---
title: "Exercice — Clients récurrents & fidélité (TS)"
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

    function lineRevenue(o: Order): number {
      return o.quantity * o.unit_price * (1 - o.discount)
    }

    // orderCountByCustomer: return how many orders each customer placed.
    // { "C001": 2, "C002": 2, "C003": 1, ... }
    function orderCountByCustomer(orders: Order[]): Record<string, number> {
      // TODO: group by customer_id and count
      return {}
    }

    // recurringCustomers: return the list of customer_ids who placed MORE THAN
    // one order, sorted alphabetically.
    function recurringCustomers(orders: Order[]): string[] {
      // TODO: reuse orderCountByCustomer, filter count > 1, sort
      return []
    }

    // revenueByCustomer: return the total revenue per customer_id,
    // rounded to 2 decimals.
    function revenueByCustomer(orders: Order[]): Record<string, number> {
      // TODO: group by customer_id and sum lineRevenue
      return {}
    }
  tests:
    - name: "nombre de commandes par client"
      code: |
        const orders: Order[] = [
          { order_id: 1001, order_date: '2024-01-05', customer_id: 'C001', product_id: 'P01', quantity: 2, unit_price: 20, discount: 0,    region: 'North' },
          { order_id: 1002, order_date: '2024-01-18', customer_id: 'C002', product_id: 'P02', quantity: 1, unit_price: 50, discount: 0.10, region: 'South' },
          { order_id: 1003, order_date: '2024-02-02', customer_id: 'C001', product_id: 'P03', quantity: 3, unit_price: 12, discount: 0,    region: 'North' },
          { order_id: 1004, order_date: '2024-02-20', customer_id: 'C003', product_id: 'P01', quantity: 1, unit_price: 20, discount: 0.05, region: 'East'  },
          { order_id: 1005, order_date: '2024-03-11', customer_id: 'C002', product_id: 'P04', quantity: 5, unit_price: 8,  discount: 0,    region: 'South' },
          { order_id: 1006, order_date: '2024-03-29', customer_id: 'C004', product_id: 'P02', quantity: 2, unit_price: 50, discount: 0.20, region: 'West'  },
        ]
        const result = orderCountByCustomer(orders)
        console.log('order count by customer :', result)
        // C001: 2 orders (1001, 1003), C002: 2 orders (1002, 1005), C003: 1, C004: 1
        assertEqual(result, { C001: 2, C002: 2, C003: 1, C004: 1 }, 'count of orders per customer')
    - name: "clients récurrents (plus d'une commande)"
      code: |
        const orders: Order[] = [
          { order_id: 1001, order_date: '2024-01-05', customer_id: 'C001', product_id: 'P01', quantity: 2, unit_price: 20, discount: 0,    region: 'North' },
          { order_id: 1002, order_date: '2024-01-18', customer_id: 'C002', product_id: 'P02', quantity: 1, unit_price: 50, discount: 0.10, region: 'South' },
          { order_id: 1003, order_date: '2024-02-02', customer_id: 'C001', product_id: 'P03', quantity: 3, unit_price: 12, discount: 0,    region: 'North' },
          { order_id: 1004, order_date: '2024-02-20', customer_id: 'C003', product_id: 'P01', quantity: 1, unit_price: 20, discount: 0.05, region: 'East'  },
          { order_id: 1005, order_date: '2024-03-11', customer_id: 'C002', product_id: 'P04', quantity: 5, unit_price: 8,  discount: 0,    region: 'South' },
          { order_id: 1006, order_date: '2024-03-29', customer_id: 'C004', product_id: 'P02', quantity: 2, unit_price: 50, discount: 0.20, region: 'West'  },
        ]
        const result = recurringCustomers(orders)
        console.log('recurring customers :', result)
        // C001 (2 orders) and C002 (2 orders) — sorted alphabetically
        assertEqual(result, ['C001', 'C002'], 'two recurring customers, sorted')
    - name: "CA par client"
      code: |
        const orders: Order[] = [
          { order_id: 1001, order_date: '2024-01-05', customer_id: 'C001', product_id: 'P01', quantity: 2, unit_price: 20, discount: 0,    region: 'North' },
          { order_id: 1002, order_date: '2024-01-18', customer_id: 'C002', product_id: 'P02', quantity: 1, unit_price: 50, discount: 0.10, region: 'South' },
          { order_id: 1003, order_date: '2024-02-02', customer_id: 'C001', product_id: 'P03', quantity: 3, unit_price: 12, discount: 0,    region: 'North' },
          { order_id: 1004, order_date: '2024-02-20', customer_id: 'C003', product_id: 'P01', quantity: 1, unit_price: 20, discount: 0.05, region: 'East'  },
          { order_id: 1005, order_date: '2024-03-11', customer_id: 'C002', product_id: 'P04', quantity: 5, unit_price: 8,  discount: 0,    region: 'South' },
          { order_id: 1006, order_date: '2024-03-29', customer_id: 'C004', product_id: 'P02', quantity: 2, unit_price: 50, discount: 0.20, region: 'West'  },
        ]
        const result = revenueByCustomer(orders)
        console.log('revenue by customer :', result)
        // C001: 1001(40) + 1003(36) = 76
        // C002: 1002(45) + 1005(40) = 85
        // C003: 1004(19) = 19
        // C004: 1006(80) = 80
        assertEqual(result, { C001: 76, C002: 85, C003: 19, C004: 80 }, 'total revenue per customer')
    - name: "aucun client récurrent si tout le monde commande une fois"
      code: |
        const orders: Order[] = [
          { order_id: 1, order_date: '2024-01-01', customer_id: 'C001', product_id: 'P01', quantity: 1, unit_price: 10, discount: 0, region: 'North' },
          { order_id: 2, order_date: '2024-01-02', customer_id: 'C002', product_id: 'P01', quantity: 1, unit_price: 10, discount: 0, region: 'South' },
        ]
        assertEqual(recurringCustomers(orders), [], 'no recurring customers')
