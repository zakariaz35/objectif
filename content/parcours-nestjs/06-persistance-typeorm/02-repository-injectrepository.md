---
title: "Repository & @InjectRepository : requêter les entités"
type: lesson
---

## Rendre une entité disponible à un module

Avant de pouvoir injecter un `Repository<Product>` dans un service, le
module concerné doit déclarer l'entité via `TypeOrmModule.forFeature([...])` :

```ts
// products.module.ts
import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Product } from "./product.entity"
import { ProductsController } from "./products.controller"
import { ProductsService } from "./products.service"

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
```

> **Symfony → NestJS.** `TypeOrmModule.forFeature([Product])` correspond au
> moment où Doctrine sait qu'un `Product` a un `Repository` disponible
> (déclaré automatiquement pour toute entité mappée). La nuance Nest : il
> faut l'importer **explicitement**, module par module — cohérent avec
> l'encapsulation stricte vue au module 2.

## Injecter et utiliser le Repository

```ts
// products.service.ts
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Product } from "./product.entity"

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.find()
  }

  findOne(id: number): Promise<Product | null> {
    return this.productsRepository.findOneBy({ id })
  }

  create(data: Partial<Product>): Promise<Product> {
    const product = this.productsRepository.create(data)   // builds an ENTITY instance
    return this.productsRepository.save(product)            // persists it (INSERT)
  }

  async update(id: number, data: Partial<Product>): Promise<Product | null> {
    await this.productsRepository.update(id, data)
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.productsRepository.delete(id)
  }
}
```

| Méthode `Repository` | Rôle | Équivalent Doctrine |
|---|---|---|
| `.find(options?)` | Liste, avec filtres/tri/pagination | `$repository->findBy(...)` |
| `.findOneBy({...})` | Un seul enregistrement, ou `null` | `$repository->findOneBy(...)` |
| `.create(data)` | Construit une instance (SANS la persister) | `new Product()` + setters |
| `.save(entity)` | INSERT ou UPDATE (persiste réellement) | `$em->persist($product); $em->flush();` |
| `.update(id, data)` | UPDATE partiel, sans recharger l'entité | `$product->setName(...); $em->flush();` |
| `.delete(id)` | DELETE | `$em->remove($product); $em->flush();` |

> ⚠️ **Erreur fréquente — oublier `.save()` après `.create()`.**
> `repository.create(data)` construit **seulement** une instance en
> mémoire : **rien n'est écrit en base** tant que `.save(...)` n'est pas
> appelé. C'est le même piège que `new Product()` sans
> `$entityManager->persist()` + `flush()` en Doctrine : construire un objet
> ne le persiste jamais tout seul.

## Requêtes plus complexes : le Query Builder

```ts
async findInStockAbove(minPrice: number): Promise<Product[]> {
  return this.productsRepository
    .createQueryBuilder("product")
    .where("product.inStock = :inStock", { inStock: true })
    .andWhere("product.price > :minPrice", { minPrice })
    .orderBy("product.price", "ASC")
    .getMany()
}
```

> **Symfony → NestJS.** Le pendant direct du `QueryBuilder` Doctrine —
> même logique de chaînage (`->where()->andWhere()->orderBy()`), mêmes
> paramètres nommés pour éviter toute injection SQL.

## À retenir

- `TypeOrmModule.forFeature([Entity])` rend le `Repository` d'une entité
  disponible à l'injection, **module par module** (comme les autres
  providers, module 2).
- `@InjectRepository(Entity)` injecte un `Repository<Entity>` typé — le
  pendant direct d'un `Repository` Doctrine autowiré.
- `.create()` construit une instance en mémoire ; **seul** `.save()` la
  persiste réellement — ne saute jamais cette étape.
