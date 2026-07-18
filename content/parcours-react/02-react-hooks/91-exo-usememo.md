---
title: "Exercice — dériver des statistiques (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface Sale {
      productId: number
      amount: number
      month: number  // 1-12
    }

    interface Stats {
      total: number
      average: number
      best: number   // month with the highest total
    }

    // Pure computation — equivalent to a useMemo in a component.
    // Compute sales statistics for a given year of data.
    function computeStats(sales: Sale[]): Stats {
      // TODO: total, average per sale, and month with the highest sum
      return { total: 0, average: 0, best: 0 }
    }
  tests:
    - name: "statistiques de base"
      code: |
        const sales: Sale[] = [
          { productId: 1, amount: 100, month: 1 },
          { productId: 2, amount: 200, month: 1 },
          { productId: 3, amount: 150, month: 2 },
        ]
        const stats = computeStats(sales)
        console.log('stats :', stats)
        assertEqual(stats.total, 450, 'total = 450')
        assertEqual(stats.average, 150, 'moyenne = 450 / 3 = 150')
        assertEqual(stats.best, 1, 'mois 1 = 300, mois 2 = 150 → best = 1')
    - name: "un seul mois"
      code: |
        const sales: Sale[] = [
          { productId: 1, amount: 50, month: 5 },
          { productId: 2, amount: 80, month: 5 },
        ]
        const stats = computeStats(sales)
        assertEqual(stats.total, 130, 'total = 130')
        assertEqual(stats.best, 5, 'seul mois = 5')
    - name: "liste vide"
      code: |
        const stats = computeStats([])
        assertEqual(stats.total, 0, 'total vide = 0')
        assertEqual(stats.average, 0, 'moyenne vide = 0')
---

## Énoncé

> **Durée conseillée : ~20 min.** Dans un composant React, `computeStats` serait enveloppée
> dans `useMemo(() => computeStats(sales), [sales])` — elle ne se recalcule que quand
> `sales` change.

Implémente `computeStats` :

- `total` : somme de tous les `amount`.
- `average` : moyenne par vente (`total / sales.length`), ou `0` si la liste est vide.
- `best` : le **numéro de mois** (`month`) dont la somme des ventes est la plus haute.

Indices : `reduce` pour agréger, `Object.entries` ou `Map` pour grouper par mois.

<!--correction-->

## Correction

```ts
function computeStats(sales: Sale[]): Stats {
  if (sales.length === 0) return { total: 0, average: 0, best: 0 }

  const total = sales.reduce((sum, s) => sum + s.amount, 0)
  const average = total / sales.length

  // Group amounts by month
  const byMonth: Record<number, number> = {}
  for (const s of sales) {
    byMonth[s.month] = (byMonth[s.month] ?? 0) + s.amount
  }

  const best = Number(
    Object.entries(byMonth).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
  )

  return { total, average, best }
}
```

Dans un composant :

```tsx
const stats = useMemo(() => computeStats(sales), [sales])
```

La logique pure est ainsi **testable sans React** et mémoïsée quand on en a besoin.
