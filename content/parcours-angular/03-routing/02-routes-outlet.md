---
title: "Déclarer des routes & RouterOutlet"
type: lesson
---

# Routes et `<router-outlet>`

Une route associe un **chemin** d'URL à un **composant**. On déclare un tableau de `Routes`.

```ts
import { Routes } from '@angular/router'
import { HomeComponent } from './home.component'
import { ProductListComponent } from './product-list.component'
import { ProductDetailComponent } from './product-detail.component'

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },  // :id = parameter
  { path: '**', component: NotFoundComponent },                  // wildcard, keep last
]
```

- `path: ''` : la racine (`/`).
- `path: 'products/:id'` : `:id` est un **paramètre** dynamique (`/products/42`).
- `path: '**'` : attrape tout (page 404). À placer **en dernier** : Angular prend la première route qui correspond.

## Brancher le routing (standalone)

Dans une app standalone, on fournit le routeur au démarrage :

```ts
import { bootstrapApplication } from '@angular/platform-browser'
import { provideRouter } from '@angular/router'
import { AppComponent } from './app.component'
import { routes } from './app.routes'

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)],
})
```

## Où s'affiche la page ? `<router-outlet>`

Le composant racine pose un `<router-outlet>` : c'est l'emplacement où le composant de la route courante est rendu.

```ts
import { Component } from '@angular/core'
import { RouterOutlet, RouterLink } from '@angular/router'

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/products">Products</a>
    </nav>
    <router-outlet />     <!-- the matched component renders here -->
  `,
})
export class AppComponent {}
```

> **À retenir —** `Routes` = un tableau `{ path, component }` ; le wildcard `'**'` se met en dernier. `provideRouter(routes)` branche le tout, et `<router-outlet>` est l'emplacement de rendu. Tout composant qui route doit importer `RouterOutlet` / `RouterLink`.
