---
title: "Quiz — Architecture & ResourceBundle"
type: quiz
questions:
  - prompt: |
      Quelle couche de Sylius ne dépend d'**aucun composant Symfony** et peut être utilisée dans n'importe quel projet PHP ?
    options:
      - "Les Bundles (`Sylius\\Bundle\\*`)"
      - "Les Components (`Sylius\\Component\\*`)"
      - "L'application standard (`SyliusStandardEdition`)"
      - "Les plugins (`SyliusPlugin`)"
    answer: 1
    tags: [architecture]
    level: débutant
    explanation: |
      Les **Components** (`Sylius\Component\*`) contiennent les modèles, interfaces et logique métier en PHP pur, sans aucune dépendance Symfony. C'est la couche la plus portable. Les Bundles, eux, s'appuient sur Symfony (DI, Doctrine, Forms…).
  - prompt: |
      Dans `composer.json` d'un plugin Sylius, quelle valeur de `"type"` permet à Symfony Flex et Sylius de le reconnaître comme plugin ?
    options:
      - "`symfony-bundle`"
      - "`sylius-extension`"
      - "`sylius-plugin`"
      - "`composer-plugin`"
    answer: 2
    tags: [architecture, plugin]
    level: débutant
    explanation: |
      La valeur `"sylius-plugin"` dans le champ `"type"` du `composer.json` est la convention officielle Sylius. Elle permet aux outils (Flex, Sylius installer) de traiter le package différemment d'un simple bundle Symfony.
  - prompt: |
      Vous déclarez `sylius_resource: resources: app.book: classes: model: App\Entity\Book`. Quel service est automatiquement enregistré dans le conteneur Symfony ?
    options:
      - "`book.service`"
      - "`app.repository.book`"
      - "`doctrine.orm.book_manager`"
      - "`sylius.crud.book`"
    answer: 1
    tags: [resourcebundle]
    level: intermédiaire
    explanation: |
      ResourceBundle enregistre automatiquement `app.repository.book`, `app.factory.book` et `app.manager.book`. Le pattern est `<alias>.<type>.<resource_name>`. `doctrine.orm.book_manager` n'est pas un service généré par Sylius.
  - prompt: |
      Pourquoi Sylius recommande-t-il d'utiliser `$factory->createNew()` plutôt que `new Book()` pour instancier une entité ?
    options:
      - "Pour que Doctrine puisse tracer la création en base"
      - "Parce que la Factory peut être remplacée ou décorée sans modifier le code appelant"
      - "Pour éviter les erreurs de type PHP 8"
      - "Parce que `new Book()` ne déclenche pas les events ResourceBundle"
    answer: 1
    tags: [resourcebundle, factory]
    level: intermédiaire
    explanation: |
      La Factory est un service injectable : n'importe quel plugin peut la remplacer dans la config Resource sans modifier le code métier. Avec `new Book()`, le code est couplé à la classe concrète et impossible à étendre de l'extérieur.
  - prompt: |
      Quel événement Symfony est dispatché **avant** la sauvegarde en base lors de la mise à jour d'une Resource `app.order` ?
    options:
      - "`sylius.order.before_update`"
      - "`sylius.order.pre_update`"
      - "`kernel.order.pre_flush`"
      - "`app.order.update_started`"
    answer: 1
    tags: [resourcebundle, events]
    level: avancé
    explanation: |
      La convention de nommage des événements ResourceBundle est `sylius.<resource_name>.<pre|post>_<action>`. Pour une Resource `app.order`, l'événement avant mise à jour est `sylius.order.pre_update`. Le suffixe `pre_` indique qu'il est dispatché avant le flush Doctrine.
---

Cinq questions pour valider la compréhension de l'architecture en couches de Sylius et du mécanisme ResourceBundle.
