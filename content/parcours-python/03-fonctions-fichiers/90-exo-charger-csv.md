---
title: "Exercice — charger et résumer un CSV"
type: exercise
---

## Énoncé

Soit un fichier `sales.csv` :

```
date,product,category,quantity,amount
2024-01-05,notebook,office,2,39.98
2024-01-08,lamp,home,1,34.00
2024-01-12,pen,office,10,25.00
2024-01-20,desk,home,1,149.00
```

Écris une fonction `load_summary(path)` qui :

1. charge le fichier avec `csv.DictReader` ;
2. convertit `quantity` en `int` et `amount` en `float` ;
3. renvoie un dictionnaire de synthèse :

```python
{
    "rows": 4,                # number of rows
    "total_revenue": 247.98,  # sum of amount
    "total_quantity": 14,     # sum of quantity
}
```

> Python ne s'exécute pas dans le navigateur : écris ta solution à la main, puis déroule la correction.

<!--correction-->

## Correction

```python
import csv


def load_summary(path):
    with open(path, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    # Cast numeric columns: everything is read as text.
    for row in rows:
        row["quantity"] = int(row["quantity"])
        row["amount"] = float(row["amount"])

    return {
        "rows": len(rows),
        "total_revenue": sum(row["amount"] for row in rows),
        "total_quantity": sum(row["quantity"] for row in rows),
    }
```

On charge dans une liste de dicts, on convertit les colonnes numériques, puis on agrège avec `len`, `sum(...)` et des **expressions génératrices** (`sum(row["amount"] for row in rows)`) — concis et efficace.

Vérification : `39.98 + 34.00 + 25.00 + 149.00 = 247.98`, et `2 + 1 + 10 + 1 = 14`.

> **À retenir —** ce petit pipeline (lire → convertir → agréger) est *exactement* ce que `pandas` fera en deux lignes à l'étape suivante. Tu sauras alors ce qui se passe sous le capot.
