---
title: "@Controller : déclarer des routes HTTP"
type: lesson
---

## Un contrôleur, un préfixe, des méthodes

```ts
// products.controller.ts
import { Controller, Get, Post, Put, Delete, Patch } from "@nestjs/common"

@Controller("products")   // every route below is prefixed with /products
export class ProductsController {
  @Get()                  // GET /products
  findAll() {
    return []
  }

  @Get(":id")              // GET /products/:id
  findOne() {
    return {}
  }

  @Post()                  // POST /products
  create() {
    return {}
  }

  @Put(":id")               // PUT /products/:id (full replace)
  replace() {
    return {}
  }

  @Patch(":id")             // PATCH /products/:id (partial update)
  update() {
    return {}
  }

  @Delete(":id")            // DELETE /products/:id
  remove() {
    return {}
  }
}
```

> **Symfony → NestJS.** Ligne à ligne, c'est l'exact équivalent d'un
> contrôleur Symfony avec des attributs `#[Route]` :
>
> ```php
> #[Route('/products', name: 'products_')]
> class ProductsController extends AbstractController
> {
>     #[Route('', methods: ['GET'])]
>     public function findAll(): Response { /* ... */ }
>
>     #[Route('/{id}', methods: ['GET'])]
>     public function findOne(string $id): Response { /* ... */ }
> }
> ```
>
> `@Controller('products')` joue le rôle du préfixe posé sur la classe ;
> chaque `@Get()`/`@Post()`/... joue le rôle d'un `#[Route(..., methods:
> [...])]` sur la méthode. Le principe de composition **préfixe de classe +
> chemin de méthode** est identique.

## Chaque contrôleur ne doit connaître QUE le protocole HTTP

```ts
// ✅ The controller does ONE thing: translate HTTP into a service call.
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll() // delegates immediately
  }
}
```

```ts
// ❌ Business logic leaking into the controller: hard to test, hard to reuse
@Controller("products")
export class ProductsController {
  @Get()
  findAll() {
    const db = openDatabaseConnection() // wrong layer for this
    return db.query("SELECT * FROM products WHERE active = true")
  }
}
```

> **Réflexe à prendre.** Exactement la même discipline qu'en Symfony : un
> contrôleur reçoit une requête, appelle un (ou plusieurs) service(s), et
> renvoie une réponse — **jamais** de logique métier ou d'accès direct aux
> données à l'intérieur.

## Sous-routes et paramètres de chemin

```ts
@Controller("products")
export class ProductsController {
  // GET /products/:id/reviews  — a nested resource under a specific product
  @Get(":id/reviews")
  findReviews() {
    return []
  }
}
```

L'ordre des routes déclarées **compte** : Nest matche la première route
compatible, dans l'ordre où elles apparaissent dans la classe.

```ts
@Controller("products")
export class ProductsController {
  @Get("featured")   // MUST come before :id, otherwise "featured" is
  findFeatured() {}  // captured as the :id parameter instead!

  @Get(":id")
  findOne() {}
}
```

> ⚠️ **Erreur fréquente — routes statiques déclarées après une route
> paramétrée.** Si `@Get(':id')` est déclaré **avant** `@Get('featured')`,
> une requête `GET /products/featured` matche `:id` avec `id =
> "featured"` : la route statique n'est **jamais atteinte**. Déclare
> toujours les segments **fixes** avant les segments **paramétrés** — le
> même piège existe avec l'ordre des routes Symfony (`#[Route]` matché
> dans l'ordre de déclaration/priorité).

## À retenir

- `@Controller('prefix')` + `@Get()`/`@Post()`/`@Put()`/`@Patch()`/
  `@Delete()` composent le chemin final — le même principe que
  `#[Route]` posé sur classe + méthode en Symfony.
- Un contrôleur ne fait que **traduire HTTP → appel de service** ; toute
  logique métier vit dans un provider (`@Injectable`).
- L'**ordre de déclaration** des routes compte : les segments **statiques**
  (`featured`) doivent être déclarés avant les segments **paramétrés**
  (`:id`), sous peine d'être « avalés » par erreur.
