---
title: "enum, input, interface et union"
type: lesson
---

## `enum` : un ensemble fermé de valeurs

Un `enum` restreint un champ (ou un argument) à une liste **fixe** de
valeurs possibles — comme un `enum` PHP 8.1+, ou une contrainte `CHECK` en
SQL :

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
}
```

N'importe quelle autre valeur (ex. `"AUDIOBOOK"` non déclarée) est rejetée à
la **validation**, avant même d'atteindre un resolver.

## `input` : le type dédié aux arguments

Un type `input` ressemble à un `type` objet, mais avec une différence
fondamentale : un `input` peut **seulement** être utilisé comme argument
(d'une query ou d'une mutation) — jamais comme type de retour.

```graphql
input CreateBookInput {
  title: String!
  authorId: ID!
  format: BookFormat = PAPERBACK   # default value if not provided
}

type Mutation {
  createBook(input: CreateBookInput!): Book!
}
```

> ⚠️ **Erreur fréquente — réutiliser un `type` comme argument.** On ne peut
> **pas** écrire `createBook(input: Book!): Book!` : `Book` est un `type`
> (type de sortie), pas un `input` (type d'entrée). GraphQL sépare
> volontairement les deux, même quand les champs se ressemblent beaucoup —
> un `input` n'a par exemple jamais de champ calculé ou de relation résolue
> dynamiquement, contrairement à un `type`.

## `interface` : des champs partagés, plusieurs implémentations

Une `interface` déclare un ensemble de champs que **plusieurs types**
s'engagent à fournir — comme une interface PHP, mais interrogeable
directement dans une requête :

```graphql
interface Publication {
  id: ID!
  title: String!
}

type Book implements Publication {
  id: ID!
  title: String!
  isbn: String!
}

type Magazine implements Publication {
  id: ID!
  title: String!
  issueNumber: Int!
}
```

Une requête peut cibler l'interface, et récupérer les champs spécifiques à
chaque type concret via une **fragment inline** (`... on Book`) :

```graphql
query {
  publications {
    id
    title
    ... on Book {
      isbn
    }
    ... on Magazine {
      issueNumber
    }
  }
}
```

## `union` : des types hétérogènes, sans champ commun

Une `union` regroupe plusieurs types qui **n'ont aucun champ en commun**
(sinon, une `interface` serait plus appropriée) :

```graphql
union SearchResult = Book | Magazine | Author

type Query {
  search(term: String!): [SearchResult!]!
}
```

Pour distinguer les types dans la réponse, on demande systématiquement
`__typename` — un champ **implicite**, disponible sur tous les types, qui
renvoie le nom du type concret :

```graphql
query {
  search(term: "dune") {
    __typename
    ... on Book {
      isbn
    }
    ... on Magazine {
      issueNumber
    }
    ... on Author {
      name
    }
  }
}
```

> 💡 **À retenir.** `interface` = « ces types partagent des champs communs,
> plus des champs spécifiques ». `union` = « ces types n'ont *rien* en
> commun, mais un même champ peut renvoyer l'un ou l'autre ». Si tu hésites,
> demande-toi : « est-ce qu'il existe au moins un champ que TOUS les types
> partagent ? » — si oui, `interface` ; si non, `union`.

## À retenir

- `enum` : un ensemble **fermé** de valeurs, validé avant l'exécution.
- `input` : le type dédié aux **arguments** — jamais un type de retour, même
  s'il ressemble à un `type` objet.
- `interface` : des types qui partagent des champs communs, interrogeables
  avec des fragments inline (`... on TypeConcret`).
- `union` : des types hétérogènes sans champ commun ; `__typename` permet de
  savoir, côté client, quel type concret a été renvoyé.
