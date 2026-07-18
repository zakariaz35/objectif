---
title: "Exercice — un resolver code-first NestJS, relation inverse"
type: exercise
---

> ⏱️ **Durée conseillée : ~20 min.**

## Énoncé

Tu disposes déjà, côté livres, du modèle et resolver suivants :

```ts
// books/models/book.model.ts
import { Field, ID, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class Book {
  @Field(() => ID)
  id: string

  @Field()
  title: string

  // Not exposed as a @Field: internal only.
  authorId: string
}
```

Écris, côté auteurs, la relation **inverse** : chaque `Author` doit exposer
un champ `books` (la liste — toujours présente, jamais d'élément `null` —
des livres écrits par cet auteur). Tu disposes d'un `BooksService` avec une
méthode `findByAuthorId(authorId: string): Book[]`.

1. Le modèle `Author` (`@ObjectType`), avec `id` et `name` en `@Field`, ET le
   champ `books` déclaré (mais PAS résolu ici — un champ relationnel se
   résout dans le `@Resolver`, pas sur le modèle lui-même).
2. Le `AuthorsResolver`, avec :
   - une query `authors(): Author[]` (délègue à `AuthorsService.findAll()`),
   - un `@ResolveField` pour `books`, qui délègue à
     `BooksService.findByAuthorId(...)`.

<!--correction-->

## Correction

```ts
// authors/models/author.model.ts
import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Book } from "../../books/models/book.model"

@ObjectType()
export class Author {
  @Field(() => ID)
  id: string

  @Field()
  name: string

  // Declared here so it appears in the generated SDL — but its VALUE is
  // computed by the @ResolveField below, never stored on the raw entity.
  @Field(() => [Book])
  books: Book[]
}
```

```ts
// authors/authors.resolver.ts
import { Parent, Query, ResolveField, Resolver } from "@nestjs/graphql"
import { Author } from "./models/author.model"
import { Book } from "../books/models/book.model"
import { AuthorsService } from "./authors.service"
import { BooksService } from "../books/books.service"

@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly booksService: BooksService,
  ) {}

  @Query(() => [Author])
  authors(): Author[] {
    return this.authorsService.findAll()
  }

  @ResolveField(() => [Book])
  books(@Parent() author: Author): Book[] {
    // `author` here is whatever the `authors` (or `author`) query resolver
    // returned — this method is only called if the CLIENT actually asked
    // for the `books` field on this Author.
    return this.booksService.findByAuthorId(author.id)
  }
}
```

- Déclarer `@Field(() => [Book])` sur le modèle `Author` ne fait
  qu'**annoncer** ce champ dans le SDL généré (`books: [Book!]!`) — ça ne
  dit rien sur *comment* il est calculé.
- Le **calcul réel** vit dans `@ResolveField` du resolver : exactement le
  même principe que `Book.author` de la leçon précédente, mais dans l'autre
  sens de la relation.
- Comme pour `Book.author`, ce `@ResolveField` s'exécute **une fois par
  auteur** dans une requête `authors { books { title } }` — le même risque
  de N+1 s'applique ici aussi, et se résout de la même façon (un
  `BooksByAuthorLoader`, sur le modèle de la leçon précédente).
