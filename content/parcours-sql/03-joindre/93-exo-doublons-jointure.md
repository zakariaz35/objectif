---
title: "Exercice — doublons de jointure & fan-out (SQL)"
type: exercise
---

## Énoncé

Le piège du **fan-out** : quand la clé de la table de droite n'est pas unique, chaque
ligne de gauche est dupliquée autant de fois qu'il y a de correspondances.

Voici deux tables :

```
orders(order_id, customer_id, amount)
tags(customer_id, tag)   -- un client peut avoir plusieurs tags
```

1. Écris la jointure `orders JOIN tags`. Combien de lignes obtient-on pour un client
   qui a 3 tags et 2 commandes ?

2. Un analyste junior calcule :

   ```sql
   SELECT SUM(o.amount) AS total_revenue
   FROM orders AS o
   JOIN tags AS t ON t.customer_id = o.customer_id;
   ```

   Pourquoi ce chiffre est-il **faux** ? Comment corriger ?

3. Écris une requête qui renvoie le CA total (non-gonflé) **et** la liste des tags
   de chaque client, sans dupliquer les montants.

<!--correction-->

## Correction

**Question 1 — cardinalité du fan-out**

Pour un client avec 2 commandes × 3 tags, la jointure produit **2 × 3 = 6 lignes**.
Chaque commande est répétée pour chaque tag, et inversement.

**Question 2 — SUM gonflé**

Le `SUM(o.amount)` additionne chaque montant de commande autant de fois qu'il y a de
tags pour ce client. Pour un client avec 3 tags et 2 commandes de 100 €, au lieu de
200 € on obtient 600 €.

**Question 3 — corriger le fan-out**

Option A : agréger *avant* de joindre (sous-requête ou CTE).

```sql
WITH order_totals AS (
  SELECT customer_id, SUM(amount) AS total_revenue
  FROM orders
  GROUP BY customer_id              -- aggregate BEFORE joining tags
)
SELECT ot.customer_id, ot.total_revenue, t.tag
FROM order_totals AS ot
JOIN tags AS t ON t.customer_id = ot.customer_id;
```

Option B : utiliser `COUNT(DISTINCT order_id)` et `SUM(DISTINCT amount)` — fragile si
plusieurs commandes ont exactement le même montant.

La règle générale : **vérifier la cardinalité** (1-1, 1-N, N-N) de chaque jointure
*avant* d'agréger. En cas de 1-N, agréger la table « N » d'abord, puis joindre.
