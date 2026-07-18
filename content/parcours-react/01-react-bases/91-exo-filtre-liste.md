---
title: "Exercice — filtrer et trier une liste (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface Product {
      id: number
      name: string
      price: number
      inStock: boolean
    }

    // Pure logic — the kind useState + useMemo would call in a real component.
    // Filter products by stock availability, then sort by price ascending.
    function filterAndSort(products: Product[], onlyInStock: boolean): Product[] {
      // TODO: return filtered (if onlyInStock) then sorted by price asc
      return []
    }
  tests:
    - name: "filtre en stock uniquement"
      code: |
        const products: Product[] = [
          { id: 1, name: 'Clavier', price: 89, inStock: true },
          { id: 2, name: 'Souris',  price: 39, inStock: false },
          { id: 3, name: 'Écran',   price: 299, inStock: true },
        ]
        const result = filterAndSort(products, true)
        console.log('résultat :', result.map(p => p.name))
        assertEqual(result.length, 2, '2 produits en stock')
        assertEqual(result[0].name, 'Clavier', 'trié par prix asc : Clavier en 1er')
        assertEqual(result[1].name, 'Écran', 'puis Écran')
    - name: "aucun filtre — juste le tri"
      code: |
        const products: Product[] = [
          { id: 1, name: 'Clavier', price: 89, inStock: true },
          { id: 2, name: 'Souris',  price: 39, inStock: false },
          { id: 3, name: 'Écran',   price: 299, inStock: true },
        ]
        const result = filterAndSort(products, false)
        console.log('ordre :', result.map(p => p.name))
        assertEqual(result.length, 3, 'tous les produits')
        assertEqual(result[0].name, 'Souris', 'Souris la moins chère en premier')
    - name: "liste vide"
      code: |
        assertEqual(filterAndSort([], true), [], 'liste vide')
---

## Énoncé

> **Durée conseillée : ~15 min.** Dans un composant React, cette logique vivrait dans
> un `useMemo` pour éviter de recalculer à chaque rendu. Ici on l'écrit comme une
> fonction pure, plus facile à tester.

Implémente `filterAndSort` :

1. Si `onlyInStock` est `true`, ne garde que les produits `inStock: true`.
2. Trie le résultat par `price` **croissant**.
3. Ne modifie pas le tableau original (retourne une nouvelle copie).

Indices : `Array.filter()`, `Array.sort()` et `[...array]` pour copier.

<!--correction-->

## Correction

```ts
function filterAndSort(products: Product[], onlyInStock: boolean): Product[] {
  const filtered = onlyInStock ? products.filter((p) => p.inStock) : [...products]
  return filtered.sort((a, b) => a.price - b.price)
}
```

Points clés :
- On ne mute pas `products` — `filter` crée un nouveau tableau ; `[...products]`
  crée une copie quand on ne filtre pas.
- `sort((a, b) => a.price - b.price)` : tri numérique croissant. Attention : `sort`
  **mute** le tableau qu'il reçoit — c'est pourquoi on ne le call pas directement sur
  `products`.
- Dans un vrai composant React : `const sorted = useMemo(() => filterAndSort(items, filter), [items, filter])`.
