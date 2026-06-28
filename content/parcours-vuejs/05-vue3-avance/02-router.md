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
  { path: '/', component: Home },
  { path: '/invoices/:id', component: Invoice },   // :id = parameter
]

export default createRouter({ history: createWebHistory(), routes })
```

## Naviguer

```vue
<RouterLink to="/invoices/42">View</RouterLink>   <!-- declarative -->
```

```js
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
router.push('/invoices/42')          // programmatically

const route = useRoute()
route.params.id                       // '42'
```

## Garde de navigation

Protéger une route (ex. authentification) :

```js
router.beforeEach((to) => {
  if (to.meta.auth && !isAuthenticated()) return '/login'
})
```

> **Repère —** `<RouterView>` est l'emplacement où la page courante s'affiche ;
> `<RouterLink>` remplace `<a>` pour naviguer sans recharger la page (SPA).
