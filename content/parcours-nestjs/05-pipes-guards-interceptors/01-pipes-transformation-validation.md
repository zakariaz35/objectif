---
title: "Pipes : transformer et valider une entrée avant le handler"
type: lesson
---

## Le rôle d'un Pipe

Un **Pipe** intercepte un argument (`@Param`, `@Query`, `@Body`...) **avant**
qu'il n'atteigne le corps de la méthode du contrôleur : il peut soit le
**transformer**, soit **valider** qu'il respecte une forme attendue (en
levant une exception sinon).

```ts
@Get(":id")
findOne(@Param("id", ParseIntPipe) id: number) {
  // `id` is ALREADY a real `number` here — ParseIntPipe did the conversion,
  // or threw a 400 Bad Request if the value wasn't a valid integer.
  return this.productsService.findOne(id)
}
```

Sans ce pipe, rappelle-toi (module 3) : `@Param('id')` renvoie toujours une
**chaîne**. `ParseIntPipe` automatise la conversion (et le rejet propre en
cas d'échec) que tu ferais autrement à la main avec `Number(id)` + une
vérification `isNaN`.

> **Symfony → NestJS.** C'est le rôle joué par le **ParamConverter** de
> Symfony (ou les *value resolvers* d'argument de contrôleur) : convertir un
> paramètre brut de route en une valeur du bon type, avant même d'entrer
> dans le corps de l'action.

## Les pipes intégrés

| Pipe intégré | Rôle |
|---|---|
| `ParseIntPipe` | Convertit en `number` entier, ou lève `400` |
| `ParseBoolPipe` | Convertit `"true"`/`"false"` en `boolean` |
| `ParseUUIDPipe` | Vérifie qu'une chaîne est un UUID valide |
| `DefaultValuePipe(x)` | Fournit une valeur par défaut si l'argument est absent |
| `ValidationPipe` | Valide un DTO entier avec `class-validator` (module précédent) |

```ts
@Get()
findAll(
  @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
) {
  return this.productsService.findAll(page, limit)
}
```

Plusieurs pipes se **chaînent** sur un même paramètre, dans l'ordre indiqué :
ici, une valeur par défaut est d'abord posée, puis convertie en entier.

## Écrire un Pipe personnalisé

Un pipe custom implémente l'interface `PipeTransform` : une seule méthode,
`transform(value, metadata)`, qui renvoie la valeur transformée (ou lève une
exception).

```ts
import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common"

export class TrimPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (typeof value !== "string") {
      throw new BadRequestException("Expected a string value")
    }
    return value.trim()   // strips leading/trailing whitespace
  }
}
```

```ts
@Get("search")
search(@Query("q", TrimPipe) query: string) {
  return this.productsService.search(query)
}
```

> **Réflexe à prendre.** Un Pipe est **pur** : il prend une valeur, renvoie
> une valeur (ou lève une exception). Il ne connaît ni la requête complète,
> ni la réponse — exactement la logique d'un `ParamConverter` Symfony, qui
> ne fait que transformer un segment de route en objet métier.

## À retenir

- Un Pipe transforme et/ou valide **un argument précis** avant qu'il
  n'atteigne le handler — le rôle du ParamConverter côté Symfony.
- Les pipes intégrés (`ParseIntPipe`, `ParseUUIDPipe`, `DefaultValuePipe`...)
  couvrent les conversions courantes ; `ValidationPipe` gère les DTO
  complets (module précédent).
- Un pipe custom implémente `PipeTransform` : une méthode `transform(value)`,
  volontairement pure et isolée.
