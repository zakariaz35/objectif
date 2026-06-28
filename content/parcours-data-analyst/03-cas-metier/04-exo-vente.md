---
title: "Exercice — grossMargin & averageBasket"
type: exercise
exercise:
  language: ts
  starter: |
    // Sales lines: each object is ONE order line.
    type SaleLine = {
      orderId: number   // order identifier (may repeat across lines)
      unitPrice: number // unit selling price (excl. tax)
      unitCost: number  // unit purchase cost
      quantity: number
    }

    // 1) Gross margin in % across all lines.
    //    revenue = sum(unitPrice * quantity)
    //    cost    = sum(unitCost  * quantity)
    //    margin% = (revenue - cost) / revenue * 100   ; revenue === 0 -> null
    function grossMargin(rows: SaleLine[]): number | null {
      // TODO: implement
      return null
    }

    // 2) Average basket = total revenue / number of DISTINCT orders (orderId).
    //    A multi-line order counts only once in the denominator.
    //    No orders -> null.
    type AmountLine = { orderId: number; amount: number }
    function averageBasket(orders: AmountLine[]): number | null {
      // TODO: implement
      return null
    }
  tests:
    - name: "grossMargin — cas simple"
      code: |
        const rows = [{ orderId: 1, unitPrice: 100, unitCost: 60, quantity: 1 }]
        const got = grossMargin(rows)
        console.log('margin %:', got)
        assertEqual(got, 40, '(100-60)/100 = 40%')
    - name: "grossMargin — quantités mixtes"
      code: |
        const rows = [
          { orderId: 1, unitPrice: 100, unitCost: 60, quantity: 2 },
          { orderId: 2, unitPrice: 50,  unitCost: 50, quantity: 1 },
        ]
        // revenue = 200 + 50 = 250 ; cost = 120 + 50 = 170
        assertEqual(grossMargin(rows), 32, '(250-170)/250 = 32%')
    - name: "grossMargin — aucune ligne"
      code: |
        assertEqual(grossMargin([]), null, 'no revenue -> no margin')
    - name: "averageBasket — commandes multi-lignes"
      code: |
        const orders = [
          { orderId: 1, amount: 30 },
          { orderId: 1, amount: 20 }, // same order
          { orderId: 2, amount: 100 },
        ]
        const got = averageBasket(orders)
        console.log('average basket:', got)
        assertEqual(got, 75, 'revenue 150 / 2 distinct orders = 75')
    - name: "averageBasket — une commande"
      code: |
        assertEqual(averageBasket([{ orderId: 9, amount: 40 }]), 40, 'single order')
    - name: "averageBasket — vide"
      code: |
        assertEqual(averageBasket([]), null, 'no orders -> null')
---

## Énoncé

Deux KPI Vente/Achat à calculer sur un **tableau d'objets** (l'équivalent d'une table).

**1. `grossMargin(rows)`** — la marge brute en % :

```
revenue = somme(unitPrice × quantity)
cost    = somme(unitCost  × quantity)
marge % = (revenue − cost) / revenue × 100
```

Si `revenue === 0` → `null`.

**2. `averageBasket(orders)`** — le panier moyen. Piège de **granularité** : le
dénominateur est le nombre de **commandes distinctes** (`orderId` uniques), pas le nombre
de lignes. Aucune commande → `null`.

> Astuce : un `Set` collecte facilement les `orderId` distincts.

<!--correction-->

## Correction

```ts
function grossMargin(rows: SaleLine[]): number | null {
  let revenue = 0
  let cost = 0
  for (const row of rows) {
    revenue += row.unitPrice * row.quantity
    cost += row.unitCost * row.quantity
  }
  if (revenue === 0) return null
  return ((revenue - cost) / revenue) * 100
}

function averageBasket(orders: AmountLine[]): number | null {
  const ids = new Set<number>()
  let total = 0
  for (const line of orders) {
    ids.add(line.orderId)
    total += line.amount
  }
  if (ids.size === 0) return null
  return total / ids.size
}
```

Pour la marge, on agrège revenue et cost **avant** de diviser (ne jamais moyenner des
pourcentages ligne à ligne). Pour le panier, le `Set` dédoublonne les `orderId` : c'est ce
qui distingue « par commande » de « par ligne ».
