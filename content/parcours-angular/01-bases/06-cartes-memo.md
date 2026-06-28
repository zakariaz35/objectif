---
title: "Cartes mémo — les bases"
type: flashcards
cards:
  - q: |
      À quoi sert le décorateur `@Component`, et qu'est-ce qu'un composant `standalone` ?
    a: |
      `@Component` attache des **métadonnées** (selector, template, styles, imports) à une
      classe TypeScript pour en faire un composant. `standalone: true` signifie qu'il ne
      dépend d'aucun `NgModule` : il déclare lui-même ses dépendances via `imports`. C'est
      la norme depuis Angular 17.
  - q: |
      Quelle est la différence entre `src="avatarUrl"` et `[src]="avatarUrl"` ?
    a: |
      `src="avatarUrl"` passe la **chaîne littérale** `"avatarUrl"`. `[src]="avatarUrl"`
      est une **liaison de propriété** : Angular évalue l'expression `avatarUrl` (une
      propriété de la classe) et pousse sa valeur vers le DOM.
  - q: |
      Que représentent les syntaxes `{{ }}`, `[ ]`, `( )` et `[( )]` ?
    a: |
      `{{ }}` = interpolation (afficher du texte). `[ ]` = liaison de propriété (classe →
      vue). `( )` = liaison d'événement (vue → classe). `[( )]` = double sens, ex.
      `[(ngModel)]` pour les formulaires (combine `[ ]` et `( )`).
  - q: |
      Pourquoi le control flow `@for` impose-t-il `track` ?
    a: |
      `track` dit à Angular comment **identifier** chaque élément (souvent une clé stable
      comme `item.id`). Sans cela, Angular re-créerait des nœuds DOM à chaque changement.
      Avec, il réutilise les nœuds existants et ne met à jour que ce qui a changé : c'est
      une optimisation de rendu.
  - q: |
      Un composant enfant veut signaler une suppression à son parent. Input ou Output ?
    a: |
      **Output**. Le parent passe les données vers l'enfant via `@Input` ; l'enfant fait
      remonter une intention via un `@Output` (un `EventEmitter` sur lequel il appelle
      `.emit()`). On ne mute jamais un `@Input` dans l'enfant.
  - q: |
      Où charger des données : dans le constructeur ou dans `ngOnInit` ?
    a: |
      Dans **`ngOnInit`**. Le constructeur sert à l'injection de dépendances et s'exécute
      avant qu'Angular ait initialisé les `@Input`. `ngOnInit` est appelé une fois, après,
      quand le composant est prêt — c'est l'endroit pour déclencher un chargement.
---

Lis la question, réfléchis, révèle, auto-évalue.
