---
title: "Cartes mémo — TCA & Backend"
type: flashcards
cards:
  - q: |
      Quelle section du TCA définit le layout du formulaire d'édition dans le backend
      (l'ordre des champs, les onglets) ?
    a: |
      La section **`types`** du TCA. La clé est le type de record (souvent `'1'`) et
      la valeur contient `showitem` — une chaîne listant les champs, palettes et onglets
      (`--div--`) dans l'ordre d'affichage. Exemple :
      ```php
      'types' => ['1' => ['showitem' => 'title, --div--;Contenu, bodytext, image']]
      ```
  - q: |
      Quel type de champ TCA utiliser pour une relation 1-N avec formulaire imbriqué
      (ex. un article avec plusieurs sections) ?
    a: |
      Le type **`inline`** (IRRE — Inline Relational Record Editing). Il affiche les
      enregistrements enfants directement dans le formulaire de l'enregistrement parent,
      avec la possibilité de les créer/modifier/supprimer inline.
  - q: |
      Pourquoi utiliser `enableRichtext: true` dans la config d'un champ `text` TCA ?
    a: |
      Cela active l'éditeur de texte enrichi (RTE, par défaut CKEditor 5 en TYPO3 12)
      pour ce champ. Sans `enableRichtext`, le champ est une simple textarea. La config
      du RTE (barres d'outils, formats autorisés) peut être affinée via
      `richtextConfiguration` (nom d'un preset RTE défini dans TypoScript ou YAML).
  - q: |
      Qu'est-ce qu'un DB Mount sur un Backend User Group ?
    a: |
      Un **DB Mount** restreint la visibilité de l'éditeur à un sous-arbre de pages.
      Si le mount est sur la page uid=5, l'éditeur ne voit que les pages enfants de uid=5
      dans le Page Module — il ne peut pas naviguer ou modifier les pages en dehors de
      cette branche. Indispensable pour les sites multi-clients sur un même TYPO3.
  - q: |
      Où sont stockées les valeurs d'un FlexForm et comment y accéder dans Extbase ?
    a: |
      Les valeurs FlexForm sont stockées dans le champ `pi_flexform` de `tt_content`,
      sous forme de XML sérialisé. Dans un Controller Extbase, TYPO3 les désérialise
      automatiquement et les injecte dans `$this->settings` si les clés XML utilisent
      la convention `settings.<nomClé>`. On y accède directement :
      `$this->settings['itemsPerPage']`.
---

Lis, réfléchis, révèle, auto-évalue.