---

## Énoncé

On veut comprendre la **fidélité client** : combien de clients reviennent, et quel CA
génèrent-ils ?

### Partie 1 — `orderCountByCustomer(orders)`

Compte le nombre de commandes par client. Renvoie `{ customer_id: count }`.

### Partie 2 — `recurringCustomers(orders)`

Renvoie la liste des `customer_id` ayant passé **plus d'une commande**, triés par ordre
alphabétique. Utilise `orderCountByCustomer` en interne.

### Partie 3 — `revenueByCustomer(orders)`

Renvoie le CA total par client `{ customer_id: revenue }`, **arrondi à 2 décimales**.
C'est le même patron que `revenueByRegion` — seule la clé change.

> **Insight —** sur notre dataset, 2 clients sur 4 sont récurrents (C001 et C002) et
> ils représentent 4 commandes sur 6 (67 %). Le client C002 est notre meilleur client
> en CA (85 €, 33 % du total). Ces métriques sont au cœur de la stratégie de rétention.

<details>
<summary><strong>Voir l'analyse en SQL & pandas</strong></summary>

```sql
-- Order count and revenue per customer
SELECT customer_id,
       COUNT(*)                                                        AS order_count,
       ROUND(SUM(quantity * unit_price * (1 - discount)), 2)          AS revenue
FROM clean_orders
GROUP BY customer_id
ORDER BY revenue DESC;

-- Recurring customers (more than one order)
SELECT customer_id
FROM clean_orders
GROUP BY customer_id
HAVING COUNT(*) > 1
ORDER BY customer_id;
```

```python
customer_stats = orders.groupby("customer_id").agg(
    order_count=("order_id", "count"),
    revenue=("line_revenue", "sum"),
).round({"revenue": 2}).sort_values("revenue", ascending=False)

recurring = customer_stats[customer_stats["order_count"] > 1].index.tolist()
# ['C001', 'C002']
```

</details>

<!--correction-->

## Correction

```ts
function orderCountByCustomer(orders: Order[]): Record<string, number> {
  const acc: Record<string, number> = {}
  for (const o of orders) {
    acc[o.customer_id] = (acc[o.customer_id] || 0) + 1
  }
  return acc
}

function recurringCustomers(orders: Order[]): string[] {
  const counts = orderCountByCustomer(orders)
  return Object.keys(counts)
    .filter(id => counts[id] > 1)
    .sort()
}

function revenueByCustomer(orders: Order[]): Record<string, number> {
  const acc: Record<string, number> = {}
  for (const o of orders) {
    acc[o.customer_id] = (acc[o.customer_id] || 0) + lineRevenue(o)
  }
  for (const c in acc) acc[c] = Math.round(acc[c] * 100) / 100
  return acc
}
```

`orderCountByCustomer` est le group-by le plus simple : on accumule `1` par commande
(au lieu du revenu). `recurringCustomers` filtre les entrées dont le compte est supérieur
à 1, puis trie pour un résultat déterministe (les tests dépendent de l'ordre). En SQL c'est
le `HAVING COUNT(*) > 1` après un `GROUP BY customer_id`.
