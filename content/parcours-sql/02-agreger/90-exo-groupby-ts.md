---
title: "Exercice interactif — GROUP BY en TypeScript"
type: exercise
exercise:
  language: ts
  starter: |
    // An order is one row of the `orders` table.
    interface Order {
      orderId: number
      category: string
      amount: number
    }

    // Equivalent of:
    //   SELECT category, SUM(amount) AS totalRevenue
    //   FROM orders
    //   GROUP BY category
    // Return one row per category: { category, totalRevenue }.
    function revenueByCategory(orders: Order[]): { category: string; totalRevenue: number }[] {
      // TODO: group by category, then sum amount inside each group
      return []
    }
  tests:
    - name: "somme par catégorie"
      code: |
        const orders: Order[] = [
          { orderId: 1, category: 'Office', amount: 100 },
          { orderId: 2, category: 'Hardware', amount: 200 },
          { orderId: 3, category: 'Office', amount: 50 },
          { orderId: 4, category: 'Hardware', amount: 300 },
          { orderId: 5, category: 'Office', amount: 25 },
        ]
        const got = revenueByCategory(orders)
        console.log('input  :', orders)
        console.log('result :', got)
        // Office: 100 + 50 + 25 = 175 ; Hardware: 200 + 300 = 500
        const office = got.find((r) => r.category === 'Office')
        const hardware = got.find((r) => r.category === 'Hardware')
        assertEqual(office?.totalRevenue, 175, 'Office = 100 + 50 + 25')
        assertEqual(hardware?.totalRevenue, 500, 'Hardware = 200 + 300')
        assertEqual(got.length, 2, 'one row per distinct category')
    - name: "table vide → []"
      code: |
        assertEqual(revenueByCategory([]), [], 'no orders → no groups')
    - name: "une seule catégorie"
      code: |
        const orders: Order[] = [
          { orderId: 1, category: 'Software', amount: 40 },
          { orderId: 2, category: 'Software', amount: 60 },
        ]
        assertEqual(revenueByCategory(orders), [{ category: 'Software', totalRevenue: 100 }], 'single group summed')
---

## Énoncé

Refais un `GROUP BY ... SUM(...)` mais en TypeScript, sur un **tableau d'objets**
(l'équivalent JS d'une table). Complète `revenueByCategory` : elle prend des `orders` et
renvoie une ligne par catégorie, `{ category, totalRevenue }`, où `totalRevenue` est la
somme des `amount` de la catégorie.

Indice : un `Map<string, number>` joue le rôle des « groupes ». On accumule, puis on
transforme en tableau.

<!--correction-->

## Correction

```ts
function revenueByCategory(orders: Order[]): { category: string; totalRevenue: number }[] {
  const groups = new Map<string, number>()
  for (const order of orders) {
    const current = groups.get(order.category) ?? 0
    groups.set(order.category, current + order.amount)
  }
  return Array.from(groups, ([category, totalRevenue]) => ({ category, totalRevenue }))
}
```

La `Map` est l'analogue des groupes du `GROUP BY` : une entrée par valeur distincte de
`category`. La boucle **accumule** le `amount` (le `SUM`). `Array.from(map, fn)`
reconstruit le « résultat » sous forme de lignes.
