---
title: "Vue Router"
type: lesson
---

# Vue Router

Le routeur officiel : il associe des **URLs** à des **composants** (les « pages »).

## Définir les routes

```js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: Accueil },
  { path: '/factures/:id', component: Facture },   // :id = paramètre
]

export default createRouter({ history: createWebHistory(), routes })
```

## Naviguer

```vue
<RouterLink to="/factures/42">Voir</RouterLink>   <!-- déclaratif -->
```

```js
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
router.push('/factures/42')          // par code

const route = useRoute()
route.params.id                       // '42'
```

## Garde de navigation

Protéger une route (ex. authentification) :

```js
router.beforeEach((to) => {
  if (to.meta.auth && !connecté()) return '/login'
})
```

> **Repère —** `<RouterView>` est l'emplacement où la page courante s'affiche ;
> `<RouterLink>` remplace `<a>` pour naviguer sans recharger la page (SPA).
