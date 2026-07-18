---
title: "Quiz — Pourquoi NestJS ?"
type: quiz
questions:
  - prompt: |
      Que fournit NestJS que Express, seul, ne fournit pas ?
    options:
      - "Un serveur HTTP : Express ne sait pas répondre aux requêtes."
      - |
        Une architecture imposée (modules, injection de dépendances,
        décorateurs), construite au-dessus d'un serveur HTTP existant.
      - "Un remplacement complet de Node.js."
    answer: 1
    tags: ["nestjs", "express", "architecture"]
    level: debutant
    explanation: |
      NestJS s'appuie sur Express (ou Fastify) pour le serveur HTTP
      lui-même : il ne le remplace pas, il structure ce qui se passe
      au-dessus (modules, DI, décorateurs), là où Express reste
      volontairement minimaliste.
  - prompt: |
      Quel est le meilleur parallèle Symfony pour décrire la différence
      Express vs NestJS ?
    options:
      - |
        Silex/Slim (micro-framework, aucune structure imposée) vs Symfony
        (framework structurant, conventions, conteneur de services).
      - "Twig vs Blade."
      - "Doctrine vs Eloquent."
    answer: 0
    tags: ["nestjs", "symfony", "passerelle"]
    level: debutant
    explanation: |
      Express ressemble à Silex/Slim : un routeur minimal, sans convention
      imposée. NestJS joue le rôle que joue Symfony vis-à-vis de PHP brut :
      une structure, un conteneur de services (DI), des conventions de
      dossiers.
  - prompt: |
      Qu'exécute réellement un décorateur comme `@Get('/users')` au moment
      où le fichier est chargé ?
    options:
      - |
        Il traite immédiatement toutes les requêtes GET /users déjà reçues.
      - |
        Il attache une métadonnée à la méthode ; c'est Nest qui, au
        démarrage, la lit pour construire la table de routage.
      - "Rien : c'est un simple commentaire ignoré à l'exécution."
    answer: 1
    tags: ["decorateurs", "reflect-metadata"]
    level: intermediaire
    explanation: |
      Un décorateur enregistre une métadonnée (via reflect-metadata) sur la
      classe/méthode ciblée. Nest la lit ensuite au bootstrap
      (`NestFactory.create`) pour construire son routeur — le décorateur
      lui-même ne « traite » aucune requête.
  - prompt: |
      Quel est l'équivalent le plus proche, côté PHP 8/Symfony, du mécanisme
      des décorateurs NestJS ?
    options:
      - "Les interfaces PHP."
      - |
        Les attributs `#[...]` (ex. `#[Route]`, `#[ORM\Column]`), lus par
        réflexion pour construire routage/mapping au démarrage.
      - "Les traits PHP."
    answer: 1
    tags: ["decorateurs", "symfony", "passerelle"]
    level: intermediaire
    explanation: |
      Les attributs PHP 8 sont, comme les décorateurs TypeScript, de la
      métadonnée déclarative attachée au code, lue par réflexion (Symfony
      lit `#[Route]` pour bâtir son routeur, Doctrine lit `#[ORM\Column]`
      pour bâtir son mapping). Nest fait la même chose avec ses propres
      décorateurs.
  - prompt: |
      D'où vient historiquement le système de décorateurs de NestJS ?
    options:
      - "Il a été inventé de zéro, sans inspiration extérieure."
      - |
        Nest reprend délibérément le système de décorateurs d'Angular,
        pensé comme « Angular côté serveur ».
      - "Il vient de Vue.js."
    answer: 1
    tags: ["decorateurs", "angular", "historique"]
    level: intermediaire
    explanation: |
      NestJS a été conçu en s'inspirant explicitement d'Angular : mêmes
      idées de modules, de décorateurs et d'injection de dépendances,
      transposées côté serveur.
  - prompt: |
      Que fait `NestFactory.create(AppModule)` au démarrage de
      l'application ?
    options:
      - |
        Il se contente d'ouvrir un port TCP, sans rien analyser.
      - |
        Il parcourt tout le graphe de modules, instancie les providers dans
        le bon ordre, et construit le routeur HTTP à partir des
        contrôleurs déclarés.
      - "Il compile le TypeScript en JavaScript à la volée, à chaque requête."
    answer: 1
    tags: ["bootstrap", "nestfactory", "di"]
    level: avance
    explanation: |
      `NestFactory.create` résout l'intégralité du graphe de dépendances
      (modules importés en cascade, providers, contrôleurs) **une fois**,
      avant de démarrer le serveur HTTP — un équivalent fonctionnel de la
      compilation du conteneur de services Symfony.
  - prompt: |
      Que génère la commande `nest generate resource products` ?
    options:
      - |
        Rien d'utile : elle affiche seulement une documentation.
      - |
        Un contrôleur, un service, un module et des fichiers de test pour
        la ressource `products`, câblés ensemble selon les conventions Nest.
      - "Uniquement une entrée dans un fichier de log."
    answer: 1
    tags: ["cli", "schematics"]
    level: debutant
    explanation: |
      Les *schematics* du CLI Nest (`nest generate`) scaffoldent du code
      conforme aux conventions (contrôleur + service + module + specs),
      l'équivalent des *makers* Symfony (`make:controller`, `make:crud`).
---

Sept questions pour ancrer le rôle de NestJS vis-à-vis d'Express, le
mécanisme des décorateurs (et son parallèle direct avec les attributs PHP 8),
et l'anatomie d'un projet généré par le CLI.
