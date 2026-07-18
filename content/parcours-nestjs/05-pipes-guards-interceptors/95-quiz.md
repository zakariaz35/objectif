---
title: "Quiz — Pipes, Guards, Interceptors, Middleware & Exception filters"
type: quiz
questions:
  - prompt: |
      Quel est le rôle précis d'un Pipe NestJS ?
    options:
      - "Décider si la requête a le droit de continuer (oui/non)."
      - "Transformer et/ou valider UN argument précis, avant le handler."
      - "Logguer une requête entrante, avant même le routing."
    answer: 1
    tags: ["pipes"]
    level: debutant
    explanation: |
      Un Pipe agit sur un argument ciblé (`@Param`, `@Query`, `@Body`) : il
      le transforme et/ou vérifie sa forme, comme un ParamConverter
      Symfony — il ne prend jamais de décision d'autorisation.
  - prompt: |
      Quel est l'équivalent Symfony le plus direct d'un Guard NestJS ?
    options:
      - "Un Repository Doctrine."
      - "Un Voter de sécurité / `#[IsGranted(...)]`."
      - "Un attribut `#[ORM\\Column]`."
    answer: 1
    tags: ["guards", "symfony"]
    level: debutant
    explanation: |
      Un Guard répond à une question binaire d'autorisation, avant le
      handler — exactement le rôle des Voters et de `#[IsGranted]` côté
      sécurité Symfony.
  - prompt: |
      Qu'est-ce qui distingue le plus un Interceptor d'un Guard ou d'un
      Pipe ?
    options:
      - |
        Un Interceptor peut agir à la fois AVANT et APRÈS l'exécution du
        handler (via `next.handle().pipe(...)`).
      - "Un Interceptor ne peut jamais accéder à la requête HTTP."
      - "Un Interceptor s'exécute uniquement pour les requêtes GET."
    answer: 0
    tags: ["interceptors"]
    level: intermediaire
    explanation: |
      Contrairement à un Pipe ou un Guard (qui n'agissent qu'avant le
      handler), un Interceptor encadre l'appel entier : du code avant
      `next.handle()`, et du code après, via les opérateurs RxJS
      (`map`, `tap`...).
  - prompt: |
      Où se situe un Middleware NestJS dans le cycle de vie d'une requête,
      par rapport aux Guards ?
    options:
      - "Après les Guards, mais avant les Pipes."
      - |
        AVANT les Guards : c'est la couche la plus en amont, avant même que
        Nest sache quel contrôleur traitera la requête.
      - "Après les Interceptors « après », juste avant la réponse finale."
    answer: 1
    tags: ["middleware", "cycle-de-vie"]
    level: intermediaire
    explanation: |
      Le Middleware est la couche la plus externe : il s'exécute avant le
      routing lui-même, donc avant les Guards, les Interceptors et les
      Pipes.
  - prompt: |
      Dans le cycle de vie complet d'une requête Nest, quel est l'ordre
      correct ?
    options:
      - |
        Middleware → Guards → Interceptors (avant) → Pipes → Handler →
        Interceptors (après) → Exception filters.
      - "Pipes → Middleware → Handler → Guards → Interceptors → Exception filters."
      - "Guards → Middleware → Pipes → Interceptors → Handler → Exception filters."
    answer: 0
    tags: ["cycle-de-vie", "ordre"]
    level: avance
    explanation: |
      C'est l'ordre exact du diagramme de ce module : Middleware d'abord
      (le plus en amont), puis Guards (autorisation), puis la partie
      « avant » des Interceptors, puis les Pipes (arguments), puis le
      handler, puis la partie « après » des Interceptors, les erreurs
      remontant à tout moment vers les Exception filters.
  - prompt: |
      Pourquoi les Guards s'exécutent-ils AVANT les Pipes, et non l'inverse ?
    options:
      - |
        Pour éviter de perdre du temps à transformer/valider des arguments
        d'une requête qui, de toute façon, sera refusée faute d'autorisation.
      - "Il n'y a en réalité aucun ordre garanti entre Guards et Pipes."
      - "Parce que les Pipes ont besoin des résultats produits par les Guards."
    answer: 0
    tags: ["guards", "pipes", "ordre", "erreur-frequente"]
    level: avance
    explanation: |
      Vérifier l'autorisation d'abord évite un travail inutile (et
      potentiellement coûteux) de transformation/validation sur une
      requête qui sera de toute façon rejetée.
  - prompt: |
      À quel mécanisme Symfony un Exception filter NestJS custom
      (`@Catch(...)`) correspond-il ?
    options:
      - "Un `EventSubscriber` sur `kernel.request`."
      - |
        Un `ExceptionListener` sur `kernel.exception` : un point central
        traduisant toute exception non gérée en réponse HTTP cohérente.
      - "Un Voter de sécurité."
    answer: 1
    tags: ["exception-filters", "symfony"]
    level: intermediaire
    explanation: |
      Les deux mécanismes jouent exactement le même rôle : un point
      d'interception central des erreurs, chargé de produire une réponse
      HTTP cohérente et personnalisable.
---

Sept questions pour ancrer le rôle distinct de chaque brique transverse
(Pipe, Guard, Interceptor, Middleware, Exception filter) et, surtout, leur
ordre d'exécution exact dans le cycle de vie d'une requête Nest.
