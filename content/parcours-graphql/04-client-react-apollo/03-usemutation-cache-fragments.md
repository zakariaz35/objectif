---
title: "useMutation, mise à jour du cache, fragments"
type: lesson
---

## `useMutation` : la même triade, un déclencheur en plus

`useMutation` ressemble à `useQuery`, avec une différence essentielle : il
ne se déclenche **jamais** tout seul au montage du composant. Il renvoie une
**fonction** à appeler explicitement (au clic d'un bouton, à la soumission
d'un formulaire...), plus le même trio `data`/`loading`/`error` :

```tsx
import { gql } from "@apollo/client"
import { useMutation } from "@apollo/client/react"

const CREATE_BOOK = gql`
  mutation CreateBook($input: CreateBookInput!) {
    createBook(input: $input) {
      id
      title
    }
  }
`

function CreateBookForm() {
  const [createBook, { loading, error }] = useMutation(CREATE_BOOK)

  async function handleSubmit(title: string, authorId: string) {
    await createBook({ variables: { input: { title, authorId } } })
  }

  return (
    <button disabled={loading} onClick={() => handleSubmit("Dune", "42")}>
      {loading ? "Creating..." : "Create book"}
    </button>
  )
}
```

## Le vrai sujet : que devient le cache après une mutation ?

Une mutation change une donnée **côté serveur** — mais le cache normalisé
de la leçon précédente, lui, ne se met pas à jour tout seul par magie. Deux
stratégies s'offrent à toi :

### 1. `refetchQueries` : le plus simple

```ts
const [createBook] = useMutation(CREATE_BOOK, {
  refetchQueries: [{ query: GET_BOOKS }],
})
```

Après la mutation, Apollo Client **relance** la query indiquée : un aller-
retour réseau en plus, mais zéro logique à écrire — la liste se remet
forcément à jour, quelle que soit la complexité du changement.

### 2. `update` : mettre à jour le cache directement, sans requête

Pour éviter cet aller-retour, on peut écrire **soi-même** comment le cache
doit changer, en utilisant directement la mécanique de la leçon
précédente :

```ts
const [createBook] = useMutation(CREATE_BOOK, {
  update(cache, { data }) {
    const newBook = data.createBook

    cache.modify({
      fields: {
        books(existingRefs = []) {
          const newBookRef = cache.writeFragment({
            data: newBook,
            fragment: gql`
              fragment NewBook on Book {
                id
                title
              }
            `,
          })
          return [...existingRefs, newBookRef]
        },
      },
    })
  },
})
```

`cache.modify` intervient au niveau du champ `books` de `ROOT_QUERY` — le
champ racine qui contient, en cache, la **liste des références** vers
chaque `Book:id`. `cache.writeFragment` écrit (ou met à jour) l'entité
`newBook` dans le cache normalisé et renvoie sa référence, qu'on ajoute
ensuite à la liste existante.

> ⚠️ **Erreur fréquente — croire qu'il faut choisir une seule stratégie
> pour tout le projet.** `refetchQueries` convient très bien à une mutation
> rare ou peu sensible à la latence (créer un livre depuis un formulaire
> d'admin). `update` vaut la peine dès qu'une mutation est fréquente ou
> doit sembler instantanée (liker un post, cocher une tâche) — les deux
> cohabitent normalement dans une même app.

## Fragments : la colocation, en pratique

Le module 2 a introduit les fragments comme un outil pour **factoriser**
des champs répétés. Côté React, ils deviennent un vrai outil
d'architecture : **chaque composant déclare, à côté de son propre code, les
champs GraphQL dont il a besoin** — la requête globale de la page se
contente d'assembler ces fragments.

```tsx
// components/BookCard.tsx
const BOOK_CARD_FRAGMENT = gql`
  fragment BookCard on Book {
    id
    title
    price
  }
`

function BookCard({ book }: { book: { title: string; price: number } }) {
  return (
    <div>
      <h3>{book.title}</h3>
      <span>{book.price} €</span>
    </div>
  )
}
```

```tsx
// pages/BooksPage.tsx
import { BOOK_CARD_FRAGMENT } from "./components/BookCard"

const GET_BOOKS = gql`
  query GetBooks {
    books {
      ...BookCard
    }
  }
  ${BOOK_CARD_FRAGMENT}
`
```

Si `BookCard` a besoin d'un champ de plus demain, on le rajoute **dans le
fragment, à côté du composant** — jamais besoin de modifier une grosse
query centrale ailleurs dans le code. Apollo Client fournit aussi un hook
dédié, `useFragment`, qui lit directement un fragment depuis le cache
normalisé (sans requête réseau) — pratique pour un composant qui affiche
une entité déjà chargée par ailleurs.

## À retenir

- `useMutation` renvoie une fonction à appeler explicitement, plus
  `data`/`loading`/`error` — jamais déclenché automatiquement comme
  `useQuery`.
- Après une mutation, deux façons de refléter le changement dans le cache :
  `refetchQueries` (simple, un aller-retour réseau de plus) ou `update`
  (manuel, direct sur le cache normalisé, sans requête).
- Les **fragments** permettent la **colocation** : chaque composant déclare
  ses propres champs, à côté de son code — la query de page les assemble.
- Ces trois leçons couvrent l'essentiel d'Apollo Client ; l'exercice qui
  suit revient sur le cœur du module — la normalisation — en la
  reconstruisant à la main.
