---
title: "Exercice — pctChange & weightedAverage"
type: exercise
exercise:
  language: ts
  starter: |
    // 1) Percentage change between two periods.
    //    Denominator = ALWAYS the initial value (prev).
    //    If prev === 0 -> null (division by zero).
    function pctChange(prev: number, curr: number): number | null {
      // TODO: implement
      return null
    }

    // 2) Weighted average of an array of rows { value, weight }.
    //    E.g. grade weighted by coefficient, price weighted by quantity.
    //    If total weight is zero (or array is empty) -> null.
    type Row = { value: number; weight: number }
    function weightedAverage(rows: Row[]): number | null {
      // TODO: implement
      return null
    }
  tests:
    - name: "pctChange — hausse"
      code: |
        const got = pctChange(200, 250)
        console.log('200 -> 250:', got, '%')
        assertEqual(got, 25, '+25% relative to the initial value')
    - name: "pctChange — baisse"
      code: |
        assertEqual(pctChange(200, 150), -25, '-25%')
    - name: "pctChange — stable"
      code: |
        assertEqual(pctChange(100, 100), 0, 'no change')
    - name: "pctChange — division par zéro"
      code: |
        assertEqual(pctChange(0, 50), null, 'no change rate from a zero base')
    - name: "weightedAverage — pondérée"
      code: |
        const rows = [{ value: 10, weight: 1 }, { value: 20, weight: 3 }]
        const got = weightedAverage(rows)
        console.log('weighted average:', got)
        assertEqual(got, 17.5, '(10*1 + 20*3) / (1+3) = 70/4')
    - name: "weightedAverage — une ligne"
      code: |
        assertEqual(weightedAverage([{ value: 5, weight: 2 }]), 5, 'single value')
    - name: "weightedAverage — vide"
      code: |
        assertEqual(weightedAverage([]), null, 'no average for 0 rows')
---

## Énoncé

Deux fonctions tirées du module sur les pourcentages.

**1. `pctChange(prev, curr)`** — le taux de variation en % :

```
(curr − prev) / prev × 100
```

Le dénominateur est **toujours `prev`** (la valeur de départ). Si `prev === 0`, renvoie
`null` (on ne divise pas par zéro).

**2. `weightedAverage(rows)`** — la moyenne **pondérée** de lignes `{ value, weight }` :

```
somme(value × weight) / somme(weight)
```

Si la somme des poids est nulle (ou le tableau vide) → `null`. Utile pour un prix moyen
pondéré par les quantités, ou une note moyenne pondérée par les coefficients.

<!--correction-->

## Correction

```ts
function pctChange(prev: number, curr: number): number | null {
  if (prev === 0) return null
  return ((curr - prev) / prev) * 100
}

type Row = { value: number; weight: number }

function weightedAverage(rows: Row[]): number | null {
  let totalValue = 0
  let totalWeight = 0
  for (const row of rows) {
    totalValue += row.value * row.weight
    totalWeight += row.weight
  }
  if (totalWeight === 0) return null
  return totalValue / totalWeight
}
```

Pour `pctChange`, la garde `prev === 0` évite l'`Infinity`. Pour `weightedAverage`, on
accumule numérateur et dénominateur en un seul passage, et la garde `totalWeight === 0`
couvre à la fois le tableau vide et des poids tous nuls.
