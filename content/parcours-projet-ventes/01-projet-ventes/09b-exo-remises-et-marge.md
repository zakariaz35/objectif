---
title: "Exercice — Effet des remises sur la marge (TS)"
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

    function lineCost(o: Order, p: Product): number {
      return o.quantity * p.cost
    }

    // averageMarginRate: for a set of orders joined with products,
    // compute the overall margin rate = sum(margin) / sum(revenue) * 100,
    // rounded to 2 decimals.
    // Returns 0 if orders is empty.
    function averageMarginRate(orders: Order[], products: Product[]): number {
      // TODO: build index, then compute total revenue and total margin
      return 0
    }

    // discountEffect: split orders into two groups:
    //   - "withDiscount"   : orders where discount > 0
    //   - "withoutDiscount": orders where discount === 0
    // Return { withDiscount: rate, withoutDiscount: rate }
    // where each rate is computed by averageMarginRate, rounded to 2 decimals.
    function discountEffect(
      orders: Order[],
      products: Product[]
    ): { withDiscount: number; withoutDiscount: number } {
      // TODO: implement
      return { withDiscount: 0, withoutDiscount: 0 }
    }
  tests:
    - name: "taux de marge avec et sans remise — dataset complet"
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
        const result = discountEffect(orders, products)
        console.log('with discount    :', result.withDiscount, '%')
        console.log('without discount :', result.withoutDiscount, '%')
        // With discount: orders 1002, 1004, 1006
        //   rev=45+19+80=144  cost=30+12+60=102  margin=42  rate=42/144=29.17%
        // Without discount: orders 1001, 1003, 1005
        //   rev=40+36+40=116  cost=24+15+15=54   margin=62  rate=62/116=53.45%
        assertEqual(result.withDiscount, 29.17, 'margin rate with discount ~29.17%')
        assertEqual(result.withoutDiscount, 53.45, 'margin rate without discount ~53.45%')
    - name: "taux de marge sur un seul ordre avec remise"
      code: |
        const products: Product[] = [
          { product_id: 'P02', name: 'Office Chair', category: 'Furniture', cost: 30 },
        ]
        // order 1002: rev=45, cost=30, margin=15, rate=15/45=33.33%
        const orders: Order[] = [
          { order_id: 1002, order_date: '2024-01-18', customer_id: 'C002', product_id: 'P02', quantity: 1, unit_price: 50, discount: 0.10, region: 'South' },
        ]
        const result = discountEffect(orders, products)
        console.log('single discounted order margin rate:', result.withDiscount, '%')
        assertEqual(result.withDiscount, 33.33, '15/45 rounded to 2 decimals')
        assertEqual(result.withoutDiscount, 0, 'no orders without discount')
    - name: "tableau vide → 0 partout"
      code: |
        const result = discountEffect([], [])
        assertEqual(result.withDiscount, 0, 'empty returns 0')
        assertEqual(result.withoutDiscount, 0, 'empty returns 0')
---

## Énoncé

Tu vas analyser l'**effet des remises sur la rentabilité** — une question que la direction
pose souvent : « Nos remises valent-elles le coup ? »

### Partie 1 — `averageMarginRate(orders, products)`

Calcule le **taux de marge global** d'un ensemble de commandes :

```
taux de marge = somme(marges de ligne) / somme(revenus de ligne) × 100
```

- Marge de ligne = `lineRevenue(o) − lineCost(o, product)`.
- Résultat **arrondi à 2 décimales**.
- Tableau vide → `0`.

### Partie 2 — `discountEffect(orders, products)`

Sépare les commandes en deux groupes :
- `withDiscount` : commandes où `discount > 0`.
- `withoutDiscount` : commandes où `discount === 0`.

Renvoie le taux de marge de chaque groupe via `averageMarginRate`.

> **Ce qu'on va découvrir —** avec notre dataset, le taux de marge chute de 53 % à 29 %
> dès qu'une remise est appliquée. C'est un signal clair : les remises méritent d'être
> encadrées plus strictement.

<details>
<summary><strong>Voir l'analyse en SQL & pandas</strong></summary>

```sql
-- Margin rate with vs without discount
SELECT
    CASE WHEN o.discount > 0 THEN 'with_discount' ELSE 'no_discount' END AS group_label,
    ROUND(
        (SUM(o.quantity * o.unit_price * (1 - o.discount) - o.quantity * p.cost)
         / SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100,
        2
    ) AS margin_rate_pct
FROM clean_orders o
JOIN products p ON p.product_id = o.product_id
GROUP BY group_label;
```

```python
merged = orders.merge(products, on="product_id")
merged["line_revenue"] = merged["quantity"] * merged["unit_price"] * (1 - merged["discount"])
merged["line_cost"]    = merged["quantity"] * merged["cost"]
merged["line_margin"]  = merged["line_revenue"] - merged["line_cost"]
merged["has_discount"] = merged["discount"] > 0

result = merged.groupby("has_discount").apply(
    lambda g: round(g["line_margin"].sum() / g["line_revenue"].sum() * 100, 2)
)
# False (no discount): 53.45%
# True  (discount):    29.17%
```

</details>

<!--correction-->

## Correction

```ts
function averageMarginRate(orders: Order[], products: Product[]): number {
  if (orders.length === 0) return 0
  const byId: Record<string, Product> = {}
  for (const p of products) byId[p.product_id] = p

  let totalRevenue = 0
  let totalMargin = 0
  for (const o of orders) {
    const p = byId[o.product_id]
    const rev = lineRevenue(o)
    const cost = lineCost(o, p)
    totalRevenue += rev
    totalMargin  += rev - cost
  }
  if (totalRevenue === 0) return 0
  return Math.round((totalMargin / totalRevenue) * 10000) / 100
}

function discountEffect(
  orders: Order[],
  products: Product[]
): { withDiscount: number; withoutDiscount: number } {
  const withDiscount    = orders.filter(o => o.discount > 0)
  const withoutDiscount = orders.filter(o => o.discount === 0)
  return {
    withDiscount:    averageMarginRate(withDiscount,    products),
    withoutDiscount: averageMarginRate(withoutDiscount, products),
  }
}
```

`averageMarginRate` accumule le revenu et la marge en une seule passe, puis divise à la
fin — c'est plus précis que de moyenner des taux individuels (qui auraient des poids
différents). `discountEffect` utilise `filter` pour séparer les deux groupes puis délègue
à `averageMarginRate`. En SQL, le `CASE WHEN discount > 0` fait exactement ce filtre.
