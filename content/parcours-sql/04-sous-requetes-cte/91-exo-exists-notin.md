---
title: "Exercice — EXISTS vs NOT IN (SQL)"
type: exercise
---

## Énoncé

Sur `customers(customer_id, name)` et `orders(order_id, customer_id, amount)` :

1. Avec **EXISTS**, renvoie les clients qui ont **au moins une commande** dont le
   `amount` dépasse 500.

2. Avec **NOT EXISTS**, renvoie les clients qui n'ont **aucune commande** (équivalent
   du LEFT JOIN + IS NULL vu précédemment).

3. Un analyste écrit :

   ```sql
   SELECT customer_id FROM customers
   WHERE customer_id NOT IN (
     SELECT customer_id FROM orders WHERE amount > 0
   );
   ```

   Que se passe-t-il si **une seule ligne** de `orders` a `customer_id = NULL` ?
   Comment corriger ?

<!--correction-->

## Correction

**Requête 1 — EXISTS avec condition sur l'amount**

```sql
SELECT c.customer_id, c.name
FROM customers AS c
WHERE EXISTS (
  SELECT 1
  FROM orders AS o
  WHERE o.customer_id = c.customer_id
    AND o.amount > 500
);
```

`EXISTS` s'arrête dès la première correspondance trouvée, ce qui le rend efficace sur
de grandes tables. Le `SELECT 1` est une convention : le contenu de la sous-requête
n'importe pas, seul le fait qu'elle renvoie *au moins une ligne* compte.

**Requête 2 — NOT EXISTS pour les clients sans commande**

```sql
SELECT c.customer_id, c.name
FROM customers AS c
WHERE NOT EXISTS (
  SELECT 1 FROM orders AS o WHERE o.customer_id = c.customer_id
);
```

**Question 3 — piège NOT IN + NULL**

Si `orders.customer_id` peut être `NULL`, la sous-requête renvoie un `NULL` dans la
liste. Or `customer_id NOT IN (..., NULL, ...)` est équivalent à
`customer_id <> NULL` pour ce terme, ce qui vaut `NULL` (ni vrai ni faux). Résultat :
**aucune ligne** n'est retournée par la requête entière, même pour les clients
clairement absents de `orders`.

Correction :

```sql
-- option A: filter NULLs in the subquery
WHERE customer_id NOT IN (
  SELECT customer_id FROM orders
  WHERE customer_id IS NOT NULL AND amount > 0
)

-- option B (recommended): NOT EXISTS, immune to NULLs
WHERE NOT EXISTS (
  SELECT 1 FROM orders AS o
  WHERE o.customer_id = c.customer_id AND o.amount > 0
)
```

La règle : dès qu'une colonne peut être `NULL`, **préfère `NOT EXISTS`** à `NOT IN`.
