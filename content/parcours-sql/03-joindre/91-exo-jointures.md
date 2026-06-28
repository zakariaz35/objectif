---
title: "Exercice — jointures & CA par catégorie (SQL)"
type: exercise
---

## Énoncé

À partir de `orders(order_id, customer_id, product_id, amount)` et
`products(product_id, name, category)`, écris une requête qui donne le **CA total par
catégorie de produit**, trié décroissant. Une commande sans produit correspondant doit
être **ignorée**.

Bonus : ensuite, liste les clients (`customers`) qui n'ont **jamais** commandé.

<!--correction-->

## Correction

CA par catégorie (INNER JOIN puis agrégation) :

```sql
SELECT p.category, SUM(o.amount) AS total_revenue
FROM orders AS o
JOIN products AS p ON p.product_id = o.product_id
GROUP BY p.category
ORDER BY total_revenue DESC;
```

L'`INNER JOIN` écarte naturellement les commandes sans produit. On groupe sur une colonne
de la table jointe (`p.category`).

Clients sans commande (LEFT JOIN + test du NULL) :

```sql
SELECT c.customer_id, c.name
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;
```

Le `LEFT JOIN` garde tous les clients ; ceux sans commande ont `o.order_id IS NULL`.
