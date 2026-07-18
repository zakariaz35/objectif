---
title: "Exercice — pipeline de transformation (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface Product {
      name: string
      price: number
      inStock: boolean
    }

    interface ProductView {
      label: string
      price: number
    }

    // The transformation you'd put inside an RxJS `map` after an HTTP GET.
    // Keep only products in stock, reshape each into { label, price },
    // and sort by price ascending (cheapest first).
    function processProducts(products: Product[]): ProductView[] {
      // TODO: filter, then map, then sort
      return []
    }
  tests:
    - name: "filtre, transforme et trie"
      code: |
        const input: Product[] = [
          { name: 'Desk', price: 199, inStock: true },
          { name: 'Lamp', price: 39, inStock: false },
          { name: 'Chair', price: 89, inStock: true },
          { name: 'Pen', price: 2, inStock: true },
        ]
        const result = processProducts(input)
        console.log('input  :', input)
        console.log('result :', result)
        assertEqual(
          result,
          [
            { label: 'Pen', price: 2 },
            { label: 'Chair', price: 89 },
            { label: 'Desk', price: 199 },
          ],
          'in-stock only, reshaped, sorted by price asc'
        )
    - name: "tout en rupture → liste vide"
      code: |
        const result = processProducts([{ name: 'X', price: 5, inStock: false }])
        console.log('result :', result)
        assertEqual(result, [], 'nothing in stock → empty')
    - name: "liste vide → []"
      code: |
        assertEqual(processProducts([]), [], 'empty input → empty output')
---

## Énoncé

Après un `GET`, on transforme rarement la donnée brute telle quelle : on filtre, on
remodèle, on trie — exactement ce qu'on mettrait dans un `map(...)` RxJS. Ici on l'écrit
comme une fonction pure (chaîne `filter` → `map` → `sort`).

Implémente `processProducts(products)` :

1. garde uniquement les produits **en stock** (`inStock === true`) ;
2. transforme chacun en `{ label: name, price }` ;
3. trie par **prix croissant** (le moins cher d'abord).

Indice : `array.filter(...).map(...).sort((a, b) => a.price - b.price)`. Les trois méthodes
renvoient de **nouveaux** tableaux — l'entrée n'est pas modifiée.

<!--correction-->

## Correction

`filter` retient les produits en stock, `map` les remodèle en `ProductView`, `sort` les
ordonne par prix (`a.price - b.price` = ordre croissant). Cette chaîne tient dans un seul
opérateur RxJS. En pratique, dans un composant on l'utiliserait ainsi :

```ts
this.http.get<Product[]>('/api/products').pipe(
  map((products) => processProducts(products)),
)
```

C'est tout l'intérêt d'isoler la transformation : elle se **teste seule**, sans réseau ni
Observable. L'implémentation :

```ts
function processProducts(products: Product[]): ProductView[] {
  return products
    .filter((p) => p.inStock)
    .map((p) => ({ label: p.name, price: p.price }))
    .sort((a, b) => a.price - b.price)
}
```
