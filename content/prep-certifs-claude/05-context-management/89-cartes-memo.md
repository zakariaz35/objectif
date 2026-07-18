---
title: "Cartes mémo — Context management & fiabilité"
type: flashcards
cards:
  - q: |
      Pourquoi ne faut-il jamais utiliser `tiktoken` (ou une autre bibliothèque
      générique) pour estimer la consommation de tokens d'un prompt destiné à Claude ?
    a: |
      Chaque famille de modèles a son propre **tokenizer** ; les comptages ne sont pas
      interchangeables d'une famille à l'autre. Le seul comptage fiable pour Claude
      passe par l'endpoint **`count_tokens`** de l'API elle-même.
  - q: |
      Un system prompt inclut un horodatage vivant (`"Current time: ..."`) à l'intérieur
      du bloc marqué `cache_control`. Quel est l'effet sur le cache, et pourquoi
      est-ce dangereux ?
    a: |
      Le cache est **silencieusement invalidé à chaque requête** : l'horodatage change
      en permanence, donc le préfixe n'est jamais identique deux fois. Aucune erreur
      n'est renvoyée — juste `cache_read_input_tokens` et `cache_creation_input_tokens`
      qui ne correspondent jamais à ce qu'on attend. La correction : sortir
      l'horodatage du bloc mis en cache.
  - q: |
      Quelle est la hiérarchie de mise en cache d'un prompt, et pourquoi l'ordre
      compte-t-il ?
    a: |
      **`tools` → `system` → `messages`**. Un changement à un niveau invalide ce
      niveau **et tous les suivants** (mais pas les précédents) — réordonner les
      outils entre deux requêtes, par exemple, invalide `system` et `messages` en
      cascade, même s'ils n'ont pas changé eux-mêmes.
  - q: |
      Un corpus documentaire de 50 pages, stable, doit être exploité avec un
      raisonnement qui croise plusieurs documents à la fois. RAG ou long contexte
      direct ?
    a: |
      **Long contexte direct** : le corpus tient confortablement dans la fenêtre et le
      besoin de raisonnement transversal favorise le fait de tout voir simultanément.
      RAG se justifie par la **taille** (corpus > fenêtre) ou la **fraîcheur**
      (données qui changent en continu) — pas par principe.
  - q: |
      Quelle est la différence de portée entre la compaction/le context editing d'un
      côté, et memory de l'autre ?
    a: |
      Compaction et context editing gèrent la croissance du contexte **à l'intérieur
      d'une même conversation** (résumé automatique, élagage ciblé). **Memory** est le
      seul des trois pensé pour faire persister de l'information **entre plusieurs
      sessions** — via des fichiers relus au début d'une session future.
  - q: |
      Une réponse s'arrête avec `stop_reason: "max_tokens"`. Faut-il retenter la même
      requête à l'identique ?
    a: |
      Non. `max_tokens` signale une **troncature**, pas un échec transitoire :
      retenter à l'identique produira la même troncature. La correction est
      d'**augmenter `max_tokens`** ou d'utiliser le **streaming** pour les sorties
      longues, afin d'éviter aussi les timeouts HTTP.
---

Count_tokens, invalidateurs silencieux du cache, hiérarchie tools→system→messages, RAG vs long contexte, portée de memory, stop_reason.
