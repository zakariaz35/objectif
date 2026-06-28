---
title: "Étape 5 — Conclure & exporter"
type: exercise
---

## Énoncé

Rassemble l'analyse en un **script complet** : du chargement à un petit rapport texte, et exporte une synthèse par catégorie dans `category_summary.csv`. Termine par 2-3 phrases d'**interprétation** business.

> Écris le script, puis déroule la correction.

<!--correction-->

## Correction

```python
import pandas as pd

# 1. Load
df = pd.read_csv("sales.csv")

# 2. Clean
df["product"] = df["product"].str.strip().str.lower()
df["category"] = df["category"].str.strip().str.lower()
df["quantity"] = df["quantity"].fillna(1).astype(int)
df["amount"] = df["amount"].astype(float)
df["date"] = pd.to_datetime(df["date"])
df["month"] = df["date"].dt.strftime("%Y-%m")

# 3. KPIs
total_revenue = df["amount"].sum()
order_count = len(df)
average_order = total_revenue / order_count

# 4. Breakdowns
top_products = df.groupby("product")["amount"].sum().sort_values(ascending=False)
revenue_by_month = df.groupby("month")["amount"].sum().sort_index()
by_category = df.groupby("category").agg(
    revenue=("amount", "sum"),
    orders=("amount", "count"),
)

# 5. Report
print("=== SALES REPORT ===")
print(f"Total revenue : {total_revenue:,.2f} €")
print(f"Orders        : {order_count}")
print(f"Average order : {average_order:,.2f} €")
print(f"Best product  : {top_products.index[0]} ({top_products.iloc[0]:,.2f} €)")
print(f"Best month    : {revenue_by_month.idxmax()} ({revenue_by_month.max():,.2f} €)")

# 6. Export
by_category.to_csv("category_summary.csv")
```

Sortie :

```
=== SALES REPORT ===
Total revenue : 610.43 €
Orders        : 8
Average order : 76.30 €
Best product  : desk (298.00 €)
Best month    : 2024-02 (362.45 €)
```

### Interprétation (le rôle de l'analyste)

> Sur les deux mois, le CA atteint **610 €** pour **8 commandes** (panier moyen **76 €**).
> Le mois de **février** progresse nettement (+46 % vs janvier), porté par les rachats
> de `desk` et `lamp`. Le produit **`desk`** concentre près de **la moitié du CA** à lui
> seul (298 €) : une dépendance à surveiller. Recommandation : sécuriser le stock de
> `desk` et tester une montée en gamme sur `lamp`, déjà en croissance.

> **À retenir —** un livrable d'analyse, ce n'est pas du code : c'est un **rapport** + un **export** + une **interprétation**. `idxmax()` donne la clé du maximum (le meilleur mois), `index[0]`/`iloc[0]` le premier élément d'un classement. Les chiffres ne valent que par la décision qu'ils éclairent.
