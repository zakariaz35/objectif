---
title: "Exercice interactif — reconstruire la normalisation du cache Apollo"
type: exercise
exercise:
  language: ts
  starter: |
    // Build the core of Apollo Client's cache NORMALIZATION, in pure
    // TypeScript. No "@apollo/client"/"react" import here: this IS the
    // mechanism from the lesson, the one that turns a nested GraphQL
    // result into a flat cache of entities.

    // An "entity" is any object with BOTH `__typename` and `id` -- exactly
    // Apollo Client's own default rule to decide what deserves its own
    // cache entry.
    function isEntity(value: any): boolean {
      return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        typeof value.__typename === "string" &&
        value.id !== undefined
      )
    }

    // Flattens a nested GraphQL query result into a normalized cache:
    //   - every ENTITY (an object with __typename + id) gets its OWN key,
    //     "Type:id", storing its OWN fields -- with any NESTED entity
    //     replaced by a reference `{ __ref: "Type:id" }` instead;
    //   - a LIST of entities becomes a list of references;
    //   - a plain nested object WITHOUT __typename/id (ex: `metadata`)
    //     stays embedded as-is: it never gets its own cache entry;
    //   - the top-level result itself is stored under the "ROOT_QUERY" key,
    //     with the same rules applied to its own fields.
    function normalize(queryResult: Record<string, any>): Record<string, any> {
      // TODO
      return {}
    }
  tests:
    - name: "aplatit une entite imbriquee simple en deux entrees + une reference"
      code: |
        const result = {
          book: {
            __typename: "Book",
            id: "1",
            title: "Dune",
            author: {
              __typename: "Author",
              id: "42",
              name: "Frank Herbert",
            },
          },
        }
        const cache = normalize(result)
        console.log("cache:", cache)
        assertEqual(
          cache["Book:1"],
          { __typename: "Book", id: "1", title: "Dune", author: { __ref: "Author:42" } },
          "the Book entity keeps its own scalar fields, with the nested Author replaced by a reference",
        )
        assertEqual(
          cache["Author:42"],
          { __typename: "Author", id: "42", name: "Frank Herbert" },
          "the Author entity gets its OWN cache entry",
        )
        assertEqual(cache.ROOT_QUERY, { book: { __ref: "Book:1" } }, "the root result only keeps a reference to the Book entity")
    - name: "dedoublonne une entite qui apparait plusieurs fois"
      code: |
        const sameAuthor = { __typename: "Author", id: "42", name: "Frank Herbert" }
        const result = {
          books: [
            { __typename: "Book", id: "1", title: "Dune", author: sameAuthor },
            { __typename: "Book", id: "2", title: "Dune Messiah", author: sameAuthor },
          ],
        }
        const cache = normalize(result)
        const authorKeys = Object.keys(cache).filter((k) => k.startsWith("Author:"))
        assertEqual(authorKeys, ["Author:42"], "the SAME author, appearing twice, must produce only ONE cache entry")
        assertEqual(
          cache.ROOT_QUERY,
          { books: [{ __ref: "Book:1" }, { __ref: "Book:2" }] },
          "a root-level list of entities becomes a list of references",
        )
    - name: "normalise une liste d'entites imbriquees (reviews)"
      code: |
        const result = {
          book: {
            __typename: "Book",
            id: "1",
            title: "Dune",
            reviews: [
              { __typename: "Review", id: "r1", rating: 5 },
              { __typename: "Review", id: "r2", rating: 4 },
            ],
          },
        }
        const cache = normalize(result)
        assertEqual(
          cache["Book:1"].reviews,
          [{ __ref: "Review:r1" }, { __ref: "Review:r2" }],
          "a nested list of entities becomes a list of references, same as at the root",
        )
        assertEqual(cache["Review:r1"], { __typename: "Review", id: "r1", rating: 5 }, "each review gets its own cache entry")
        assertEqual(cache["Review:r2"], { __typename: "Review", id: "r2", rating: 4 }, "each review gets its own cache entry")
    - name: "un objet imbrique sans __typename/id reste integre, non extrait"
      code: |
        const result = {
          book: {
            __typename: "Book",
            id: "1",
            title: "Dune",
            metadata: { pages: 412, language: "en" },
          },
        }
        const cache = normalize(result)
        assertEqual(cache["Book:1"].metadata, { pages: 412, language: "en" }, "a plain nested object (no __typename/id) stays embedded, unchanged")
        assertEqual(
          Object.keys(cache).some((k) => k.startsWith("metadata")),
          false,
          "a plain nested object never gets its own cache entry",
        )
