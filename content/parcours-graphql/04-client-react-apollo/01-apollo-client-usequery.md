---
title: "Apollo Client : mise en place et useQuery"
type: lesson
---

## Un client qui parle le même langage que le serveur

Les trois premiers modules ont construit le **serveur** : schéma, resolvers,
DataLoader. Côté navigateur, il faut maintenant un client capable
d'envoyer des requêtes GraphQL, de gérer `loading`/`error`, et surtout —
prochaine leçon — de **mettre en cache** intelligemment ce qu'il reçoit.
**Apollo Client** est, avec urql, l'un des deux clients GraphQL les plus
utilisés dans l'écosystème React/Next.

```bash
npm install @apollo/client graphql
```

> ⚠️ **Apollo Client v4 (2026) — d'où viennent les imports.** `npm install
> @apollo/client` installe la **v4**. Le cœur (`ApolloClient`, `InMemoryCache`,
> `gql`, `HttpLink`, `split`…) s'importe depuis `@apollo/client` ; mais **les
> hooks React** (`ApolloProvider`, `useQuery`, `useMutation`, `useSubscription`…)
> ont quitté la racine et viennent désormais de **`@apollo/client/react`**.
> (En v3, tout était à la racine — d'où beaucoup d'exemples en ligne encore
> écrits ainsi.)

## Créer le client, l'exposer à toute l'app

```ts
// lib/apollo-client.ts
import { ApolloClient, InMemoryCache } from "@apollo/client"

export const apolloClient = new ApolloClient({
  uri: "http://localhost:3000/graphql", // the SAME single endpoint from module 1
  cache: new InMemoryCache(), // detailed in the next lesson
})
```

```tsx
// app root (or _app.tsx / layout.tsx client boundary)
import { ApolloProvider } from "@apollo/client/react"
import { apolloClient } from "./lib/apollo-client"

export function App({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}
```

`ApolloProvider` place le client dans le contexte React : n'importe quel
composant descendant peut ensuite utiliser les hooks `useQuery`/`useMutation`
sans avoir à passer le client explicitement.

> **Passerelle.** Que le serveur GraphQL derrière `uri` soit un serveur
> NestJS (module 3) ou l'endpoint `/graphql` d'API Platform ne change
> **rien** côté client : Apollo Client ne connaît que le contrat GraphQL
> (schéma, requêtes, réponses), jamais l'implémentation serveur.

## `useQuery` : le hook central

`useQuery` prend une requête GraphQL (écrite avec le tag `gql`), envoie
l'appel, et renvoie un objet avec trois informations essentielles :

```tsx
// components/BookList.tsx
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"

const GET_BOOKS = gql`
  query GetBooks {
    books {
      id
      title
      author {
        id
        name
      }
    }
  }
`

export function BookList() {
  const { loading, error, data } = useQuery(GET_BOOKS)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <ul>
      {data.books.map((book: { id: string; title: string }) => (
        <li key={book.id}>{book.title}</li>
      ))}
    </ul>
  )
}
```

- **`loading`** : `true` tant qu'aucune donnée n'est encore disponible (au
  tout premier appel — voir la nuance sur le cache dans la prochaine leçon).
- **`error`** : rempli si la requête a échoué (réseau, ou `errors[]` renvoyé
  par le serveur — détaillé au module 5).
- **`data`** : la réponse, déjà façonnée **exactement** comme la requête l'a
  demandée — le même principe qu'au module 1, juste consommé côté React.

> **Réflexe à prendre.** `gql` n'exécute rien : c'est une fonction qui
> **parse** le texte de la requête en un AST (le même type d'arbre que la
> leçon « anatomie d'une requête » du module 3), que `useQuery` envoie
> ensuite au serveur. Une faute de syntaxe GraphQL dans un `gql\`...\`` est
> détectée **à la compilation/exécution du composant**, pas seulement côté
> serveur.

## Variables : exactement comme au module 2

Un composant qui affiche **un** livre précis passe ses variables en second
argument de `useQuery`, jamais concaténées dans le texte :

```tsx
const GET_BOOK = gql`
  query GetBook($id: ID!) {
    book(id: $id) {
      title
      price
    }
  }
`

function BookDetails({ bookId }: { bookId: string }) {
  const { loading, error, data } = useQuery(GET_BOOK, {
    variables: { id: bookId },
  })

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return <h1>{data.book.title}</h1>
}
```

Quand `bookId` change (un autre livre sélectionné), Apollo Client relance
automatiquement la requête avec les nouvelles variables — pas besoin de
`useEffect` manuel pour ça.

## Ailleurs dans l'écosystème (bref aperçu)

Apollo Client n'est pas la seule option, et tu croiseras probablement les
deux autres familles :

- **urql** : plus léger, une architecture à base d'« exchanges »
  (middlewares composables) ; son cache normalisé (`@urql/exchange-graphcache`)
  reprend la même idée que celle détaillée dans la prochaine leçon, mais en
  option activable, pas par défaut.
- **TanStack Query + `graphql-request`** : si l'app utilise déjà TanStack
  Query pour du REST, on peut lui faire exécuter de simples requêtes
  GraphQL (via `graphql-request`, un client minimal) — mais TanStack Query
  met en cache **par clé de requête**, sans normaliser les entités : pas la
  déduplication automatique du prochain chapitre.
- **Next.js App Router / Server Components** : les hooks `useQuery`
  demandent un composant **client** (`"use client"`) — Apollo tient un état
  React (cache, souscriptions aux changements), incompatible avec le rendu
  serveur d'un Server Component. Dans un Server Component, on interroge
  l'endpoint GraphQL directement (`fetch("/graphql", { method: "POST", ... })`,
  ou via le package `@apollo/client-integration-nextjs` qui adapte Apollo
  Client au SSR de l'App Router).

## À retenir

- `ApolloClient` + `InMemoryCache` + `ApolloProvider` : la mise en place de
  base, à faire une seule fois à la racine de l'app.
- `useQuery(QUERY, { variables })` renvoie `{ loading, error, data }` — la
  même triade que dans n'importe quel client GraphQL.
- `gql` **parse** la requête, il ne l'exécute pas — la même étape de
  parsing que celle vue côté serveur au module 3.
- Apollo Client n'est qu'une option parmi d'autres (urql, TanStack Query +
  `graphql-request`) ; toutes reposent sur le même protocole GraphQL, mais
  gèrent le cache différemment — sujet de la prochaine leçon.
