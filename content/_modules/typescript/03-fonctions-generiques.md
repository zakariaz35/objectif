---
title: "Fonctions & génériques"
type: lesson
---

# Typer les fonctions, et les génériques

## Typer une fonction

On type les **paramètres** et le **retour** :

```ts
function sum(a: number, b: number): number {
  return a + b
}

const double = (x: number): number => x * 2
```

Retour `void` quand la fonction ne renvoie rien :

```ts
function log(message: string): void {
  console.log(message)
}
```

## Génériques (les bases)

Un générique = un type **paramétré** (`<T>`), pour écrire du code réutilisable **sans perdre le typage**.

```ts
function first<T>(list: T[]): T | undefined {
  return list[0]
}

first<number>([1, 2, 3])     // number | undefined
first(['a', 'b'])            // string | undefined (T inferred)
```

Tu en croiseras tout le temps dans Vue : `ref<number>(0)`, `Ref<User>`, `Array<string>`.

> **À retenir —** types sur les paramètres + le retour ; `<T>` quand le type d'entrée
> doit se **propager** au retour. Inutile de tout typer à la main : laisse l'inférence
> travailler, annote là où ça clarifie.
