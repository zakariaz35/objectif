---
title: "Étape 1 — le service de données"
type: exercise
---

## Énoncé

On commence par la **donnée**. Crée un `ProductService` (`providedIn: 'root'`) qui :

1. définit le type `interface Product { id: number; name: string; price: number; inStock: boolean }` ;
2. expose `getAll(): Product[]` renvoyant 4 ou 5 produits codés en dur (on simule l'API) ;
3. expose une méthode pure `search(products, query): Product[]` qui garde les produits dont
   le `name` contient `query` (insensible à la casse ; une requête vide renvoie tout).

On garde la logique de recherche **dans le service** pour qu'elle soit testable et
réutilisable.

<!--correction-->

## Correction

```ts
import { Injectable } from '@angular/core'

export interface Product {
  id: number
  name: string
  price: number
  inStock: boolean
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private products: Product[] = [
    { id: 1, name: 'Standing Desk', price: 199, inStock: true },
    { id: 2, name: 'Desk Lamp', price: 39, inStock: false },
    { id: 3, name: 'Office Chair', price: 89, inStock: true },
    { id: 4, name: 'Notebook', price: 5, inStock: true },
    { id: 5, name: 'Mechanical Keyboard', price: 79, inStock: false },
  ]

  getAll(): Product[] {
    return this.products
  }

  // pure helper: case-insensitive name search; empty query returns everything
  search(products: Product[], query: string): Product[] {
    const q = query.trim().toLowerCase()
    if (q === '') return products
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }
}
```

`search` est **pure** : mêmes entrées → même sortie, aucun effet de bord. C'est exactement
le genre de logique qu'on a appris à tester en exercice interactif (étape RxJS/HTTP). Plus
tard, `getAll` pourrait renvoyer un `Observable<Product[]>` issu de `HttpClient` sans rien
changer aux composants au-dessus.
