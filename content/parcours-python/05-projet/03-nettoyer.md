---
title: "Étape 2 — Nettoyer les données"
type: exercise
---

## Énoncé

À partir du DataFrame chargé, produis une version propre :

1. normalise `product` et `category` (sans espaces autour, en minuscules) ;
2. convertis `quantity` en entier ; remplace la valeur manquante par `1` (hypothèse : une commande sans quantité = 1 unité) ;
3. assure-toi que `amount` est bien un `float` ;
4. convertis `date` en vraie date et ajoute une colonne `month` (ex. `"2024-02"`).

> Écris le code, puis déroule la correction.

<!--correction-->

## Correction

```python
import pandas as pd

df = pd.read_csv("sales.csv")

# 1. Normalize text columns: strip spaces, lowercase.
df["product"] = df["product"].str.strip().str.lower()
df["category"] = df["category"].str.strip().str.lower()

# 2. quantity → integer, missing values filled with 1.
df["quantity"] = df["quantity"].fillna(1).astype(int)

# 3. amount → float (safe even if already numeric).
df["amount"] = df["amount"].astype(float)

# 4. Parse the date and derive a "YYYY-MM" month column.
df["date"] = pd.to_datetime(df["date"])
df["month"] = df["date"].dt.strftime("%Y-%m")

print(df.dtypes)
print(df["category"].value_counts())
# office    4
# home      4   → no more case duplicates
```

Points clés :

- **`.str.strip().str.lower()`** applique les méthodes de chaîne à toute la colonne (le `.str` est l'accesseur de chaîne d'une Series). Après ça, `Lamp` et `lamp` fusionnent.
- **`fillna(1)`** remplace les `NaN` avant la conversion ; `.astype(int)` échouerait sur un `NaN`.
- **`pd.to_datetime`** transforme la colonne texte en dates ; **`.dt.strftime("%Y-%m")`** en extrait le mois sous forme `"2024-01"`, parfait pour grouper.

> **À retenir —** le nettoyage suit le diagnostic : normaliser le texte (`.str`), combler les manquants (`fillna`), fixer les types (`astype`), enrichir (colonne `month`). Une donnée propre = des KPI fiables.
