---
title: "Cartes mémo — Architecture & ResourceBundle"
type: flashcards
cards:
  - q: |
      Quelle est la différence entre un **Component** Sylius et un **Bundle** Sylius ?
    a: |
      Un **Component** (`Sylius\Component\*`) est du PHP pur sans dépendance Symfony : modèles, interfaces, logique métier. Un **Bundle** (`Sylius\Bundle\*`) intègre le Component dans Symfony : DI, configuration, Forms, Controllers. On code **contre les interfaces des Components**, jamais contre les classes concrètes des Bundles.
  - q: |
      Qu'est-ce que `SyliusResourceBundle` apporte concrètement par rapport à Doctrine seul ?
    a: |
      Il génère automatiquement depuis une déclaration YAML : la **Factory** (création d'instances), le **Repository** (accès en lecture), le **Manager** (persist/flush), le **Controller CRUD** et les **routes** associées. Équivalent à un SonataAdmin sans interface graphique imposée, entièrement piloté par config.
  - q: |
      Pourquoi utiliser la **Factory** plutôt que `new MonEntite()` dans Sylius ?
    a: |
      La Factory est un service injectable et remplaçable. N'importe quel plugin peut la décorer (`app.factory.book: class: CustomBookFactory`) sans modifier le code métier qui l'utilise. Avec `new`, le code est couplé à la classe concrète et devient impossible à étendre sans modification.
  - q: |
      Quelle interface doit implémenter toute entité Sylius pour être reconnue comme Resource ?
    a: |
      `Sylius\Component\Resource\Model\ResourceInterface`, qui fournit `getId(): mixed`. En pratique on utilise le trait `ResourceTrait` pour ne pas réécrire l'implémentation. Sans cette interface, `SyliusResourceBundle` ne peut pas enregistrer l'entité.
  - q: |
      Quels événements Symfony sont dispatchés automatiquement lors de la création d'une Resource nommée `app.book` ?
    a: |
      `sylius.book.pre_create` (avant le flush) et `sylius.book.post_create` (après). Le même pattern existe pour `update` et `delete`. Ces événements permettent d'hooker le cycle de vie sans surcharger le controller.
  - q: |
      Comment déclarer des routes CRUD automatiques pour une Resource `app.book` ?
    a: |
      ```yaml
      app_book:
          resource: |
              alias: app.book
          type: sylius.resource
      ```
      Cela génère les routes `app_book_index`, `app_book_create`, `app_book_update`, `app_book_delete`, `app_book_show`.
  - q: |
      Quel est le principal piège agence avec `sylius_resource:` lors d'un upgrade ?
    a: |
      Ne pas déclarer l'entrée `interface:` dans la config Resource. Sans interface, les plugins tiers ne peuvent pas décorer l'entité, et Sylius ne peut pas résoudre les overrides par type. Résultat : les plugins qui tentent de remplacer votre entité échouent silencieusement.
---

Sept cartes pour ancrer les fondations de l'architecture Sylius et de ResourceBundle avant de passer aux modules suivants.
