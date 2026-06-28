---
title: "Quiz éclair — les bases"
type: quiz
questions:
  - prompt: |
      Dans un template, quelle syntaxe réagit à un **clic** en appelant une méthode de la
      classe ?
    options:
      - "{{ onClick() }}"
      - "[click]=\"onClick()\""
      - "(click)=\"onClick()\""
      - "*click=\"onClick()\""
    answer: 2
    explanation: >
      Les parenthèses `( )` lient un **événement**. `(click)="onClick()"` appelle la
      méthode à chaque clic. Les crochets `[ ]` servent à lier une propriété (donnée →
      vue), pas un événement.
  - prompt: |
      Tu écris `<input [(ngModel)]="query" />`. Que faut-il pour que cela fonctionne ?
    options:
      - "Rien, ngModel est disponible partout"
      - "Importer `FormsModule` dans le composant"
      - "Importer `CommonModule` dans le composant"
      - "Déclarer `query` avec `@Input()`"
    answer: 1
    explanation: >
      `[(ngModel)]` vit dans `FormsModule`. Un composant standalone doit l'ajouter à son
      tableau `imports`. (Le binding double sens combine `[ngModel]` et
      `(ngModelChange)`.)
  - prompt: |
      Quelle affirmation sur `@for` (Angular 17+) est correcte ?
    options:
      - "`track` est optionnel et sert seulement au style"
      - "`track` est obligatoire et identifie chaque élément pour le rendu"
      - "`@for` nécessite d'importer `CommonModule`"
      - "`@for` ne gère pas le cas d'une liste vide"
    answer: 1
    explanation: >
      `track` est **obligatoire** : il dit à Angular comment identifier chaque élément pour
      optimiser le rendu. Le control flow `@for`/`@if` est intégré (aucun import) et `@for`
      propose `@empty` pour la liste vide.
  - prompt: |
      Un composant enfant a `@Input() label`. Le parent fait `<app-tag [label]="title" />`.
      Que se passe-t-il si l'enfant fait `this.label = 'x'` ?
    options:
      - "C'est la bonne façon de mettre à jour le parent"
      - "Cela lève une erreur de compilation"
      - "Cela fonctionne techniquement mais casse le flux unidirectionnel : à éviter"
      - "Le parent est automatiquement mis à jour"
    answer: 2
    explanation: >
      Techniquement la propriété change dans l'enfant, mais cela **ne remonte pas** au
      parent et brise le principe « données vers le bas, événements vers le haut ». Pour
      modifier une donnée du parent, l'enfant émet un `@Output`.
  - prompt: |
      Où placer un chargement de données qui doit s'exécuter une fois le composant prêt ?
    options:
      - "Dans le constructeur"
      - "Dans `ngOnInit`"
      - "Dans `ngOnDestroy`"
      - "Directement dans le template"
    answer: 1
    explanation: >
      `ngOnInit` s'exécute une fois, après l'initialisation des `@Input`. Le constructeur
      s'exécute trop tôt (avant les inputs) et doit rester réservé à l'injection de
      dépendances.
---

Cinq questions pour valider les bases. Lis bien les énoncés : la syntaxe compte.
