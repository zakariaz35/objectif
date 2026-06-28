---
title: "Exercice — Part de marché par catégorie (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface Order {
      order_id: number
      order_date: string
      customer_id: string
      product_id: string
      quantity: number
      unit_price: number
      discount: number
      region: string
    }
    interface Product {
      product_id: string
      name: string
      category: string
      cost: number
    }

    function lineRevenue(o: Order): number {
      return o.quantity * o.unit_price * (1 - o.discount)
    }

    // marketShareByCategory: join orders × products, compute revenue by category,
    // then express each as a PERCENTAGE of the total revenue.
    // Return { category: share_pct }, rounded to 2 decimals.
    // If total revenue is 0, return an empty object.
    function marketShareByCategory(
      orders: Order[],
      products: Product[]
    ): Record<string, number> {
      // TODO: step 1 — build product index
      // TODO: step 2 — accumulate revenue by category
      // TODO: step 3 — compute total, then divide each by total * 100
      return {}
    }

    // marginRateByCategory: join orders × products, compute for each category:
    //   margin_rate = sum(line_margin) / sum(line_revenue) * 100, rounded to 2 decimals.
    // line_margin = lineRevenue(o) - o.quantity * p.cost
    function marginRateByCategory(
      orders: Order[],
      products: Product[]
    ): Record<string, number> {
      // TODO: accumulate revenue and margin per category separately, then divide
      return {}
    }
  tests:
    - name: "part de marché par catégorie"
      code: |
        const products: Product[] = [
          { product_id: 'P01', name: 'Wireless Mouse', category: 'Accessories', cost: 12 },
          { product_id: 'P02', name: 'Office Chair',   category: 'Furniture',   cost: 30 },
          { product_id: 'P03', name: 'Notebook',       category: 'Stationery',  cost: 5  },
          { product_id: 'P04', name: 'Ballpoint Pen',  category: 'Stationery',  cost: 3  },
        ]
        const orders: Order[] = [
          { order_id: 1001, order_date: '2024-01-05', customer_id: 'C001', product_id: 'P01', quantity: 2, unit_price: 20, discount: 0,    region: 'North' },
          { order_id: 1002, order_date: '2024-01-18', customer_id: 'C002', product_id: 'P02', quantity: 1, unit_price: 50, discount: 0.10, region: 'South' },
          { order_id: 1003, order_date: '2024-02-02', customer_id: 'C001', product_id: 'P03', quantity: 3, unit_price: 12, discount: 0,    region: 'North' },
          { order_id: 1004, order_date: '2024-02-20', customer_id: 'C003', product_id: 'P01', quantity: 1, unit_price: 20, discount: 0.05, region: 'East'  },
          { order_id: 1005, order_date: '2024-03-11', customer_id: 'C002', product_id: 'P04', quantity: 5, unit_price: 8,  discount: 0,    region: 'South' },
          { order_id: 1006, order_date: '2024-03-29', customer_id: 'C004', product_id: 'P02', quantity: 2, unit_price: 50, discount: 0.20, region: 'West'  },
        ]
        const result = marketShareByCategory(orders, products)
        console.log('market share by category (%) :', result)
        // Total = 260
        // Accessories: 59/260*100 = 22.69%
        // Furniture:  125/260*100 = 48.08%
        // Stationery:  76/260*100 = 29.23%
        assertEqual(result, { Accessories: 22.69, Furniture: 48.08, Stationery: 29.23 }, 'share sums to ~100%')
    - name: "taux de marge par catégorie"
      code: |
        const products: Product[] = [
          { product_id: 'P01', name: 'Wireless Mouse', category: 'Accessories', cost: 12 },
          { product_id: 'P02', name: 'Office Chair',   category: 'Furniture',   cost: 30 },
          { product_id: 'P03', name: 'Notebook',       category: 'Stationery',  cost: 5  },
          { product_id: 'P04', name: 'Ballpoint Pen',  category: 'Stationery',  cost: 3  },
        ]
        const orders: Order[] = [
          { order_id: 1001, order_date: '2024-01-05', customer_id: 'C001', product_id: 'P01', quantity: 2, unit_price: 20, discount: 0,    region: 'North' },
          { order_id: 1002, order_date: '2024-01-18', customer_id: 'C002', product_id: 'P02', quantity: 1, unit_price: 50, discount: 0.10, region: 'South' },
          { order_id: 1003, order_date: '2024-02-02', customer_id: 'C001', product_id: 'P03', quantity: 3, unit_price: 12, discount: 0,    region: 'North' },
          { order_id: 1004, order_date: '2024-02-20', customer_id: 'C003', product_id: 'P01', quantity: 1, unit_price: 20, discount: 0.05, region: 'East'  },
          { order_id: 1005, order_date: '2024-03-11', customer_id: 'C002', product_id: 'P04', quantity: 5, unit_price: 8,  discount: 0,    region: 'South' },
          { order_id: 1006, order_date: '2024-03-29', customer_id: 'C004', product_id: 'P02', quantity: 2, unit_price: 50, discount: 0.20, region: 'West'  },
        ]
        const result = marginRateByCategory(orders, products)
        console.log('margin rate by category (%) :', result)
        // Accessories: margin=23, rev=59,  rate=23/59*100=38.98%
        // Furniture:   margin=35, rev=125, rate=35/125*100=28.00%
        // Stationery:  margin=46, rev=76,  rate=46/76*100=60.53%
        assertEqual(result, { Accessories: 38.98, Furniture: 28, Stationery: 60.53 }, 'margin rate per category')
    - name: "catégorie unique"
      code: |
        const products: Product[] = [
          { product_id: 'P01', name: 'Wireless Mouse', category: 'Accessories', cost: 12 },
        ]
        const orders: Order[] = [
          { order_id: 1, order_date: '2024-01-01', customer_id: 'C001', product_id: 'P01', quantity: 1, unit_price: 20, discount: 0, region: 'North' },
        ]
        // Only one category: 100% market share
        assertEqual(marketShareByCategory(orders, products), { Accessories: 100 }, 'single category = 100%')
