---
title: "Extraire la requête : @Param, @Query, @Body, @Headers"
type: lesson
---

## Injecter des morceaux de la requête, un par un

Plutôt que de manipuler un objet `Request` brut, Nest te laisse **déclarer**
exactement ce dont chaque paramètre de méthode a besoin :

```ts
import { Body, Controller, Get, Headers, Param, Post, Query } from "@nestjs/common"

@Controller("products")
export class ProductsController {
  // GET /products/42 → id = "42"
  @Get(":id")
  findOne(@Param("id") id: string) {
    return { id }
  }

  // GET /products?category=books&inStock=true
  @Get()
  findAll(@Query("category") category?: string, @Query("inStock") inStock?: string) {
    return { category, inStock }
  }

  // POST /products with a JSON body: { "name": "Book", "price": 12 }
  @Post()
  create(@Body() body: { name: string; price: number }) {
    return body
  }

  @Get("secured")
  findSecured(@Headers("authorization") authHeader?: string) {
    return { authHeader }
  }
}
```

| Décorateur | Source | Équivalent Symfony |
|---|---|---|
| `@Param('id')` | Segment de l'URL (`:id`) | `Request $request` → argument de route (ParamConverter) |
| `@Query('key')` | Query string (`?key=value`) | `$request->query->get('key')` |
| `@Body()` | Corps de la requête (déjà parsé en JSON) | `$request->toArray()` / body désérialisé en DTO |
| `@Headers('name')` | Un en-tête HTTP | `$request->headers->get('name')` |

> **Symfony → NestJS.** Récupérer un paramètre de route en argument typé
> directement dans la signature de la méthode (`findOne(string $id)`) est
> exactement ce que fait le **ParamConverter** de Symfony. `@Query`/
> `@Headers` correspondent aux accesseurs `$request->query`/`$request->
> headers` de l'objet `Request` de Symfony — sauf qu'ici, chaque valeur est
> **injectée directement** en paramètre, sans passer par un objet `Request`
> global.

## Sans argument : l'objet entier

```ts
@Get()
findAll(@Query() query: Record<string, string>) {
  // query = { category: "books", inStock: "true" }
  return query
}

@Post()
create(@Body() body: unknown) {
  // the WHOLE body, unvalidated for now (module 4: DTO + class-validator)
  return body
}
```

> ⚠️ **Erreur fréquente — faire confiance à `@Body()` sans validation.**
> `@Body()` renvoie le JSON envoyé par le client **tel quel**, sans aucune
> vérification de forme ni de type — exactement comme
> `$request->toArray()` en Symfony avant de le passer à un formulaire ou au
> Validator. Le module suivant (DTO & validation) couvre la façon
> **correcte** de sécuriser ça avec `class-validator` et une `ValidationPipe`.

## Codes de statut explicites

```ts
import { Controller, Delete, HttpCode, HttpStatus, Post } from "@nestjs/common"

@Controller("products")
export class ProductsController {
  @Post()
  @HttpCode(HttpStatus.CREATED)   // 201 instead of the default 200/201 heuristic
  create() {
    return { id: 1 }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)  // 204: no body expected
  remove() {
    // nothing returned: matches 204 semantics
  }
}
```

Par défaut, Nest renvoie `201 Created` pour un `@Post()` et `200 OK` pour le
reste — `@HttpCode(...)` permet de surcharger ce comportement quand le cas
le demande (`204 No Content` pour une suppression, par exemple).

> **Symfony → NestJS.** Équivalent direct de `return new JsonResponse($data,
> Response::HTTP_CREATED)` ou `$this->json($data, 201)`.

## À retenir

- `@Param`/`@Query`/`@Body`/`@Headers` extraient des morceaux **précis** de
  la requête directement en paramètres typés — le rôle joué par le
  `Request` global et le `ParamConverter` côté Symfony.
- `@Body()` ne valide **rien** par défaut : c'est le sujet du module
  suivant.
- `@HttpCode(HttpStatus.XXX)` surcharge le code de statut par défaut d'une
  route (ex. `204` pour une suppression sans corps de réponse).
