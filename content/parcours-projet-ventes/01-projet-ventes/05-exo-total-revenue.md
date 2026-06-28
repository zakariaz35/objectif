---
title: "Exercice — CA total & panier moyen (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface Order {
      order_id: number
      order_date: string   // "YYYY-MM-DD"
      product_id: string
      quantity: number
      unit_price: number
      discount: number     // rate, 0.10 means -10%
      region: string
    }

    // Revenue of a single line: quantity * unit_price * (1 - discount)
    // Provided for you, reuse it.
    function lineRevenue(o: Order): number {
      return o.quantity * o.unit_price * (1 - o.discount)
    }

    // totalRevenue: sum of every line's revenue, rounded to 2 decimals.
    // An empty array returns 0.
    function totalRevenue(orders: Order[]): number {
      // TODO: implement
      return 0
    }

    // averageBasket: total revenue divided by the number of orders,
    // rounded to 2 decimals. An empty array returns 0.
    function averageBasket(orders: Order[]): number {
      // TODO: implement
      return 0
    }
  tests:
    - name: "CA total du dataset"
      code: |
        const orders: Order[] = [
          { order_id: 1001, order_date: '2024-01-05', product_id: 'P01', quantity: 2, unit_price: 20, discount: 0,    region: 'North' },
          { order_id: 1002, order_date: '2024-01-18', product_id: 'P02', quantity: 1, unit_price: 50, discount: 0.10, region: 'South' },
          { order_id: 1003, order_date: '2024-02-02', product_id: 'P03', quantity: 3, unit_price: 12, discount: 0,    region: 'North' },
          { order_id: 1004, order_date: '2024-02-20', product_id: 'P01', quantity: 1, unit_price: 20, discount: 0.05, region: 'East'  },
          { order_id: 1005, order_date: '2024-03-11', product_id: 'P04', quantity: 5, unit_price: 8,  discount: 0,    region: 'South' },
          { order_id: 1006, order_date: '2024-03-29', product_id: 'P02', quantity: 2, unit_price: 50, discount: 0.20, region: 'West'  },
        ]
        console.log('lines :', orders.map(lineRevenue))
        console.log('total :', totalRevenue(orders))
        assertEqual(totalRevenue(orders), 260, '40+45+36+19+40+80 = 260')
    - name: "remise appliquée par ligne"
      code: |
        const one: Order[] = [
          { order_id: 1, order_date: '2024-01-01', product_id: 'P02', quantity: 1, unit_price: 50, discount: 0.10, region: 'South' },
        ]
        assertEqual(totalRevenue(one), 45, '50 * (1 - 0.10) = 45')
    - name: "panier moyen"
      code: |
        const orders: Order[] = [
          { order_id: 1001, order_date: '2024-01-05', product_id: 'P01', quantity: 2, unit_price: 20, discount: 0,    region: 'North' },
          { order_id: 1002, order_date: '2024-01-18', product_id: 'P02', quantity: 1, unit_price: 50, discount: 0.10, region: 'South' },
          { order_id: 1003, order_date: '2024-02-02', product_id: 'P03', quantity: 3, unit_price: 12, discount: 0,    region: 'North' },
          { order_id: 1004, order_date: '2024-02-20', product_id: 'P01', quantity: 1, unit_price: 20, discount: 0.05, region: 'East'  },
          { order_id: 1005, order_date: '2024-03-11', product_id: 'P04', quantity: 5, unit_price: 8,  discount: 0,    region: 'South' },
          { order_id: 1006, order_date: '2024-03-29', product_id: 'P02', quantity: 2, unit_price: 50, discount: 0.20, region: 'West'  },
        ]
        console.log('avg basket :', averageBasket(orders))
        assertEqual(averageBasket(orders), 43.33, '260 / 6 = 43.33 (rounded)')
    - name: "tableau vide → 0"
      code: |
        assertEqual(totalRevenue([]), 0, 'no orders, no revenue')
        assertEqual(averageBasket([]), 0, 'no orders, no basket')
---

## Énoncé

Implémente les deux KPI de base, en réutilisant `lineRevenue` (déjà fourni) :

1. `totalRevenue(orders)` : somme des revenus de ligne, **arrondie à 2 décimales** ;
   tableau vide → `0`.
2. `averageBasket(orders)` : CA total / nombre de commandes, **arrondi à 2 décimales** ;
   tableau vide → `0`.

Indice arrondi : `Math.round(value * 100) / 100`.

<!--correction-->

## Correction

```ts
function totalRevenue(orders: Order[]): number {
  const sum = orders.reduce((acc, o) => acc + lineRevenue(o), 0)
  return Math.round(sum * 100) / 100
}

function averageBasket(orders: Order[]): number {
  if (orders.length === 0) return 0
  return Math.round((totalRevenue(orders) / orders.length) * 100) / 100
}
```

`totalRevenue` accumule avec `reduce` (un tableau vide donne `0` naturellement, le cas
limite est gratuit). `averageBasket` réutilise `totalRevenue` puis divise par le nombre de
commandes — on garde quand même le garde-fou `length === 0` pour éviter une division par
zéro. C'est l'équivalent exact de `SUM(...) / COUNT(*)` en SQL et de `.mean()` en pandas.
