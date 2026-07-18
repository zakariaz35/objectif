---
title: "Le DTO : une classe, pas une simple interface"
type: lesson
---

## Pourquoi une classe, et pas un `type`/une `interface` ?

Un **DTO** (*Data Transfer Object*) décrit la forme des données attendues en
entrée d'une route — typiquement, le corps d'une requête `POST`/`PATCH`.

```ts
// create-product.dto.ts
export class CreateProductDto {
  name: string
  price: number
}
```

> ⚠️ **Erreur fréquente — définir un DTO avec une `interface` ou un
> `type`.** Une interface TypeScript **n'existe plus du tout** une fois
> compilée en JavaScript : c'est une pure fiction du compilateur, disparue
> à l'exécution (*erased*). Or `class-validator` (leçon suivante) a besoin
> de **décorateurs** posés sur de vraies propriétés de classe, lus au
> runtime via `reflect-metadata`. Une `interface` ne peut porter aucun
> décorateur : le DTO **doit** être une `class`.

```ts
// ❌ An interface: erased at compile time, CANNOT carry validation decorators
interface CreateProductDto {
  name: string
  price: number
}

// ✅ A class: exists at runtime, CAN carry @IsString(), @Min(0)...
class CreateProductDto {
  name: string
  price: number
}
```

> **Symfony → NestJS.** C'est le même rôle qu'une classe **Form** ou un
> **DTO** typé chez Symfony (`#[Assert\NotBlank]` posé sur les propriétés
> d'une classe PHP) : la validation a besoin d'un vrai objet, porteur de
> métadonnées, pas d'une simple structure de typage compile-time.

## `class-transformer` : du JSON brut à une vraie instance

Le corps d'une requête HTTP arrive toujours en JSON — un **objet littéral**,
pas une instance de `CreateProductDto`. `class-transformer` fait le pont :

```ts
import { plainToInstance } from "class-transformer"

const raw = { name: "Book", price: "12" }   // plain JSON, price is a STRING here
const dto = plainToInstance(CreateProductDto, raw)

console.log(dto instanceof CreateProductDto)   // true: now a REAL instance
```

Dans une route Nest, ce passage `JSON brut → instance de classe` se fait
**automatiquement**, dès qu'un paramètre `@Body()` est typé avec une classe
DTO — c'est le rôle de la `ValidationPipe` (leçon 3 de ce module), qui
combine `class-transformer` (transformation) et `class-validator`
(validation, leçon suivante).

```ts
@Post()
create(@Body() dto: CreateProductDto) {
  // by the time we reach this line, `dto` is ALREADY a real
  // CreateProductDto instance — never a plain, unchecked object.
  return this.productsService.create(dto)
}
```

> **Symfony → NestJS.** C'est l'équivalent de
> `$form->handleRequest($request)` (ou du *denormalizer* du Serializer
> component) : transformer une requête brute en un objet PHP typé, prêt à
> être validé puis manipulé normalement.

## À retenir

- Un DTO Nest **doit** être une `class` (jamais une `interface`/`type`) :
  seule une classe existe au runtime et peut porter des décorateurs de
  validation.
- `class-transformer` transforme un objet JSON brut en une **vraie
  instance** de la classe DTO — le pendant du *denormalizer* / du
  `handleRequest` d'un formulaire Symfony.
- Ce mécanisme (transformation + validation) est automatisé côté Nest par
  la `ValidationPipe`, détaillée en fin de module.
