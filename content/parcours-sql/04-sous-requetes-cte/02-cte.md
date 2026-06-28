---
title: "CTE (WITH) : lisibilité & étapes"
type: lesson
---

# CTE : nommer les étapes avec WITH

Une **CTE** (Common Table Expression) est une sous-requête **nommée**, déclarée en tête
avec `WITH`. C'est l'outil n°1 pour rendre une analyse lisible : on décompose en étapes
qui se lisent de haut en bas, comme un pipeline.

## De la sous-requête imbriquée à la CTE

Avant — imbrication difficile à lire :

```sql
SELECT category, total_revenue
FROM (
  SELECT category, SUM(amount) AS total_revenue
  FROM orders
  GROUP BY category
) AS t
WHERE total_revenue > 1000
ORDER BY total_revenue DESC;
```

Après — la même chose en étapes nommées :

```sql
WITH revenue_by_category AS (
  SELECT category, SUM(amount) AS total_revenue
  FROM orders
  GROUP BY category
)
SELECT category, total_revenue
FROM revenue_by_category
WHERE total_revenue > 1000
ORDER BY total_revenue DESC;
```

## Chaîner plusieurs CTE

Chaque CTE peut référencer les précédentes — un vrai pipeline :

```sql
WITH monthly AS (
  SELECT DATE_TRUNC('month', order_date) AS month, SUM(amount) AS revenue
  FROM orders
  GROUP BY DATE_TRUNC('month', order_date)
),
ranked AS (
  SELECT month, revenue,
         AVG(revenue) OVER () AS avg_revenue
  FROM monthly
)
SELECT month, revenue
FROM ranked
WHERE revenue > avg_revenue        -- months above average
ORDER BY month;
```

## CTE vs sous-requête : quand quoi ?

- **CTE** : dès qu'une étape est réutilisée, ou que l'imbrication nuit à la lecture. À
  privilégier pour les analyses qui s'enchaînent.
- **Sous-requête scalaire/`EXISTS`** : pour une valeur ou un test ponctuel dans un
  `WHERE`/`SELECT`.

> **À retenir —** la CTE ne change pas le résultat, elle change la **lisibilité**. Pense
> « pipeline d'étapes nommées » : chaque `WITH` est une vue temporaire de la requête.
