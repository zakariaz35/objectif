---
title: "pandas : groupby, agg, tri, merge, export"
type: lesson
---

# Agréger, fusionner, exporter avec pandas

C'est ici que pandas remplace tout ton code « group by à la main » par des expressions courtes.

```python
import pandas as pd
df = pd.read_csv("sales.csv")
# date, product, category, quantity, amount
```

## `groupby` : agréger par clé

Souviens-toi du `defaultdict` de tout à l'heure. Voici son équivalent :

```python
# Total revenue by category
df.groupby("category")["amount"].sum()
# category
# home      183.00
# office    164.93

# Number of sales per category
df.groupby("category").size()
```

## `agg` : plusieurs agrégats d'un coup

```python
df.groupby("category").agg(
    revenue=("amount", "sum"),
    orders=("amount", "count"),
    avg_order=("amount", "mean"),
)
#           revenue  orders  avg_order
# category
# home       183.00       2     91.500
# office     164.93       3     54.977
```

La syntaxe `nom_resultat=("colonne", "fonction")` est lisible et nomme directement les colonnes de sortie. Fonctions courantes : `"sum"`, `"mean"`, `"count"`, `"min"`, `"max"`, `"median"`, `"nunique"`.

## Trier les résultats

```python
df.sort_values("amount", ascending=False)          # the DataFrame, sorted by amount descending

# Top 3 products by revenue
(df.groupby("product")["amount"].sum()
   .sort_values(ascending=False)
   .head(3))
```

## Compter les valeurs : `value_counts`

L'équivalent direct de `Counter` :

```python
df["category"].value_counts()
# office    3
# home      2
```

## Fusionner deux tables : `merge`

Comme un `JOIN` SQL. Exemple : enrichir les ventes avec un libellé de catégorie.

```python
categories = pd.DataFrame([
    {"category": "office", "label": "Fournitures de bureau"},
    {"category": "home",   "label": "Maison"},
])

enriched = df.merge(categories, on="category", how="left")
# adds the "label" column to each sale
```

| `how` | Lignes conservées |
|---|---|
| `"inner"` | seulement les clés présentes des **deux** côtés (défaut) |
| `"left"` | toutes celles de **gauche** (le plus courant pour enrichir) |
| `"right"` | toutes celles de droite |
| `"outer"` | toutes, des deux côtés |

## Exporter le résultat

```python
summary = df.groupby("category").agg(revenue=("amount", "sum"))

summary.to_csv("summary.csv")               # export to CSV
summary.to_excel("summary.xlsx")            # export to Excel (requires openpyxl)
```

```mermaid
flowchart LR
    A[read_csv] --> B[filtres booléens]
    B --> C["groupby().agg()"]
    C --> D[sort_values]
    D --> E[to_csv / to_excel]
```

> **À retenir —** `groupby("clé").agg(nom=("col","fonction"))` est ton outil d'analyse n°1. `value_counts` compte, `sort_values` classe, `merge(on=, how=)` joint deux tables (souvent `how="left"` pour enrichir), `to_csv` exporte. Tu fais désormais en une ligne ce qui prenait dix.
