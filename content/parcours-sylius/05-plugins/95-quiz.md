---
title: "Quiz — Développement de plugins"
type: quiz
questions:
  - prompt: |
      Dans l'`AbstractResourceBundle`, quelle méthode indique à Sylius où trouver les modèles du plugin pour le mécanisme d'override ?
    options:
      - "`getResourceNamespace()`"
      - "`getModelNamespace()`"
      - "`getEntityNamespace()`"
      - "`getResourcePath()`"
    answer: 1
    tags: [plugin, resourcebundle]
    level: débutant
    explanation: |
      `getModelNamespace()` retourne le namespace PHP où se trouvent les modèles du plugin (ex. `'Acme\SyliusWishlistPlugin\Model'`). Sylius utilise cette info pour résoudre les overrides déclarés dans `sylius_<bundle>: resources: <resource>: classes: model:`.
  - prompt: |
      Comment ajouter un champ `brand` à l'entité `Product` de Sylius **sans casser les mises à jour futures** ?
    options:
      - "Modifier directement `vendor/sylius/sylius/src/.../Product.php`"
      - "Créer une entité `App\\Entity\\Product\\Product` qui étend `BaseProduct` + déclarer l'override dans `sylius_product.yaml`"
      - "Copier toute la classe `Product` dans `src/` et la modifier"
      - "Ajouter une colonne directement en SQL sans toucher au PHP"
    answer: 1
    tags: [plugin, override, entite]
    level: débutant
    explanation: |
      L'override via **extension** (hériter de `BaseProduct`) + **déclaration dans `sylius_product.yaml`** est le seul mécanisme compatible avec les mises à jour. Modifier le vendor ou copier la classe coupe le lien avec les évolutions upstream. L'ajout SQL brut casse l'ORM.
  - prompt: |
      Vous écrivez un service qui décore `sylius.shipping_calculator.flat_rate`. Quelle interface devez-vous implémenter pour garantir la compatibilité ?
    options:
      - "`Sylius\\Component\\Shipping\\Model\\ShippingMethodInterface`"
      - "`Sylius\\Component\\Shipping\\Calculator\\CalculatorInterface`"
      - "`Symfony\\Component\\DependencyInjection\\ContainerInterface`"
      - "`Sylius\\Bundle\\ShippingBundle\\Calculator\\AbstractCalculator`"
    answer: 1
    tags: [plugin, decoration, service]
    level: intermédiaire
    explanation: |
      Un decorator doit implémenter la **même interface** que le service qu'il décore. Pour le calculateur de livraison, c'est `Sylius\Component\Shipping\Calculator\CalculatorInterface`. Implémenter l'interface (pas étendre la classe concrète) garantit que le code reste compatible si Sylius remplace son implémentation interne.
  - prompt: |
      Pourquoi ne faut-il **jamais inclure de migrations Doctrine** dans un package plugin Sylius ?
    options:
      - "Parce que Doctrine ne supporte pas les migrations dans les vendors"
      - "Parce que les migrations doivent toutes résider dans l'application finale pour être exécutées dans le bon ordre"
      - "Parce que Sylius gère les migrations automatiquement via son installer"
      - "Parce que les plugins n'ont pas le droit de modifier la base de données"
    answer: 1
    tags: [plugin, migrations, bonne-pratique]
    level: intermédiaire
    explanation: |
      Les migrations Doctrine sont liées à **l'état de la base de données de l'application finale**, pas d'un seul bundle. Si deux plugins incluent chacun des migrations, les numéros de version peuvent entrer en conflit. La convention Sylius est de fournir les **fichiers de mapping Doctrine** dans le plugin, et de laisser `doctrine:migrations:diff` dans l'application finale générer la migration combinée.
  - prompt: |
      Dans un template Twig qui surcharge `@SyliusAdmin/Product/show.html.twig`, comment appeler le contenu du bloc `content` du template **original** ?
    options:
      - "`{% include '@SyliusAdmin/Product/show.html.twig' %}`"
      - "`{{ parent() }}` après `{% extends '@!SyliusAdmin/Product/show.html.twig' %}`"
      - "Impossible sans copier le contenu original"
      - "`{% use '@SyliusAdmin/Product/show.html.twig' %}`"
    answer: 1
    tags: [plugin, templates, twig]
    level: avancé
    explanation: |
      `{% extends '@!SyliusAdmin/Product/show.html.twig' %}` (avec `!`) charge le template original depuis le Bundle, pas depuis votre surcharge. Ensuite, `{{ parent() }}` dans un bloc inclut le contenu du bloc parent. Sans le `!`, Twig essaierait d'étendre votre propre fichier de surcharge → récursion infinie.
---

Cinq questions pour valider la maîtrise de la structure des plugins, des patterns d'override et des bonnes pratiques d'extension Sylius.
