---
title: "Quiz — Entités & Fields"
type: quiz
questions:
  - prompt: |
      Un développeur veut lister les 10 articles publiés les plus récents. Quelle
      séquence de code est correcte ?
    options:
      - "EntityTypeManager::loadMultiple(['type' => 'article', 'status' => 1])"
      - "getStorage('node')->getQuery()->condition('type','article')->condition('status',1)->sort('created','DESC')->range(0,10)->execute() puis loadMultiple($ids)"
      - "\\Drupal::database()->query('SELECT * FROM node WHERE type = :type', [':type' => 'article'])"
      - "NodeQuery::create()->filter('status', 1)->limit(10)->get()"
    answer: 1
    tags: [entity-api, entity-query]
    level: debutant
    explanation: >
      La bonne pratique est d'utiliser EntityQuery (option 2) : elle applique les contrôles
      d'accès, utilise le cache d'entités, et reste agnostique du schéma SQL. L'option 1
      n'est pas une API valide. L'option 3 (requête SQL brute) contourne les contrôles
      d'accès et le cache — à n'utiliser qu'en dernier recours. L'option 4 n'existe pas.

  - prompt: |
      Quelle table SQL Drupal crée-t-il automatiquement pour stocker les valeurs du champ
      `field_tags` (type : entity_reference) sur les nœuds ?
    options:
      - "field_data_field_tags"
      - "node__field_tags"
      - "drupal_node_field_tags"
      - "Les références sont stockées directement dans la table `node_field_data`"
    answer: 1
    tags: [field-api, database, storage]
    level: intermediaire
    explanation: >
      Depuis Drupal 8, le schéma de stockage des champs suit la convention
      `{entity_type}__{field_name}`. Pour un champ field_tags sur les nœuds, c'est
      node__field_tags. Le format field_data_ (option 1) était la convention D7,
      obsolète. Les références ne sont jamais stockées dans node_field_data.

  - prompt: |
      Un designer veut modifier l'affichage du champ `field_image` (ajouter une légende
      sous l'image). Où configure-t-on cela en Drupal ?
    options:
      - "Dans le template Twig du type de contenu, en modifiant manuellement le HTML"
      - "Dans le FieldFormatter du champ, configurable via Structure > Types de contenu > Gérer l'affichage"
      - "Dans settings.php en ajoutant une variable de thème"
      - "Dans le FieldWidget, qui contrôle à la fois la saisie et l'affichage"
    answer: 1
    tags: [field-formatter, display, theming]
    level: debutant
    explanation: >
      L'affichage d'un champ est contrôlé par son FieldFormatter, configurable via
      l'interface « Gérer l'affichage » (Manage display) — sans toucher au code.
      Le FieldWidget (option 4) gère uniquement la saisie. Modifier le template Twig
      (option 1) est possible mais déconseillé pour de simples options d'affichage
      disponibles en UI.

  - prompt: |
      Dans quel cas crée-t-on une entité custom en code plutôt que d'utiliser un type de
      contenu standard ?
    options:
      - "Toujours : les entités custom sont plus performantes que les types de contenu"
      - "Quand les données ont une structure métier complexe (ex. commandes, produits) qui nécessite une logique spécifique, des routes dédiées et des permissions granulaires"
      - "Quand on veut stocker plus de 10 champs sur une entité"
      - "Uniquement pour les entités sans interface d'édition"
    answer: 1
    tags: [entity-api, architecture, custom-entity]
    level: intermediaire
    explanation: >
      Les entités custom sont justifiées pour les données métier complexes nécessitant
      logique dédiée, routes spécifiques et gestion fine des permissions — pas pour le
      contenu éditorial classique. Les types de contenu couvrent la plupart des besoins
      éditoriaux. Le nombre de champs ou l'absence d'UI ne sont pas des critères.
---
