---
title: "Étape 2 — Nettoyer les données"
type: lesson
---

# Étape 2 — Nettoyer le jeu de données

Les vraies données sont **sales**. Avant toute analyse, on inspecte et on corrige —
sinon les KPI sont faux. Voici les `orders` tels qu'on les reçoit, avec des **saletés
volontaires** (en gras les problèmes) :

| order_id | order_date | customer_id | product_id | quantity | unit_price | discount | region |
|---|---|---|---|---|---|---|---|
| 1001 | 2024-01-05 | C001 | P01 | 2 | 20 | 0 | North |
| 1002 | **18/01/2024** | C002 | P02 | 1 | 50 | 0.10 | South |
| 1003 | 2024-02-02 | C001 | P03 | 3 | 12 | 0 | **north** |
| 1004 | 2024-02-20 | C003 | P01 | 1 | 20 | 0.05 | East |
| 1005 | **2024/3/11** | C002 | P04 | 5 | 8 | 0 | South |
| 1006 | 2024-03-29 | C004 | P02 | 2 | 50 | 0.20 | West |
| **1006** | **2024-03-29** | **C004** | **P02** | **2** | **50** | **0.20** | **West** |
| 1007 | 2024-03-30 | C005 | P03 | 1 | 12 | **(vide)** | East |

## Les 4 problèmes à corriger

1. **Dates en formats mêlés** : `18/01/2024` et `2024/3/11` au lieu de `YYYY-MM-DD`.
2. **Doublon** : la ligne `1006` apparaît deux fois.
3. **Valeur manquante** : `discount` vide sur `1007` → devrait valoir `0`.
4. **Libellé incohérent** : `north` (minuscule) vs `North`.

## La version métier : pandas (reqlié)

C'est ce que tu ferais dans un notebook. Voir le détail dans `parcours-python` (module
pandas) — ici, la recette condensée.

<details>
<summary><strong>Voir le nettoyage en pandas</strong></summary>

```python
import pandas as pd

orders = pd.read_csv("orders.csv")

# 1. Parse mixed date formats into a real datetime, then a clean ISO string
orders["order_date"] = pd.to_datetime(orders["order_date"], format="mixed", dayfirst=True)
orders["order_date"] = orders["order_date"].dt.strftime("%Y-%m-%d")

# 2. Drop exact duplicate rows
orders = orders.drop_duplicates()

# 3. Fill missing discount with 0
orders["discount"] = orders["discount"].fillna(0)

# 4. Normalize region labels (trim + title case)
orders["region"] = orders["region"].str.strip().str.title()
```

</details>

## La même idée en SQL (replié)

En base, on nettoie souvent à la lecture ou dans une vue (voir `parcours-sql`).

<details>
<summary><strong>Voir une vue de nettoyage en SQL</strong></summary>

```sql
CREATE VIEW clean_orders AS
SELECT DISTINCT
    order_id,
    order_date,                       -- already stored as DATE here
    customer_id,
    product_id,
    quantity,
    unit_price,
    COALESCE(discount, 0) AS discount,
    INITCAP(TRIM(region))  AS region
FROM orders;
```

`DISTINCT` retire les doublons, `COALESCE` remplace les `NULL`, `INITCAP`/`TRIM`
normalisent le libellé de région.

</details>

## Pourquoi chaque anomalie compte

Prenons le cas concret :
- Le doublon de la ligne `1006` représente **80 € de CA fictif** (+31 % sur la période).
- La région `north` au lieu de `North` créerait deux groupes distincts dans le `GROUP BY`
  alors que c'est la même zone : on perdrait la vision régionale correcte.
- Un `discount` manquant traité comme `0` peut surestimer le revenu réel d'une ligne.
- Une date mal parsée décale la ligne dans le mauvais mois, faussant la courbe mensuelle.

> **Règle d'or** — Documente toujours les corrections appliquées (combien de doublons
> supprimés, combien de valeurs imputées). Un rapport de nettoyage fait partie du livrable.

## À toi : normaliser une ligne en TypeScript

Maintenant, tu implémentes la logique. C'est l'exercice **interactif** ci-après. Tu vas
écrire `normalizeRegion` et `cleanDiscount` — les deux corrections les plus simples — pour
**ressentir** ce que `str.title()` et `fillna(0)` font réellement.

> **À retenir** — Le nettoyage n'est pas optionnel : un doublon gonfle le CA, une date mal
> parsée casse l'analyse mensuelle, un libellé incohérent éclate un « North » en deux. On
> nettoie **avant** d'agréger, et on documente ce qu'on a corrigé. Une donnée propre vaut
> mieux qu'un algorithme complexe sur des données sales.
