---
title: "Cartes mémo — Entités & Fields"
type: flashcards
cards:
  - q: |
      Quelle est la différence entre une ContentEntity et une ConfigEntity en Drupal ?
    a: |
      **ContentEntity** : données éditables (nœuds, users, termes…) stockées dans des
      tables SQL, révisables, traduisibles. **ConfigEntity** : configuration du site
      (types de contenu, vues, blocs…) stockée en YAML, exportable avec `drush cex`,
      non révisable. Les ConfigEntities font partie du déploiement ; les ContentEntities
      font partie du contenu éditorial.
  - q: |
      Comment Drupal stocke-t-il les valeurs de champs (Field API) en base de données ?
    a: |
      Chaque champ sur un bundle crée une table dédiée :
      `{entity_type}__{field_name}` (ex. `node__field_tags`). Cette table contient
      `entity_id`, `revision_id`, `langcode`, `delta` (pour les valeurs multiples) et
      les colonnes spécifiques au type de champ. Drupal gère ces tables automatiquement
      — tu ne les manipules jamais directement.
  - q: |
      Quelles sont les trois couches d'un champ (Field API) et quel est le rôle de chacune ?
    a: |
      **FieldType** : définit le schéma de données (colonnes SQL + validation).
      **FieldWidget** : définit l'interface de saisie dans les formulaires d'édition.
      **FieldFormatter** : définit comment la valeur est rendue dans les templates Twig.
      Les trois sont des plugins Drupal — extensibles et remplaçables.
  - q: |
      Qu'est-ce que `EntityQuery` et en quoi ressemble-t-il au QueryBuilder Doctrine ?
    a: |
      `EntityQuery` est l'API de requête Drupal : `->condition()` équivaut à
      `->andWhere()`, `->sort()` à `->orderBy()`, `->range()` à `->setMaxResults()`.
      La différence principale : `->execute()` retourne des **IDs** (pas des objets) ;
      il faut ensuite `->loadMultiple($ids)`. Cela permet à Drupal d'utiliser son cache
      statique d'entités entre les appels.
  - q: |
      Pourquoi le module Paragraphs est-il si répandu en agence ?
    a: |
      Il permet de composer des pages avec des blocs de contenu **hétérogènes et
      ordonnables** (texte, image + légende, CTA, vidéo…) sans rigidifier le modèle.
      Chaque type de paragraphe a ses propres champs et son template Twig. C'est
      l'alternative Drupal aux page builders — sans les limitations de l'UI drag-and-drop,
      et entièrement contrôlable par le code.
---
