---
title: "Quiz — Routing & Data fetching"
type: quiz
questions:
  - prompt: |
      Quel composant React Router v6 joue le rôle de « zone d'affichage » pour les routes enfants (équivalent de `<router-outlet>` Angular) ?
    options:
      - "`<Route />`"
      - "`<RouterView />`"
      - "`<Outlet />`"
      - "`<Switch />`"
    answer: 2
    tags: [routing]
    level: debutant
    explanation: |
      `<Outlet />` est l'emplacement où React Router affiche la route enfant correspondante. En Vue Router c'est `<RouterView>`, en Angular `<router-outlet>`. `<Switch>` vient de React Router v5 (remplacé par l'API déclarative en v6).
  - prompt: |
      Comment récupérer le paramètre `id` dans la route `/products/:id` ?
    options:
      - "`const id = useRoute().params.id`"
      - "`const { id } = useParams()`"
      - "`const id = this.route.params.id`"
      - "`const id = location.pathname.split('/')[2]`"
    answer: 1
    tags: [routing, params]
    level: debutant
    explanation: |
      `useParams()` retourne un objet avec les segments dynamiques de la route. `useRoute().params` est la syntaxe Vue Router. `this.route.params` est Angular. Le parsing manuel de `location.pathname` est fragile — on ne le fait pas.
  - prompt: |
      Quel est le principal avantage de React Query par rapport à un `useEffect` + `fetch` manuel ?
    options:
      - "React Query est inclus dans React, donc plus rapide à charger"
      - "React Query gère automatiquement le cache, la revalidation et les états loading/error"
      - "React Query empêche les re-rendus"
      - "React Query fonctionne sans Provider"
    answer: 1
    tags: [data-fetching, react-query]
    level: intermediaire
    explanation: |
      `useEffect` + `fetch` manuel fonctionne, mais il faut gérer soi-même : états loading/error, race conditions, cache, revalidation, déduplification. React Query (TanStack Query) fait tout ça automatiquement. C'est la recommandation de l'équipe React pour la majorité des apps.
  - prompt: |
      Dans React Router v6, `<NavLink to="/home">` ajoute automatiquement quelle classe quand la route est active ?
    options:
      - "`selected`"
      - "`current`"
      - "`active`"
      - "`router-link-active`"
    answer: 2
    tags: [routing]
    level: debutant
    explanation: |
      `<NavLink>` ajoute la classe `active` par défaut quand la route correspond. On peut la personnaliser via `className={({ isActive }) => isActive ? 'mon-actif' : ''}`. En Vue Router c'est `router-link-active`/`router-link-exact-active`.
  - prompt: |
      Le hook `use()` de React 19 sert à :
    options:
      - "Remplacer tous les hooks existants"
      - "\"Déballer\" une Promise ou un Context directement dans le corps d'un composant"
      - "Créer des hooks personnalisés"
      - "Gérer les erreurs globales"
    answer: 1
    tags: [react19, suspense]
    level: avance
    explanation: |
      `use(promise)` est un nouveau hook React 19 qui suspend le composant jusqu'à ce que la Promise soit résolue, en coordination avec `<Suspense>`. Il peut aussi lire un Context : `use(MyContext)`. Contrairement aux autres hooks, il peut être appelé de façon conditionnelle [source: react.dev].
---

Cinq questions sur React Router v6 et les patterns de data fetching.
