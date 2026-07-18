---
title: "Exercice interactif — filtrer & trier en TypeScript"
type: exercise
exercise:
  language: ts
  starter: |
    interface Order {
      orderId: number
      region: string
      category: string
      amount: number | null
    }

    // Equivalent of:
    //   SELECT orderId, region, category, amount
    //   FROM orders
    //   WHERE region = filterRegion
    //     AND amount IS NOT NULL
    //     AND amount >= minAmount
    //   ORDER BY amount DESC
    // Excludes rows where amount is null.
    // Returns orders sorted by amount descending.
    function filterAndSort(orders: Order[], filterRegion: string, minAmount: number): Order[] {
      // TODO: filter by region, exclude null amounts, keep amount >= minAmount, sort desc
      return []
    }
  tests:
    - name: "filtre région + montant minimum"
      code: |
        const orders: Order[] = [
          { orderId: 1, region: 'North', category: 'Office',    amount: 500 },
          { orderId: 2, region: 'South', category: 'Hardware',  amount: 300 },
          { orderId: 3, region: 'North', category: 'Hardware',  amount: 200 },
          { orderId: 4, region: 'North', category: 'Office',    amount: 80  },
          { orderId: 5, region: 'North', category: 'Office',    amount: null },
        ]
        const got = filterAndSort(orders, 'North', 100)
        console.log('input  :', orders)
        console.log('result :', got)
        // North + amount >= 100 + non-null -> orderId 1 (500) and 3 (200)
        assertEqual(got.length, 2, 'two orders pass the filter')
        assertEqual(got[0].orderId, 1, 'amount 500 first (DESC)')
        assertEqual(got[1].orderId, 3, 'amount 200 second')
    - name: "aucun résultat pour une région inconnue"
      code: |
        const orders: Order[] = [
          { orderId: 1, region: 'North', category: 'Office', amount: 500 },
        ]
        const got = filterAndSort(orders, 'East', 0)
        console.log('result for unknown region:', got)
        assertEqual(got, [], 'unknown region -> empty array')
    - name: "montant null exclu (piège IS NOT NULL)"
      code: |
        const orders: Order[] = [
          { orderId: 1, region: 'North', category: 'Office', amount: null },
          { orderId: 2, region: 'North', category: 'Office', amount: 200 },
        ]
        const got = filterAndSort(orders, 'North', 0)
        console.log('result (null excluded):', got)
        assertEqual(got.length, 1, 'null row must be excluded')
        assertEqual(got[0].orderId, 2, 'only the order with an amount remains')
    - name: "tri décroissant"
      code: |
        const orders: Order[] = [
          { orderId: 1, region: 'North', category: 'Office', amount: 50  },
          { orderId: 2, region: 'North', category: 'Office', amount: 300 },
          { orderId: 3, region: 'North', category: 'Office', amount: 150 },
        ]
        const got = filterAndSort(orders, 'North', 0)
        console.log('sorted result:', got.map((o) => o.amount))
        assertEqual(got[0].amount, 300, 'largest amount first')
        assertEqual(got[2].amount, 50,  'smallest amount last')
---

## Énoncé

Implémente `filterAndSort` : elle prend un tableau de commandes, une région et un
montant minimum, et renvoie les commandes **de cette région** dont le montant est
**non-null** et **supérieur ou égal** à `minAmount`, **triées par montant décroissant**.

C'est l'équivalent TypeScript de :

```sql
SELECT orderId, region, category, amount
FROM orders
WHERE region = filterRegion
  AND amount IS NOT NULL
  AND amount >= minAmount
ORDER BY amount DESC;
```

Indices :
- `Array.filter(...)` pour les deux conditions (attention à distinguer `null` et `0`).
- `Array.sort((a, b) => b.amount - a.amount)` pour le tri décroissant.
- Un `null` n'est **pas** `>= minAmount` : vérifie l'exclusion explicitement.

<!--correction-->

## Correction

```ts
function filterAndSort(orders: Order[], filterRegion: string, minAmount: number): Order[] {
  return orders
    .filter(
      (o) =>
        o.region === filterRegion &&
        o.amount !== null &&
        o.amount !== undefined &&
        o.amount >= minAmount,
    )
    .sort((a, b) => (b.amount as number) - (a.amount as number))
}
```

Le double test `!== null && !== undefined` matérialise le `IS NOT NULL` SQL (en TS strict
`null` et `undefined` sont distincts). Le `.sort(...)` joue le rôle de `ORDER BY amount DESC`.
On ne modifie pas le tableau original : `.filter` crée déjà un nouveau tableau.
