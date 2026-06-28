---
title: "Exercice — écris la mesure"
type: exercise
---

## Énoncé

Modèle en étoile : `Sales(order_id, order_date, product_id, customer_id, amount, quantity)`,
`Products(product_id, name, category)`, `Customers(customer_id, name, region)`,
et une table `Date` marquée.

Écris la **mesure DAX** demandée dans chaque cas. Pense à choisir entre agrégat simple et `CALCULATE`.

1. **CA total**.
2. **Panier moyen** (CA moyen par commande).
3. **Nombre de clients distincts**.
4. **CA des seuls produits de la catégorie `"Electronics"`**, quel que soit le découpage du visuel.
5. **Part (%) du CA de chaque catégorie dans le total** (utilisable dans un tableau par `category`).

<!--correction-->

## Correction

```text
// 1. Total revenue
Total Sales = SUM ( Sales[amount] )

// 2. Average basket — average amount per order
Avg Basket = AVERAGE ( Sales[amount] )

// 3. Distinct customers
Distinct Customers = DISTINCTCOUNT ( Sales[customer_id] )

// 4. Electronics only — CALCULATE replaces the category filter
Electronics Sales =
CALCULATE ( [Total Sales], Products[category] = "Electronics" )

// 5. Category share — divide the contextual total by the all-categories total
Category Share % =
DIVIDE (
    [Total Sales],
    CALCULATE ( [Total Sales], ALL ( Products[category] ) )
)
```

Points clés :

- on **réutilise** `[Total Sales]` partout : une mesure se compose d'autres mesures, c'est idiomatique et lisible ;
- en (4), `CALCULATE` **remplace** le filtre `category` ; la mesure reste fixée sur Electronics même dans un visuel découpé par `region` ;
- en (5), `ALL(Products[category])` **retire** le filtre de catégorie pour obtenir le dénominateur (le total global), et `DIVIDE` protège de la division par zéro.
