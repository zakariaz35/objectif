---
title: "Exercice — un tool de statut de facture, avec garde-fous"
type: exercise
---

> ⏱️ **Durée conseillée : ~15 min.**

## Énoncé

Ton équipe veut un assistant qui répond en langage naturel à des questions
comme « Où en est la facture INV-2026-0142 ? », en s'appuyant sur un service
existant :

```java
public interface InvoiceStatusService {
    // Returns "PENDING", "PAID", "OVERDUE" or throws if not found
    String statusOf(String invoiceId);
}
```

1. Écris une classe `InvoiceTools` qui expose cette information au LLM via
   `@Tool`, avec des descriptions claires.
2. Enregistre ce tool sur un `ChatClient` dédié, avec un plafond de tokens
   raisonnable pour une réponse courte.
3. Ce tool est en **lecture seule** — justifie pourquoi il ne nécessite pas
   la même prudence qu'un tool `cancelInvoice` ou `sendReminder`, et ce que
   tu changerais si on te demandait d'ajouter ce dernier.
4. Où loguerais-tu la consommation de tokens de cet assistant, et pourquoi
   est-ce utile même sur un tool aussi simple ?

<!--correction-->

## Correction

```java
// InvoiceTools.java
@Component
public class InvoiceTools {

    private final InvoiceStatusService invoiceStatusService;

    public InvoiceTools(InvoiceStatusService invoiceStatusService) {
        this.invoiceStatusService = invoiceStatusService;
    }

    @Tool(description = "Get the current status of an invoice by its id (PENDING, PAID, or OVERDUE)")
    public String getInvoiceStatus(@ToolParam(description = "The invoice id, e.g. INV-2026-0142") String invoiceId) {
        try {
            return invoiceStatusService.statusOf(invoiceId);
        } catch (InvoiceNotFoundException e) {
            // Return a clear, model-friendly message rather than letting an exception bubble up
            return "No invoice found with id " + invoiceId;
        }
    }
}
```

```java
// InvoiceAssistant.java
@Service
public class InvoiceAssistant {

    private final ChatClient chatClient;

    public InvoiceAssistant(ChatModel chatModel, InvoiceTools invoiceTools) {
        this.chatClient = ChatClient.builder(chatModel)
                .defaultTools(invoiceTools)
                .defaultOptions(AnthropicChatOptions.builder()
                        .maxTokens(200)   // short, factual answers only
                        .temperature(0.1)
                        .build())
                .build();
    }

    public String ask(String question) {
        ChatResponse response = chatClient.prompt()
                .user(question)
                .call()
                .chatResponse();

        // Log token usage for every call, even a simple read-only one
        Usage usage = response.getMetadata().getUsage();
        log.info("invoice-assistant tokens total={}", usage.getTotalTokens());

        return response.getResult().getOutput().getText();
    }
}
```

**Réponses aux questions 3 et 4** :

- `getInvoiceStatus` est un tool **en lecture seule** : au pire, le modèle
  l'appelle avec un mauvais identifiant et obtient une réponse "not found" —
  aucune conséquence irréversible. Un tool `cancelInvoice` ou
  `sendReminder`, lui, **déclenche une action réelle** (annulation, email
  envoyé à un client) sur simple décision du modèle : il faudrait ajouter
  une étape de **confirmation explicite** côté application (par exemple,
  ne jamais appeler l'action directement depuis le tool, mais créer une
  demande en attente de validation humaine, ou exiger une confirmation
  déjà donnée par l'utilisateur dans son message).
- Même pour un tool simple, **loguer la consommation de tokens** permet de
  repérer tôt une dérive : un utilisateur qui pose la même question en
  boucle, un prompt système qui grossit avec le temps, ou un modèle
  soudainement plus verbeux que prévu — des signaux qu'on ne voit **que**
  si on les mesure dès le début, pas après la première facture surprise.
