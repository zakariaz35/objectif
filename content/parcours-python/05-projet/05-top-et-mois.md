---
title: "Étape 4 — Top produits & CA par mois"
type: exercise
---

## Énoncé

Toujours sur le DataFrame nettoyé, produis deux analyses :

1. **Top produits** : le CA par `product`, classé du plus gros au plus petit.
2. **CA par mois** : le CA total par `month`, dans l'ordre chronologique.

> Écris le code, puis déroule la correction.

<!--correction-->

## Correction

### Top produits

```python
top_products = (
    df.groupby("product")["amount"]
      .sum()
      .sort_values(ascending=False)
)
print(top_products)
# product
# desk        298.00
# lamp        136.00
# notebook    139.93
# pen          37.50
```

Après tri décroissant :

```
desk        298.00
notebook    139.93
lamp        136.00
pen          37.50
```

`desk` domine (2 ventes à 149.00). On peut prendre le podium avec `.head(3)`.

### CA par mois

```python
revenue_by_month = (
    df.groupby("month")["amount"]
      .sum()
      .sort_index()           # months are "YYYY-MM" strings → chronological order
)
print(revenue_by_month)
# month
# 2024-01    247.98
# 2024-02    362.45
```

Détail : janvier = `39.98 + 34.00 + 25.00 + 149.00 = 247.98` ; février = `99.95 + 102.00 + 12.50 + 149.00 = 362.45`.

`sort_index()` ordonne par la clé de groupe (le mois) : comme le format `"YYYY-MM"` se trie alphabétiquement dans l'ordre chronologique, c'est exactement ce qu'on veut.

> **À retenir —** `groupby(col)["amount"].sum()` est le motif universel d'analyse. On le combine avec `sort_values` (classer par mesure, ex. top produits) ou `sort_index` (classer par clé, ex. ordre des mois).
