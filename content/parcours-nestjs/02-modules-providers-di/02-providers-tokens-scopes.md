---
title: "Providers : @Injectable, tokens et scopes"
type: lesson
---

## `@Injectable()` : une classe que Nest peut construire pour toi

```ts
// products.service.ts
import { Injectable } from "@nestjs/common"

@Injectable()
export class ProductsService {
  private products: { id: number; name: string; price: number }[] = []

  findAll() {
    return this.products
  }
}
```

`@Injectable()` marque une classe comme **provider** : Nest sait qu'il peut
l'instancier et l'injecter dans un constructeur, en résolvant lui-même les
dépendances de son propre constructeur (récursivement).

```ts
// orders.service.ts
import { Injectable } from "@nestjs/common"
import { ProductsService } from "../products/products.service"

@Injectable()
export class OrdersService {
  // Nest resolves ProductsService automatically: nothing to instantiate by hand.
  constructor(private readonly productsService: ProductsService) {}

  createOrder(productId: number) {
    const products = this.productsService.findAll()
    const product = products.find((p) => p.id === productId)
    if (!product) throw new Error("Product not found")
    return { product, createdAt: new Date() }
  }
}
```

> **Symfony → NestJS.** C'est **l'autowiring** de Symfony, à l'identique :
> tu déclares un service (constructeur typé), et le conteneur résout la
> chaîne de dépendances tout seul — aucun `new` manuel, aucune usine à
> écrire pour le cas courant. `@Injectable()` correspond au service
> **autowiré et privé par défaut** de Symfony (`services.yaml` :
> `App\: resource: '../src/'` avec `autowire: true`).

## Provider par jeton : quand ce n'est pas une classe

Tout n'est pas une classe injectable : une valeur de config, une constante,
une fonction *factory*. Nest permet d'enregistrer un provider derrière un
**jeton** (`string` ou `Symbol`) plutôt qu'une classe :

```ts
// products.module.ts
import { Module } from "@nestjs/common"
import { ProductsService } from "./products.service"

export const TAX_RATE = "TAX_RATE" // token: a plain string (or Symbol) identifying the provider

@Module({
  providers: [
    ProductsService,
    { provide: TAX_RATE, useValue: 0.2 },   // a constant value behind a token
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
```

```ts
// products.service.ts
import { Inject, Injectable } from "@nestjs/common"
import { TAX_RATE } from "./products.module"

@Injectable()
export class ProductsService {
  // @Inject(TOKEN) is required here: TypeScript types alone cannot
  // resolve a plain value, only classes/interfaces do.
  constructor(@Inject(TAX_RATE) private readonly taxRate: number) {}

  priceWithTax(price: number) {
    return price * (1 + this.taxRate)
  }
}
```

Trois formes de provider existent au-delà de la classe simple :

| Forme | Usage |
|---|---|
| `{ provide: TOKEN, useValue: X }` | Une valeur constante (config, constante métier) |
| `{ provide: TOKEN, useClass: MyImpl }` | Lier un jeton (ou une interface) à une implémentation concrète |
| `{ provide: TOKEN, useFactory: (...) => X, inject: [...] }` | Construire la valeur dynamiquement (ex. lire une variable d'env) |

> **Symfony → NestJS.** `useValue` correspond à un `parameter` de
> `services.yaml` (`app.tax_rate: 0.2`) injecté via `%app.tax_rate%`.
> `useClass` derrière un jeton correspond à un **alias de service** (lier
> une interface `PaymentGatewayInterface` à `StripeGateway` dans
> `services.yaml`). `useFactory` correspond à une **factory de service**
> Symfony (`factory: ['@some.factory', 'create']`).

## Scopes : combien d'instances, et pour qui ?

Par défaut, un provider Nest est un **singleton** : une seule instance,
partagée par toute l'application, créée une fois au démarrage.

```ts
import { Injectable, Scope } from "@nestjs/common"

@Injectable({ scope: Scope.DEFAULT })     // singleton (implicit, the default)
export class ProductsService {}

@Injectable({ scope: Scope.REQUEST })     // one new instance PER incoming request
export class RequestContextService {}

@Injectable({ scope: Scope.TRANSIENT })   // one new instance PER injection point
export class TransientLogger {}
```

> **Symfony → NestJS.** `Scope.DEFAULT` (singleton) est le comportement
> **par défaut** de Symfony aussi (`shared: true`). `Scope.REQUEST`
> correspond à un service **non partagé recréé par requête** — cas plus rare
> en Symfony, qui n'a pas d'équivalent direct courant : on y reste plutôt sur
> un service partagé (singleton) et on récupère l'état propre à la requête
> via des objets de contexte dédiés (ex. l'utilisateur courant via
> `Security`, la `Request` via le `RequestStack`).

> ⚠️ **Erreur fréquente — abuser de `Scope.REQUEST`.** Un provider en
> `REQUEST` scope **recrée toute sa chaîne de dépendances** à chaque requête
> (l'instanciation cesse d'être partagée), avec un coût de performance
> réel. Réserve-le aux cas où tu as **vraiment** besoin d'un état
> par-requête (ex. le tenant courant en multi-tenant) ; le singleton
> (`Scope.DEFAULT`) reste le bon choix dans l'immense majorité des cas.

## À retenir

- `@Injectable()` marque une classe comme provider : Nest résout ses
  dépendances de constructeur automatiquement — l'autowiring Symfony, en
  TypeScript.
- Un provider peut aussi être une **valeur**, une **classe alternative**, ou
  une **factory**, enregistrée derrière un **jeton** (`useValue`/`useClass`/
  `useFactory`) — le pendant des `parameters`/alias/factories Symfony.
- Le **scope par défaut est singleton** (une instance pour toute
  l'application) ; `Scope.REQUEST`/`Scope.TRANSIENT` existent, mais coûtent
  en performance — à réserver à des besoins réels.
