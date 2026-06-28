---
title: "Exercice interactif — Top-N par groupe en TypeScript"
type: exercise
exercise:
  language: ts
  starter: |
    interface Order {
      orderId: number
      category: string
      amount: number
    }

    // Equivalent of:
    //   WITH ranked AS (
    //     SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY amount DESC) AS rn
    //     FROM orders
    //   )
    //   SELECT * FROM ranked WHERE rn <= n
    // Return, per category, the top `n` orders by amount (highest first).
    // Output is ordered by category (asc), then amount (desc).
    function topNByCategory(orders: Order[], n: number): Order[] {
      // TODO: group by category, sort each group by amount desc, keep the first n
      return []
    }
  tests:
    - name: "top 2 par catégorie"
      code: |
        const orders: Order[] = [
          { orderId: 1, category: 'Office', amount: 50 },
          { orderId: 2, category: 'Office', amount: 200 },
          { orderId: 3, category: 'Office', amount: 120 },
          { orderId: 4, category: 'Hardware', amount: 300 },
          { orderId: 5, category: 'Hardware', amount: 80 },
        ]
        const got = topNByCategory(orders, 2)
        console.log('input  :', orders)
        console.log('top-2  :', got)
        // Hardware: 300, 80 ; Office: 200, 120 (50 dropped). Sorted by category asc.
        assertEqual(got, [
          { orderId: 4, category: 'Hardware', amount: 300 },
          { orderId: 5, category: 'Hardware', amount: 80 },
          { orderId: 2, category: 'Office', amount: 200 },
          { orderId: 3, category: 'Office', amount: 120 },
        ], 'top 2 per category, category asc then amount desc')
    - name: "n plus grand que le groupe → tout le groupe"
      code: |
        const orders: Order[] = [
          { orderId: 1, category: 'Office', amount: 10 },
          { orderId: 2, category: 'Office', amount: 30 },
        ]
        const got = topNByCategory(orders, 5)
        assertEqual(got, [
          { orderId: 2, category: 'Office', amount: 30 },
          { orderId: 1, category: 'Office', amount: 10 },
        ], 'fewer rows than n → keep all, sorted desc')
    - name: "table vide → []"
      code: |
        assertEqual(topNByCategory([], 3), [], 'no orders → empty result')
---

## Énoncé

Refais un **top-N par groupe** (le cas `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)`
puis `WHERE rn <= n`) en TypeScript. Pour chaque `category`, garde les `n` commandes au
`amount` le plus élevé. Le résultat est trié par `category` croissante, puis par `amount`
décroissant.

Indices : groupe dans une `Map<string, Order[]>`, trie chaque groupe par `amount`
décroissant, prends `slice(0, n)`. Pour la sortie globale, trie les catégories par ordre
alphabétique.

<!--correction-->

## Correction

```ts
function topNByCategory(orders: Order[], n: number): Order[] {
  const groups = new Map<string, Order[]>()
  for (const order of orders) {
    const list = groups.get(order.category) ?? []
    list.push(order)
    groups.set(order.category, list)
  }

  const result: Order[] = []
  const categories = Array.from(groups.keys()).sort()
  for (const category of categories) {
    const top = groups
      .get(category)!
      .slice()
      .sort((a, b) => b.amount - a.amount) // amount desc = ORDER BY amount DESC
      .slice(0, n) // ROW_NUMBER() <= n
    result.push(...top)
  }
  return result
}
```

La `Map` matérialise le `PARTITION BY category`. Le tri par `amount` décroissant joue le
rôle du `ORDER BY amount DESC` de la fenêtre, et `slice(0, n)` celui du `WHERE rn <= n`.
On trie les catégories pour un résultat **déterministe**.
