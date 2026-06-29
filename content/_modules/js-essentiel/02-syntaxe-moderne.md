---
title: "Syntaxe moderne (ES)"
type: lesson
---

# Syntaxe moderne

Le JavaScript qu'on écrit tous les jours dans un projet Vue.

## `let` / `const`

`const` par défaut (la liaison ne change pas), `let` si la valeur doit évoluer. Oublie `var`.

```js
const VAT = 0.2          // will not be reassigned
let total = 0            // will change
```

## Fonctions fléchées

Plus courtes, et elles **ne créent pas leur propre `this`** (pratique dans les callbacks).

```js
const double = (x) => x * 2
const squares = [1, 2, 3].map((n) => n * n)   // [1, 4, 9]
```

## Template literals

```js
const name = 'Hassane'
const msg = `Hello ${name}, it is ${new Date().getHours()}h`
```

## Destructuration

```js
const user = { id: 1, name: 'Ada', role: 'admin' }
const { name, role } = user         // extract two fields
const [first, second] = [10, 20]    // arrays
```

## Spread / rest `...`

```js
const a = [1, 2], b = [3, 4]
const all = [...a, ...b]             // [1, 2, 3, 4]
const copy = { ...user, role: 'user' }   // copy + change a field
```

## Optional chaining `?.` et nullish `??`

```js
const city = user.address?.city        // undefined instead of an error
const page = params.page ?? 1          // 1 if null/undefined (but keeps 0)
```

> **À retenir —** `const` par défaut, fonctions fléchées, destructuration et spread reviennent dans **chaque** composant Vue. Le reste s'apprend au besoin.
