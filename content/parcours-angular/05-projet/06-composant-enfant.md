---
title: "Étape 5 — extraire une ligne en composant"
type: exercise
---

## Énoncé

La ligne de produit grossit (prix, badge « out of stock », bientôt un bouton). Extrais-la
dans un composant enfant `ProductItemComponent` :

1. il reçoit le produit via `@Input({ required: true }) product` ;
2. il a un bouton « ★ » qui **émet** `@Output() toggleFavorite` (avec l'`id` du produit) ;
3. le parent écoute l'événement et journalise (ou met à jour un état de favoris).

C'est l'occasion d'appliquer le « données en bas, événements en haut ».

<!--correction-->

## Correction

L'enfant — présentation pure, ne mute jamais son `@Input` :

```ts
import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Product } from './product.service'

@Component({
  standalone: true,
  selector: 'app-product-item',
  template: `
    <li>
      {{ product.name }} — {{ product.price }} €
      @if (!product.inStock) { <em>(out of stock)</em> }
      <button (click)="toggleFavorite.emit(product.id)">★</button>
    </li>
  `,
})
export class ProductItemComponent {
  @Input({ required: true }) product!: Product
  @Output() toggleFavorite = new EventEmitter<number>()
}
```

Le parent — passe la donnée et écoute l'événement :

```ts
@Component({
  standalone: true,
  selector: 'app-product-list',
  imports: [FormsModule, ProductItemComponent],
  template: `
    <!-- …search + filters… -->
    <ul>
      @for (product of visibleProducts; track product.id) {
        <app-product-item
          [product]="product"
          (toggleFavorite)="onToggleFavorite($event)"
        />
      } @empty {
        <li>No match.</li>
      }
    </ul>
  `,
})
export class ProductListComponent {
  // …query, availability, visibleProducts…
  favorites = new Set<number>()

  onToggleFavorite(id: number): void {
    this.favorites.has(id) ? this.favorites.delete(id) : this.favorites.add(id)
    console.log('favorites:', [...this.favorites])
  }
}
```

L'enfant ne décide pas s'il est favori : il **signale** une intention (`toggleFavorite`) et
le parent, propriétaire de l'état `favorites`, tranche. Le parent doit importer
`ProductItemComponent` dans ses `imports` pour utiliser `<app-product-item>`.

> **Repère —** un composant de **présentation** (enfant) reçoit des `@Input`, émet des
> `@Output`, et ne possède pas l'état. Un composant **conteneur** (parent) détient l'état
> et orchestre. Cette séparation est ce qui rend une feature Angular maintenable.
