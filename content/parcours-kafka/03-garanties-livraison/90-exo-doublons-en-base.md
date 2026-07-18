---
title: "Exercice — des paiements dupliqués en base"
type: exercise
---

> ⏱️ **Durée conseillée : ~15 min.**

## Énoncé

Le service `payments-processor` consomme le topic `payment-events` et, pour chaque
`PaymentCaptured`, exécute :

```java
consumer.subscribe(List.of("payment-events"));
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(500));
    for (ConsumerRecord<String, String> record : records) {
        PaymentCaptured event = parse(record.value());
        // INSERT a new row for every captured payment, no uniqueness check
        db.execute(
            "INSERT INTO ledger (payment_id, amount, recorded_at) VALUES (?, ?, NOW())",
            event.paymentId(), event.amount()
        );
    }
    consumer.commitSync();   // committed AFTER processing the whole batch
}
```

En production, l'équipe comptable signale que **certains paiements apparaissent deux
fois** dans la table `ledger`, ce qui gonfle artificiellement le chiffre d'affaires
consolidé.

1. Le commit a lieu **après** le traitement du batch entier (bonne pratique vue au
   module 2). Explique néanmoins **précisément** le scénario qui peut produire un
   doublon malgré ce commit tardif.
2. Ce doublon est-il un dysfonctionnement de Kafka ? Justifie.
3. Propose une correction du code ci-dessus qui élimine le risque de doublon, **sans**
   changer la garantie de livraison (reste en at-least-once).

<!--correction-->

## Correction

**1. Le scénario du doublon.**

Le commit a lieu après le traitement de **tout le batch** retourné par `poll()` — mais
s'il y a, par exemple, 50 messages dans ce batch et que l'application **crashe** après
avoir inséré les 30 premiers (panne, redéploiement, OOM), **aucun** commit n'a eu lieu
pour ce batch : au redémarrage, le consumer relit les 50 messages depuis le dernier offset
commité, y compris les 30 déjà insérés en base. Ces 30 paiements sont réinsérés — d'où le
doublon dans `ledger`. C'est exactement le scénario at-least-once du module 3 : commit
après traitement protège contre la **perte**, pas contre le **retraitement partiel** d'un
batch en cas de crash au milieu.

**2. Ce n'est pas un dysfonctionnement de Kafka.**

Kafka fait précisément ce qui était configuré : offset non commité tant que
`commitSync()` n'a pas été appelé, donc redélivrance du batch entier au redémarrage.
C'est le comportement **attendu** de l'at-least-once. Le bug est côté application :
l'insertion en base n'est **pas idempotente** — rejouer le même événement produit une
nouvelle ligne au lieu de ne rien changer.

**3. Correction — clé d'idempotence + contrainte d'unicité.**

```sql
-- payment_id becomes the natural idempotency key: one ledger row per payment
ALTER TABLE ledger ADD CONSTRAINT uniq_payment_id UNIQUE (payment_id);
```

```java
consumer.subscribe(List.of("payment-events"));
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(500));
    for (ConsumerRecord<String, String> record : records) {
        PaymentCaptured event = parse(record.value());
        try {
            // Re-running this INSERT for an already-recorded payment_id now fails cleanly
            db.execute(
                "INSERT INTO ledger (payment_id, amount, recorded_at) VALUES (?, ?, NOW())",
                event.paymentId(), event.amount()
            );
        } catch (DuplicateKeyException e) {
            // Already recorded in a previous (partial) run — safe to skip
            log.info("Payment {} already in ledger, skipping duplicate", event.paymentId());
        }
    }
    consumer.commitSync();
}
```

La garantie de livraison **reste at-least-once** (le commit a toujours lieu après
traitement, aucun changement de ce côté) — ce qui change, c'est que retraiter le même
`payment_id` n'a plus **aucun effet supplémentaire** en base : la contrainte d'unicité
transforme un doublon silencieux en une exception attendue et gérée. C'est la correction
attendue plutôt que de chercher à empêcher Kafka de jamais relivrer un message (ce qui
reviendrait à vouloir un exactly-once end-to-end — le mythe vu en leçon 3).
