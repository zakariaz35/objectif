---
title: "Cartes mémo — Architecture & modèle mental"
type: flashcards
cards:
  - q: |
      Drupal 10 est bâti sur quels composants Symfony ? Cite-en au moins cinq.
    a: |
      **HttpFoundation** (Request/Response), **Routing**, **DependencyInjection**,
      **EventDispatcher**, **Console**, **Twig**, **Validator**, **Serializer**.
      Depuis D8, Drupal utilise Symfony comme infrastructure sous-jacente.
  - q: |
      Quelle est la différence entre un hook Drupal et un EventSubscriber Symfony ?
    a: |
      Un **hook** est une fonction dont le nom suit la convention `module_hookname` —
      découverte procédurale, pas de classe. Un **EventSubscriber** implémente
      `EventSubscriberInterface` et est déclaré comme service tagué — injectable,
      testable unitairement. Préférer les subscribers pour tout nouveau code.
  - q: |
      Qu'est-ce qu'un « render array » et pourquoi l'utiliser plutôt que retourner
      directement une Response HTML ?
    a: |
      Un render array est une structure PHP `['#theme' => '…', '#cache' => […], …]`
      que Drupal convertit en HTML **au dernier moment**. Il transporte les métadonnées
      de **cache** (tags, contexts, max-age) : Drupal peut mettre en cache le fragment,
      l'invalider ciblé et assembler la page par couches. Retourner une `Response` brute
      court-circuite tout ce système.
  - q: |
      Dans un controller Drupal, pourquoi doit-on implémenter `create(ContainerInterface
      $container)` alors qu'en Symfony on utilise l'autowiring ?
    a: |
      Drupal ne fait pas d'autowiring automatique sur les controllers — il résout les
      dépendances via la méthode statique `create()` qui reçoit le container. C'est la
      même injection de dépendances, juste explicite. L'autowiring Symfony est disponible
      uniquement si tu configures `drupal/autowire` ou similaire (non recommandé en agence
      sans accord équipe).
  - q: |
      Quelle est la frontière « configuration / contenu » en Drupal, et pourquoi est-elle
      critique en contexte d'agence ?
    a: |
      La **configuration** (types de contenu, champs, vues, permissions…) s'exporte en
      YAML et se versionne dans Git. Le **contenu** (nœuds, users…) reste en base.
      En agence, tout changement de config doit être exporté (`drush cex`) et commité ;
      sinon la prod diverge du repo et les déploiements suivants écrasent les changements
      en prod.
---