---

## Énoncé

Deux nouvelles métriques pour la présentation finale :

### Partie 1 — `marketShareByCategory(orders, products)`

Calcule la **part de marché interne** (en %) de chaque catégorie dans le CA total.

- Formule : `revenue_catégorie / revenue_total × 100`, arrondi à 2 décimales.
- Si le total est 0, renvoie `{}`.
- La somme des parts doit faire 100 % (aux arrondis près).

### Partie 2 — `marginRateByCategory(orders, products)`

Calcule le **taux de marge** (en %) de chaque catégorie :
```
taux = somme(marges de ligne) / somme(revenus de ligne) × 100
```
Arrondi à 2 décimales. Accumule `revenue` et `margin` séparément, divise à la fin
(pas la moyenne des taux individuels).

> **Lecture croisée —** en combinant ces deux fonctions, on peut dresser un tableau
> « volume × rentabilité » : Furniture est la locomotive en volume (48 %) mais la moins
> rentable (28 %) ; Stationery est petit en volume (29 %) mais très rentable (61 %).
> Ce croisement est souvent appelé **matrice BCG simplifiée** dans les présentations.

<details>
<summary><strong>Voir en SQL (fenêtre + GROUP BY)</strong></summary>

```sql
-- Market share + margin rate, all in one query
SELECT
    p.category,
    ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2)      AS revenue,
    ROUND(
        SUM(o.quantity * o.unit_price * (1 - o.discount)) * 100.0
        / SUM(SUM(o.quantity * o.unit_price * (1 - o.discount))) OVER (),
        2
    )                                                                  AS market_share_pct,
    ROUND(
        (SUM(o.quantity * o.unit_price * (1 - o.discount) - o.quantity * p.cost)
         / SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100,
        2
    )                                                                  AS margin_rate_pct
FROM clean_orders o
JOIN products p ON p.product_id = o.product_id
GROUP BY p.category
ORDER BY revenue DESC;
```

La fonction de fenêtre `SUM(...) OVER ()` calcule le total global sans détruire le
`GROUP BY`. C'est une technique avancée du module SQL avancé.

</details>

<!--correction-->

## Correction

```ts
function marketShareByCategory(
  orders: Order[],
  products: Product[]
): Record<string, number> {
  const byId: Record<string, Product> = {}
  for (const p of products) byId[p.product_id] = p

  const revenueByCategory: Record<string, number> = {}
  let total = 0
  for (const o of orders) {
    const cat = byId[o.product_id].category
    const rev = lineRevenue(o)
    revenueByCategory[cat] = (revenueByCategory[cat] || 0) + rev
    total += rev
  }
  if (total === 0) return {}

  const result: Record<string, number> = {}
  for (const cat in revenueByCategory) {
    result[cat] = Math.round((revenueByCategory[cat] / total) * 10000) / 100
  }
  return result
}

function marginRateByCategory(
  orders: Order[],
  products: Product[]
): Record<string, number> {
  const byId: Record<string, Product> = {}
  for (const p of products) byId[p.product_id] = p

  const revByCategory: Record<string, number> = {}
  const marginByCategory: Record<string, number> = {}
  for (const o of orders) {
    const cat = byId[o.product_id].category
    const rev = lineRevenue(o)
    const margin = rev - o.quantity * byId[o.product_id].cost
    revByCategory[cat]    = (revByCategory[cat]    || 0) + rev
    marginByCategory[cat] = (marginByCategory[cat] || 0) + margin
  }

  const result: Record<string, number> = {}
  for (const cat in revByCategory) {
    result[cat] = Math.round((marginByCategory[cat] / revByCategory[cat]) * 10000) / 100
  }
  return result
}
```

`marketShareByCategory` accumule les revenus et le total en une passe, puis calcule les
parts en une seconde passe — on ne peut pas diviser avant d'avoir le total. `marginRateByCategory`
accumule `revenue` et `margin` séparément, puis divise par catégorie : c'est un taux de marge
*pondéré par le volume*, plus juste que la moyenne des taux individuels.
