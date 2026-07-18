---
title: "Query, Mutation : arguments, variables, fragments, alias"
type: lesson
---

## Les trois types racines

Un schéma GraphQL définit jusqu'à trois types **racines**, points d'entrée
de toute requête :

```graphql
type Query {
  book(id: ID!): Book
  books(format: BookFormat): [Book!]!
}

type Mutation {
  createBook(input: CreateBookInput!): Book!
}

type Subscription {
  bookAdded: Book!
}
```

- **`Query`** : lecture, sans effet de bord — un champ `Query` peut être
  résolu autant de fois que nécessaire sans rien changer côté serveur.
- **`Mutation`** : écriture, avec effet de bord (créer, modifier, supprimer).
  Contrairement à `Query`, les champs d'une même `Mutation` sont exécutés
  **séquentiellement**, pas en parallèle — pour éviter les effets de bord
  imprévisibles entre deux mutations envoyées ensemble.
- **`Subscription`** : abonnement temps réel, détaillé au module 5.

> **Passerelle.** `Query` correspond à un `GET` REST (lecture, idempotent),
> `Mutation` regroupe ce que REST éclate en `POST`/`PUT`/`PATCH`/`DELETE` —
> mais GraphQL ne fait **aucune** distinction de verbe : c'est le **nom du
> champ** (`createBook`, `deleteBook`, `updateBook`...) qui porte l'intention,
> pas une convention HTTP.

## Arguments

Chaque champ peut déclarer ses propres arguments, typés comme n'importe quel
champ :

```graphql
type Query {
  books(format: BookFormat, limit: Int = 20): [Book!]!
}
```

```graphql
query {
  books(format: EBOOK, limit: 5) {
    title
  }
}
```

## Variables : ne jamais concaténer une requête à la main

Écrire des valeurs **en dur** dans une requête (`book(id: "42")`) fonctionne,
mais devient vite fragile — exactement comme concaténer des valeurs dans du
SQL brut. Les **variables** séparent le texte de la requête (fixe, souvent
mis en cache/analysé par des outils) des valeurs (dynamiques) :

```graphql
query GetBook($id: ID!, $withReviews: Boolean = false) {
  book(id: $id) {
    title
    reviews @include(if: $withReviews) {
      rating
    }
  }
}
```

```json
{ "id": "42", "withReviews": true }
```

> ⚠️ **Erreur fréquente — construire la requête en concaténant des
> variables dans la chaîne.** Comme pour le SQL et l'injection, il vaut
> mieux transmettre les valeurs séparément (l'objet `variables`) que de les
> insérer dans le texte de la requête. Tous les clients GraphQL sérieux
> (Apollo Client compris — module 4) t'y encouragent nativement.

## Fragments : factoriser un ensemble de champs

Un **fragment** nomme un ensemble de champs, réutilisable dans plusieurs
requêtes — utile dès qu'un même « morceau » de données (une carte produit,
un avatar utilisateur...) apparaît à plusieurs endroits :

```graphql
fragment BookPreview on Book {
  id
  title
  author {
    name
  }
}

query {
  books {
    ...BookPreview
  }
  favoriteBook: book(id: "1") {
    ...BookPreview
  }
}
```

Le module 4 montre comment les fragments deviennent, côté client React, un
outil de **colocation** (chaque composant déclare les champs dont il a
besoin, à côté de son propre code).

## Alias : renommer un champ dans la réponse

Deux appels du **même** champ, avec des arguments différents, ne peuvent pas
coexister sous la même clé dans la réponse JSON. L'**alias** résout ce
conflit :

```graphql
query {
  dune: book(id: "1") {
    title
  }
  foundation: book(id: "2") {
    title
  }
}
```

```json
{
  "data": {
    "dune": { "title": "Dune" },
    "foundation": { "title": "Foundation" }
  }
}
```

Sans alias, les deux appels à `book(...)` produiraient tous les deux une clé
`book` dans la réponse — un conflit que le serveur ne peut pas résoudre à ta
place.

## À retenir

- `Query` (lecture, parallélisable), `Mutation` (écriture, séquentielle),
  `Subscription` (temps réel, module 5) : les trois racines d'un schéma.
- Toujours passer les valeurs dynamiques en **variables**, jamais concaténées
  dans le texte de la requête.
- Un **fragment** factorise un ensemble de champs réutilisé à plusieurs
  endroits — la base de la colocation côté client (module 4).
- Un **alias** permet d'appeler le même champ plusieurs fois, avec des
  arguments différents, sans collision de clé dans la réponse.
