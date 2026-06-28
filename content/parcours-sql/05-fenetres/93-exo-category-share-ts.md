---
title: "Exercice interactif — part de marché par catégorie en TypeScript"
type: exercise
exercise:
  language: ts
  starter: |
    interface Order {
      orderId: number
      category: string
      amount: number
    }

    interface ShareRow {
      orderId: number
      category: string
      amount: number
      categoryShare: number  // fraction of the category's total (between 0 and 1)
    }

    // Equivalent of:
    //   SELECT orderId, category, amount,
    //          amount * 1.0 / SUM(amount) OVER (PARTITION BY category) AS categoryShare
    //   FROM orders
    //
    // Each row is kept (no reduction).
    // categoryShare = amount / (sum of amount for all rows in the same category).
    function categoryShare(orders: Order[]): ShareRow[] {
      // TODO: step 1 — compute total per category (PARTITION BY)
      //        step 2 — enrich each row with its share
      return []
    }
  tests:
    - name: "part de marché dans la catégorie"
      code: |
        const orders: Order[] = [
          { orderId: 1, category: 'Office',   amount: 100 },
          { orderId: 2, category: 'Office',   amount: 300 },
          { orderId: 3, category: 'Hardware', amount: 200 },
          { orderId: 4, category: 'Hardware', amount: 200 },
        ]
        const got = categoryShare(orders)
        console.log('input  :', orders)
        console.log('result :', got)
        // Office total=400: ord1=0.25, ord2=0.75
        // Hardware total=400: ord3=0.5, ord4=0.5
        const o1 = got.find((r) => r.orderId === 1)
        const o2 = got.find((r) => r.orderId === 2)
        const o3 = got.find((r) => r.orderId === 3)
        assert(Math.abs((o1?.categoryShare ?? -1) - 0.25) < 1e-9, 'orderId 1 : 100/400 = 0.25')
        assert(Math.abs((o2?.categoryShare ?? -1) - 0.75) < 1e-9, 'orderId 2 : 300/400 = 0.75')
        assert(Math.abs((o3?.categoryShare ?? -1) - 0.5)  < 1e-9, 'orderId 3 : 200/400 = 0.5')
    - name: "nombre de lignes inchangé (pas de réduction)"
      code: |
        const orders: Order[] = [
          { orderId: 1, category: 'Office', amount: 50 },
          { orderId: 2, category: 'Office', amount: 50 },
          { orderId: 3, category: 'Hardware', amount: 200 },
        ]
        const got = categoryShare(orders)
        console.log('taille résultat :', got.length, '(doit rester 3)')
        assertEqual(got.length, 3, 'la fenêtre ne réduit pas le nombre de lignes')
    - name: "catégorie à une seule ligne → categoryShare = 1"
      code: |
        const orders: Order[] = [
          { orderId: 1, category: 'Unique', amount: 500 },
        ]
        const got = categoryShare(orders)
        console.log('résultat catégorie unique :', got)
        assert(Math.abs(got[0].categoryShare - 1.0) < 1e-9, 'seule ligne → part = 1.0 (100 %)')
    - name: "table vide → []"
      code: |
        assertEqual(categoryShare([]), [], 'aucune commande → aucune ligne')
---

## Énoncé

Implémente `categoryShare` : pour chaque commande, calcule la **part** que représente
son `amount` dans le **total de sa catégorie**. Le nombre de lignes en sortie est
identique à l'entrée — aucune réduction (sémantique fonction fenêtre).

C'est l'équivalent TypeScript de :

```sql
SELECT orderId, category, amount,
       amount * 1.0 / SUM(amount) OVER (PARTITION BY category) AS categoryShare
FROM orders;
```

Indices :
- **Étape 1** : calcule un `Map<string, number>` (category → total) — c'est le
  `SUM(amount) OVER (PARTITION BY category)`.
- **Étape 2** : parcours les commandes et divise `amount` par le total de sa catégorie.

<!--correction-->

## Correction

```ts
function categoryShare(orders: Order[]): ShareRow[] {
  // Step 1 — PARTITION BY category: total per category
  const totals = new Map<string, number>()
  for (const o of orders) {
    totals.set(o.category, (totals.get(o.category) ?? 0) + o.amount)
  }

  // Step 2 — enrich each row (no reduction: same number of rows as input)
  return orders.map((o) => ({
    orderId: o.orderId,
    category: o.category,
    amount: o.amount,
    categoryShare: o.amount / totals.get(o.category)!,
  }))
}
```

Le point clé : on **ne groupe pas** — on fait deux passes. La première calcule les
totaux (l'équivalent du calcul interne de la fenêtre `PARTITION BY category`). La
seconde enrichit chaque ligne sans la supprimer. C'est exactement ce que fait SQL avec
`OVER (PARTITION BY category)` : le total est « broadcast » sur chaque ligne de la
partition, sans réduire.
