---
title: "Exercice — écrire un ProductsController complet"
type: exercise
---

> ⏱️ **Durée conseillée : ~20 min.**

## Énoncé

En t'appuyant sur `ProductsService` ci-dessous (déjà fourni, ne le modifie
pas), écris un `ProductsController` qui expose les routes suivantes :

```ts
// products.service.ts (already exists, provided as-is)
import { Injectable, NotFoundException } from "@nestjs/common"

export interface Product {
  id: number
  name: string
  price: number
}

@Injectable()
export class ProductsService {
  private products: Product[] = [
    { id: 1, name: "Mechanical Keyboard", price: 89 },
    { id: 2, name: "Ergonomic Mouse", price: 45 },
  ]

  findAll(category?: string): Product[] {
    // (category filtering omitted here for brevity)
    return this.products
  }

  findOne(id: number): Product {
    const product = this.products.find((p) => p.id === id)
    if (!product) throw new NotFoundException(`Product #${id} not found`)
    return product
  }

  create(data: { name: string; price: number }): Product {
    const product = { id: this.products.length + 1, ...data }
    this.products.push(product)
    return product
  }

  remove(id: number): void {
    this.products = this.products.filter((p) => p.id !== id)
  }
}
```

Ton `ProductsController` doit :

1. Être préfixé `/products`.
2. `GET /products` : renvoyer tous les produits, avec un filtre optionnel
   `?category=...` transmis à `findAll`.
3. `GET /products/:id` : renvoyer un produit (l'`id` de l'URL est une
   chaîne : convertis-la en `number` avant d'appeler le service).
4. `POST /products` : créer un produit à partir du corps de la requête,
   répondre avec le statut `201 Created` (comportement par défaut de Nest
   pour un `@Post()`, donc rien de spécial à ajouter).
5. `DELETE /products/:id` : supprimer un produit, répondre `204 No Content`
   (sans corps de réponse).

<!--correction-->

## Correction

```ts
// products.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common"
import { Product, ProductsService } from "./products.service"

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query("category") category?: string): Product[] {
    return this.productsService.findAll(category)
  }

  @Get(":id")
  findOne(@Param("id") id: string): Product {
    return this.productsService.findOne(Number(id))
  }

  @Post()
  create(@Body() body: { name: string; price: number }): Product {
    return this.productsService.create(body)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string): void {
    this.productsService.remove(Number(id))
  }
}
```

- `@Query("category")` reste **optionnel** (le paramètre TypeScript
  `category?: string`) : une requête `GET /products` sans query string
  fonctionne aussi bien qu'avec `?category=books`.
- `@Param("id")` renvoie toujours une **chaîne** (les segments d'URL ne
  sont jamais typés automatiquement) : `Number(id)` fait la conversion
  avant d'appeler le service — le module suivant (Pipes) montrera comment
  automatiser cette conversion avec `ParseIntPipe`.
- `@Post()` renvoie déjà `201 Created` par défaut : aucun `@HttpCode`
  nécessaire ici, contrairement à `@Delete()` où l'on force explicitement
  `204 No Content` (`remove` ne renvoie rien, ce qui correspond à ce statut).
- Le contrôleur ne fait strictement que **traduire HTTP → appel de
  service** : aucune logique métier (recherche, suppression) n'y est
  dupliquée — elle reste entièrement dans `ProductsService`, comme vu à la
  leçon 1.
