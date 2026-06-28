---
title: "Aide-mémoire SQL"
type: lesson
---

# Aide-mémoire SQL — référence rapide

Une page à garder ouverte. Syntaxe → effet, mini-exemples d'une ligne.

---

## SELECT / WHERE / ORDER BY

| Syntaxe | Effet |
|---|---|
| `SELECT col1, col2 FROM t` | Projeter des colonnes |
| `SELECT DISTINCT col FROM t` | Valeurs uniques |
| `SELECT * FROM t WHERE cond` | Filtrer les lignes |
| `ORDER BY col DESC` | Trier décroissant |
| `LIMIT 10` | Garder les 10 premières lignes |
| `OFFSET 20 LIMIT 10` | Pagination : page 3 par tranche de 10 |

```sql
SELECT product_id, amount
FROM orders
WHERE region = 'Nord' AND amount > 100
ORDER BY amount DESC
LIMIT 5;
```

### Opérateurs de filtre courants

| Opérateur | Exemple |
|---|---|
| `=`, `<>`, `<`, `>`, `<=`, `>=` | `amount >= 50` |
| `BETWEEN a AND b` | `amount BETWEEN 10 AND 200` |
| `IN (...)` | `region IN ('Nord', 'Sud')` |
| `LIKE 'A%'` | Commence par A (% = n chars, _ = 1 char) |
| `IS NULL` / `IS NOT NULL` | `email IS NULL` |
| `NOT` | `NOT region = 'Est'` |
| `COALESCE(a, b)` | Premier non-NULL : `COALESCE(note, 0)` |

---

## GROUP BY / HAVING

```sql
SELECT category, COUNT(*) AS nb, SUM(amount) AS total
FROM orders
GROUP BY category
HAVING SUM(amount) > 1000   -- HAVING filtre les groupes, pas les lignes
ORDER BY total DESC;
```

| Règle | Rappel |
|---|---|
| `WHERE` | Filtre **avant** le regroupement (lignes brutes) |
| `HAVING` | Filtre **après** le regroupement (sur les agrégats) |
| Colonnes du `SELECT` | Doivent être dans `GROUP BY` ou dans une fonction d'agrégat |

### Fonctions d'agrégat

| Fonction | Effet |
|---|---|
| `COUNT(*)` | Nombre de lignes |
| `COUNT(col)` | Nombre de valeurs non-NULL |
| `COUNT(DISTINCT col)` | Valeurs distinctes |
| `SUM(col)` | Somme |
| `AVG(col)` | Moyenne (ignore NULL) |
| `MIN(col)` / `MAX(col)` | Minimum / maximum |

---

## JOIN

```sql
-- INNER : lignes communes aux deux tables
SELECT o.order_id, c.name
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id;

-- LEFT : toutes les lignes de gauche, NULL si pas de correspondance
SELECT c.name, o.order_id
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;
```

| Type | Lignes retournées |
|---|---|
| `INNER JOIN` | Lignes correspondant des deux côtés |
| `LEFT JOIN` | Toutes les lignes de gauche + NULL à droite si absent |
| `RIGHT JOIN` | Toutes les lignes de droite + NULL à gauche si absent |
| `FULL OUTER JOIN` | Toutes les lignes des deux côtés |
| `CROSS JOIN` | Produit cartésien (chaque ligne × chaque ligne) |

> **Piège doublons** — si la table de droite contient plusieurs lignes par clé, chaque ligne de gauche est dupliquée autant de fois. Toujours vérifier avec `COUNT(*)` avant et après la jointure.

---

## Sous-requêtes

```sql
-- Scalar : une valeur
SELECT order_id FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders);

-- IN : liste de valeurs
SELECT name FROM customers
WHERE id IN (SELECT DISTINCT customer_id FROM orders WHERE region = 'Nord');

-- EXISTS : test d'existence (arrête dès la première correspondance, souvent plus rapide)
SELECT name FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.amount > 500
);
```

| Forme | Cas d'usage |
|---|---|
| Scalaire `= (SELECT ...)` | Comparer à une valeur calculée |
| `IN (SELECT col ...)` | Filtrer sur une liste dynamique |
| `EXISTS (SELECT 1 ...)` | Tester l'existence d'une ligne liée |
| `NOT IN` / `NOT EXISTS` | Lignes sans correspondance — préférer `NOT EXISTS` si NULL possibles |

---

## CTE (Common Table Expressions)

```sql
WITH monthly_sales AS (
    SELECT DATE_TRUNC('month', order_date) AS month,
           SUM(amount) AS total
    FROM orders
    GROUP BY 1
),
ranked AS (
    SELECT month, total,
           RANK() OVER (ORDER BY total DESC) AS rnk
    FROM monthly_sales
)
SELECT month, total
FROM ranked
WHERE rnk <= 3;
```

| Règle | Rappel |
|---|---|
| Syntaxe | `WITH name AS (query), name2 AS (...)  SELECT ...` |
| Une CTE peut référencer une CTE précédente | Oui, dans l'ordre de déclaration |
| Remplace les sous-requêtes imbriquées | Pour la lisibilité ; pas toujours plus rapide |
| CTE récursive | `WITH RECURSIVE` — parcours d'arbre, séquences |

---

## Fonctions fenêtre (OVER)

```sql
SELECT
    order_id,
    category,
    amount,
    SUM(amount)   OVER (PARTITION BY category)              AS cat_total,
    ROW_NUMBER()  OVER (PARTITION BY category ORDER BY amount DESC) AS rn,
    SUM(amount)   OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) AS running_total
FROM orders;
```

### Fonctions disponibles

| Fonction | Effet |
|---|---|
| `ROW_NUMBER()` | Numéro unique par partition (1, 2, 3…) |
| `RANK()` | Même rang en cas d'égalité, saute ensuite (1, 1, 3…) |
| `DENSE_RANK()` | Même rang, pas de saut (1, 1, 2…) |
| `SUM / AVG / MIN / MAX` | Agrégat dans la fenêtre (cumul si `ORDER BY`) |
| `LAG(col, n)` | Valeur de la ligne n rangs avant |
| `LEAD(col, n)` | Valeur de la ligne n rangs après |
| `FIRST_VALUE(col)` | Première valeur de la partition |
| `NTILE(n)` | Découpage en n tranches égales |

### Recette top-N par groupe

```sql
WITH ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY amount DESC) AS rn
    FROM orders
)
SELECT order_id, category, amount
FROM ranked
WHERE rn <= 3;   -- top 3 per category
```

> **À retenir —** `WHERE` ne peut pas contenir de fonction fenêtre ; passe toujours par une CTE ou une sous-requête. `PARTITION BY` = les groupes ; `ORDER BY` dans `OVER` = rangs et cumuls.
