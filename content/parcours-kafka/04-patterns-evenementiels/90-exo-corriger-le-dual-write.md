---
title: "Exercice — corriger un dual write avec l'outbox pattern"
type: exercise
---

> ⏱️ **Durée conseillée : ~20 min.**

## Énoncé

Le service `shipping-service` expose un endpoint qui marque une commande comme expédiée.
Le code actuel :

```java
@Transactional
public void markAsShipped(String orderId) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    order.setStatus(OrderStatus.SHIPPED);
    orderRepository.save(order);   // (1) inside the @Transactional DB transaction

    ShippedEvent event = new ShippedEvent(orderId, Instant.now());
    kafkaProducer.send("shipping-events", orderId, toJson(event));   // (2) NOT transactional with (1)
}
```

En production, une alerte remonte : lors d'un incident réseau de 90 secondes vers le
cluster Kafka, plusieurs commandes ont été marquées `SHIPPED` en base **sans qu'aucun
événement `ShippedEvent` n'ait été publié** — le service Facturation (qui déclenche la
facturation finale sur réception de cet événement) n'a jamais été notifié pour ces
commandes.

1. Explique pourquoi encapsuler l'appel `kafkaProducer.send()` dans un `try/catch` avec
   retry ne résout pas complètement le problème.
2. Conçois la solution avec l'**outbox pattern** : donne le schéma de la table outbox
   nécessaire, et réécris la méthode `markAsShipped` pour qu'elle n'écrive **plus jamais**
   directement vers Kafka.
3. Décris, en une phrase, comment le relay doit se comporter en cas de crash **après**
   avoir publié vers Kafka mais **avant** d'avoir marqué la ligne outbox comme publiée —
   et pourquoi ce n'est pas un problème si le module 3 a bien été compris.

<!--correction-->

## Correction

**1. Pourquoi un `try/catch` + retry ne suffit pas.**

Même avec des tentatives de retry autour de l'envoi Kafka, deux fenêtres de risque
subsistent : (a) un **crash du processus** entre le `orderRepository.save()` (déjà
commité en base, puisqu'à l'intérieur du `@Transactional`) et l'appel `kafkaProducer.send
()` — aucun retry ne peut avoir lieu si le processus n'existe plus ; (b) même avec des
retries, si **tous** échouent (incident prolongé, comme les 90 secondes de l'énoncé), la
méthode doit alors décider quoi faire : lever une exception après coup ne peut plus
annuler le `save()` déjà commité. Le problème est **structurel** (deux systèmes, deux
écritures, aucune transaction commune) : aucune quantité de gestion d'erreur locale ne
l'élimine, seul un changement d'architecture le peut.

**2. Solution avec l'outbox pattern.**

```sql
CREATE TABLE outbox_events (
  id UUID PRIMARY KEY,
  aggregate_id VARCHAR(36) NOT NULL,     -- the order id
  event_type VARCHAR(100) NOT NULL,      -- "ShippedEvent"
  payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  published_at TIMESTAMP NULL
);
```

```java
@Transactional
public void markAsShipped(String orderId) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    order.setStatus(OrderStatus.SHIPPED);
    orderRepository.save(order);   // (1) business data

    ShippedEvent event = new ShippedEvent(orderId, Instant.now());
    outboxRepository.save(new OutboxEvent(
        UUID.randomUUID(), orderId, "ShippedEvent", toJson(event)
    ));   // (2) SAME transaction, SAME database — Kafka is not involved here anymore
}
```

Les deux écritures ((1) et (2)) partagent maintenant **la même transaction**, sur la
**même base de données** : soit les deux sont commitées ensemble, soit aucune ne l'est —
plus aucune fenêtre où l'une réussit sans l'autre. La publication effective vers Kafka
devient la responsabilité d'un **relay** séparé (polling sur `published_at IS NULL`, ou
CDC via Debezium sur la table `outbox_events`), qui peut retenter autant que nécessaire
sans jamais risquer d'incohérence avec l'état métier.

**3. Comportement du relay en cas de crash après publication mais avant marquage.**

Le relay doit **republier** l'événement au redémarrage (il ne voit toujours pas
`published_at` renseigné) — ce qui produit un **doublon** côté Kafka dans ce scénario
précis. Ce n'est pas un problème dans la mesure où le module 3 s'applique ici exactement
comme ailleurs : le relay opère en **at-least-once**, et c'est au **consommateur** de
l'événement (le service Facturation, dans cet exemple) d'être **idempotent** — via une clé
d'idempotence (l'`id` de l'outbox event, par exemple) et une contrainte d'unicité côté
Facturation. L'outbox pattern résout le **dual write**, pas le besoin d'idempotence côté
consommateur, qui reste — comme toujours en at-least-once — une responsabilité distincte.
