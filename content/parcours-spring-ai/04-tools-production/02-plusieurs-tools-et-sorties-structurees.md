---
title: "Plusieurs tools, résultats structurés et actions sensibles"
type: lesson
---

## Enregistrer plusieurs tools à la fois

Un assistant utile combine souvent **plusieurs** capacités. Spring AI
accepte simplement plusieurs objets porteurs de méthodes `@Tool` :

```java
ChatClient chatClient = ChatClient.builder(chatModel)
        .defaultTools(orderTools, invoiceTools, customerTools)
        .build();
```

Le modèle voit l'ensemble des tools disponibles et choisit, question par
question, lequel (ou lesquels, en plusieurs étapes) appeler. Il peut même
enchaîner : appeler `getOrderStatus`, puis, avec le résultat, décider
d'appeler `getInvoiceForOrder`.

> **Réflexe à prendre.** Regroupe les tools par **domaine métier** (une
> classe `OrderTools`, une classe `InvoiceTools`...), comme tu découperais
> des services Symfony par responsabilité. Évite une seule classe fourre-tout
> avec vingt méthodes `@Tool` sans rapport entre elles.

## Un tool peut renvoyer un objet structuré, pas seulement du texte

Un tool n'est pas limité à retourner une `String` : il peut renvoyer un
record ou une liste, sérialisés automatiquement pour être transmis au
modèle — utile pour des données qui ont une vraie structure.

```java
public record OrderDetails(Long id, String status, LocalDate estimatedDelivery) {}

@Tool(description = "Get full details of an order, including estimated delivery date")
public OrderDetails getOrderDetails(@ToolParam(description = "The order id") Long orderId) {
    Order order = orderRepository.findByIdOrThrow(orderId);
    return new OrderDetails(order.id(), order.status(), order.estimatedDelivery());
}
```

Le modèle reçoit ces informations structurées **en résultat de tool**, et
les reformule en langage naturel dans sa réponse finale à l'utilisateur —
tu n'as pas à faire ce formatage toi-même.

## Attention aux tools qui produisent un effet de bord

Un tool en **lecture seule** (`getOrderStatus`) est peu risqué : au pire, une
mauvaise décision du modèle renvoie une information incorrecte. Un tool qui
**modifie un état** (`cancelOrder`, `sendRefund`, `sendEmail`) est bien plus
sensible : le modèle décide, seul, de déclencher une action réelle.

```java
// Sensitive tool: think twice before letting the model call this directly
@Tool(description = "Cancel an order. Only call this if the user explicitly confirms.")
public String cancelOrder(@ToolParam(description = "The order id") Long orderId) {
    orderService.cancel(orderId);
    return "Order " + orderId + " has been cancelled.";
}
```

> ⚠️ **Erreur fréquente — laisser un tool à effet de bord s'exécuter sans
> confirmation.** Une reformulation ambiguë de l'utilisateur, ou une
> injection de prompt dans un document ingéré par du RAG, peut suffire à
> déclencher une annulation non voulue. Pour toute action **irréversible ou
> coûteuse** (remboursement, envoi d'email, suppression), ajoute une étape
> de confirmation explicite côté application — ne fais jamais confiance à la
> seule décision du modèle.

## À retenir

- Enregistre plusieurs `@Tool` regroupés par domaine métier ; le modèle peut
  les enchaîner sur plusieurs étapes pour répondre à une question complexe.
- Un tool peut renvoyer un **objet structuré** (record), pas seulement du
  texte — Spring AI le sérialise pour le modèle.
- Distingue les tools en **lecture seule** (peu risqués) des tools à **effet
  de bord** (annulation, envoi, suppression) : ces derniers exigent une
  confirmation explicite côté application, jamais une confiance aveugle
  dans la décision du modèle.
