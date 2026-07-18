---
title: "Prompts, rôles et templates"
type: lesson
---

## Système vs utilisateur : un concept que tu connais déjà

Quand tu appelles Claude via l'API Anthropic (directement, ou via Symfony AI),
tu distingues déjà un message **système** (les instructions permanentes : le
rôle, le ton, les contraintes) d'un message **utilisateur** (la demande du
moment). Spring AI reprend exactement cette distinction.

```java
String answer = chatClient.prompt()
        // The "system" message: stable instructions, set once
        .system("You are a concise assistant. Answer in one short paragraph.")
        // The "user" message: the actual request, changes every call
        .user("Explain what a database index is.")
        .call()
        .content();
```

> **Symfony AI → Spring AI.** C'est le même couple `system` / messages que
> l'API Messages d'Anthropic (et donc `ai-bundle`) : le message système fixe
> le comportement une fois pour toutes, les messages utilisateur portent la
> conversation. Rien de nouveau à apprendre ici, seulement une syntaxe Java.

## `PromptTemplate` : des prompts paramétrés, pas des concaténations

Construire un prompt en concaténant des `String` marche, mais devient vite
fragile (espaces oubliés, injections accidentelles). Spring AI propose des
**templates** avec des paramètres nommés, dans l'esprit d'un `Twig` ou d'un
`f-string` Python.

```java
// Reusable prompt with named placeholders — not string concatenation
public String classifyDocument(String rawText) {
    return chatClient.prompt()
            .user(u -> u
                .text("""
                    Classify the following document into one of: \
                    INVOICE, CONTRACT, ID_CARD, OTHER.
                    Reply with the category only.

                    Document:
                    {document}
                    """)
                .param("document", rawText))
            .call()
            .content();
}
```

> **Réflexe à prendre.** Garde tes prompts système dans une **constante** ou
> un fichier de ressources dédié (`classification-prompt.st`), pas éparpillés
> en dur dans chaque méthode — exactement comme tu externalises tes prompts
> Claude dans un fichier de config plutôt que de les hardcoder dans un
> contrôleur Symfony.

## Régler le comportement du modèle : `ChatOptions`

Température, nombre max de tokens, modèle utilisé pour **cet appel précis**
(différent du modèle par défaut de `application.properties`) : tout passe par
des `ChatOptions`, spécifiques à chaque fournisseur.

```java
import org.springframework.ai.anthropic.AnthropicChatOptions;

String answer = chatClient.prompt()
        .user("List 3 risks of a Big Bang migration, one line each.")
        .options(AnthropicChatOptions.builder()
                .temperature(0.2)   // low temperature: factual, deterministic-ish answers
                .maxTokens(300)
                .build())
        .call()
        .content();
```

| Paramètre | Rôle |
|---|---|
| `temperature` | 0 = réponse quasi déterministe · 1 = plus créative/variée |
| `maxTokens` | plafond de tokens générés (coût + latence) |
| `model` | surcharge ponctuelle du modèle par défaut |

> ⚠️ **Erreur fréquente — mettre une `temperature` haute pour une tâche de
> classification ou d'extraction.** Pour tout ce qui doit être **fiable et
> reproductible** (catégoriser un document, extraire un champ), vise une
> température **basse** (`0` à `0.2`). Garde une température plus haute
> uniquement pour du texte créatif (reformulation, brainstorm).

## À retenir

- `system` = instructions stables, `user` = demande du moment — le même
  découpage que l'API Messages d'Anthropic.
- `PromptTemplate` (via `.text("...").param(...)`) évite la concaténation
  fragile de chaînes et rend les prompts réutilisables.
- `ChatOptions` (température, `maxTokens`, modèle) se règle **par appel** —
  basse température pour les tâches factuelles/extraction.
