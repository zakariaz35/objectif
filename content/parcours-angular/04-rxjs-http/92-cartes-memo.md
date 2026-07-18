---
title: "Cartes mémo — RxJS & HTTP"
type: flashcards
cards:
  - q: |
      Trois différences entre une `Promise` et un `Observable` ?
    a: |
      1) Une Promise émet **une** valeur, un Observable un **flux** (0..n). 2) Une Promise
      est **eager** (s'exécute tout de suite), un Observable est **lazy** (rien tant qu'on
      ne `subscribe` pas). 3) Un Observable est **annulable** (`unsubscribe`) et offre des
      opérateurs riches (`map`, `filter`, `debounceTime`…).
  - q: |
      Pourquoi un `this.http.get(...)` ne déclenche-t-il aucune requête tant qu'on ne s'y
      abonne pas ?
    a: |
      Parce qu'un Observable est **lazy** : il ne fait rien avant `subscribe`. `HttpClient`
      renvoie un Observable « froid », donc la requête part au moment de l'abonnement (ou
      quand le pipe `async` s'abonne pour toi).
  - q: |
      Différence entre `map` (RxJS) et `filter` (RxJS) ?
    a: |
      `map` **transforme** la valeur émise. `filter` décide si **l'émission entière**
      passe ou non. Pour filtrer le **contenu d'un tableau** émis en une fois, on fait
      `map(arr => arr.filter(...))`, pas le `filter` de RxJS.
  - q: |
      À quoi sert `catchError` et avec quoi le combine-t-on souvent ?
    a: |
      Il **intercepte une erreur** du flux pour éviter de casser l'abonnement. On le
      combine souvent avec `of(fallback)` (ex. `of([])`) pour émettre une valeur de repli
      et laisser l'UI continuer à fonctionner.
  - q: |
      Quelle est la façon la plus propre de consommer un Observable dans un template, et
      pourquoi ?
    a: |
      Le pipe **`async`** (`obs$ | async`). Il s'abonne quand le composant s'affiche et
      **se désabonne automatiquement** à sa destruction : pas de `subscribe` manuel, pas
      de fuite mémoire.
  - q: |
      Quand on s'abonne manuellement, comment éviter une fuite mémoire (Angular 16+) ?
    a: |
      Ajouter `.pipe(takeUntilDestroyed())` avant `subscribe`. Appelé dans le constructeur
      (contexte d'injection), il coupe l'abonnement à la destruction du composant. Hors
      constructeur, on lui passe un `DestroyRef`.
---

Lis, réfléchis, révèle, auto-évalue.
