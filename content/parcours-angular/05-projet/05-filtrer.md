---
title: "Étape 4 — filtrer par disponibilité"
type: exercise
---

## Énoncé

Ajoute un filtre par disponibilité avec trois choix : **all** / **in stock** / **out of
stock**. Combine-le avec la recherche : la liste affichée doit respecter **les deux**
critères.

1. ajoute une propriété `availability: 'all' | 'in' | 'out'` (départ `'all'`) ;
2. trois boutons changent `availability` (mets en avant le bouton actif avec `[class.active]`) ;
3. le getter `visibleProducts` enchaîne recherche **puis** filtre de disponibilité.

<!--correction-->

## Correction

```ts
import { Component, inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ProductService, Product } from './product.service'

type Availability = 'all' | 'in' | 'out'

@Component({
  standalone: true,
  selector: 'app-product-list',
  imports: [FormsModule],
  template: `
    <h1>Products</h1>
    <input [(ngModel)]="query" placeholder="Search by name…" />

    <div class="filters">
      <button [class.active]="availability === 'all'" (click)="availability = 'all'">All</button>
      <button [class.active]="availability === 'in'" (click)="availability = 'in'">In stock</button>
      <button [class.active]="availability === 'out'" (click)="availability = 'out'">Out of stock</button>
    </div>

    <p>{{ visibleProducts.length }} result(s)</p>
    <ul>
      @for (product of visibleProducts; track product.id) {
        <li>
          {{ product.name }} — {{ product.price }} €
          @if (!product.inStock) { <em>(out of stock)</em> }
        </li>
      } @empty {
        <li>No match.</li>
      }
    </ul>
  `,
  styles: [`.active { font-weight: bold; }`],
})
export class ProductListComponent implements OnInit {
  private service = inject(ProductService)
  private all: Product[] = []
  query = ''
  availability: Availability = 'all'

  ngOnInit(): void {
    this.all = this.service.getAll()
  }

  get visibleProducts(): Product[] {
    const bySearch = this.service.search(this.all, this.query)
    return bySearch.filter((p) => {
      if (this.availability === 'in') return p.inStock
      if (this.availability === 'out') return !p.inStock
      return true
    })
  }
}
```

On enchaîne les deux filtres dans le getter : `search` d'abord, puis le filtre de
disponibilité. `[class.active]="availability === 'x'"` est une liaison de classe pratique
(ajoute la classe quand l'expression est vraie). Le compteur `visibleProducts.length` est
lui aussi dérivé — toujours à jour, jamais resynchronisé.
