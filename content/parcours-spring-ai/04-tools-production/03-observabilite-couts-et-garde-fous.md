---
title: "Observabilité, coûts et garde-fous en production"
type: lesson
---

## Un appel LLM est un appel externe comme un autre

Tu appliques déjà, sur tes intégrations Claude en production, la discipline
qu'exige tout appel à un service externe : timeout, retry, supervision,
suivi des coûts. Un appel Spring AI **n'échappe pas** à cette règle — au
contraire, la variabilité de latence et de coût d'un LLM la rend encore plus
nécessaire.

> **Réflexe à prendre.** Face à un appel `ChatClient`, pose-toi les mêmes
> questions que face à un appel HTTP externe : que se passe-t-il s'il est
> lent ? S'il échoue ? Combien coûte-t-il ? Rien de nouveau à inventer, les
> mêmes outils Spring (Resilience4j, Spring Retry, Actuator/Micrometer)
> s'appliquent.

## Suivre la consommation de tokens

Chaque réponse porte des métadonnées d'usage — la base du suivi de coût,
que tu fais déjà côté API Anthropic directe.

```java
ChatResponse response = chatClient.prompt()
        .user(question)
        .call()
        .chatResponse();

Usage usage = response.getMetadata().getUsage();
log.info("tokens in={} out={} total={}",
        usage.getPromptTokens(), usage.getGenerationTokens(), usage.getTotalTokens());
```

Historiser ce volume (par utilisateur, par fonctionnalité) est ce qui permet
ensuite de répondre à des questions très concrètes : quelle fonctionnalité
coûte le plus ? quel client consomme le plus de tokens ?

## Observabilité : brancher Micrometer/Actuator

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```properties
management.endpoints.web.exposure.include=health,metrics,prometheus
```

Une fois Actuator présent, les appels via `ChatClient`/`ChatModel` publient
des métriques (latence, nombre d'appels, erreurs) exploitables par ton stack
de supervision habituelle (Prometheus/Grafana) — le même réflexe que
superviser tes appels FastAPI/Symfony en prod.

## Garde-fous côté coûts

| Levier | Effet |
|---|---|
| `maxTokens` bas pour les tâches courtes | plafonne le coût par appel |
| Modèle « léger » pour les tâches simples, modèle « fort » pour les tâches complexes | évite de payer le tarif du modèle le plus puissant pour tout |
| Cache applicatif sur les prompts répétés | évite de repayer un appel identique |
| Alerte sur un volume de tokens anormal | détecte une boucle ou un abus tôt |

> **Passerelle.** C'est le même arbitrage que choisir entre Claude Haiku et
> Claude Opus selon la tâche côté Symfony AI : pas la peine de payer le
> modèle le plus cher pour classifier un email en trois catégories.

## Garde-fous côté fiabilité et sécurité

```java
ChatClient resilientClient = ChatClient.builder(chatModel)
        .defaultOptions(AnthropicChatOptions.builder()
                .maxTokens(500)   // hard cap: predictable cost and latency
                .build())
        .build();
```

- **Timeout** : configure un délai raisonnable sur le client HTTP sous-jacent
  — ne laisse jamais une requête utilisateur attendre indéfiniment un LLM
  qui ne répond pas.
- **Retry avec backoff** : un échec réseau ponctuel ne doit pas remonter
  directement à l'utilisateur (Spring Retry ou Resilience4j, comme sur tout
  appel externe).
- **Ne jamais logger de données sensibles** dans les prompts/réponses
  (numéros de carte, mots de passe, données personnelles) — applique la même
  vigilance qu'à tes logs d'API habituels.
- **Validation métier après coup** : un LLM reste probabiliste ; toute
  décision **critique** (montant remboursé, statut légal d'un document)
  mérite une vérification déterministe en plus de la réponse du modèle.

> ⚠️ **Erreur fréquente — traiter un appel LLM comme "gratuit" et
> "instantané" en développement, puis découvrir les coûts et la latence
> réels en production.** Mesure la consommation de tokens et la latence dès
> le développement, pas seulement après un premier incident de facturation.

## À retenir

- Un appel `ChatClient` est un appel externe : timeout, retry, supervision
  et suivi de coût s'appliquent, exactement comme sur tes autres intégrations.
- Le `Usage` de chaque `ChatResponse` (tokens prompt/génération/total) est la
  base du suivi de coût — historise-le par fonctionnalité ou par client.
- Adapte le **modèle** à la **tâche** (léger pour du simple, puissant pour du
  complexe) plutôt que d'utiliser systématiquement le modèle le plus cher.
- Ne fais jamais confiance aveuglément à une décision critique du modèle :
  garde une validation déterministe en plus, pour tout ce qui a un impact
  métier réel.
