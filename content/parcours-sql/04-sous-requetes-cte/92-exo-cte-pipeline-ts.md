---
title: "Exercice interactif — pipeline CTE en TypeScript"
type: exercise
exercise:
  language: ts
  starter: |
    interface Order {
      orderId: number
      region: string
      amount: number
    }

    interface AboveAvgRow {
      orderId: number
      region: string
      amount: number
      regionAvg: number  // average amount in that region
    }

    // Equivalent of:
    //   WITH region_avg AS (
    //     SELECT region, AVG(amount) AS avg_amount
    //     FROM orders
    //     GROUP BY region
    //   )
    //   SELECT o.orderId, o.region, o.amount, r.avg_amount AS regionAvg
    //   FROM orders AS o
    //   JOIN region_avg AS r ON r.region = o.region
    //   WHERE o.amount > r.avg_amount
    //   ORDER BY o.region ASC, o.amount DESC
    //
    // Returns orders whose amount exceeds their region's average.
    function aboveRegionAverage(orders: Order[]): AboveAvgRow[] {
      // TODO: step 1 — compute region average (the CTE)
      //        step 2 — filter orders above their region average
      return []
    }
  tests:
    - name: "commandes au-dessus de la moyenne de leur région"
      code: |
        const orders: Order[] = [
          { orderId: 1, region: 'North', amount: 100 },
          { orderId: 2, region: 'North', amount: 200 },
          { orderId: 3, region: 'North', amount: 300 },
          { orderId: 4, region: 'South', amount: 50  },
          { orderId: 5, region: 'South', amount: 150 },
        ]
        // North avg = (100+200+300)/3 = 200 -> orderId 3 (300) passes
        // South avg = (50+150)/2      = 100 -> orderId 5 (150) passes
        const got = aboveRegionAverage(orders)
        console.log('input  :', orders)
        console.log('result :', got)
        assertEqual(got.length, 2, 'two orders exceed their region average')
        const ids = got.map((r) => r.orderId).sort()
        assertEqual(ids, [3, 5], 'orderId 3 (North) and 5 (South) are kept')
    - name: "regionAvg correctement attaché"
      code: |
        const orders: Order[] = [
          { orderId: 1, region: 'North', amount: 100 },
          { orderId: 2, region: 'North', amount: 200 },
          { orderId: 3, region: 'North', amount: 300 },
        ]
        const got = aboveRegionAverage(orders)
        console.log('attached regionAvg:', got)
        // avg North = 200, only orderId 3 passes
        assertEqual(got.length, 1, 'only orderId 3 exceeds 200')
        assertEqual(got[0].regionAvg, 200, 'regionAvg must equal the North average = 200')
    - name: "tous au-dessous ou égaux → []"
      code: |
        const orders: Order[] = [
          { orderId: 1, region: 'North', amount: 100 },
          { orderId: 2, region: 'North', amount: 100 },
        ]
        // avg = 100, none is STRICTLY greater
        const got = aboveRegionAverage(orders)
        console.log('none above:', got)
        assertEqual(got, [], 'equal to the average -> excluded (strictly >)')
    - name: "table vide → []"
      code: |
        assertEqual(aboveRegionAverage([]), [], 'no orders -> no result')
---

## Énoncé

Implémente `aboveRegionAverage` en deux étapes séparées — comme une CTE SQL :

1. **Étape 1 (la CTE `region_avg`)** : calcule la moyenne des `amount` par `region`.
2. **Étape 2** : filtre les commandes dont le `amount` est **strictement supérieur**
   à la moyenne de leur région, et attache cette moyenne dans `regionAvg`.

C'est l'équivalent TypeScript de :

```sql
WITH region_avg AS (
  SELECT region, AVG(amount) AS avg_amount
  FROM orders
  GROUP BY region
)
SELECT o.orderId, o.region, o.amount, r.avg_amount AS regionAvg
FROM orders AS o
JOIN region_avg AS r ON r.region = o.region
WHERE o.amount > r.avg_amount
ORDER BY o.region ASC, o.amount DESC;
```

Indice : calcule d'abord une `Map<string, number>` (region → moyenne), puis parcours
les commandes pour filtrer et enrichir.

<!--correction-->

## Correction

```ts
function aboveRegionAverage(orders: Order[]): AboveAvgRow[] {
  if (orders.length === 0) return []

  // Step 1 — CTE: compute average per region
  const sums = new Map<string, { total: number; count: number }>()
  for (const order of orders) {
    const s = sums.get(order.region) ?? { total: 0, count: 0 }
    s.total += order.amount
    s.count++
    sums.set(order.region, s)
  }
  const regionAvgMap = new Map<string, number>(
    Array.from(sums, ([region, s]) => [region, s.total / s.count]),
  )

  // Step 2 — JOIN + WHERE o.amount > regionAvg + ORDER BY
  return orders
    .filter((o) => o.amount > (regionAvgMap.get(o.region) ?? 0))
    .map((o) => ({
      orderId: o.orderId,
      region: o.region,
      amount: o.amount,
      regionAvg: regionAvgMap.get(o.region)!,
    }))
    .sort((a, b) => {
      const regionCmp = a.region.localeCompare(b.region)
      return regionCmp !== 0 ? regionCmp : b.amount - a.amount
    })
}
```

Les deux étapes sont volontairement séparées pour refléter la structure CTE : la
`regionAvgMap` est la « table virtuelle » que SQL nomme `region_avg`. Le `.filter`
joue le rôle du `WHERE o.amount > r.avg_amount`. Le pipeline est lisible de haut en
bas, exactement comme un `WITH`.
