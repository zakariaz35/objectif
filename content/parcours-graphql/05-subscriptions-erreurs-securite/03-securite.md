---
title: "Sécurité : profondeur, coût, introspection, authentification"
type: lesson
---

## La surface d'attaque que REST n'a pas

Le module 1 l'a annoncé : la flexibilité de GraphQL a un prix. Une route
REST a une forme **figée** — impossible d'en abuser au-delà de ce qu'elle
fait déjà. Une requête GraphQL, elle, est **construite par le client** :
rien n'empêche, par défaut, une requête arbitrairement profonde ou coûteuse.
C'est le sujet le plus sérieux de ce cours : ignorer ces points en
production expose réellement le serveur, pas juste en théorie.

## 1. Depth limiting : empêcher l'imbrication infinie

Un schéma avec des relations qui se répondent (`Author.books` →
`Book.author` → `Author.books` → ...) permet, en théorie, une requête
imbriquée **à l'infini** :

```graphql
query Attack {
  author(id: "1") {
    books {
      author {
        books {
          author {
            books { title } # ... repeated dozens of times
          }
        }
      }
    }
  }
}
```

Chaque niveau d'imbrication multiplie le nombre de resolvers appelés — une
requête de 15-20 niveaux peut suffire à saturer le serveur, même avec
DataLoader (qui limite le nombre de requêtes **par niveau**, pas le nombre
de **niveaux**). Le correctif : une règle de **validation** qui rejette
toute requête dépassant une profondeur maximale, **avant** exécution.

```bash
npm install graphql-depth-limit
```

```ts
import depthLimit from "graphql-depth-limit"

GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  validationRules: [depthLimit(5)], // reject any query nested deeper than 5 levels
})
```

## 2. Query complexity : limiter le COÛT, pas juste la profondeur

Une requête peu profonde peut quand même être extrêmement coûteuse si elle
demande de **grandes listes** :

```graphql
query Attack {
  books(limit: 10000) {
    reviews(limit: 10000) {
      author { name }
    }
  }
}
```

L'analyse de **complexité** (ou de « coût ») assigne un poids à chaque
champ — souvent multiplié par un argument de pagination (`limit`,
`first`) — et rejette une requête dont le coût total dépasse un seuil,
toujours **avant** exécution :

```ts
import { createComplexityLimitRule } from "graphql-validation-complexity"

GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  validationRules: [createComplexityLimitRule(1000)],
})
```

> ⚠️ **Erreur fréquente — croire que DataLoader protège contre ce genre
> d'abus.** DataLoader (module 3) résout un problème de **performance**
> (le N+1), pas de **sécurité** : il regroupe les appels, il ne limite ni
> la profondeur, ni la taille des listes demandées. Les deux sujets sont
> orthogonaux et doivent être traités séparément.

## 3. Désactiver l'introspection en production

Le module 1 l'a mentionné : l'introspection (interroger le schéma sur
lui-même) est précieuse en développement, mais donne à **quiconque** une
cartographie complète de l'API en production — chaque type, chaque champ,
chaque argument, y compris ceux jamais utilisés par le client officiel.

```ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  introspection: process.env.NODE_ENV !== "production", // OFF in prod
})
```

> **Réflexe à prendre.** Désactiver l'introspection ne rend pas l'API
> « invisible » — un attaquant motivé peut reconstruire une bonne partie du
> schéma en observant les requêtes du client officiel. Mais ça retire
> l'exploration **gratuite et exhaustive** en un clic, ce qui relève quand
> même la barre significativement. Sans introspection, l'explorateur
> interactif (Apollo Sandbox) n'a d'ailleurs plus rien à afficher : les deux
> suivent la même bascule dev/prod.

## 4. Rate limiting : au niveau HTTP, ET au niveau GraphQL

Un rate limiting HTTP classique (« N requêtes par minute par IP », via
`@nestjs/throttler`) reste utile, mais **ne connaît pas le coût** d'une
requête GraphQL : il compte des requêtes, pas leur profondeur ni leur
complexité. Une seule requête `POST /graphql`, très coûteuse, passe le même
filtre qu'une requête triviale. D'où la nécessité de **combiner** les deux
niveaux :

- un rate limiting HTTP généraliste (contre le volume brut de requêtes),
- **et** depth limiting + query complexity (contre le coût d'**une seule**
  requête, même peu fréquente).

## 5. Authentification et autorisation : les Guards NestJS, adaptés à GraphQL

Un `@UseGuards(...)` NestJS classique lit la requête HTTP (`request.headers`,
`request.user`...) — mais dans un contexte GraphQL, l'objet `ExecutionContext`
de NestJS ne pointe pas directement dessus. L'adaptateur `GqlExecutionContext`
fait le pont :

```ts
// auth/gql-auth.guard.ts
import { ExecutionContext, Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { GqlExecutionContext } from "@nestjs/graphql"

@Injectable()
export class GqlAuthGuard extends AuthGuard("jwt") {
  getRequest(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context)
    return gqlContext.getContext().req // the underlying HTTP request
  }
}
```

```ts
@Resolver(() => Book)
export class BooksResolver {
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Book)
  createBook(@Args("input") input: CreateBookInput, @CurrentUser() user: User): Promise<Book> {
    return this.booksService.create(input, user)
  }
}
```

Le Guard s'applique exactement comme sur un contrôleur REST — seule sa
manière de **lire** la requête change. On peut aussi protéger un champ
précis (`@ResolveField`) plutôt qu'une opération entière, pour une
autorisation **au niveau du champ** (ex. `email` visible seulement par le
propriétaire du compte).

> **API Platform → NestJS/Apollo.** L'attribut `security` d'API Platform
> (`#[ApiResource(security: "is_granted('ROLE_ADMIN')")]`), au niveau d'une
> ressource ou d'une opération GraphQL précise, joue exactement le même
> rôle qu'un Guard ici — la déclaration change de forme, l'intention
> (autoriser/refuser avant d'exécuter le resolver) reste identique. Les
> réflexes depth limiting / query complexity, eux, ne sont pas automatiques
> côté API Platform non plus : GraphQL-PHP (le moteur sous-jacent) expose
> les mêmes points d'extension bas niveau, à activer explicitement.

## À retenir

- **Depth limiting** (`graphql-depth-limit`) empêche l'imbrication
  arbitraire ; **query complexity** (`graphql-validation-complexity`)
  empêche les requêtes trop coûteuses même peu profondes — deux protections
  complémentaires, appliquées à la **validation**, avant toute exécution.
- **Désactive l'introspection** (et l'explorateur interactif) en
  production — ça ne rend pas l'API invisible, mais ça retire
  l'exploration exhaustive et gratuite.
- Le rate limiting HTTP classique ne suffit pas seul : il ignore le
  **coût** d'une requête GraphQL, à traiter séparément.
- Les Guards NestJS fonctionnent avec GraphQL via `GqlExecutionContext` —
  même mécanique que REST, adaptée pour lire le contexte GraphQL plutôt que
  la requête HTTP brute.
