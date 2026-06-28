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
          { orderId: 1, region: 'Nord', category: 'Office',   amount: 100 },
          { orderId: 2, region: 'Nord', category: 'Hardware', amount: 200 },
          { orderId: 3, region: 'Sud',  category: 'Office',   amount: 150 },
          { orderId: 4, region: 'Nord', category: 'Office',   amount: 50  },
          { orderId: 5, region: 'Sud',  category: 'Hardware', amount: 300 },
        ]
        const got = revenueByRegionAndCategory(orders)
        console.log('input  :', orders)
        console.log('result :', got)
        // Nord|Office = 100+50=150 ; Nord|Hardware=200 ; Sud|Office=150 ; Sud|Hardware=300
        const nordOffice    = got.find((r) => r.region === 'Nord' && r.category === 'Office')
        const nordHardware  = got.find((r) => r.region === 'Nord' && r.category === 'Hardware')
        const sudHardware   = got.find((r) => r.region === 'Sud'  && r.category === 'Hardware')
        assertEqual(nordOffice?.totalRevenue,   150, 'Nord|Office = 100 + 50')
        assertEqual(nordHardware?.totalRevenue, 200, 'Nord|Hardware = 200')
        assertEqual(sudHardware?.totalRevenue,  300, 'Sud|Hardware = 300')
        assertEqual(got.length, 4, '4 paires distinctes (region, category)')
    - name: "tri région puis catégorie croissant"
      code: |
        const orders: Order[] = [
          { orderId: 1, region: 'Sud',  category: 'Office',   amount: 10 },
          { orderId: 2, region: 'Nord', category: 'Hardware', amount: 20 },
          { orderId: 3, region: 'Nord', category: 'Office',   amount: 30 },
        ]
        const got = revenueByRegionAndCategory(orders)
        console.log('résultat trié :', got)
        assertEqual(got[0].region, 'Nord', 'Nord vient avant Sud (alpha asc)')
        assertEqual(got[0].category, 'Hardware', 'Hardware avant Office dans Nord')
    - name: "table vide → []"
      code: |
        assertEqual(revenueByRegionAndCategory([]), [], 'aucune commande → aucun groupe')
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
