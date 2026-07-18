---
title: "Exercice interactif — un mini exécuteur de resolvers"
type: exercise
exercise:
  language: ts
  starter: |
    // Build a SIMPLIFIED GraphQL execution engine, in pure TypeScript.
    // No graphql/@nestjs import here: this is the core IDEA behind the
    // "parsing -> validation -> EXECUTION" flow from the lesson, stripped
    // down to its essence -- resolving a "selection set" field by field,
    // recursively, exactly like the real engine does.

    // A resolver function: given the PARENT value, returns this field's value.
    type ResolverFn = (parent: any) => any

    // Resolvers, grouped by TYPE NAME (like "Book.author", "Author.name"...).
    type ResolverMap = {
      [typeName: string]: {
        [fieldName: string]: ResolverFn
      }
    }

    // What the "client" asked for: `true` = a leaf (scalar) field,
    // an object = a nested field with its OWN sub-selection.
    type SelectionSet = {
      [fieldName: string]: true | SelectionSet
    }

    // Tells the executor which TYPE a nested object field resolves to.
    // (In a real GraphQL server, this information lives in the schema/SDL --
    // here, it is passed explicitly so the executor knows which resolvers
    // to use for the nested type.)
    type FieldTypeMap = {
      [typeName: string]: {
        [fieldName: string]: string
      }
    }

    // Resolve `selection` against `parent` (a value of type `typeName`).
    // For EACH requested field:
    //   - use the explicit resolver from `resolvers[typeName][fieldName]`
    //     if one exists,
    //   - otherwise fall back to plain property access: `parent[fieldName]`
    //     (this is GraphQL's DEFAULT resolver behaviour).
    //   - if the sub-selection is a nested object (not `true`), recurse:
    //     use `fieldTypes[typeName][fieldName]` to know which type's
    //     resolvers to use for the nested value (or for EACH item, if the
    //     value is an array).
    // Return ONLY the requested fields -- never anything else.
    function executeSelection(
      typeName: string,
      parent: any,
      selection: SelectionSet,
      resolvers: ResolverMap,
      fieldTypes: FieldTypeMap,
    ): any {
      // TODO
      return {}
    }
  tests:
    - name: "ne renvoie que les champs selectionnes (pas d'over-fetching)"
      code: |
        const book = { id: "1", title: "Dune", internalNotes: "do not expose this" }
        const result = executeSelection("Book", book, { title: true }, {}, {})
        console.log("result:", result)
        assertEqual(result, { title: "Dune" }, "only requested fields must appear in the result")
    - name: "sans resolver declare, un champ retombe sur un simple acces de propriete"
      code: |
        const parent = { title: "Dune", rating: 4.8 }
        const result = executeSelection("Book", parent, { title: true, rating: true }, {}, {})
        assertEqual(result, { title: "Dune", rating: 4.8 }, "fields without an explicit resolver must fall back to plain property access, like GraphQL's default resolver")
    - name: "un resolver explicite peut remplacer l'acces direct a la propriete"
      code: |
        const resolvers = {
          Book: {
            title: (parent: any) => parent.title.toUpperCase(),
          },
        }
        const result = executeSelection("Book", { title: "dune" }, { title: true }, resolvers, {})
        assertEqual(result, { title: "DUNE" }, "an explicit resolver must override the default property access")
    - name: "un champ imbrique est resolu recursivement, avec sa propre selection"
      code: |
        const resolvers = {
          Book: {
            author: (parent: any) => ({ id: parent.authorId, name: "Frank Herbert", email: "secret@example.com" }),
          },
        }
        const fieldTypes = { Book: { author: "Author" } }
        const book = { title: "Dune", authorId: "42" }
        const selection = { title: true, author: { name: true } }
        const result = executeSelection("Book", book, selection, resolvers, fieldTypes)
        console.log("result:", result)
        assertEqual(
          result,
          { title: "Dune", author: { name: "Frank Herbert" } },
          "nested selection must only keep requested sub-fields (email must NOT leak through)",
        )
    - name: "un champ resolu vers un tableau d'objets est resolu element par element"
      code: |
        const resolvers = {
          Author: {
            books: () => [
              { id: "1", title: "Dune", pages: 412 },
              { id: "2", title: "Dune Messiah", pages: 256 },
            ],
          },
        }
        const fieldTypes = { Author: { books: "Book" } }
        const selection = { name: true, books: { title: true } }
        const result = executeSelection("Author", { name: "Frank Herbert" }, selection, resolvers, fieldTypes)
        assertEqual(
          result,
          { name: "Frank Herbert", books: [{ title: "Dune" }, { title: "Dune Messiah" }] },
          "each item of a list field must be resolved independently, keeping only requested sub-fields",
        )
