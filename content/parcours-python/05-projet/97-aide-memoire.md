---
title: "Aide-mémoire pandas (+ bases Python utiles)"
type: lesson
---

# Aide-mémoire pandas — référence rapide

Une page à garder ouverte. Blocs Python exécutables dans le navigateur (Pyodide).

---

## Bases Python utiles pour l'analyse

| Syntaxe | Effet |
|---|---|
| `type(x)` | Type de la variable |
| `len(lst)` | Longueur d'une liste / chaîne |
| `[x for x in lst if cond]` | List comprehension filtrée |
| `{k: v for k, v in d.items()}` | Dict comprehension |
| `sorted(lst, key=lambda x: x[1], reverse=True)` | Tri personnalisé décroissant |
| `str.strip()` / `str.lower()` / `str.split(",")` | Nettoyage de chaînes |
| `f"{val:.2f}"` | F-string formatée 2 décimales |
| `round(x, 2)` | Arrondi |
| `int(x)` / `float(x)` / `str(x)` | Conversion de type |

---

## Charger des données

```python
import pandas as pd

df = pd.read_csv("sales.csv")                        # default separator: comma
df = pd.read_csv("sales.csv", sep=";", encoding="utf-8")
df = pd.read_csv("sales.csv", parse_dates=["order_date"])  # auto-parse dates
df = pd.read_excel("sales.xlsx", sheet_name="Sheet1")
```

### Exploration rapide

```python
df.shape          # (rows, columns)
df.dtypes         # column types
df.head(5)        # first 5 rows
df.tail(3)        # last 3 rows
df.info()         # dtypes + non-null counts
df.describe()     # numeric stats (count/mean/std/min/quartiles/max)
df.isnull().sum() # missing values per column
df.columns.tolist()
```

---

## Sélection : colonnes et lignes

| Syntaxe | Effet |
|---|---|
| `df["col"]` | Une colonne → Series |
| `df[["col1", "col2"]]` | Plusieurs colonnes → DataFrame |
| `df.iloc[0]` | Première ligne (par position) |
| `df.iloc[0:5]` | 5 premières lignes |
| `df.iloc[2, 3]` | Ligne 2, colonne 3 (par position) |
| `df.loc[idx]` | Ligne dont l'index vaut `idx` |
| `df.loc[idx, "col"]` | Valeur précise (index + nom de colonne) |
| `df.loc[:, "col1":"col3"]` | Plage de colonnes par nom |

```python
# Sélectionner lignes + colonnes en une fois
df.loc[df["category"] == "office", ["product", "amount"]]
```

---

## Filtres booléens

```python
df[df["amount"] > 100]                              # single condition
df[df["category"] == "home"]                        # equality
df[(df["category"] == "office") & (df["amount"] >= 30)]  # AND
df[(df["category"] == "home") | (df["amount"] > 200)]    # OR
df[~(df["category"] == "home")]                     # NOT

df[df["category"].isin(["home", "garden"])]         # equivalent to IN
df[df["amount"].between(20, 50)]                    # inclusive range
df[df["name"].str.contains("Paris", na=False)]      # substring match
df[df["date"].notna()]                              # exclude NaN
```

> Toujours mettre des **parenthèses** autour de chaque condition quand on combine avec `&` ou `|`.

---

## Créer / modifier des colonnes

```python
df["unit_price"] = df["amount"] / df["quantity"]   # vectorized operation
df["is_big"] = df["amount"] > 100                  # boolean column
df["label"] = df["category"].str.upper()           # string method
df["year"] = df["order_date"].dt.year              # extract from datetime
df["month"] = df["order_date"].dt.to_period("M")

df["category"] = df["category"].fillna("unknown")  # fill missing
df["amount"] = df["amount"].astype(float)          # cast type
```

---

## groupby / agg

```python
# Simple aggregation
df.groupby("category")["amount"].sum()
df.groupby("category")["amount"].agg(["sum", "mean", "count"])

# Multiple columns, named results
df.groupby("category").agg(
    total=("amount", "sum"),
    avg=("amount", "mean"),
    nb=("order_id", "count"),
).reset_index()

# Multiple grouping keys
df.groupby(["region", "category"])["amount"].sum().reset_index()
```

| Agrégat | Effet |
|---|---|
| `"sum"` | Somme |
| `"mean"` | Moyenne |
| `"count"` | Nombre de valeurs non-NULL |
| `"size"` | Nombre de lignes (inclut NULL) |
| `"min"` / `"max"` | Minimum / maximum |
| `"nunique"` | Nombre de valeurs distinctes |
| `"first"` / `"last"` | Première / dernière valeur du groupe |

---

## merge (jointures)

```python
# INNER join
result = pd.merge(df_orders, df_customers, on="customer_id")

# LEFT join
result = pd.merge(df_orders, df_customers, on="customer_id", how="left")

# Colonnes de jointure différentes dans chaque table
result = pd.merge(df_orders, df_customers,
                  left_on="cust_id", right_on="id", how="inner")
```

| `how=` | Lignes retournées |
|---|---|
| `"inner"` | Correspondances uniquement (défaut) |
| `"left"` | Toutes les lignes de gauche + NaN si absent à droite |
| `"right"` | Toutes les lignes de droite |
| `"outer"` | Toutes les lignes des deux tables |

---

## Tri

```python
df.sort_values("amount", ascending=False)             # descending
df.sort_values(["region", "amount"], ascending=[True, False])  # multi-key
df.nlargest(5, "amount")   # top 5 (plus rapide que sort + head)
df.nsmallest(5, "amount")  # bottom 5
```

---

## Export

```python
df.to_csv("output.csv", index=False)                # no row index
df.to_csv("output.csv", sep=";", encoding="utf-8-sig")  # Excel-friendly
df.to_excel("output.xlsx", index=False, sheet_name="Results")
```

---

## Nettoyage express

```python
df.dropna()                              # drop rows with any NaN
df.dropna(subset=["amount", "date"])     # drop only if these cols are NaN
df.fillna(0)                             # replace all NaN with 0
df.fillna({"amount": 0, "note": "?"})   # per-column fill
df.drop_duplicates()                     # keep first occurrence
df.drop_duplicates(subset=["order_id"]) # deduplicate on one key
df.rename(columns={"old": "new"})       # rename columns
df.drop(columns=["useless_col"])        # remove a column
df["col"] = df["col"].str.strip().str.lower()  # clean strings
```

> **À retenir —** `read_csv` → `head/info/describe` → filtre booléen (`df[masque]`) → `groupby().agg()` → `merge()` → `sort_values()` → `to_csv()`. C'est le pipeline standard de 80 % des analyses.
