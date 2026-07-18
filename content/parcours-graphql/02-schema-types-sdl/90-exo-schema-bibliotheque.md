---
title: "Exercice — le schéma SDL d'une petite bibliothèque"
type: exercise
---

> ⏱️ **Durée conseillée : ~20 min.**

## Énoncé

Conçois, en SDL, le schéma d'une petite application de bibliothèque, en
respectant ces règles :

1. Un `Book` a un `id`, un `title` (toujours présent), un `format` limité à
   `PAPERBACK`, `HARDCOVER` ou `EBOOK`, une liste de `tags` (des chaînes ;
   la liste elle-même existe toujours, mais peut être vide ; aucun élément
   de la liste ne doit jamais être `null`), et un `author`.
2. Un `Author` a un `id`, un `name` (toujours présent) et la liste de ses
   `books` (toujours présente, jamais d'élément `null`).
3. Une requête `book(id)` peut renvoyer `null` si l'id n'existe pas. Une
   requête `books` renvoie toujours une liste (jamais `null`, jamais
   d'élément `null`).
4. Une mutation `createBook` prend en argument un objet regroupant `title`,
   `authorId` et `format` (avec `PAPERBACK` comme valeur par défaut si non
   précisé), et renvoie le livre créé.

<!--correction-->

## Correction

```graphql
enum BookFormat {
  PAPERBACK
  HARDCOVER
  EBOOK
}

type Book {
  id: ID!
  title: String!
  format: BookFormat!
  tags: [String!]!
  author: Author!
}

type Author {
  id: ID!
  name: String!
  books: [Book!]!
}

input CreateBookInput {
  title: String!
  authorId: ID!
  format: BookFormat = PAPERBACK
}

type Query {
  book(id: ID!): Book
  books: [Book!]!
}

type Mutation {
  createBook(input: CreateBookInput!): Book!
}
```

- `format: BookFormat!` : l'énoncé dit « limité à trois valeurs » — un
  `enum`, et **toujours présent** → `!`.
- `tags: [String!]!` : « la liste existe toujours » → `!` après le crochet ;
  « aucun élément ne doit être `null` » → `!` collé à `String`. Une liste
  **vide** (`[]`) reste valide : ce n'est pas la même chose que `null`.
- `book(id: ID!): Book` (sans `!` final) : l'énoncé autorise explicitement
  `null` si l'id n'existe pas — un piège classique aurait été de mettre
  `Book!` par réflexe.
- `books: [Book!]!` : toujours une liste, jamais d'élément `null` — même
  logique que `tags`.
- `CreateBookInput` est un `input`, pas un `type` : il ne sert **que**
  d'argument à `createBook`, jamais de type de retour. `format` porte une
  **valeur par défaut** (`= PAPERBACK`), donc l'argument reste facultatif
  côté client.
