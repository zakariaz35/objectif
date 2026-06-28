---
title: "Questions fréquentes SQL & statistiques"
type: exercise
---

# Questions fréquentes SQL & statistiques

Un tour des questions qui reviennent le plus souvent en entretien Data-Analyst, avec les
réponses modèles attendues. Pour chaque question, réfléchis d'abord, puis déplie la
correction.

---

## SQL

### Q1 — Quelle est la différence entre `WHERE` et `HAVING` ?

<!--correction-->

`WHERE` filtre les **lignes individuelles avant** le `GROUP BY` ; `HAVING` filtre les
**groupes après** l'agrégation.

```sql
-- Only orders in 2024
SELECT region, SUM(quantity * unit_price) AS revenue
FROM orders
WHERE order_date >= '2024-01-01'   -- row-level filter
GROUP BY region
HAVING SUM(quantity * unit_price) > 1000;  -- group-level filter
```

> Retenir : **W** before, **H** after. Si la condition porte sur une fonction d'agrégation
> (`SUM`, `COUNT`, `AVG`…), c'est forcément `HAVING`.

---

### Q2 — Comment calculer un CA mensuel avec `GROUP BY` ?

<!--correction-->

On extrait le mois avec une fonction de date, puis on agrège.

```sql
-- Monthly revenue (SQLite syntax)
SELECT strftime('%Y-%m', order_date) AS month,
       ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS revenue
FROM orders
GROUP BY month
ORDER BY month;
```

En PostgreSQL/MySQL on utiliserait `DATE_TRUNC('month', order_date)` ou `DATE_FORMAT`.

> Le mot-clé : **granularité temporelle**. L'intervieweur voudra souvent que tu précises
> si tu pourrais adapter à semaine, trimestre, année — la structure du `GROUP BY` est la même.

---

### Q3 — `INNER JOIN` vs `LEFT JOIN` : quand choisir lequel ?

<!--correction-->

| | `INNER JOIN` | `LEFT JOIN` |
|---|---|---|
| Résultat | Seulement les lignes qui ont une correspondance des **deux côtés** | Toutes les lignes de la table **gauche**, même sans correspondance à droite (NULL) |
| Usage typique | Jointure produits/commandes quand tout produit est référencé | Repérer les clients **sans commande**, les produits **jamais vendus** |

```sql
-- Products sold (inner join → only matched rows)
SELECT p.name, SUM(o.quantity) AS units_sold
FROM orders o
INNER JOIN products p ON o.product_id = p.product_id
GROUP BY p.name;

-- Products never sold (left join + NULL filter)
SELECT p.name
FROM products p
LEFT JOIN orders o ON p.product_id = o.product_id
WHERE o.order_id IS NULL;
```

> L'intervieweur teste souvent « comment trouverais-tu les produits jamais commandés ? »
> La réponse modèle : `LEFT JOIN … WHERE o.order_id IS NULL`.

---

### Q4 — Qu'est-ce qu'une fonction fenêtre (`OVER`) et à quoi sert-elle ?

<!--correction-->

Une **fonction fenêtre** calcule une valeur **par rapport à un ensemble de lignes** (la
« fenêtre ») sans effondrer les lignes comme le ferait un `GROUP BY`. On garde ainsi toutes
les lignes tout en ajoutant un calcul cumulatif ou de rang.

```sql
-- Running total of revenue by date
SELECT order_date,
       quantity * unit_price AS line_revenue,
       SUM(quantity * unit_price) OVER (ORDER BY order_date) AS running_total
FROM orders;

-- Rank products by revenue within each category
SELECT product_id, category,
       SUM(quantity * unit_price) AS revenue,
       RANK() OVER (PARTITION BY category ORDER BY SUM(quantity * unit_price) DESC) AS rank_in_category
FROM orders
JOIN products USING (product_id)
GROUP BY product_id, category;
```

> Fonctions fenêtre les plus demandées : `ROW_NUMBER()`, `RANK()`, `SUM() OVER`,
> `LAG()` / `LEAD()` (pour comparer à la période précédente/suivante).

---

## Excel & statistiques

### Q5 — Quelle est la différence entre moyenne et médiane ? Quand utiliser laquelle ?

<!--correction-->

- **Moyenne** : somme ÷ effectif. Sensible aux **valeurs extrêmes** (outliers).
- **Médiane** : valeur centrale (50e percentile). **Robuste** aux outliers.

**Exemple concret** — salaires d'une équipe de 5 :
`20 000 | 22 000 | 23 000 | 24 000 | 150 000`

- Moyenne : 47 800 € → gonflée par le PDG.
- Médiane : 23 000 € → représente mieux la majorité.

> Règle pratique : si ta distribution est **asymétrique** (salaires, prix immobilier,
> délais de livraison), préfère la **médiane**. Si elle est symétrique, moyenne ≈ médiane.

---

### Q6 — Comment calcules-tu une évolution en pourcentage (MoM, YoY) ?

<!--correction-->

```
évolution % = (valeur_n - valeur_n-1) / valeur_n-1 × 100
```

En pratique :

```python
# Month-over-month growth with pandas
monthly["mom_growth_pct"] = monthly["revenue"].pct_change() * 100
monthly["mom_growth_pct"] = monthly["mom_growth_pct"].round(1)
```

En SQL on utilise `LAG` :

```sql
SELECT month, revenue,
       ROUND(
         100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
               / LAG(revenue) OVER (ORDER BY month),
         1
       ) AS mom_growth_pct
FROM monthly_revenue;
```

> Piège classique : **diviser par zéro** si le mois précédent vaut 0. Toujours protéger
> (`NULLIF` en SQL, `.replace(0, pd.NA)` en pandas).

---

### Q7 — Qu'est-ce qu'un écart-type et comment l'interpréter dans un contexte métier ?

<!--correction-->

L'écart-type mesure la **dispersion** des valeurs autour de la moyenne. Un écart-type
**élevé** signifie des données très éparpillées ; **faible** = les valeurs sont proches
de la moyenne.

**Exemple concret** — délais de livraison en jours :

| Transporteur | Moyenne | Écart-type |
|---|---|---|
| A | 3 j | 0,5 j | → fiable, très prévisible |
| B | 3 j | 4 j | → même moyenne, mais imprévisible |

> En entretien : « la moyenne seule ne suffit pas à évaluer la qualité de service ; il faut
> regarder aussi la **variabilité** ». C'est un signal fort que tu penses « distribution »
> et pas seulement « moyenne ».

---

> **À retenir** — En SQL : maîtrise `GROUP BY` / `HAVING`, `JOIN`, et au moins une
> fonction fenêtre (`SUM OVER`, `RANK`). En stats : moyenne vs médiane, écart-type,
> et toujours « comparé à quoi ? ». Ce sont les 80 % des questions techniques posées en
> entretien Data-Analyst junior.
