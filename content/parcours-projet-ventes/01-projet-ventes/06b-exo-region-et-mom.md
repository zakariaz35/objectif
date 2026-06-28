---
title: "Exercice — CA par région & évolution mois/mois (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface Order {
      order_id: number
      order_date: string   // "YYYY-MM-DD"
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

    // revenueByRegion: group orders by region and sum line revenue.
    // Return { region: revenue }, rounded to 2 decimals.
    function revenueByRegion(orders: Order[]): Record<string, number> {
      // TODO: implement (same pattern as monthlyRevenue, different key)
      return {}
    }

    // monthOverMonthGrowth: given a { "YYYY-MM": revenue } object (sorted keys),
    // return the growth rate (%) for each month relative to the previous month.
    // The first month is skipped (no previous). Each rate is rounded to 2 decimals.
    // Example: { "2024-01": 85, "2024-02": 55 } => { "2024-02": -35.29 }
    function monthOverMonthGrowth(monthly: Record<string, number>): Record<string, number> {
      // TODO: implement
      return {}
    }
  tests:
    - name: "CA par région — dataset complet"
      code: |
        const orders: Order[] = [
          { order_id: 1001, order_date: '2024-01-05', customer_id: 'C001', product_id: 'P01', quantity: 2, unit_price: 20, discount: 0,    region: 'North' },
          { order_id: 1002, order_date: '2024-01-18', customer_id: 'C002', product_id: 'P02', quantity: 1, unit_price: 50, discount: 0.10, region: 'South' },
          { order_id: 1003, order_date: '2024-02-02', customer_id: 'C001', product_id: 'P03', quantity: 3, unit_price: 12, discount: 0,    region: 'North' },
          { order_id: 1004, order_date: '2024-02-20', customer_id: 'C003', product_id: 'P01', quantity: 1, unit_price: 20, discount: 0.05, region: 'East'  },
          { order_id: 1005, order_date: '2024-03-11', customer_id: 'C002', product_id: 'P04', quantity: 5, unit_price: 8,  discount: 0,    region: 'South' },
          { order_id: 1006, order_date: '2024-03-29', customer_id: 'C004', product_id: 'P02', quantity: 2, unit_price: 50, discount: 0.20, region: 'West'  },
        ]
        const result = revenueByRegion(orders)
        console.log('revenue by region :', result)
        // North: 1001(40) + 1003(36) = 76
        // South: 1002(45) + 1005(40) = 85
        // East:  1004(19) = 19
        // West:  1006(80) = 80
        assertEqual(result, { North: 76, South: 85, East: 19, West: 80 }, 'revenue summed per region')
    - name: "région unique"
      code: |
        const orders: Order[] = [
          { order_id: 1, order_date: '2024-01-01', customer_id: 'C001', product_id: 'P01', quantity: 3, unit_price: 10, discount: 0, region: 'North' },
          { order_id: 2, order_date: '2024-01-02', customer_id: 'C002', product_id: 'P01', quantity: 2, unit_price: 10, discount: 0, region: 'North' },
        ]
        assertEqual(revenueByRegion(orders), { North: 50 }, '30 + 20 = 50 in North')
    - name: "évolution mois/mois — dataset T1 2024"
      code: |
        // Jan=85, Feb=55, Mar=120
        // Feb: (55-85)/85 = -0.3529... => -35.29%
        // Mar: (120-55)/55 = 1.1818... => +118.18%
        const monthly = { '2024-01': 85, '2024-02': 55, '2024-03': 120 }
        const result = monthOverMonthGrowth(monthly)
        console.log('MoM growth (%) :', result)
        assertEqual(result, { '2024-02': -35.29, '2024-03': 118.18 }, 'growth rates rounded to 2 decimals')
    - name: "un seul mois — pas de croissance calculable"
      code: |
        const monthly = { '2024-01': 100 }
        assertEqual(monthOverMonthGrowth(monthly), {}, 'single month has no previous, result is empty')
    - name: "croissance nulle entre deux mois identiques"
      code: |
        const monthly = { '2024-01': 100, '2024-02': 100 }
        assertEqual(monthOverMonthGrowth(monthly), { '2024-02': 0 }, '(100-100)/100 = 0%')
---

## Énoncé

### Partie 1 — CA par région

Implémente `revenueByRegion(orders)` : groupe les commandes par **région** et somme le
revenu de ligne.

- Renvoie `{ "North": 76, "South": 85, ... }`, chaque total **arrondi à 2 décimales**.
- C'est exactement le même patron que `monthlyRevenue` — seule la clé change (`region`
  au lieu du mois).

### Partie 2 — Évolution mois/mois (MoM)

Implémente `monthOverMonthGrowth(monthly)` : à partir de l'objet `{ mois: CA }` produit
par `monthlyRevenue`, calcule le **taux de croissance en %** de chaque mois par rapport
au précédent.

- Formule : `(courant - précédent) / précédent * 100`, arrondi à 2 décimales.
- Le **premier mois** n'a pas de précédent → absent du résultat.
- Indice : `Object.keys(monthly).sort()` pour obtenir les mois dans l'ordre chronologique.

> **Insight** : sur le T1 2024, on observe −35,29 % en février et +118,18 % en mars. Ce
> type d'indicateur est souvent appelé « MoM growth » dans les rapports métier.

<!--correction-->

## Correction

```ts
function revenueByRegion(orders: Order[]): Record<string, number> {
  const acc: Record<string, number> = {}
  for (const o of orders) {
    acc[o.region] = (acc[o.region] || 0) + lineRevenue(o)
  }
  for (const r in acc) acc[r] = Math.round(acc[r] * 100) / 100
  return acc
}

function monthOverMonthGrowth(monthly: Record<string, number>): Record<string, number> {
  const months = Object.keys(monthly).sort()
  const result: Record<string, number> = {}
  for (let i = 1; i < months.length; i++) {
    const prev = monthly[months[i - 1]]
    const curr = monthly[months[i]]
    result[months[i]] = Math.round(((curr - prev) / prev) * 10000) / 100
  }
  return result
}
```

`revenueByRegion` est un group-by classique avec `region` comme clé — le code est quasi
identique à `monthlyRevenue`, seul le nom du champ change. C'est voulu : **toutes les
agrégations partagent la même structure**.

`monthOverMonthGrowth` trie les clés pour garantir l'ordre chronologique (les objets JS
ne garantissent pas l'ordre d'insertion pour les clés non-entières). La boucle commence à
`i = 1` pour toujours avoir un `i - 1` valide. On multiplie par `10000` puis divise par
`100` pour arrondir à 2 décimales (équivalent à `Math.round(x * 100) / 100` sur un
pourcentage entier).
