---
title: "Exercice interactif — cumul (running total) en TypeScript"
type: exercise
exercise:
  language: ts
  starter: |
    interface Order {
      orderId: number
      orderDate: string   // ISO format: 'YYYY-MM-DD'
      amount: number
    }

    interface RunningRow {
      orderId: number
      orderDate: string
      amount: number
      runningTotal: number  // cumulative sum from first date up to (and including) this row
    }

    // Equivalent of:
    //   SELECT orderId, orderDate, amount,
    //          SUM(amount) OVER (ORDER BY orderDate) AS runningTotal
    //   FROM orders
    //   ORDER BY orderDate ASC
    //
    // Rows are sorted by orderDate ascending.
    // runningTotal is the cumulative sum of amount from the first row up to the current row.
    function runningTotal(orders: Order[]): RunningRow[] {
      // TODO: sort by orderDate, then compute cumulative sum
      return []
    }
  tests:
    - name: "cumul croissant par date"
      code: |
        const orders: Order[] = [
          { orderId: 3, orderDate: '2024-01-03', amount: 50  },
          { orderId: 1, orderDate: '2024-01-01', amount: 100 },
          { orderId: 2, orderDate: '2024-01-02', amount: 200 },
        ]
        const got = runningTotal(orders)
        console.log('input  (non trié)   :', orders)
        console.log('résultat (trié + cumul) :', got)
        // sorted: 01/01(100), 01/02(200), 01/03(50)
        // cumul :        100,        300,       350
        assertEqual(got[0].orderDate,    '2024-01-01', 'première date en premier')
        assertEqual(got[0].runningTotal, 100, 'cumul après 01/01 = 100')
        assertEqual(got[1].runningTotal, 300, 'cumul après 01/02 = 100 + 200')
        assertEqual(got[2].runningTotal, 350, 'cumul après 01/03 = 300 + 50')
    - name: "tri préservé indépendamment de l'ordre d'entrée"
      code: |
        const orders: Order[] = [
          { orderId: 2, orderDate: '2024-03-01', amount: 500 },
          { orderId: 1, orderDate: '2024-01-15', amount: 300 },
        ]
        const got = runningTotal(orders)
        console.log('résultat :', got)
        assertEqual(got[0].orderId, 1, 'orderId 1 (01/15) vient en premier')
        assertEqual(got[0].runningTotal, 300, 'cumul après 01/15 = 300')
        assertEqual(got[1].runningTotal, 800, 'cumul après 03/01 = 300 + 500')
    - name: "une seule commande → runningTotal = amount"
      code: |
        const orders: Order[] = [
          { orderId: 1, orderDate: '2024-06-01', amount: 42 },
        ]
        const got = runningTotal(orders)
        console.log('résultat une seule ligne :', got)
        assertEqual(got[0].runningTotal, 42, 'pour une seule ligne, cumul = amount')
    - name: "table vide → []"
      code: |
        assertEqual(runningTotal([]), [], 'aucune commande → tableau vide')
---

## Énoncé

Implémente `runningTotal` : trie les commandes par `orderDate` croissant, puis calcule
le **cumul des `amount`** — chaque ligne porte la somme de toutes les lignes jusqu'à
elle-même (y compris).

C'est l'équivalent TypeScript de :

```sql
SELECT orderId, orderDate, amount,
       SUM(amount) OVER (ORDER BY orderDate) AS runningTotal
FROM orders
ORDER BY orderDate ASC;
```

Indices :
- Commence par trier (`Array.sort` sur `orderDate` — comparer des chaînes ISO
  `'YYYY-MM-DD'` fonctionne directement avec `localeCompare` ou `<`/`>`).
- Parcours le tableau trié en maintenant un accumulateur `cumul`.
- Le tableau d'entrée ne doit **pas** être muté : utilise `.slice().sort(...)`.

<!--correction-->

## Correction

```ts
function runningTotal(orders: Order[]): RunningRow[] {
  // Sort by date ascending (ISO strings compare lexicographically)
  const sorted = orders.slice().sort((a, b) => a.orderDate.localeCompare(b.orderDate))

  let cumul = 0
  return sorted.map((o) => {
    cumul += o.amount
    return {
      orderId: o.orderId,
      orderDate: o.orderDate,
      amount: o.amount,
      runningTotal: cumul,
    }
  })
}
```

Le `.slice()` évite de muter le tableau original — même principe que `ORDER BY` qui ne
modifie pas la table source. L'accumulateur `cumul` joue exactement le rôle de
`SUM(amount) OVER (ORDER BY orderDate)` : SQL maintient lui aussi un total cumulé
ligne par ligne dans le cadre de la fenêtre ordonnée.
