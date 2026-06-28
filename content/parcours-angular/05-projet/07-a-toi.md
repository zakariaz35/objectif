---
title: "À toi de jouer — ton propre projet"
type: lesson
---

# À toi de jouer

Tu as une vue complète : un service de données, un conteneur avec recherche et filtres, un
composant enfant qui communique par `@Input`/`@Output`. Maintenant, **fais-la tienne**.

Crée un vrai projet (`ng new my-app --standalone`), recopie le code des étapes, lance
`ng serve`, et étends-le.

## Idées d'extensions (du plus simple au plus ambitieux)

- **Trier** la liste : un menu déroulant « par nom / par prix » ; ajoute la logique de tri
  dans le service (`sortBy(products, key)`) et un getter qui l'enchaîne après les filtres.
- **Page de détail** : ajoute une route `products/:id` (étape Routing). Le clic sur une
  ligne navigue vers le détail, qui lit l'`id` via `ActivatedRoute`.
- **Vraie API** : remplace `getAll(): Product[]` par
  `getAll(): Observable<Product[]>` avec `HttpClient`, et consomme avec le pipe `async`
  (étape RxJS/HTTP). Les composants au-dessus changent à peine.
- **Persister les favoris** dans le navigateur :

  ```ts
  // save on every change
  localStorage.setItem('favorites', JSON.stringify([...this.favorites]))
  // and on startup
  this.favorites = new Set(JSON.parse(localStorage.getItem('favorites') ?? '[]'))
  ```

- **Signals** (Angular 17+) : remplace les getters dérivés par des `signal` + `computed`
  pour une réactivité plus fine — par exemple `query = signal('')` et
  `visibleProducts = computed(() => ...)`.
- **Tester** la logique pure du service (`search`, `sortBy`) avec un test unitaire — c'est
  exactement ce que la DI rend facile.

> **Pas d'idée ?** Reprends un autre domaine : une liste de **films**, de **recettes**, ou
> de **tâches**. L'important est de **construire** : c'est en assemblant service, composants
> et routing que tout le parcours se met en place.
