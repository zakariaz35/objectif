---
title: "Exercice — CA par mois (group by) (TS)"
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
      discount: number
      region: string
    }

    function lineRevenue(o: Order): number {
      return o.quantity * o.unit_price * (1 - o.discount)
    }

    // monthlyRevenue: group orders by month ("YYYY-MM") and sum line revenue.
    // Return an object { "2024-01": 85, "2024-02": 55, ... },
    // each total rounded to 2 decimals.
    // Hint: the month is the first 7 chars of order_date.
    function monthlyRevenue(orders: Order[]): Record<string, number> {
      // TODO: implement
      return {}
    }
  tests:
    - name: "groupe et somme par mois"
      code: |
        const orders: Order[] = [
          { order_id: 1001, order_date: '2024-01-05', product_id: 'P01', quantity: 2, unit_price: 20, discount: 0,    region: 'North' },
          { order_id: 1002, order_date: '2024-01-18', product_id: 'P02', quantity: 1, unit_price: 50, discount: 0.10, region: 'South' },
          { order_id: 1003, order_date: '2024-02-02', product_id: 'P03', quantity: 3, unit_price: 12, discount: 0,    region: 'North' },
          { order_id: 1004, order_date: '2024-02-20', product_id: 'P01', quantity: 1, unit_price: 20, discount: 0.05, region: 'East'  },
          { order_id: 1005, order_date: '2024-03-11', product_id: 'P04', quantity: 5, unit_price: 8,  discount: 0,    region: 'South' },
          { order_id: 1006, order_date: '2024-03-29', product_id: 'P02', quantity: 2, unit_price: 50, discount: 0.20, region: 'West'  },
        ]
        const result = monthlyRevenue(orders)
        console.log('monthly :', result)
        assertEqual(result, { '2024-01': 85, '2024-02': 55, '2024-03': 120 }, 'revenue summed per month')
    - name: "un seul mois"
      code: |
        const orders: Order[] = [
          { order_id: 1, order_date: '2024-05-01', product_id: 'P01', quantity: 1, unit_price: 10, discount: 0, region: 'North' },
          { order_id: 2, order_date: '2024-05-30', product_id: 'P01', quantity: 2, unit_price: 10, discount: 0, region: 'North' },
        ]
        assertEqual(monthlyRevenue(orders), { '2024-05': 30 }, '10 + 20 = 30 in May')
    - name: "tableau vide → objet vide"
      code: |
        assertEqual(monthlyRevenue([]), {}, 'no orders, no months')
---

## Énoncé

Implémente `monthlyRevenue(orders)` : groupe les commandes par **mois** (`"YYYY-MM"`) et
somme le revenu de ligne de chaque groupe.

- Renvoie un objet `{ "2024-01": 85, "2024-02": 55, ... }`.
- Chaque total est **arrondi à 2 décimales**.
- Tableau vide → objet vide `{}`.

Indices :
- Le mois est `order_date.slice(0, 7)`.
- Accumule dans un objet : `acc[month] = (acc[month] || 0) + lineRevenue(o)`.

<!--correction-->

## Correction

```ts
function monthlyRevenue(orders: Order[]): Record<string, number> {
  const acc: Record<string, number> = {}
  for (const o of orders) {
    const month = o.order_date.slice(0, 7)
    acc[month] = (acc[month] || 0) + lineRevenue(o)
  }
  for (const month in acc) {
    acc[month] = Math.round(acc[month] * 100) / 100
  }
  return acc
}
```

C'est le **group by** manuel : une boucle qui accumule dans un objet, la clé étant le mois.
Le `(acc[month] || 0)` initialise le total à `0` la première fois qu'on voit un mois. On
arrondit en une seconde passe, à la fin. En SQL c'est `GROUP BY strftime('%Y-%m', ...)`, en
pandas `.groupby("month").sum()`.
