---
title: "Exercice interactif — GROUP BY multi-clé en TypeScript"
type: exercise
exercise:
  language: ts
  starter: |
    interface Order {
      orderId: number
      region: string
      category: string
      amount: number
    }

    interface RevenueRow {
      region: string
      category: string
      totalRevenue: number
    }

    // Equivalent of:
    //   SELECT region, category, SUM(amount) AS totalRevenue
    //   FROM orders
    //   GROUP BY region, category
    //   ORDER BY region ASC, category ASC
    // Returns one row per (region, category) pair, sorted asc by region then category.
    function revenueByRegionAndCategory(orders: Order[]): RevenueRow[] {
      // TODO: group by both region AND category, sum amount per pair
      return []
    }
  tests:
    - name: "groupe region × category"
      code: |
        const orders: Order[] = [
          { orderId: 1, region: 'North', category: 'Office',   amount: 100 },
          { orderId: 2, region: 'North', category: 'Hardware', amount: 200 },
          { orderId: 3, region: 'South', category: 'Office',   amount: 150 },
          { orderId: 4, region: 'North', category: 'Office',   amount: 50  },
          { orderId: 5, region: 'South', category: 'Hardware', amount: 300 },
        ]
        const got = revenueByRegionAndCategory(orders)
        console.log('input  :', orders)
        console.log('result :', got)
        // North|Office = 100+50=150 ; North|Hardware=200 ; South|Office=150 ; South|Hardware=300
        const northOffice   = got.find((r) => r.region === 'North' && r.category === 'Office')
        const northHardware = got.find((r) => r.region === 'North' && r.category === 'Hardware')
        const southHardware = got.find((r) => r.region === 'South' && r.category === 'Hardware')
        assertEqual(northOffice?.totalRevenue,   150, 'North|Office = 100 + 50')
        assertEqual(northHardware?.totalRevenue, 200, 'North|Hardware = 200')
        assertEqual(southHardware?.totalRevenue, 300, 'South|Hardware = 300')
        assertEqual(got.length, 4, '4 distinct (region, category) pairs')
    - name: "tri région puis catégorie croissant"
      code: |
        const orders: Order[] = [
          { orderId: 1, region: 'South', category: 'Office',   amount: 10 },
          { orderId: 2, region: 'North', category: 'Hardware', amount: 20 },
          { orderId: 3, region: 'North', category: 'Office',   amount: 30 },
        ]
        const got = revenueByRegionAndCategory(orders)
        console.log('sorted result:', got)
        assertEqual(got[0].region, 'North', 'North comes before South (alpha asc)')
        assertEqual(got[0].category, 'Hardware', 'Hardware before Office within North')
    - name: "table vide → []"
      code: |
        assertEqual(revenueByRegionAndCategory([]), [], 'no orders -> no groups')
---

## Énoncé

Implémente `revenueByRegionAndCategory` : groupe les commandes par **paire** `(region,
category)` et calcule la somme des `amount`. Trie le résultat par `region` puis
`category` (ordre alphabétique croissant).

C'est l'équivalent TypeScript de :

```sql
SELECT region, category, SUM(amount) AS totalRevenue
FROM orders
GROUP BY region, category
ORDER BY region ASC, category ASC;
```

Indice : utilise une `Map<string, RevenueRow>` avec une clé composite comme
`region + '|' + category` pour simuler le `GROUP BY` à deux colonnes.

<!--correction-->

## Correction

```ts
function revenueByRegionAndCategory(orders: Order[]): RevenueRow[] {
  const groups = new Map<string, RevenueRow>()

  for (const order of orders) {
    const key = order.region + '|' + order.category
    const current = groups.get(key) ?? {
      region: order.region,
      category: order.category,
      totalRevenue: 0,
    }
    current.totalRevenue += order.amount
    groups.set(key, current)
  }

  // ORDER BY region ASC, category ASC
  return Array.from(groups.values()).sort((a, b) => {
    const regionCmp = a.region.localeCompare(b.region)
    return regionCmp !== 0 ? regionCmp : a.category.localeCompare(b.category)
  })
}
```

La clé `region + '|' + category` est l'équivalent du `GROUP BY region, category` :
deux paires identiques écrivent dans la même entrée de la `Map`. Le tri final reproduit
l'`ORDER BY region ASC, category ASC`.
