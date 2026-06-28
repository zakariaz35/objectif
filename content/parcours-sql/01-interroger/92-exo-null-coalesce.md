---
title: "Exercice — NULL, COALESCE, CASE WHEN (SQL)"
type: exercise
---

## Énoncé

Sur la table `orders(order_id, region, category, amount)` — où `region` et `amount`
peuvent être `NULL` :

1. **Requête 1** : renvoie toutes les commandes en remplaçant les `region` manquantes
   par `'Inconnue'` et les `amount` manquants par `0`. Affiche `order_id`, `region`
   (nettoyée) et `amount` (nettoyé).

2. **Requête 2** : ajoute une colonne `order_size` (segment) :
   - `'large'` si `amount >= 1000`
   - `'medium'` si `amount >= 200`
   - `'small'` sinon (y compris `NULL → small`)
   Puis compte le nombre de commandes par segment, trié par count décroissant.

3. **Piège** : explique pourquoi la requête suivante ne renvoie aucune ligne même si
   des commandes ont bien `region = NULL`.

   ```sql
   SELECT * FROM orders WHERE region = NULL;
   ```

<!--correction-->

## Correction

**Requête 1 — COALESCE**

```sql
SELECT
  order_id,
  COALESCE(region, 'Inconnue') AS region,
  COALESCE(amount, 0)          AS amount
FROM orders;
```

**Requête 2 — CASE WHEN + GROUP BY**

```sql
SELECT
  CASE
    WHEN amount >= 1000 THEN 'large'
    WHEN amount >= 200  THEN 'medium'
    ELSE 'small'                    -- NULL falls into ELSE
  END AS order_size,
  COUNT(*) AS nb_orders
FROM orders
GROUP BY order_size
ORDER BY nb_orders DESC;
```

`NULL >= 1000` → `NULL` (ni vrai ni faux), donc la condition échoue silencieusement et
la ligne tombe dans le `ELSE 'small'`. Si on veut segmenter les `NULL` séparément, on
ajoute `WHEN amount IS NULL THEN 'missing'` **en premier** dans le `CASE`.

**Piège — `region = NULL`**

Toute comparaison avec `NULL` retourne `NULL` (un troisième état logique, ni `TRUE` ni
`FALSE`). Le moteur SQL filtre uniquement les lignes dont la condition vaut `TRUE` ; les
lignes `NULL` et `FALSE` sont toutes deux écartées. C'est pourquoi `region = NULL`
ne ramène **jamais** rien : il faut `region IS NULL`.
