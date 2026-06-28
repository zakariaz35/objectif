---
title: "Exercice — CA & marge par catégorie (jointure) (TS)"
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

    // revenueByCategory: join orders with products on product_id, then group
    // revenue by category. Return { category: revenue }, rounded to 2 decimals.
    function revenueByCategory(orders: Order[], products: Product[]): Record<string, number> {
      // TODO: build an index { product_id: product }, then accumulate per category
      return {}
    }

    // marginByCategory: same join, but accumulate the MARGIN per category.
    // line margin = lineRevenue(o) - o.quantity * product.cost
    function marginByCategory(orders: Order[], products: Product[]): Record<string, number> {
      // TODO: implement
      return {}
    }
  tests:
    - name: "CA par catégorie"
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
        const result = revenueByCategory(orders, products)
        console.log('revenue by category :', result)
        assertEqual(result, { Accessories: 59, Furniture: 125, Stationery: 76 }, 'joined then grouped')
    - name: "marge par catégorie"
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
        const result = marginByCategory(orders, products)
        console.log('margin by category :', result)
        assertEqual(result, { Accessories: 23, Furniture: 35, Stationery: 46 }, 'revenue - cost per category')
---

## Énoncé

Tu vas faire une **jointure** `orders × products` sur `product_id`, puis grouper par
catégorie.

1. `revenueByCategory(orders, products)` : renvoie `{ category: revenue }`, arrondi à 2
   décimales.
2. `marginByCategory(orders, products)` : renvoie `{ category: margin }`, où
   `marge de ligne = lineRevenue(o) - o.quantity * product.cost`.

Indice clé — **indexe** d'abord les produits dans un objet pour les retrouver vite :

```ts
const byId: Record<string, Product> = {}
for (const p of products) byId[p.product_id] = p
// puis, pour une commande o : const product = byId[o.product_id]
```

<!--correction-->

## Correction

```ts
function revenueByCategory(orders: Order[], products: Product[]): Record<string, number> {
  const byId: Record<string, Product> = {}
  for (const p of products) byId[p.product_id] = p

  const acc: Record<string, number> = {}
  for (const o of orders) {
    const category = byId[o.product_id].category
    acc[category] = (acc[category] || 0) + lineRevenue(o)
  }
  for (const c in acc) acc[c] = Math.round(acc[c] * 100) / 100
  return acc
}

function marginByCategory(orders: Order[], products: Product[]): Record<string, number> {
  const byId: Record<string, Product> = {}
  for (const p of products) byId[p.product_id] = p

  const acc: Record<string, number> = {}
  for (const o of orders) {
    const product = byId[o.product_id]
    const margin = lineRevenue(o) - o.quantity * product.cost
    acc[product.category] = (acc[product.category] || 0) + margin
  }
  for (const c in acc) acc[c] = Math.round(acc[c] * 100) / 100
  return acc
}
```

On construit l'index `byId` une fois, puis on parcourt les commandes une seule fois : c'est
une **jointure en O(n)**. Le reste est le group by habituel. `marginByCategory` ne change
que la valeur accumulée : `revenu − coût` au lieu du revenu seul. C'est l'équivalent du
`JOIN ... GROUP BY category` en SQL.
