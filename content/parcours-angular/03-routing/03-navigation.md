---
title: "Naviguer : routerLink & Router"
type: lesson
---

# Naviguer entre les vues

Deux façons : **déclarative** dans le template (`routerLink`), ou **programmatique** dans la classe (le service `Router`).

## Déclaratif : `routerLink`

Remplace `<a href>` pour naviguer sans recharger la page (SPA).

```html
<a routerLink="/products">All products</a>

<!-- with a parameter, use an array of segments -->
<a [routerLink]="['/products', product.id]">{{ product.name }}</a>

<!-- highlight the active link -->
<a routerLink="/products" routerLinkActive="active">Products</a>
```

`routerLinkActive="active"` ajoute la classe CSS `active` quand la route est celle affichée. Pratique pour la barre de navigation.

## Programmatique : le service `Router`

Pour naviguer depuis le code (après une soumission de formulaire, par exemple) :

```ts
import { Component, inject } from '@angular/core'
import { Router } from '@angular/router'

@Component({ /* ... */ })
export class LoginComponent {
  private router = inject(Router)

  onLoginSuccess(): void {
    // navigate after a successful action
    this.router.navigate(['/products'])
  }
}
```

`navigate(['/products', id])` prend un tableau de segments, comme `routerLink`.

## Query params

On ajoute des paramètres de requête (`?page=2&sort=name`) ainsi :

```html
<a [routerLink]="['/products']" [queryParams]="{ page: 2, sort: 'name' }">Page 2</a>
```

```ts
this.router.navigate(['/products'], { queryParams: { page: 2, sort: 'name' } })
```

> **À retenir —** `routerLink` (avec un **tableau** de segments pour les paramètres) dans le template ; le service `Router` + `navigate([...])` dans la classe. `routerLinkActive` stylise le lien courant ; `queryParams` ajoute le `?clé=valeur`.
