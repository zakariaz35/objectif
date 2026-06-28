---
title: "Exercice — fenêtres : part de marché & cumul (SQL)"
type: exercise
---

## Énoncé

Sur `orders(order_id, order_date, category, amount)` :

1. Affiche chaque commande avec la **part** de son `amount` dans le **total de sa
   catégorie** (`amount / total_categorie`), sans regrouper (donc avec une fonction
   fenêtre).
2. Calcule le **CA cumulé par jour** (`order_date` croissant) : pour chaque date, le total
   cumulé depuis le début.

<!--correction-->

## Correction

Part dans la catégorie (agrégat fenêtré, pas de réduction) :

```sql
SELECT
  order_id,
  category,
  amount,
  amount * 1.0 / SUM(amount) OVER (PARTITION BY category) AS category_share
FROM orders;
```

`SUM(amount) OVER (PARTITION BY category)` donne le total de la catégorie sur chaque
ligne ; on divise pour obtenir la part. Le `* 1.0` force la division en flottant.

CA cumulé par date (cumul = agrégat fenêtré avec `ORDER BY`) :

```sql
SELECT
  order_date,
  SUM(amount) AS daily_revenue,
  SUM(SUM(amount)) OVER (ORDER BY order_date) AS running_total
FROM orders
GROUP BY order_date
ORDER BY order_date;
```

On agrège d'abord par jour (`SUM(amount)` + `GROUP BY order_date`), puis la fonction
fenêtre **cumule** ces totaux journaliers dans le temps : d'où le `SUM(SUM(amount))`.
