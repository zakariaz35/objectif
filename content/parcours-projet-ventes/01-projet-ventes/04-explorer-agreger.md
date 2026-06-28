---
title: "Étape 3 — Explorer & agréger"
type: lesson
---

# Étape 3 — Explorer et agréger

Données propres en main, on répond aux premières questions de la responsable : **combien
on vend, et comment ça se répartit**. C'est le cœur du métier : agréger.

On travaille désormais sur le dataset **nettoyé** (6 lignes, sans doublon) :

| order_id | order_date | product_id | quantity | unit_price | discount | region |
|---|---|---|---|---|---|---|
| 1001 | 2024-01-05 | P01 | 2 | 20 | 0 | North |
| 1002 | 2024-01-18 | P02 | 1 | 50 | 0.10 | South |
| 1003 | 2024-02-02 | P03 | 3 | 12 | 0 | North |
| 1004 | 2024-02-20 | P01 | 1 | 20 | 0.05 | East |
| 1005 | 2024-03-11 | P04 | 5 | 8 | 0 | South |
| 1006 | 2024-03-29 | P02 | 2 | 50 | 0.20 | West |

Rappel de la formule du **revenu d'une ligne** :
`quantity * unit_price * (1 - discount)`.

## Les KPI qu'on veut

- **CA total** (chiffre d'affaires).
- **Panier moyen** (CA / nombre de commandes).
- **CA par catégorie** (besoin de la jointure produits → étape 4).
- **CA par mois** (tendance dans le temps).

## La version métier : SQL & pandas (repliée)

<details>
<summary><strong>Voir CA total & panier moyen</strong></summary>

```sql
-- Total revenue (line discount applied)
SELECT ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS total_revenue
FROM clean_orders;

-- Average basket = total revenue / number of orders
SELECT ROUND(SUM(quantity * unit_price * (1 - discount)) / COUNT(*), 2) AS avg_basket
FROM clean_orders;
```

```python
orders["line_revenue"] = orders["quantity"] * orders["unit_price"] * (1 - orders["discount"])
total_revenue = round(orders["line_revenue"].sum(), 2)
avg_basket = round(orders["line_revenue"].mean(), 2)
```

</details>

<details>
<summary><strong>Voir CA par mois</strong></summary>

```sql
SELECT strftime('%Y-%m', order_date) AS month,
       ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS revenue
FROM clean_orders
GROUP BY month
ORDER BY month;
```

```python
orders["month"] = orders["order_date"].str.slice(0, 7)
monthly = orders.groupby("month")["line_revenue"].sum().round(2)
```

</details>

> Le `GROUP BY month` en SQL et le `.groupby("month")` en pandas font **exactement** la
> même chose que la boucle d'accumulation que tu vas écrire en TS. Revois `parcours-sql`
> pour `GROUP BY` et `parcours-python` pour `groupby`.

## À toi : implémenter les agrégations en TS

Trois exercices interactifs suivent, du plus simple au plus complet :

1. `totalRevenue(orders)` — la somme des revenus de ligne.
2. `averageBasket(orders)` — le panier moyen.
3. `monthlyRevenue(orders)` — le CA groupé par mois (`YYYY-MM`).

> **À retenir** — Toute agrégation = **un accumulateur**. Somme : `reduce` vers un nombre.
> Group by : `reduce` vers un objet `{ clé: total }`. SQL, pandas et JS ne sont que trois
> dialectes de cette même idée.
