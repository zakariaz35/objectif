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

> **À retenir —** scalaire = une valeur (souvent dans `WHERE`/`SELECT`) ; `IN`/`EXISTS` =
> appartenance ; **corrélée** = dépend de la ligne externe (puissant mais coûteux).
> `NOT EXISTS` est plus sûr que `NOT IN` face aux `NULL`.
