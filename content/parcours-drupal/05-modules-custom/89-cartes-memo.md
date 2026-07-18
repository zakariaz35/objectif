---
title: "Cartes mémo — Modules custom"
type: flashcards
cards:
  - q: |
      Quels sont les deux fichiers obligatoires pour qu'un module Drupal soit reconnu ?
    a: |
      Un seul fichier est strictement obligatoire : **`my_module.info.yml`** avec au
      minimum `name`, `type: module` et `core_version_requirement`. Le fichier `.module`
      est optionnel (nécessaire seulement si tu déclares des hooks). Drupal découvre le
      module dès que le `.info.yml` est présent dans un dossier de modules.
  - q: |
      Comment déclarer un template Twig custom dans un module ?
    a: |
      1. Implémenter `hook_theme()` dans le fichier `.module` en déclarant le nom du
         thème et ses variables : `return ['my_module_card' => ['variables' => [...]]]`.
      2. Créer le fichier `templates/my-module-card.html.twig` (nom = thème avec
         underscores remplacés par tirets).
      Drupal résout automatiquement le template via la convention de nommage.
  - q: |
      Quelle est la différence entre `hook_preprocess_node()` et
      `hook_preprocess_node__article()` ?
    a: |
      `hook_preprocess_node()` est appelé pour **tous les types de nœuds** (article,
      page, produit…). `hook_preprocess_node__article()` est appelé uniquement pour
      les nœuds de type `article`. La version spécifique (`__article`) est à préférer
      quand la logique ne concerne qu'un type — elle est plus performante et plus lisible.
  - q: |
      Comment attacher une bibliothèque CSS/JS uniquement sur certaines pages en Drupal ?
    a: |
      Via le `#attached` du render array retourné par le controller ou le bloc :
      `'#attached' => ['library' => ['my_module/ma-biblio']]`. La bibliothèque n'est
      incluse que sur les pages qui rendent ce render array. Pour une inclusion globale,
      utiliser `hook_page_attachments()`. Ne jamais ajouter de `<link>` ou `<script>`
      en dur dans un template.
---
