---
title: "Étape 3 — rechercher par nom"
type: exercise
---

## Énoncé

Ajoute un champ de recherche. Le composant doit :

1. avoir une propriété `query = ''` liée à un input via `[(ngModel)]` (n'oublie pas
   d'importer `FormsModule`) ;
2. exposer une liste **dérivée** `visibleProducts` qui applique `service.search(...)` ;
3. afficher cette liste dérivée plutôt que la liste brute.

Indice : recalcule la liste filtrée dans un **getter** plutôt que de la stocker, pour
qu'elle suive `query` automatiquement.

<!--correction-->

## Correction

```ts
import { Component, inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ProductService, Product } from './product.service'

@Component({
  standalone: true,
  selector: 'app-product-list',
  imports: [FormsModule],
  template: `
    <h1>Products</h1>
    <input [(ngModel)]="query" placeholder="Search by name…" />

    <ul>
      @for (product of visibleProducts; track product.id) {
        <li>{{ product.name }} — {{ product.price }} €</li>
      } @empty {
        <li>No match.</li>
      }
    </ul>
  `,
})
export class ProductListComponent implements OnInit {
  private service = inject(ProductService)
  private all: Product[] = []
  query = ''

  ngOnInit(): void {
    this.all = this.service.getAll()
  }

  // derived: recomputed from `all` + `query` on every change detection
  get visibleProducts(): Product[] {
    return this.service.search(this.all, this.query)
  }
}
```

`visibleProducts` est un **getter** : il dérive de `all` et `query`, et se réévalue quand
l'un d'eux change. On ne **duplique** pas l'état (pas de second tableau à synchroniser à la
main) — même principe qu'un `computed` en Vue. La logique de filtre, elle, reste dans le
service (`search`), donc testable isolément.

> **Repère —** dérive, ne duplique pas. Une donnée calculable à partir d'une autre se met
> dans un getter (ou un `computed`/signal), jamais dans une propriété qu'on resynchronise.
