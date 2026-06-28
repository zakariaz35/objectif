---
title: "Exercice — la logique d'un agrégat filtré (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    // A DAX measure boils down to: FILTER the fact rows by the current context,
    // then AGGREGATE a column. Here we reproduce that idea in TypeScript to feel it.

    type Sale = { category: string; region: string; amount: number }

    // Reproduce CALCULATE([Total Sales], category = <category>):
    // sum the `amount` of the rows whose category matches, ignoring everything else.
    function totalSalesForCategory(sales: Sale[], category: string): number {
      // TODO: filter by category, then sum the amounts
      return 0
    }
  tests:
    - name: "somme uniquement la catégorie demandée"
      code: |
        const sales = [
          { category: 'Electronics', region: 'Paris', amount: 1250 },
          { category: 'Furniture',   region: 'Paris', amount: 800 },
          { category: 'Electronics', region: 'Lyon',  amount: 980 },
        ]
        const got = totalSalesForCategory(sales, 'Electronics')
        console.log('rows     :', sales)
        console.log('result   :', got)
        assertEqual(got, 2230, 'should sum only Electronics amounts (1250 + 980)')
    - name: "catégorie absente → 0"
      code: |
        const sales = [{ category: 'Furniture', region: 'Lyon', amount: 500 }]
        assertEqual(totalSalesForCategory(sales, 'Toys'), 0, 'no matching row → 0')
    - name: "tableau vide → 0"
      code: |
        assertEqual(totalSalesForCategory([], 'Electronics'), 0, 'empty fact table → 0')
---

## Énoncé

Une mesure DAX, au fond, c'est deux gestes : **filtrer** les lignes du fait selon le
contexte, puis **agréger** une colonne. Pour bien le sentir, on le reproduit en TypeScript.

Implémente `totalSalesForCategory(sales, category)` : l'équivalent de
`CALCULATE(SUM(Sales[amount]), Products[category] = <category>)`. Filtre les ventes de la
catégorie demandée, puis somme leur `amount`.

Indice : enchaîne `filter` (le contexte de filtre) puis `reduce` (l'agrégat `SUM`).

<!--correction-->

## Correction

```ts
function totalSalesForCategory(sales: Sale[], category: string): number {
  return sales
    .filter((s) => s.category === category)   // the filter context
    .reduce((sum, s) => sum + s.amount, 0)    // the SUM aggregate
}
```

C'est exactement la mécanique de `CALCULATE` : on restreint l'ensemble de lignes (le
contexte de filtre), puis on agrège la colonne. En Power BI, `filter` est implicite (il
vient du visuel, des slicers et des arguments de `CALCULATE`) et `SUM` fait le `reduce`.
Le `reduce` avec accumulateur initial `0` garantit que le tableau vide renvoie `0`.
