---
title: "Étape 2 — afficher la liste"
type: exercise
---

## Énoncé

Crée `ProductListComponent` (standalone) qui :

1. injecte `ProductService` ;
2. charge les produits dans `ngOnInit` (dans une propriété `products`) ;
3. affiche le nom et le prix de chaque produit avec `@for` (et `track`), plus un `@empty`.

<!--correction-->

## Correction

```ts
import { Component, inject, OnInit } from '@angular/core'
import { ProductService, Product } from './product.service'

@Component({
  standalone: true,
  selector: 'app-product-list',
  template: `
    <h1>Products</h1>
    <ul>
      @for (product of products; track product.id) {
        <li>{{ product.name }} — {{ product.price }} €</li>
      } @empty {
        <li>No products.</li>
      }
    </ul>
  `,
})
export class ProductListComponent implements OnInit {
  private service = inject(ProductService)
  products: Product[] = []

  ngOnInit(): void {
    this.products = this.service.getAll()
  }
}
```

Le composant ne sait pas **d'où** viennent les produits : il les demande au service. C'est
le découplage de la DI. `track product.id` donne à Angular une clé stable pour un rendu
efficace, et `@empty` gère la liste vide sans condition supplémentaire.

> **Repère —** un composant « conteneur » comme celui-ci orchestre : il récupère la donnée
> (via un service) et la passe au template. La logique métier reste dans le service.
