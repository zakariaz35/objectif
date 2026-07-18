---
title: "Exercice — logique de Pipe, Guard et Interceptor, en pur TypeScript"
type: exercise
exercise:
  language: ts
  starter: |
    // Three SEPARATE mini-functions, each mirroring the CORE LOGIC of a
    // NestJS building block — no @nestjs/* import, no decorator, no runtime:
    // just the plain TypeScript logic each one performs internally.

    // === 1. Pipe-like: string -> trimmed integer, like ParseIntPipe + a trim step ===
    // TODO: trim `raw`, then convert it to an integer.
    // If, after trimming, the value is NOT a valid integer, throw an Error
    // with the message "invalid integer".
    function parseIntPipeTransform(raw: string): number {
      // TODO
      return 0
    }

    // === 2. Guard-like: is at least one of the user's roles allowed? ===
    // TODO: return true if userRoles contains AT LEAST ONE role present in
    // allowedRoles, false otherwise. An empty userRoles list is never allowed.
    function canActivateForRoles(allowedRoles: string[], userRoles: string[]): boolean {
      // TODO
      return false
    }

    // === 3. Interceptor-like: wrap a controller's return value in { data } ===
    // TODO: return a new object of the shape { data: value }, WITHOUT
    // mutating or otherwise altering `value` itself.
    function wrapResponseInterceptor<T>(value: T): { data: T } {
      // TODO
      return { data: value }
    }
  tests:
    - name: "parseIntPipeTransform convertit une chaine avec espaces en entier"
      code: |
        const result = parseIntPipeTransform("  42  ")
        console.log("result:", result)
        assertEqual(result, 42, "leading/trailing whitespace must be trimmed before conversion")
    - name: "parseIntPipeTransform rejette une valeur non entiere"
      code: |
        let threw = false
        try {
          parseIntPipeTransform("not-a-number")
        } catch (e) {
          threw = true
        }
        assert(threw, "an invalid integer string must throw an Error, just like ParseIntPipe returning 400")
    - name: "canActivateForRoles autorise si au moins UN role correspond"
      code: |
        const allowed = canActivateForRoles(["admin", "manager"], ["editor", "manager"])
        assertEqual(allowed, true, "having at least one allowed role must grant access")
    - name: "canActivateForRoles refuse si AUCUN role ne correspond"
      code: |
        const allowed = canActivateForRoles(["admin", "manager"], ["editor", "viewer"])
        assertEqual(allowed, false, "having zero matching roles must deny access")
    - name: "canActivateForRoles refuse une liste de roles utilisateur vide"
      code: |
        const allowed = canActivateForRoles(["admin"], [])
        assertEqual(allowed, false, "an empty userRoles list must never be granted access")
    - name: "wrapResponseInterceptor enveloppe la valeur sans la muter"
      code: |
        const original = { id: 1, name: "Book" }
        const wrapped = wrapResponseInterceptor(original)
        console.log("wrapped:", wrapped)
        assertEqual(wrapped, { data: { id: 1, name: "Book" } }, "the value must be wrapped inside a { data } envelope")
        assertEqual(original, { id: 1, name: "Book" }, "the original value must remain untouched")
---

> ⏱️ **Durée conseillée : ~20 min.**

## Énoncé

Ce module a présenté trois briques transverses distinctes : **Pipes**,
**Guards**, **Interceptors**. Sans aucun runtime NestJS, tu vas implémenter
la **logique pure** de chacune, sous forme de trois petites fonctions
indépendantes.

1. **`parseIntPipeTransform(raw)`** — comme `ParseIntPipe` : nettoie les
   espaces (`.trim()`), convertit en entier, et **lève une erreur** si le
   résultat n'est pas un entier valide (au lieu de renvoyer silencieusement
   `NaN`).
2. **`canActivateForRoles(allowedRoles, userRoles)`** — comme un Guard de
   rôles : autorise l'accès dès qu'**au moins un** rôle de l'utilisateur
   figure dans la liste des rôles autorisés.
3. **`wrapResponseInterceptor(value)`** — comme un Interceptor de réponse :
   enveloppe n'importe quelle valeur dans `{ data: value }`, **sans**
   modifier la valeur d'origine.

Réflexes utiles :

- `Number.parseInt` ou `Number(...)` convertissent une chaîne ; `Number
  .isInteger(...)` vérifie que le résultat est bien un entier (et pas
  `NaN`, ni un flottant).
- `Array.prototype.some(...)` est l'outil naturel pour « au moins un élément
  qui correspond ».
- Une simple expression objet `{ data: value }` suffit pour le point 3 — pas
  besoin de cloner `value` lui-même, juste de ne jamais le réassigner.

<!--correction-->

## Correction

```ts
function parseIntPipeTransform(raw: string): number {
  const trimmed = raw.trim()
  const value = Number(trimmed)

  if (!Number.isInteger(value)) {
    throw new Error("invalid integer")
  }

  return value
}

function canActivateForRoles(allowedRoles: string[], userRoles: string[]): boolean {
  return userRoles.some((role) => allowedRoles.includes(role))
}

function wrapResponseInterceptor<T>(value: T): { data: T } {
  return { data: value }
}
```

- **`parseIntPipeTransform`** sépare bien les deux étapes : nettoyage
  (`.trim()`) puis conversion (`Number(...)`), avant de **vérifier** le
  résultat avec `Number.isInteger` — `Number("not-a-number")` vaut `NaN`,
  et `Number.isInteger(NaN)` est `false`, ce qui déclenche l'erreur, comme
  `ParseIntPipe` renverrait un `400 Bad Request`.
- **`canActivateForRoles`** utilise `some(...)` : dès qu'**un seul** rôle
  utilisateur est présent dans `allowedRoles`, la fonction s'arrête et
  renvoie `true` — exactement la sémantique « au moins un rôle suffit »
  d'un Guard de rôles typique.
- **`wrapResponseInterceptor`** ne fait que construire un nouvel objet
  autour de `value`, sans jamais le modifier : c'est le même geste qu'un
  vrai `WrapResponseInterceptor`, qui transforme ce que **renvoie** le
  handler sans jamais toucher à l'objet d'origine.

> Ces trois fonctions sont volontairement séparées des vraies classes Nest
> (`PipeTransform`, `CanActivate`, `NestInterceptor`) : ce sont des
> classes/décorateurs qui, au runtime, **appellent** une logique de ce
> type — celle que tu viens d'écrire à la main.
