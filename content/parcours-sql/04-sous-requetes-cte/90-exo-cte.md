---
title: "Exercice — sous-requête & CTE (SQL)"
type: exercise
---

## Énoncé

1. Avec une **sous-requête corrélée**, renvoie les commandes dont le `amount` dépasse la
   moyenne **de leur région** (`order_id`, `region`, `amount`).
2. Réécris la même intention avec une **CTE** qui calcule d'abord la moyenne par région,
   puis joint. Compare la lisibilité.

<!--correction-->

## Correction

Version sous-requête corrélée :

```sql
SELECT o.order_id, o.region, o.amount
FROM orders AS o
WHERE o.amount > (
  SELECT AVG(o2.amount)
  FROM orders AS o2
  WHERE o2.region = o.region
);
```

Version CTE (moyenne par région calculée une fois, puis jointe) :

```sql
WITH region_avg AS (
  SELECT region, AVG(amount) AS avg_amount
  FROM orders
  GROUP BY region
)
SELECT o.order_id, o.region, o.amount
FROM orders AS o
JOIN region_avg AS r ON r.region = o.region
WHERE o.amount > r.avg_amount;
```

La CTE expose l'étape « moyenne par région » comme une table nommée : l'intention est
explicite et le moteur peut la calculer une seule fois plutôt que (logiquement) par
ligne.