---

> ⏱️ **Durée conseillée : ~25 min.**

## Énoncé

La leçon « le cache normalisé » a montré **l'idée** : Apollo Client
décompose une réponse imbriquée en entités (`Type:id`), reliées entre elles
par des références `{ __ref: ... }`. Cet exercice te fait **reconstruire ce
mécanisme**, en miniature.

Implémente `normalize(queryResult)` :

1. Parcours récursivement `queryResult`.
2. Pour chaque **objet** rencontré :
   - s'il a un `__typename` **et** un `id` (utilise `isEntity`, déjà
     fournie) : c'est une **entité**. Calcule sa clé `"Type:id"`, traite
     **récursivement** chacun de ses propres champs (au cas où l'un d'eux
     contient lui-même une entité imbriquée), stocke le résultat dans le
     cache sous cette clé, et renvoie `{ __ref: "Type:id" }` à la place de
     l'objet d'origine ;
   - sinon (objet « simple », comme `metadata`) : traite récursivement ses
     champs, mais **sans** lui créer sa propre entrée de cache — il reste
     imbriqué là où il était.
3. Pour un **tableau**, applique la même règle à **chaque élément**.
4. Stocke le résultat du traitement de `queryResult` lui-même sous la clé
   `"ROOT_QUERY"`.

Réflexe utile : une seule fonction récursive auxiliaire (par ex.
`extractEntity(value)`) qui gère les trois cas (tableau / entité / objet
simple / valeur brute), appelée une première fois sur `queryResult` pour
remplir `cache.ROOT_QUERY`.

<!--correction-->

## Correction

```ts
function isEntity(value: any): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value.__typename === "string" &&
    value.id !== undefined
  )
}

function normalize(queryResult: Record<string, any>): Record<string, any> {
  const cache: Record<string, any> = {}

  function extractEntity(value: any): any {
    if (Array.isArray(value)) {
      return value.map(extractEntity)
    }

    if (value !== null && typeof value === "object") {
      // Recurse into every field FIRST: nested entities must be extracted
      // and replaced by references before we (maybe) store this object.
      const normalizedFields: Record<string, any> = {}
      for (const [fieldName, fieldValue] of Object.entries(value)) {
        normalizedFields[fieldName] = extractEntity(fieldValue)
      }

      if (isEntity(value)) {
        const key = `${value.__typename}:${value.id}`
        cache[key] = normalizedFields
        return { __ref: key }
      }

      // Plain nested object (no __typename/id): stays embedded, as-is.
      return normalizedFields
    }

    // Scalar value (string, number, boolean, null, undefined): unchanged.
    return value
  }

  cache.ROOT_QUERY = extractEntity(queryResult)
  return cache
}
```

- **`extractEntity` traite d'abord les champs, ENSUITE décide** : c'est ce
  qui permet à une entité qui contient elle-même une entité imbriquée
  (`Book` → `Author`) d'obtenir des champs déjà « nettoyés » (avec des
  `__ref` à la place des objets) avant d'être elle-même stockée.
- **La déduplication est automatique**, pas un cas particulier codé à part :
  deux occurrences du même `{ __typename: "Author", id: "42", ... }`
  calculent la **même** clé `"Author:42"` et écrivent donc **à la même
  entrée** du cache, quel que soit le nombre de fois où l'entité apparaît
  dans `queryResult`.
- **`cache.ROOT_QUERY = extractEntity(queryResult)`** traite le résultat
  racine comme n'importe quel objet « simple » (il n'a lui-même ni
  `__typename` ni `id`) : ses champs sont normalisés (chaque entité
  remplacée par une référence), mais il n'obtient pas sa propre entrée
  `Type:id` — exactement le rôle que joue `ROOT_QUERY` dans le vrai cache
  d'Apollo Client.
- Un objet sans `__typename`/`id` (`metadata`) traverse `extractEntity` sans
  jamais entrer dans le `if (isEntity(value))` : il reste imbriqué, comme
  annoncé dans la leçon (« sans `id`, pas de normalisation »).

> Le vrai `InMemoryCache` d'Apollo va plus loin (fusion de champs
> partiels, `keyFields` personnalisés, champs paginés...) — mais le cœur du
> mécanisme, celui qui explique la déduplication et la mise à jour
> automatique de l'UI, est très exactement celui que tu viens d'écrire.
