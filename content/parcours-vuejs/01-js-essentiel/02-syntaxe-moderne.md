---
title: "Syntaxe moderne (ES)"
type: lesson
---

# Syntaxe moderne

Le JavaScript qu'on écrit tous les jours dans un projet Vue.

## `let` / `const`

`const` par défaut (la liaison ne change pas), `let` si la valeur doit évoluer. Oublie `var`.

```js
const TVA = 0.2          // ne sera pas réassigné
let total = 0            // évoluera
```

## Fonctions fléchées

Plus courtes, et elles **ne créent pas leur propre `this`** (pratique dans les callbacks).

```js
const double = (x) => x * 2
const carres = [1, 2, 3].map((n) => n * n)   // [1, 4, 9]
```

## Template literals

```js
const nom = 'Hassane'
const msg = `Bonjour ${nom}, il est ${new Date().getHours()}h`
```

## Destructuration

```js
const user = { id: 1, nom: 'Ada', role: 'admin' }
const { nom, role } = user          // extrait deux champs
const [premier, second] = [10, 20]  // tableaux
```

## Spread / rest `...`

```js
const a = [1, 2], b = [3, 4]
const tout = [...a, ...b]            // [1, 2, 3, 4]
const copie = { ...user, role: 'user' }   // copie + modifie un champ
```

## Optional chaining `?.` et nullish `??`

```js
const ville = user.adresse?.ville      // undefined au lieu d'une erreur
const page = params.page ?? 1          // 1 si null/undefined (mais garde 0)
```

> **À retenir —** `const` par défaut, fonctions fléchées, destructuration et spread reviennent dans **chaque** composant Vue. Le reste s'apprend au besoin.
