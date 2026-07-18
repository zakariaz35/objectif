---
title: "Relations et migrations"
type: lesson
---

## Déclarer une relation

```ts
// order.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Product } from "../products/product.entity"

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  quantity: number

  @ManyToOne(() => Product, { eager: false })
  @JoinColumn({ name: "product_id" })   // explicit FK column name
  product: Product
}
```

```ts
// product.entity.ts (the other side of the relation)
import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Order } from "../orders/order.entity"

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number

  @OneToMany(() => Order, (order) => order.product)
  orders: Order[]
}
```

| TypeORM | Cardinalité | Doctrine |
|---|---|---|
| `@ManyToOne(() => Product)` | Plusieurs `Order` → un `Product` | `#[ORM\ManyToOne(targetEntity: Product::class)]` |
| `@OneToMany(() => Order, (o) => o.product)` | Un `Product` → plusieurs `Order` | `#[ORM\OneToMany(mappedBy: 'product')]` |
| `@ManyToMany(...)` + `@JoinTable()` | Table de jointure | `#[ORM\ManyToMany] + #[ORM\JoinTable]` |
| `@JoinColumn({ name: '...' })` | Nom explicite de la colonne FK | `#[ORM\JoinColumn(name: '...')]` |

> **Symfony → NestJS.** Correspondance directe : `@ManyToOne`/`@OneToMany`
> décrivent **le même** couple de cardinalités que côté Doctrine, avec la
> même nuance importante — **le côté propriétaire** de la relation
> (celui qui porte la clé étrangère, ici `Order` via `@JoinColumn`) doit
> être identifié tout aussi précisément qu'en Doctrine.

> ⚠️ **Erreur fréquente — charger une relation en `eager: true` partout.**
> Comme le *lazy loading* par défaut de Doctrine, TypeORM charge les
> relations **à la demande** sauf `eager: true` explicite (ou `relations:
> [...]` dans une requête). Marquer une relation `eager` par confort
> alourdit **chaque** requête sur l'entité, même quand la relation n'est
> pas utilisée — même piège des N+1 requêtes qu'en Doctrine si mal maîtrisé.

## Charger une relation explicitement

```ts
async findOneWithProduct(id: number): Promise<Order | null> {
  return this.ordersRepository.findOne({
    where: { id },
    relations: { product: true },   // explicit JOIN, only when actually needed
  })
}
```

## Migrations : ne jamais laisser `synchronize` gérer un vrai schéma

```bash
# Generate a migration by DIFFING entities against the current database schema
npx typeorm migration:generate src/migrations/AddProductInStock -d src/data-source.ts

# Apply pending migrations
npx typeorm migration:run -d src/data-source.ts

# Roll back the last migration
npx typeorm migration:revert -d src/data-source.ts
```

> **Symfony → NestJS.** Exactement le triptyque
> `doctrine:migrations:diff` / `doctrine:migrations:migrate` /
> `doctrine:migrations:migrate prev` : une migration est un **fichier
> versionné** (SQL généré + code TypeScript `up()`/`down()`), relu et
> validé avant d'être appliqué — jamais une modification automatique et
> silencieuse du schéma en production.

```ts
// A generated migration file — up() applies the change, down() reverts it
export class AddProductInStock1700000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "in_stock" boolean NOT NULL DEFAULT true`,
    )
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "in_stock"`)
  }
}
```

> 💡 **À retenir.** Le flux de travail recommandé sur un vrai projet : (1)
> modifier l'entité, (2) générer la migration (`migration:generate`), (3)
> **relire** le SQL généré (les diffs automatiques ne sont pas toujours
> exacts), (4) committer le fichier de migration avec le code, (5)
> l'appliquer en CI/CD au déploiement — jamais `synchronize: true` en
> production.

## À retenir

- `@ManyToOne`/`@OneToMany`/`@ManyToMany` transposent directement les
  annotations de relation Doctrine, avec la même notion de côté
  « propriétaire » de la relation.
- Les relations sont chargées **à la demande** par défaut (lazy) : réserve
  `eager`/`relations: {...}` aux cas réellement nécessaires.
- Les **migrations** (générées, relues, versionnées) remplacent
  `synchronize: true` dès qu'un projet a une vraie base de données —
  exactement la discipline `doctrine:migrations` de Symfony.
