---
title: "class-validator : des contraintes déclaratives"
type: lesson
---

## Poser des règles directement sur les propriétés

```ts
// create-product.dto.ts
import { IsEmail, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator"

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsInt()
  @Min(0)
  price: number

  @IsOptional()     // this field can be absent entirely
  @IsString()
  description?: string

  @IsEmail()
  supplierEmail: string
}
```

Chaque décorateur `class-validator` décrit **une** contrainte. Une propriété
peut en cumuler plusieurs (`@IsString()` + `@MinLength(2)` : une chaîne, ET
d'au moins 2 caractères).

> **Symfony → NestJS.** C'est une transposition quasi littérale des
> contraintes du composant **Validator** de Symfony :
>
> ```php
> class CreateProductDto
> {
>     #[Assert\NotBlank]
>     #[Assert\Length(min: 2)]
>     public string $name;
>
>     #[Assert\PositiveOrZero]
>     public int $price;
>
>     #[Assert\Email]
>     public string $supplierEmail;
> }
> ```
>
> Même philosophie : des attributs déclaratifs posés sur les propriétés
> d'une classe, lus par un moteur de validation générique — Symfony lit
> `#[Assert\...]`, Nest lit les décorateurs `class-validator`.

## Contraintes courantes

| `class-validator` | Vérifie | Équivalent Symfony |
|---|---|---|
| `@IsString()` | Est une chaîne | `#[Assert\Type('string')]` |
| `@IsInt()` / `@IsNumber()` | Est un entier / un nombre | `#[Assert\Type('int')]` |
| `@IsEmail()` | Format email valide | `#[Assert\Email]` |
| `@Min(n)` / `@Max(n)` | Valeur numérique bornée | `#[Assert\Range(min: n)]` |
| `@MinLength(n)` / `@MaxLength(n)` | Longueur de chaîne | `#[Assert\Length(min: n)]` |
| `@IsOptional()` | La propriété peut être absente | Absence de `#[Assert\NotBlank]` |
| `@IsEnum(MonEnum)` | Valeur dans une énumération | `#[Assert\Choice(callback: ...)]` |
| `@IsArray()` + `@ValidateNested()` | Tableau d'objets, chacun validé | `#[Assert\Valid]` en cascade (collections) |

## Valider un DTO imbriqué

```ts
import { Type } from "class-transformer"
import { IsArray, ValidateNested } from "class-validator"

class OrderItemDto {
  @IsString()
  productId: string

  @IsInt()
  @Min(1)
  quantity: number
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })   // validate EVERY item of the array
  @Type(() => OrderItemDto)         // tells class-transformer the array's item type
  items: OrderItemDto[]
}
```

> ⚠️ **Erreur fréquente — oublier `@Type(() => X)` sur un tableau imbriqué.**
> Sans cette information, `class-transformer` ne sait pas **quelle classe**
> instancier pour chaque élément du tableau : la validation imbriquée
> échoue silencieusement, ou valide le mauvais type. `@Type()` et
> `@ValidateNested({ each: true })` vont **toujours par paire** pour un
> tableau d'objets imbriqués.

## À retenir

- Chaque décorateur `class-validator` (`@IsString`, `@IsEmail`, `@Min`...)
  pose **une** contrainte ; elles se cumulent librement sur une propriété.
- C'est la transposition directe des attributs `#[Assert\...]` du composant
  Validator Symfony — même philosophie, décorateurs TypeScript au lieu
  d'attributs PHP.
- Pour un DTO imbriqué (tableau d'objets), `@ValidateNested({ each: true })`
  **et** `@Type(() => Classe)` sont indissociables.
