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
          { orderId: 1, region: 'Nord', amount: 100 },
          { orderId: 2, region: 'Nord', amount: 200 },
          { orderId: 3, region: 'Nord', amount: 300 },
          { orderId: 4, region: 'Sud',  amount: 50  },
          { orderId: 5, region: 'Sud',  amount: 150 },
        ]
        // Nord avg = (100+200+300)/3 = 200 → orderId 3 (300) passe
        // Sud  avg = (50+150)/2      = 100 → orderId 5 (150) passe
        const got = aboveRegionAverage(orders)
        console.log('input  :', orders)
        console.log('result :', got)
        assertEqual(got.length, 2, 'deux commandes dépassent la moyenne régionale')
        const ids = got.map((r) => r.orderId).sort()
        assertEqual(ids, [3, 5], 'orderId 3 (Nord) et 5 (Sud) sont retenus')
    - name: "regionAvg correctement attaché"
      code: |
        const orders: Order[] = [
          { orderId: 1, region: 'Nord', amount: 100 },
          { orderId: 2, region: 'Nord', amount: 200 },
          { orderId: 3, region: 'Nord', amount: 300 },
        ]
        const got = aboveRegionAverage(orders)
        console.log('regionAvg attaché :', got)
        // avg Nord = 200, seul orderId 3 passe
        assertEqual(got.length, 1, 'seul orderId 3 dépasse 200')
        assertEqual(got[0].regionAvg, 200, 'regionAvg doit valoir la moyenne Nord = 200')
    - name: "tous au-dessous ou égaux → []"
      code: |
        const orders: Order[] = [
          { orderId: 1, region: 'Nord', amount: 100 },
          { orderId: 2, region: 'Nord', amount: 100 },
        ]
        // avg = 100, aucun n'est STRICTEMENT supérieur
        const got = aboveRegionAverage(orders)
        console.log('aucun au-dessus :', got)
        assertEqual(got, [], 'égal à la moyenne → exclu (strictement >)')
    - name: "table vide → []"
      code: |
        assertEqual(aboveRegionAverage([]), [], 'aucune commande → aucun résultat')
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
