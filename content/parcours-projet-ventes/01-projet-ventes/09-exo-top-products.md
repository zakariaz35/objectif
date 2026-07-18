---
title: "Exercice — Top N produits (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface Order {
      order_id: number
      order_date: string
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

    // topNProducts: revenue per product, then the n best, sorted descending.
    // Return an array of { name, revenue } (revenue rounded to 2 decimals),
    // using the product NAME (looked up in products), not the id.
    function topNProducts(orders: Order[], products: Product[], n: number): { name: string; revenue: number }[] {
      // TODO: implement
      return []
    }
  tests:
    - name: "top 2 produits par CA"
      code: |
        const products: Product[] = [
          { product_id: 'P01', name: 'Wireless Mouse', category: 'Accessories', cost: 12 },
          { product_id: 'P02', name: 'Office Chair',   category: 'Furniture',   cost: 30 },
          { product_id: 'P03', name: 'Notebook',       category: 'Stationery',  cost: 5  },
          { product_id: 'P04', name: 'Ballpoint Pen',  category: 'Stationery',  cost: 3  },
        ]
        const orders: Order[] = [
          { order_id: 1001, order_date: '2024-01-05', product_id: 'P01', quantity: 2, unit_price: 20, discount: 0,    region: 'North' },
          { order_id: 1002, order_date: '2024-01-18', product_id: 'P02', quantity: 1, unit_price: 50, discount: 0.10, region: 'South' },
          { order_id: 1003, order_date: '2024-02-02', product_id: 'P03', quantity: 3, unit_price: 12, discount: 0,    region: 'North' },
          { order_id: 1004, order_date: '2024-02-20', product_id: 'P01', quantity: 1, unit_price: 20, discount: 0.05, region: 'East'  },
          { order_id: 1005, order_date: '2024-03-11', product_id: 'P04', quantity: 5, unit_price: 8,  discount: 0,    region: 'South' },
          { order_id: 1006, order_date: '2024-03-29', product_id: 'P02', quantity: 2, unit_price: 50, discount: 0.20, region: 'West'  },
        ]
        const top = topNProducts(orders, products, 2)
        console.log('top 2 :', top)
        assertEqual(top, [
          { name: 'Office Chair', revenue: 125 },
          { name: 'Wireless Mouse', revenue: 59 },
        ], 'Office Chair (125) then Wireless Mouse (59)')
    - name: "n=1 renvoie le meilleur"
      code: |
        const products: Product[] = [
          { product_id: 'P01', name: 'Wireless Mouse', category: 'Accessories', cost: 12 },
          { product_id: 'P02', name: 'Office Chair',   category: 'Furniture',   cost: 30 },
        ]
        const orders: Order[] = [
          { order_id: 1, order_date: '2024-01-05', product_id: 'P01', quantity: 1, unit_price: 20, discount: 0, region: 'North' },
          { order_id: 2, order_date: '2024-01-18', product_id: 'P02', quantity: 1, unit_price: 50, discount: 0, region: 'South' },
        ]
        assertEqual(topNProducts(orders, products, 1), [{ name: 'Office Chair', revenue: 50 }], 'best single product')
    - name: "n plus grand que le nombre de produits"
      code: |
        const products: Product[] = [
          { product_id: 'P01', name: 'Wireless Mouse', category: 'Accessories', cost: 12 },
        ]
        const orders: Order[] = [
          { order_id: 1, order_date: '2024-01-05', product_id: 'P01', quantity: 2, unit_price: 20, discount: 0, region: 'North' },
        ]
        assertEqual(topNProducts(orders, products, 5), [{ name: 'Wireless Mouse', revenue: 40 }], 'returns all when n is too big')
---

## Énoncé

Implémente `topNProducts(orders, products, n)` : calcule le **CA par produit**, garde les
`n` meilleurs, triés par CA **décroissant**.

- Renvoie un tableau d'objets `{ name, revenue }` (le **nom** du produit, pas l'`id`).
- Chaque `revenue` est arrondi à 2 décimales.
- Si `n` dépasse le nombre de produits, renvoie tout ce qu'il y a.

Indices :
- Accumule le CA par `product_id` dans un objet.
- Indexe les noms : `{ product_id: name }`.
- `Object.entries(...)` → `.map(...)` → `.sort((a, b) => b.revenue - a.revenue)` →
  `.slice(0, n)`.

<!--correction-->

## Correction

```ts
function topNProducts(orders: Order[], products: Product[], n: number): { name: string; revenue: number }[] {
  const nameOf: Record<string, string> = {}
  for (const p of products) nameOf[p.product_id] = p.name

  const revenueById: Record<string, number> = {}
  for (const o of orders) {
    revenueById[o.product_id] = (revenueById[o.product_id] || 0) + lineRevenue(o)
  }

  return Object.entries(revenueById)
    .map(([product_id, revenue]) => ({
      name: nameOf[product_id],
      revenue: Math.round(revenue * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, n)
}
```

On agrège le CA par produit (group by), on transforme chaque entrée en
`{ name, revenue }` via l'index des noms, on **trie** décroissant puis on **coupe** à `n`
avec `slice`. `slice` ne plante pas si `n` dépasse la taille : il renvoie tout. C'est le
classique `ORDER BY revenue DESC LIMIT n` de SQL.
