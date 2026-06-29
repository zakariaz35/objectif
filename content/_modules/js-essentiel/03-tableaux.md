---
title: "Les méthodes de tableau"
type: lesson
---

# Manipuler les tableaux

En Vue, on transforme sans arrêt des listes (afficher, filtrer, totaliser). Ces méthodes **ne modifient pas** le tableau d'origine : elles en renvoient un nouveau (sauf `reduce` qui renvoie une valeur).

## `map` — transformer chaque élément

```js
const prices = [10, 20, 30]
const withTax = prices.map((p) => p * 1.2)   // [12, 24, 36]
```

## `filter` — garder certains éléments

```js
const users = [
  { name: 'Ada', active: true },
  { name: 'Bob', active: false },
]
const activeUsers = users.filter((u) => u.active)   // [{ name: 'Ada', active: true }]
```

## `find` — le premier qui correspond

```js
const ada = users.find((u) => u.name === 'Ada')
```

## `reduce` — réduire à une seule valeur

```js
const total = [10, 20, 30].reduce((sum, p) => sum + p, 0)   // 60
```

## `some` / `every` — tester

```js
users.some((u) => u.active)    // true : au moins un actif
users.every((u) => u.active)   // false : pas tous actifs
```

> **Le combo gagnant —** `filter` puis `map` : « garde ceux qui… puis extrais… ».
>
> ```js
> const activeNames = users.filter((u) => u.active).map((u) => u.name)   // ['Ada']
> ```
