---
title: "Sous-requêtes : scalaire, IN, corrélée"
type: lesson
---

# Sous-requêtes : une requête dans la requête

Une sous-requête est une requête imbriquée dont le résultat alimente la requête
englobante. Trois formes reviennent en analyse.

## Sous-requête scalaire (renvoie une seule valeur)

Comparer chaque commande à la moyenne globale :

```sql
SELECT order_id, amount
FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders);
```

**Visualisation — que retourne la sous-requête ?**

```sql
SELECT AVG(amount) FROM orders;   -- returns a single value: 142.50
```

La requête externe se lit alors comme :

```sql
SELECT order_id, amount FROM orders WHERE amount > 142.50;
```

| order_id | amount |
|---|---|
| 103 | 200.00 |
| 105 | 175.00 |

La sous-requête renvoie **un seul nombre**, utilisé comme une constante.

## Sous-requête avec IN (renvoie une liste)

Les commandes des produits de la catégorie `Hardware` :

```sql
SELECT order_id, amount
FROM orders
WHERE product_id IN (
  SELECT product_id FROM products WHERE category = 'Hardware'
);
```

**Visualisation — que retourne la sous-requête IN ?**

```sql
SELECT product_id FROM products WHERE category = 'Hardware';
-- returns: (10, 15, 23)
```

La requête externe se lit alors comme :

```sql
SELECT order_id, amount FROM orders WHERE product_id IN (10, 15, 23);
```

| order_id | amount |
|---|---|
| 101 | 120.00 |
| 103 | 200.00 |

> Attention à `NOT IN` : si la sous-requête peut renvoyer un `NULL`, `NOT IN` ne renvoie
> **aucune** ligne. Préfère `NOT EXISTS` dans ce cas.

## Sous-requête corrélée

Elle référence la requête externe : elle est (logiquement) ré-évaluée pour chaque ligne.
« Commandes au-dessus de la moyenne **de leur propre catégorie** » :

```sql
SELECT o.order_id, o.category, o.amount
FROM orders AS o
WHERE o.amount > (
  SELECT AVG(o2.amount)
  FROM orders AS o2
  WHERE o2.category = o.category   -- correlation with the outer row
);
```

## EXISTS : « y a-t-il au moins une ligne ? »

Clients ayant au moins une commande :

```sql
SELECT c.customer_id, c.name
FROM customers AS c
WHERE EXISTS (
  SELECT 1 FROM orders AS o WHERE o.customer_id = c.customer_id
);
```

`EXISTS` s'arrête à la première correspondance : souvent plus efficace qu'un `IN` sur
une grosse liste, et sûr vis-à-vis des `NULL`.

## Erreur classique : ORDER BY dans une sous-requête sans LIMIT

Un `ORDER BY` à l'intérieur d'une sous-requête **sans `LIMIT`** est ignoré par le moteur
(PostgreSQL et MySQL le silencient tous les deux). L'ordre du résultat final doit être
imposé dans la requête **externe**.

```sql
-- WARNING: ORDER BY inside the subquery is silently ignored
SELECT order_id, amount
FROM orders
WHERE product_id IN (
  SELECT product_id
  FROM products
  ORDER BY list_price DESC   -- useless here, ignored by the engine
);

-- correct: ORDER BY belongs in the outer query
SELECT order_id, amount
FROM orders
WHERE product_id IN (
  SELECT product_id FROM products WHERE category = 'Hardware'
)
ORDER BY amount DESC;        -- this one is applied
```

## Cas d'agence : clients actifs en 2024 dans une région

`EXISTS` est la forme la plus efficace pour tester « au moins une ligne » — il s'arrête
à la première correspondance, ce qui évite de construire une liste complète comme `IN`.

```sql
-- customers from the "North" region with at least one order in 2024
SELECT c.customer_id, c.name
FROM customers AS c
WHERE c.region = 'North'
  AND EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
      AND o.order_date >= DATE '2024-01-01'
  );
```

**Performance : surveiller les sous-requêtes corrélées**

```sql
-- correlated subquery: re-evaluated for each outer row
EXPLAIN ANALYZE
SELECT o.order_id, o.category, o.amount
FROM orders AS o
WHERE o.amount > (
  SELECT AVG(o2.amount)
  FROM orders AS o2
  WHERE o2.category = o.category   -- correlated on category
);
-- Look for "SubPlan" in the output: executed once per outer row, can be slow
-- If performance is critical, rewrite as a JOIN + CTE (see module 04-cte)
```

> **À retenir —** scalaire = une valeur (souvent dans `WHERE`/`SELECT`) ; `IN`/`EXISTS` =
> appartenance ; **corrélée** = dépend de la ligne externe (puissant mais coûteux).
> `NOT EXISTS` est plus sûr que `NOT IN` face aux `NULL`.
