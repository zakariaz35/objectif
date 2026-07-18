---
title: "Exercice — sécuriser un serveur GraphQL exposé naïvement"
type: exercise
---

> ⏱️ **Durée conseillée : ~20 min.**

## Énoncé

Une équipe vient de mettre en ligne, tel quel, ce serveur GraphQL — d'abord
la configuration du module NestJS :

```ts
// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
})
```

... puis un extrait du schéma généré :

```graphql
type Author {
  id: ID!
  name: String!
  email: String!
  books: [Book!]!
}

type Book {
  id: ID!
  title: String!
  author: Author!
}

type Query {
  authors: [Author!]!
  book(id: ID!): Book
}

type Mutation {
  deleteBook(id: ID!): Boolean!
}
```

... et le resolver de la mutation :

```ts
@Mutation(() => Boolean)
async deleteBook(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
  return this.booksService.delete(id)
}
```

Identifie **au moins quatre** problèmes de sécurité dans cette mise en
production, et propose, pour chacun, une correction concrète — code ou
configuration à l'appui.

Indices, si besoin : relis les cinq points de la leçon « Sécurité »
(profondeur, coût, introspection, rate limiting, authentification), et
regarde attentivement la relation `Author.books` / `Book.author`.

<!--correction-->

## Correction

### 1. Introspection active en production

`GraphQLModule.forRoot` ne précise pas `introspection` : par défaut,
**tout le schéma est explorable**, y compris en production — n'importe qui
découvre chaque type, chaque champ, chaque mutation disponible (`deleteBook`
compris) sans documentation externe, via l'introspection elle-même ou
l'explorateur interactif (Apollo Sandbox) qui s'appuie dessus.

```ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  introspection: process.env.NODE_ENV !== "production",
})
```

### 2. Relation cyclique `Author.books` / `Book.author` : pas de depth limit

`Author.books` renvoie des `Book`, qui exposent chacun `author`, qui
renvoie à nouveau des `books`... Rien n'empêche une requête imbriquée sur
des dizaines de niveaux — sans `depthLimit`, chaque niveau supplémentaire
multiplie le travail du serveur.

```ts
import depthLimit from "graphql-depth-limit"

GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  introspection: process.env.NODE_ENV !== "production",
  validationRules: [depthLimit(6)],
})
```

### 3. Aucune limite de coût sur les listes (`authors`, `books`)

`authors: [Author!]!` n'a aucun argument de pagination — impossible de
demander une page, uniquement « tout ». Combiné à `books` sans limite non
plus, une seule requête peut forcer le serveur à charger l'intégralité de
la base en mémoire.

```graphql
type Query {
  authors(limit: Int = 20, offset: Int = 0): [Author!]!
}
```

... accompagné d'une règle de complexité qui rejette une requête trop
coûteuse même avec des arguments de pagination raisonnables mais imbriqués :

```ts
import { createComplexityLimitRule } from "graphql-validation-complexity"

validationRules: [depthLimit(6), createComplexityLimitRule(1000)],
```

### 4. `deleteBook` : aucune authentification, aucune autorisation

N'importe quel client peut supprimer **n'importe quel** livre — la mutation
la plus destructrice du schéma n'est protégée par rien.

```ts
@UseGuards(GqlAuthGuard) // authentication: reject anonymous callers
@Mutation(() => Boolean)
async deleteBook(
  @Args("id", { type: () => ID }) id: string,
  @CurrentUser() user: User, // authorization: only an admin can delete
): Promise<boolean> {
  if (!user.isAdmin) {
    throw new ForbiddenException("Only an admin can delete a book")
  }
  return this.booksService.delete(id)
}
```

### 5. (bonus) `email` exposé sans restriction sur `Author`

`Author.email` est un champ non-null, accessible à **tout** client capable
d'écrire `authors { email }` — une donnée personnelle exposée sans
distinction entre un visiteur anonyme et le propriétaire du compte. Une
autorisation **au niveau du champ** (un `@ResolveField` dédié, avec son
propre Guard, qui renvoie `null` ou lève une erreur si l'appelant n'a pas le
droit de voir cet email) limite l'exposition à ceux qui en ont réellement
besoin.

### 6. (bonus) Aucun rate limiting HTTP en complément

Même avec depth/complexity limiting, rien n'empêche un client d'envoyer des
milliers de requêtes légitimes par seconde. Un rate limiting HTTP classique
(`@nestjs/throttler`) reste une protection complémentaire, à un niveau
différent (le volume de requêtes, pas leur coût individuel).

> Retiens l'ordre de priorité : **authentification/autorisation** d'abord
> (une mutation qui supprime des données sans aucun contrôle est le risque
> le plus grave, quel que soit le reste), puis **introspection**,
> **profondeur/coût**, puis le rate limiting en renfort — les cinq points
> de la leçon « Sécurité », tous nécessaires ensemble, aucun ne remplaçant
> les autres.