---

> ⏱️ **Durée conseillée : ~25 min.**

## Énoncé

Dans la leçon « anatomie d'une requête », tu as tracé à la main comment un
moteur GraphQL résout une requête **champ par champ** : un resolver explicite
quand tu en écris un, un simple accès de propriété (`parent.fieldName`)
sinon — et une récursion dès qu'un champ a lui-même une sous-sélection.

Implémente `executeSelection(typeName, parent, selection, resolvers,
fieldTypes)`, le cœur de ce mécanisme :

1. Pour chaque champ de `selection` :
   - si `resolvers[typeName][fieldName]` existe, appelle-le avec `parent` et
     utilise sa valeur de retour ;
   - sinon, utilise `parent[fieldName]` directement (le comportement du
     **resolver par défaut** de GraphQL).
2. Si la sous-sélection de ce champ est `true` (un scalar), garde la valeur
   telle quelle.
3. Si la sous-sélection est un **objet** (un champ imbriqué), utilise
   `fieldTypes[typeName][fieldName]` pour savoir sur quel type récursivement
   appliquer `executeSelection` — et applique-le **à chaque élément** si la
   valeur est un tableau.
4. Le résultat ne doit **jamais** contenir de champ non demandé.

Réflexe utile : une simple boucle sur `Object.keys(selection)`, qui
construit un objet résultat au fur et à mesure — exactement comme le moteur
GraphQL construit sa réponse en épousant la forme de la requête.

<!--correction-->

## Correction

```ts
type ResolverFn = (parent: any) => any

type ResolverMap = {
  [typeName: string]: {
    [fieldName: string]: ResolverFn
  }
}

type SelectionSet = {
  [fieldName: string]: true | SelectionSet
}

type FieldTypeMap = {
  [typeName: string]: {
    [fieldName: string]: string
  }
}

function executeSelection(
  typeName: string,
  parent: any,
  selection: SelectionSet,
  resolvers: ResolverMap,
  fieldTypes: FieldTypeMap,
): any {
  const result: any = {}

  for (const fieldName of Object.keys(selection)) {
    // Use the explicit resolver if declared, otherwise fall back to plain
    // property access -- GraphQL's DEFAULT field resolver behaviour.
    const resolverForField = resolvers[typeName]?.[fieldName]
    const value = resolverForField ? resolverForField(parent) : parent?.[fieldName]

    const subSelection = selection[fieldName]

    if (subSelection === true || value == null) {
      // Leaf field (scalar), or nothing to recurse into: keep as-is.
      result[fieldName] = value
      continue
    }

    // Nested object field: we need to know WHICH type it resolves to, to
    // look up the right resolvers for ITS OWN sub-fields -- exactly the
    // information a real GraphQL schema provides.
    const nestedTypeName = fieldTypes[typeName]?.[fieldName]
    if (!nestedTypeName) {
      throw new Error(`Unknown type for field "${typeName}.${fieldName}"`)
    }

    if (Array.isArray(value)) {
      result[fieldName] = value.map((item) =>
        executeSelection(nestedTypeName, item, subSelection, resolvers, fieldTypes),
      )
    } else {
      result[fieldName] = executeSelection(nestedTypeName, value, subSelection, resolvers, fieldTypes)
    }
  }

  return result
}
```

- La boucle sur `Object.keys(selection)` garantit que le résultat ne
  contient **jamais** un champ non demandé — même si `parent` en possède
  beaucoup d'autres (`internalNotes`, `email`...). C'est la mécanique exacte
  qui évite l'over-fetching côté serveur : on ne lit et n'assemble que ce
  qui a été sélectionné.
- `resolverForField ? resolverForField(parent) : parent?.[fieldName]`
  reproduit **exactement** le choix que fait `graphql-js` à l'exécution :
  resolver explicite si déclaré, sinon accès de propriété — le mécanisme
  détaillé dans la leçon « anatomie d'une requête ».
- `fieldTypes` joue le rôle du **schéma** : il dit à l'exécuteur « le champ
  `author` d'un `Book` renvoie un `Author` », l'information nécessaire pour
  savoir quels resolvers utiliser une fois la récursion entamée.
- Le `Array.isArray(value)` gère le cas d'une liste (`books`) : chaque
  élément est résolu **indépendamment**, avec la même sous-sélection — le
  point de départ conceptuel du problème N+1 que tu creuses juste après.
