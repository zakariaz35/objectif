---
title: "Les méthodes de tableau"
type: lesson
---

# Manipuler les tableaux

En Vue, on transforme sans arrêt des listes (afficher, filtrer, totaliser). Ces méthodes **ne modifient pas** le tableau d'origine : elles en renvoient un nouveau (sauf `reduce` qui renvoie une valeur).

## `map` — transformer chaque élément

```js
const prix = [10, 20, 30]
const ttc = prix.map((p) => p * 1.2)   // [12, 24, 36]
```

## `filter` — garder certains éléments

```js
const users = [
  { nom: 'Ada', actif: true },
  { nom: 'Bob', actif: false },
]
const actifs = users.filter((u) => u.actif)   // [{ nom: 'Ada', actif: true }]
```

## `find` — le premier qui correspond

```js
const ada = users.find((u) => u.nom === 'Ada')
```

## `reduce` — réduire à une seule valeur

```js
const total = [10, 20, 30].reduce((somme, p) => somme + p, 0)   // 60
```

## `some` / `every` — tester

```js
users.some((u) => u.actif)    // true : au moins un actif
users.every((u) => u.actif)   // false : pas tous actifs
```

> **Le combo gagnant —** `filter` puis `map` : « garde ceux qui… puis extrais… ».
>
> ```js
> const nomsActifs = users.filter((u) => u.actif).map((u) => u.nom)   // ['Ada']
> ```
