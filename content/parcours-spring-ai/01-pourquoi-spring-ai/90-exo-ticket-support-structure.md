---
title: "Exercice — structurer un ticket de support avec le ChatClient"
type: exercise
---

> ⏱️ **Durée conseillée : ~15 min.**

## Énoncé

Une équipe support reçoit des messages en texte libre (email, formulaire de
contact) et doit aujourd'hui les trier **à la main** avant de les router vers
la bonne file. Tu dois automatiser ce tri avec le `ChatClient`.

Voici deux exemples de messages bruts :

```text
Message 1 :
"Bonjour, depuis ce matin impossible de me connecter à mon compte, le
mot de passe est refusé alors qu'il est correct. C'est urgent, j'ai une
présentation client dans 2h."

Message 2 :
"Est-ce que vous prévoyez d'ajouter un export PDF des factures ? Ce
serait pratique pour notre compta."
```

1. Définis un **record Java** `SupportTicket` qui capture :
   - `category` (`"BUG"`, `"FEATURE_REQUEST"`, `"BILLING"`, `"OTHER"`),
   - `priority` (`"LOW"`, `"MEDIUM"`, `"HIGH"`),
   - `summary` (résumé en une phrase, en français).
2. Écris une méthode `SupportTicket triage(String rawMessage)` qui utilise
   le `ChatClient` avec `.entity(...)` pour produire ce record.
3. Ajoute un **message système** qui explique clairement au modèle les
   règles de classification (ex. : « urgent » ou un enjeu métier explicite →
   `HIGH`).
4. Que fais-tu si le champ `category` renvoyé par le modèle ne fait **pas**
   partie des quatre valeurs attendues ? Propose une garde-fou.

<!--correction-->

## Correction

```java
// SupportTicket.java — the structured shape we want back
public record SupportTicket(
        String category,   // "BUG" | "FEATURE_REQUEST" | "BILLING" | "OTHER"
        String priority,    // "LOW" | "MEDIUM" | "HIGH"
        String summary       // one-sentence summary, in French
) {}
```

```java
// TriageService.java
@Service
public class TriageService {

    private static final String SYSTEM_PROMPT = """
        You triage customer support messages. Classify each message into
        exactly one category: BUG, FEATURE_REQUEST, BILLING, or OTHER.
        Set priority to HIGH if the message mentions an urgent business
        impact (a deadline, a blocked login, money at risk), MEDIUM for a
        clear but not urgent issue, LOW otherwise.
        Write the summary in French, one sentence.
        """;

    private final ChatClient chatClient;

    public TriageService(ChatModel chatModel) {
        this.chatClient = ChatClient.builder(chatModel).build();
    }

    public SupportTicket triage(String rawMessage) {
        return chatClient.prompt()
                .system(SYSTEM_PROMPT)
                .user(rawMessage)
                .options(AnthropicChatOptions.builder()
                        .temperature(0.1)   // low temperature: consistent classification
                        .build())
                .call()
                .entity(SupportTicket.class);
    }
}
```

```java
// Guardrail: never trust the category blindly — validate against the
// known set, exactly like validating any external input.
private static final Set<String> KNOWN_CATEGORIES =
        Set.of("BUG", "FEATURE_REQUEST", "BILLING", "OTHER");

public SupportTicket triageSafe(String rawMessage) {
    SupportTicket ticket = triage(rawMessage);
    if (!KNOWN_CATEGORIES.contains(ticket.category())) {
        // Fall back to a safe default rather than routing to an unknown queue
        return new SupportTicket("OTHER", ticket.priority(), ticket.summary());
    }
    return ticket;
}
```

**Points clés** :

- Le message **système** porte les règles de classification, jamais mêlées
  au message utilisateur — même discipline que côté Symfony AI.
- Une **basse température** (`0.1`) réduit la variabilité de la
  classification d'un appel à l'autre.
- Le garde-fou sur `category` traite la sortie du LLM comme une **entrée
  externe non fiable** : on ne route jamais vers une file inconnue sans
  filet de sécurité.
