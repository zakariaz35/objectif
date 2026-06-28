---
title: "Exercice — configurer un jeu de routes (reveal)"
type: exercise
---

## Énoncé

Cet exercice porte sur la **configuration** du Router : il ne s'exécute pas dans le bac à
sable, on le fait « sur papier » puis on compare à la correction.

On veut l'application suivante :

- `/` affiche `HomeComponent` ;
- `/products` affiche `ProductListComponent` ;
- `/products/:id` affiche `ProductDetailComponent` ;
- la section `/admin` est **chargée en lazy** depuis `./admin/admin.component` ;
- toute autre URL affiche `NotFoundComponent`.

Écris le tableau `routes: Routes` correspondant. Pense à l'**ordre** des routes.

<!--correction-->

## Correction

```ts
import { Routes } from '@angular/router'
import { HomeComponent } from './home.component'
import { ProductListComponent } from './product-list.component'
import { ProductDetailComponent } from './product-detail.component'
import { NotFoundComponent } from './not-found.component'

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then((m) => m.AdminComponent),
  },
  { path: '**', component: NotFoundComponent },   // wildcard MUST be last
]
```

Points clés :

- l'ordre compte : Angular retient la **première** route qui correspond, donc le wildcard
  `'**'` se place en **dernier** ;
- `path: 'products'` (statique) est déclaré avant `'products/:id'` (paramétré) — peu importe
  ici car ils ne se chevauchent pas, mais en cas de doute, les routes spécifiques d'abord ;
- `loadComponent` avec `import()` charge le code d'`/admin` **à la demande**, hors du
  bundle initial.
