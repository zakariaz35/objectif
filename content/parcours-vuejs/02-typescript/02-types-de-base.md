---
title: "Les types de base"
type: lesson
---

# Les types de base

TypeScript = JavaScript + des annotations de **type** vérifiées avant l'exécution.

## Annoter une variable

```ts
let nom: string = 'Ada'
let age: number = 30
let actif: boolean = true
let tags: string[] = ['vue', 'ts']
```

Souvent l'annotation est **inférée** automatiquement — pas besoin de la répéter :

```ts
let total = 0          // TS sait que c'est un number
```

## Unions

Une valeur qui peut être de plusieurs types :

```ts
let id: string | number
id = 'abc'   // ok
id = 42      // ok
```

## `interface` et `type`

Décrire la **forme** d'un objet :

```ts
interface User {
  id: number
  nom: string
  role?: 'admin' | 'user'   // ? = optionnel
}

type Point = { x: number; y: number }
```

> **interface vs type —** Pour décrire un objet, les deux marchent. `interface` est
> extensible (plusieurs déclarations fusionnent) et lisible pour des objets ; `type`
> est plus polyvalent (unions, alias). Règle simple : **`interface` pour les objets**,
> `type` pour le reste.

> **Évite `any` —** `any` désactive toute vérification. Préfère `unknown` (force à
> vérifier le type avant de l'utiliser) quand tu ne sais pas.
