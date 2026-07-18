---
title: "Entités TypeORM : @Entity, @Column, @PrimaryGeneratedColumn"
type: lesson
---

## Pourquoi TypeORM, et pas un autre ORM ?

Nest reste **agnostique** de l'ORM (TypeORM, Prisma, Mongoose pour MongoDB
sont tous supportés officiellement). Ce parcours choisit **TypeORM** parce
que son fonctionnement — entités décorées, `Repository`, `EntityManager` —
est **le plus proche de Doctrine**, ce qui en fait le point d'entrée le plus
naturel venant de Symfony.

> 💡 **Alternative : Prisma.** Prisma inverse l'approche : un schéma déclaré
> dans un fichier `.prisma` (pas des classes décorées) génère un client
> TypeScript entièrement typé. Très apprécié pour son excellent typage et
> ses migrations, mais son modèle (schéma externe + client généré) est plus
> éloigné des réflexes Doctrine. Retiens qu'il existe — mais ce parcours se
> concentre sur TypeORM, le pont le plus direct avec ce que tu connais déjà.

## Une entité : une classe décorée

```ts
// product.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column("decimal", { precision: 10, scale: 2 })
  price: number

  @Column({ default: true })
  inStock: boolean

  @Column({ nullable: true })
  description?: string
}
```

> **Symfony → NestJS.** Une correspondance quasi ligne à ligne avec une
> entité Doctrine :
>
> ```php
> #[ORM\Entity]
> class Product
> {
>     #[ORM\Id]
>     #[ORM\GeneratedValue]
>     #[ORM\Column]
>     private int $id;
>
>     #[ORM\Column]
>     private string $name;
>
>     #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
>     private string $price;
> }
> ```
>
> `@Entity()` ↔ `#[ORM\Entity]`, `@PrimaryGeneratedColumn()` ↔ `#[ORM\Id] +
> #[ORM\GeneratedValue]`, `@Column(...)` ↔ `#[ORM\Column(...)]`. Le
> vocabulaire des options (`nullable`, `default`, `precision`, `scale`) est
> quasiment identique d'un ORM à l'autre.

## Types de colonnes courants

| TypeORM | Rôle | Doctrine |
|---|---|---|
| `@Column()` | Colonne simple, type déduit du type TS | `#[ORM\Column]` |
| `@Column('text')` | Texte long | `#[ORM\Column(type: 'text')]` |
| `@Column('decimal', {...})` | Nombre décimal précis (jamais `float` pour un prix) | `#[ORM\Column(type: 'decimal')]` |
| `@CreateDateColumn()` | Horodatage auto à la création | `#[ORM\Column] + un listener \`prePersist\`` |
| `@UpdateDateColumn()` | Horodatage auto à chaque update | `#[ORM\Column] + un listener \`preUpdate\`` |

> ⚠️ **Erreur fréquente — stocker un prix en `float`.** Comme en Doctrine,
> utilise `decimal` (pas `float`/`number` flottant) pour toute valeur
> monétaire : les flottants binaires introduisent des erreurs
> d'arrondi (`0.1 + 0.2 !== 0.3`) inacceptables sur de l'argent.

## Configurer la connexion

```ts
// app.module.ts
import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Product } from "./products/product.entity"

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Product],
      synchronize: false,   // NEVER true in production — see the callout below
    }),
  ],
})
export class AppModule {}
```

> ⚠️ **Erreur fréquente — `synchronize: true` en production.** Cette option
> fait recréer/modifier le schéma de base de données **automatiquement** à
> partir des entités, à chaque démarrage : pratique en tout début de
> prototype, **dangereux** dès qu'une vraie base contient des données
> (risque de perte de colonnes/tables). Utilise des **migrations**
> explicites (leçon 3) dès que le projet a une base réelle — exactement la
> discipline `doctrine:migrations:diff` / `doctrine:migrations:migrate` de
> Symfony.

## À retenir

- TypeORM est choisi ici pour sa proximité directe avec Doctrine : entités
  décorées, `Repository`, `EntityManager`.
- `@Entity()`/`@Column()`/`@PrimaryGeneratedColumn()` sont la transposition
  quasi littérale de `#[ORM\Entity]`/`#[ORM\Column]`/`#[ORM\Id]`.
- `synchronize: true` est réservé au tout début d'un prototype ; passe aux
  migrations explicites dès qu'une vraie base existe.
