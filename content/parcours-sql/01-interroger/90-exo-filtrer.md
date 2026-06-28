---
title: "Exercice — filtrer & trier (SQL)"
type: exercise
---

## Énoncé

À partir de la table `orders(order_id, order_date, region, category, amount)`, écris la
requête qui renvoie les **10 plus grosses commandes** de la région `Nord`, passées
**en 2024**, pour les catégories `Office` ou `Hardware`. Affiche `order_id`, `category`
et `amount`, triées du montant le plus élevé au plus faible.

Exclus aussi les commandes dont le `amount` est manquant.

<!--correction-->

## Correction

```sql
SELECT order_id, category, amount
FROM orders
WHERE region = 'Nord'
  AND order_date >= DATE '2024-01-01'
  AND order_date <  DATE '2025-01-01'
  AND category IN ('Office', 'Hardware')
  AND amount IS NOT NULL
ORDER BY amount DESC
LIMIT 10;
```

Points clés :

- l'année se filtre par un **intervalle demi-ouvert** (`>= 2024-01-01 AND < 2025-01-01`)
  plutôt que `YEAR(order_date) = 2024` : la version intervalle peut utiliser un index.
- `category IN (...)` est plus lisible que deux `OR`.
- `amount IS NOT NULL` est ici redondant si on ne s'intéresse qu'au tri DESC (les `NULL`
  finiraient en bas), mais c'est une bonne habitude de rendre l'intention explicite.
