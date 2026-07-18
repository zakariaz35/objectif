---
title: "Exercice — HAVING (SQL)"
type: exercise
---

## Énoncé

Sur `orders(order_id, customer_id, region, category, amount)`, écris une requête qui
liste les **régions** ayant réalisé **plus de 5 commandes** et un **CA total supérieur à
10 000**. Affiche `region`, le nombre de commandes et le CA, trié par CA décroissant.

<!--correction-->

## Correction

```sql
SELECT
  region,
  COUNT(*)    AS nb_orders,
  SUM(amount) AS total_revenue
FROM orders
GROUP BY region
HAVING COUNT(*) > 5
   AND SUM(amount) > 10000
ORDER BY total_revenue DESC;
```

Les deux conditions portent sur des **agrégats** : elles vont donc dans le `HAVING`, pas
dans le `WHERE`. On peut combiner plusieurs conditions d'agrégat avec `AND` / `OR`.
