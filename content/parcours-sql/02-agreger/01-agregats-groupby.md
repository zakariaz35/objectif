---
title: "Agrégats, GROUP BY, HAVING"
type: lesson
---

# Agréger : le cœur de l'analyse SQL

C'est l'équivalent du TCD (tableau croisé dynamique) Excel : on **groupe** par une
dimension et on **agrège** une mesure.

## Les fonctions d'agrégation

```sql
SELECT
  COUNT(*)        AS nb_orders,
  SUM(amount)     AS total_revenue,
  AVG(amount)     AS avg_basket,
  MIN(amount)     AS min_amount,
  MAX(amount)     AS max_amount
FROM orders;
```

Attention : `COUNT(*)` compte les **lignes**, `COUNT(column)` compte les valeurs
**non-NULL** de la colonne, et `COUNT(DISTINCT customer_id)` les valeurs **distinctes**.
Les agrégats (`SUM`, `AVG`…) **ignorent les NULL**.

## GROUP BY : agréger par dimension

« CA par catégorie » :

```sql
SELECT category, SUM(amount) AS total_revenue
FROM orders
GROUP BY category
ORDER BY total_revenue DESC;
```

Règle d'or : **toute colonne du `SELECT` qui n'est pas agrégée doit être dans le
`GROUP BY`**.

On peut grouper par plusieurs dimensions (matrice région × catégorie) :

```sql
SELECT region, category, SUM(amount) AS total_revenue
FROM orders
GROUP BY region, category;
```

## Grouper par mois

```sql
-- PostgreSQL
SELECT DATE_TRUNC('month', order_date) AS month, SUM(amount) AS total_revenue
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;
```

## HAVING : filtrer APRÈS agrégation

`WHERE` filtre les **lignes**, `HAVING` filtre les **groupes** :

```sql
-- categories whose revenue exceeds 1000
SELECT category, SUM(amount) AS total_revenue
FROM orders
GROUP BY category
HAVING SUM(amount) > 1000;
```

On combine souvent les deux : `WHERE` réduit les lignes en entrée, `HAVING` filtre les
agrégats en sortie.

```sql
SELECT category, SUM(amount) AS total_revenue
FROM orders
WHERE order_date >= DATE '2024-01-01'   -- before aggregation
GROUP BY category
HAVING SUM(amount) > 1000;               -- after aggregation
```

> **À retenir —** `WHERE` = avant le `GROUP BY` (sur les lignes), `HAVING` = après (sur
> les agrégats). On ne peut pas mettre `SUM(amount) > 1000` dans un `WHERE`.
