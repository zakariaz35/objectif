---
title: "Exercice — un mini moteur de validation (façon class-validator)"
type: exercise
exercise:
  language: ts
  starter: |
    // A SIMPLIFIED, class-validator-like validation engine, in pure TypeScript.
    // A "rule" is a function: (value) => an error message, or null if valid.
    type Rule = (value: unknown) => string | null

    // Rule builders — already implemented for you (mirrors @IsString, @IsEmail...).
    function isString(): Rule {
      return (value) => (typeof value === "string" ? null : "must be a string")
    }

    function isEmail(): Rule {
      return (value) => {
        if (typeof value !== "string" || !value.includes("@")) return "must be a valid email"
        return null
      }
    }

    function min(limit: number): Rule {
      return (value) =>
        typeof value === "number" && value >= limit ? null : `must be >= ${limit}`
    }

    function minLength(limit: number): Rule {
      return (value) =>
        typeof value === "string" && value.length >= limit
          ? null
          : `must be at least ${limit} characters`
    }

    // A schema maps each field name to the list of rules it must satisfy,
    // just like a DTO class maps each property to its validation decorators.
    type Schema = Record<string, Rule[]>

    // TODO: implement validate().
    // For every field declared in `schema` (in declaration order), run EVERY
    // rule of that field (in array order) against `data[field]`.
    // Collect every failing rule into a flat array of strings, formatted as
    // "fieldName: message" (e.g. "email: must be a valid email").
    // A field passing ALL its rules contributes NOTHING to the result.
    // Fields present in `data` but NOT declared in `schema` must be ignored
    // (like class-validator's `whitelist` option: only declared fields count).
    function validate(schema: Schema, data: Record<string, unknown>): string[] {
      // TODO
      return []
    }
  tests:
    - name: "un objet valide ne produit aucune erreur"
      code: |
        const schema = {
          name: [isString(), minLength(2)],
          email: [isEmail()],
          age: [min(18)],
        }
        const data = { name: "Ada", email: "ada@example.com", age: 20 }
        const errors = validate(schema, data)
        console.log("errors:", errors)
        assertEqual(errors, [], "a fully valid object must produce zero errors")
    - name: "chaque champ invalide produit un message au format 'champ: message'"
      code: |
        const schema = {
          name: [isString()],
          email: [isEmail()],
          age: [min(18)],
        }
        const data = { name: 42, email: "not-an-email", age: 10 }
        const errors = validate(schema, data)
        console.log("errors:", errors)
        assertEqual(
          errors,
          ["name: must be a string", "email: must be a valid email", "age: must be >= 18"],
          "errors must be formatted as 'field: message', in schema declaration order",
        )
    - name: "plusieurs regles en echec sur le MEME champ sont toutes collectees, dans l'ordre"
      code: |
        const schema = { password: [isString(), minLength(8)] }
        const data = { password: 12345 } // not a string AND (as a string) too short
        const errors = validate(schema, data)
        assertEqual(
          errors,
          ["password: must be a string", "password: must be at least 8 characters"],
          "all failing rules for a field must be collected, in the rule array's order",
        )
    - name: "un champ present dans data mais absent du schema est ignore (whitelist)"
      code: |
        const schema = { name: [isString()] }
        const data = { name: "Ada", extraField: "should be ignored entirely" }
        const errors = validate(schema, data)
        assertEqual(errors, [], "fields not declared in the schema must NOT be checked at all")
    - name: "un champ valide au milieu de champs invalides ne genere aucune erreur pour lui"
      code: |
        const schema = {
          name: [isString(), minLength(2)],
          email: [isEmail()],
          age: [min(18)],
        }
        const data = { name: "Bob", email: "not-an-email", age: 15 }
        const errors = validate(schema, data)
        assertEqual(
          errors,
          ["email: must be a valid email", "age: must be >= 18"],
          "a passing field (name here) must contribute NOTHING to the errors array",
        )
---

> ⏱️ **Durée conseillée : ~25 min.**

## Énoncé

`class-validator` fonctionne, au fond, très simplement : pour chaque
propriété d'un DTO, une liste de **règles** (les décorateurs `@IsString()`,
`@IsEmail()`...) sont exécutées contre la valeur reçue, et chaque échec
produit un message d'erreur.

Le starter fournit déjà les **règles** (`isString`, `isEmail`, `min`,
`minLength`) : ta mission est d'écrire l'**orchestrateur**, `validate()`,
qui les exécute toutes et collecte les erreurs — exactement le rôle joué
par la `ValidationPipe` de Nest (vue en leçon 3), en version simplifiée.

Règles précises attendues :

1. Ne parcourir **que** les champs déclarés dans `schema` (jamais ceux de
   `data` qui n'y figureraient pas — le réflexe `whitelist`).
2. Pour chaque champ, exécuter **toutes** ses règles, dans l'ordre du
   tableau — pas seulement la première qui échoue.
3. Formater chaque erreur `"nomDuChamp: message"`.
4. Un champ qui passe toutes ses règles ne doit produire **aucune** entrée.

Réflexes utiles :

- `Object.keys(schema)` te donne les noms de champs, **dans l'ordre de
  déclaration** du schéma.
- Pour chaque champ, une simple boucle sur son tableau de règles, en
  poussant chaque message non-`null` dans le tableau de résultat final.

<!--correction-->

## Correction

```ts
// --- Provided by the starter (the rule builders + types) ---
type Rule = (value: unknown) => string | null

function isString(): Rule {
  return (value) => (typeof value === "string" ? null : "must be a string")
}

function isEmail(): Rule {
  return (value) => {
    if (typeof value !== "string" || !value.includes("@")) return "must be a valid email"
    return null
  }
}

function min(limit: number): Rule {
  return (value) =>
    typeof value === "number" && value >= limit ? null : `must be >= ${limit}`
}

function minLength(limit: number): Rule {
  return (value) =>
    typeof value === "string" && value.length >= limit
      ? null
      : `must be at least ${limit} characters`
}

type Schema = Record<string, Rule[]>

// --- The part to implement ---
function validate(schema: Schema, data: Record<string, unknown>): string[] {
  const errors: string[] = []

  for (const field of Object.keys(schema)) {
    const rules = schema[field]
    const value = data[field]

    for (const rule of rules) {
      const message = rule(value)
      if (message !== null) {
        errors.push(`${field}: ${message}`)
      }
    }
  }

  return errors
}
```

- On boucle sur `Object.keys(schema)` — **jamais** sur `Object.keys(data)` :
  c'est ce qui garantit qu'un champ non déclaré dans le schéma (ex.
  `extraField`) est **totalement ignoré**, comme le ferait `whitelist:
  true` sur une vraie `ValidationPipe`.
- La boucle interne exécute **chaque** règle du champ, sans s'arrêter à la
  première qui échoue : c'est le comportement par défaut de
  `class-validator`, qui remonte **toutes** les violations d'une propriété,
  pas seulement la première.
- Le format `"${field}: ${message}"` reproduit, en très simplifié, le
  tableau `message: string[]` que Nest renvoie dans le corps d'une réponse
  `400 Bad Request` générée par la `ValidationPipe`.

> Le vrai `class-validator` va plus loin (validation imbriquée avec
> `@ValidateNested`, groupes de validation, messages i18n...) — mais le
> mécanisme central, celui que tu viens d'écrire (un schéma de règles, une
> boucle, une collecte d'erreurs), est exactement le même.
