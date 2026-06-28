---
title: "Quiz éclair — RxJS & HTTP"
type: quiz
questions:
  - prompt: |
      Tu écris `this.http.get<Product[]>('/api/products')` mais aucune requête ne part dans
      l'onglet réseau. Pourquoi ?
    options:
      - "L'URL est invalide"
      - "Un Observable est lazy : rien ne part tant qu'on ne s'y abonne pas"
      - "Il faut typer la réponse avec `any`"
      - "`HttpClient` n'a pas été importé"
    answer: 1
    explanation: >
      `HttpClient` renvoie un Observable **lazy**. La requête se déclenche au `subscribe`
      (ou quand le pipe `async` s'abonne). Sans abonnement, rien ne part.
  - prompt: |
      Tu reçois un `Observable<Product[]>` et veux n'émettre que les noms. Quel opérateur ?
    options:
      - "`filter((products) => products.map((p) => p.name))`"
      - "`map((products) => products.map((p) => p.name))`"
      - "`catchError((products) => products.map((p) => p.name))`"
      - "`map((products) => products.filter((p) => p.name))`"
    answer: 1
    explanation: >
      `map` (RxJS) transforme la valeur émise (le tableau). À l'intérieur, `products.map`
      (Array) extrait chaque nom. `filter` déciderait juste si l'émission passe, ce n'est
      pas le besoin ici.
  - prompt: |
      Quel est le rôle de `catchError((err) => of([]))` après un `http.get` ?
    options:
      - "Réessayer la requête trois fois"
      - "Intercepter l'erreur et émettre une liste vide à la place"
      - "Annuler l'abonnement"
      - "Convertir l'Observable en Promise"
    answer: 1
    explanation: >
      `catchError` intercepte l'erreur et renvoie un flux de repli. `of([])` émet un
      tableau vide puis complète, ce qui évite que l'UI plante.
  - prompt: |
      Quelle est la façon recommandée de consommer un Observable dans un template ?
    options:
      - "`subscribe` dans `ngOnInit` et stocker dans une propriété"
      - "Le pipe `async` (`obs$ | async`), qui gère l'abonnement et le désabonnement"
      - "Convertir en Promise avec `toPromise()`"
      - "Appeler `.value` sur l'Observable"
    answer: 1
    explanation: >
      Le pipe `async` s'abonne à l'affichage et se désabonne à la destruction : pas de
      `subscribe` manuel, pas de fuite. C'est la voie à privilégier.
  - prompt: |
      Tu t'abonnes manuellement dans le constructeur. Comment éviter la fuite mémoire ?
    options:
      - "Rien, Angular nettoie tout seul"
      - "Appeler `unsubscribe()` dans le constructeur"
      - "Ajouter `.pipe(takeUntilDestroyed())` avant `subscribe`"
      - "Mettre l'abonnement dans `ngOnInit`"
    answer: 2
    explanation: >
      `takeUntilDestroyed()` (Angular 16+), appelé dans le contexte d'injection du
      constructeur, coupe l'abonnement à la destruction du composant. Sans cela, un flux
      continu fuiterait.
---

Cinq questions pour valider RxJS et HTTP.
