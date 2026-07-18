---
title: "Injecter : inject() vs constructeur"
type: lesson
---

# Récupérer un service dans un composant

Deux façons d'obtenir une dépendance. Les deux marchent ; la fonction `inject()` est la tendance moderne.

## Via le constructeur (classique)

```ts
import { Component } from '@angular/core'
import { CartService } from './cart.service'

@Component({
  standalone: true,
  selector: 'app-cart',
  template: `<p>{{ service.count() }} items — {{ service.total() }} €</p>`,
})
export class CartComponent {
  // Angular reads the type and injects the matching instance
  constructor(public service: CartService) {}
}
```

Angular lit le **type** du paramètre (`CartService`) et fournit l'instance. Le modificateur (`public`) crée d'office la propriété — pas besoin de réassigner.

## Via `inject()` (moderne, Angular 14+)

```ts
import { Component, inject } from '@angular/core'
import { CartService } from './cart.service'

@Component({
  standalone: true,
  selector: 'app-cart',
  template: `<p>{{ service.count() }} items — {{ service.total() }} €</p>`,
})
export class CartComponent {
  private service = inject(CartService)
}
```

`inject(CartService)` retourne l'instance, appelée au niveau du champ. Avantages :

- **moins de bruit** quand on a plusieurs dépendances (pas de longue liste de paramètres) ;
- réutilisable dans des **fonctions** hors classe (ex. fonctions de garde de route, intercepteurs) ;
- joue mieux avec l'héritage.

> `inject()` doit être appelé dans un **contexte d'injection** : initialisation d'un champ, constructeur, ou fabrique d'un provider. Pas dans une méthode appelée plus tard.

## Le même service partagé

Comme `CartService` est `providedIn: 'root'`, deux composants différents qui l'injectent voient **le même panier** :

```ts
// CartIconComponent and CheckoutComponent both:
private cart = inject(CartService)
// ...read the SAME items, total, count
```

C'est la mécanique d'état partagé d'Angular avant même de parler de store.

> **À retenir —** constructeur ou `inject()`, c'est le **type** qui détermine quoi injecter. Privilégie `inject()` pour le code neuf (plus concis, utilisable hors classe). `providedIn: 'root'` garantit que tout le monde partage la même instance.
