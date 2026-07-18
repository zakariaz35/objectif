---
title: "Réponses structurées : du texte à un objet Java"
type: lesson
---

## Le besoin que tu connais déjà

Sur tes pipelines d'OCR, tu ne veux jamais un paragraphe de texte libre en
retour de Claude : tu veux un **JSON** exploitable (le montant d'une facture,
la date, le nom du fournisseur), que tu décodes ensuite avec le Serializer
Symfony ou un `json_decode` bien typé. Spring AI industrialise exactement ce
besoin, côté Java.

## `.entity(...)` : mapper directement vers un objet

Plutôt que de demander du JSON en prose puis de le parser toi-même, tu
décris la forme attendue avec un **record Java**, et Spring AI se charge
d'ajouter les instructions de format au prompt **et** de parser la réponse.

```java
// The shape you want back — a plain Java record
public record DocumentSummary(
        String category,   // e.g. "INVOICE", "CONTRACT", "ID_CARD"
        String summary,     // one-sentence summary
        int confidencePct    // model's own confidence, 0-100
) {}

public DocumentSummary summarize(String rawText) {
    return chatClient.prompt()
            .user(u -> u
                .text("Analyze this document and summarize it.\n\n{document}")
                .param("document", rawText))
            .call()
            .entity(DocumentSummary.class);
}
```

Derrière `.entity(DocumentSummary.class)`, Spring AI :

1. ajoute au prompt une instruction de format dérivée de la structure du
   record (les noms de champs, leurs types) ;
2. envoie le prompt au modèle ;
3. **parse** la réponse JSON du modèle vers une instance de `DocumentSummary`.

> **Symfony AI → Spring AI.** C'est le pendant de ce que tu fais aujourd'hui
> en demandant un `response_format` JSON à Claude puis en désérialisant avec
> le composant Serializer de Symfony vers un DTO. Spring AI fusionne les deux
> étapes (prompt de format + parsing) en un seul appel `.entity(...)`.

## Listes et structures imbriquées

```java
public record LineItem(String label, double amount) {}
public record InvoiceData(String vendor, String date, List<LineItem> items) {}

InvoiceData invoice = chatClient.prompt()
        .user(u -> u.text("Extract structured data from this invoice.\n\n{document}")
                .param("document", ocrText))
        .call()
        .entity(InvoiceData.class);
```

> **Réflexe à prendre.** Garde les records **simples et plats** autant que
> possible. Plus la structure demandée est imbriquée, plus le modèle a de
> chances de produire un JSON légèrement invalide — exactement comme un
> `response_format` JSON Schema trop complexe côté API Anthropic augmente le
> risque d'échec de parsing.

## Le parsing peut échouer : prévois-le

Un LLM reste probabiliste : rien ne garantit à 100 % un JSON strictement
conforme, même avec les instructions de format. Entoure l'appel comme
n'importe quel appel externe non fiable.

```java
try {
    DocumentSummary result = chatClient.prompt()
            .user(u -> u.text("...").param("document", rawText))
            .call()
            .entity(DocumentSummary.class);
    return result;
} catch (Exception e) {
    // Same discipline as any external call: log, fall back, retry once
    log.warn("Structured extraction failed, falling back to manual review", e);
    throw new DocumentExtractionException(e);
}
```

> ⚠️ **Erreur fréquente — traiter `.entity(...)` comme une garantie absolue.**
> Ce n'est **pas** une validation de schéma côté serveur : c'est le modèle qui
> essaie d'obéir à une instruction. Pour des champs critiques (montants,
> identifiants), ajoute une validation métier **après** le mapping (Bean
> Validation, contrôles applicatifs), comme tu le ferais après tout
> désérialisation venant d'une source externe non fiable.

## À retenir

- `.entity(MonRecord.class)` fait en un appel ce que tu fais en deux étapes
  côté Symfony AI : demander un format **et** parser la réponse.
- Préfère des records **simples et plats** : moins de risque d'échec de
  parsing qu'une structure profondément imbriquée.
- Le résultat reste **probabiliste** : entoure l'appel comme tout appel
  externe non fiable, et valide les champs critiques après coup.
