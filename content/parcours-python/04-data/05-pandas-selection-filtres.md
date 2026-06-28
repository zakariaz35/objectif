---
title: "pandas : sélection & filtres booléens"
type: lesson
---

# Sélectionner et filtrer dans un DataFrame

On part d'un DataFrame chargé :

```python
import pandas as pd
df = pd.read_csv("sales.csv")
# columns: date, product, category, quantity, amount
```

## Sélectionner des colonnes

```python
df["amount"]                 # one column → a Series
df[["product", "amount"]]    # multiple columns → a DataFrame
```

> Attention : `df["amount"]` (une chaîne) renvoie une **Series** ; `df[["amount"]]` (une liste) renvoie un **DataFrame** à une colonne.

## Sélectionner des lignes : `loc` et `iloc`

- **`iloc`** : par **position** (comme l'indexation de liste).
- **`loc`** : par **label** d'index (et c'est `loc` qu'on utilise avec des conditions).

```python
df.iloc[0]            # first row (by position)
df.iloc[0:3]          # first 3 rows
df.iloc[0, 1]         # row 0, column 1

df.loc[0]             # row whose index equals 0
df.loc[0, "product"]  # value at row 0, column "product"
```

## Filtres booléens — le cœur de l'analyse

Une condition sur une colonne produit une **Series de booléens** ; on l'utilise pour ne garder que les lignes vraies. C'est l'équivalent du `WHERE` SQL.

```python
df["amount"] > 50            # Series of True/False

df[df["amount"] > 50]        # rows where amount > 50
df[df["category"] == "home"] # rows in the home category
```

### Combiner des conditions

Avec pandas : `&` (et), `|` (ou), `~` (non) — **et des parenthèses obligatoires** autour de chaque condition.

```python
# office AND amount >= 30
df[(df["category"] == "office") & (df["amount"] >= 30)]

# home OR amount > 100
df[(df["category"] == "home") | (df["amount"] > 100)]
```

### `isin` et `between` (raccourcis pratiques)

```python
df[df["category"].isin(["home", "garden"])]    # category in a list
df[df["amount"].between(20, 50)]               # amount between 20 and 50 (inclusive)
```

## Sélectionner colonnes + lignes ensemble

```python
# Products and amounts for "office" sales
df.loc[df["category"] == "office", ["product", "amount"]]
```

## Créer / modifier une colonne

Une nouvelle colonne se calcule de façon vectorisée, sans boucle :

```python
df["unit_price"] = df["amount"] / df["quantity"]
df["is_big"] = df["amount"] > 100
```

> **À retenir —** `df["col"]` pour une colonne, `df[df["col"] > x]` pour filtrer (masque booléen = `WHERE`). Conditions multiples : `&` / `|` / `~` avec des **parenthèses**. `loc` (labels/conditions) vs `iloc` (positions). Une nouvelle colonne se calcule en une expression vectorisée.
