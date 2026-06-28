---
title: "SELECT, WHERE, ORDER BY (refresher)"
type: lesson
---

# SQL pour l'analyste

Tu as déjà fait du SQL avancé et du PL/SQL. Ici, pas de cours from-scratch : un
**refresher appliqué**, orienté usage analyste, avec des cas concrets. Tout au long du
parcours on travaille sur un schéma de ventes :

```
customers(customer_id, name, region, signup_date)
products(product_id, name, category, unit_price, cost)
orders(order_id, order_date, customer_id, product_id, region, category, amount)
```

> **Objectif du parcours —** retrouver le réflexe « filtrer → grouper → agréger →
> joindre → fenêtrer ».
>
> SQL ne s'exécute pas dans la plateforme : les requêtes sont en mode lecture. Des
> exercices **interactifs en TypeScript** te font refaire la même logique sur des
> tableaux d'objets (l'équivalent JS d'une table), eux **réellement exécutés**.

## Sélectionner les bonnes colonnes

Évite `SELECT *` en analyse : nomme ce dont tu as besoin (lisibilité, perf, contrat
stable). Renomme avec `AS` quand c'est plus parlant.

```sql
SELECT order_id, region, amount AS revenue
FROM orders;
```

## Filtrer : WHERE

```sql
SELECT order_id, region, amount
FROM orders
WHERE region = 'Nord'
  AND order_date >= DATE '2024-01-01';
```

Opérateurs utiles côté analyste :

```sql
WHERE category IN ('Office', 'Hardware')   -- list of values
WHERE amount BETWEEN 100 AND 500           -- range (bounds included)
WHERE name LIKE 'Key%'                      -- text pattern (% = n characters)
WHERE region IS NOT NULL                    -- valeurs manquantes
```

### Le piège NULL

`NULL` n'est pas une valeur, c'est « inconnu ». Toute comparaison avec `NULL` renvoie
`NULL` (ni vrai, ni faux) :

```sql
WHERE region = NULL      -- ❌ never returns any row
WHERE region IS NULL     -- ✅ correct syntax
```

`NULL` est aussi **exclu** des comparaisons : `WHERE amount <> 100` ne renvoie pas les
lignes où `amount` est `NULL`.

## DISTINCT : valeurs uniques

```sql
SELECT DISTINCT region FROM orders;          -- list of distinct regions
SELECT DISTINCT region, category FROM orders; -- unique pairs
```

## Trier et limiter : ORDER BY / LIMIT

```sql
SELECT order_id, amount
FROM orders
ORDER BY amount DESC      -- largest orders first
LIMIT 10;                 -- top 10
```

> **À retenir —** l'ordre logique d'exécution est `FROM → WHERE → GROUP BY → HAVING →
> SELECT → ORDER BY → LIMIT`. Le `WHERE` filtre **avant** l'agrégation ; le `HAVING`
> filtre **après** (leçon suivante). Et pour tester une absence, c'est `IS NULL`, pas
> `= NULL`.
