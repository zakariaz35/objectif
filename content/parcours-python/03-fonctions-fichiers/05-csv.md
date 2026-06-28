---
title: "Lire un CSV avec le module csv"
type: lesson
---

# Lire un CSV proprement

Le CSV est *le* format d'arrivée des données en BI. Le module `csv` de la bibliothèque standard le lit correctement, en gérant les guillemets, les virgules dans les valeurs, etc.

Prenons un fichier `sales.csv` :

```
date,product,category,quantity,amount
2024-01-05,notebook,office,2,39.98
2024-01-08,lamp,home,1,34.00
2024-01-12,pen,office,10,25.00
```

## `csv.reader` : chaque ligne devient une liste

```python
import csv

with open("sales.csv", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)        # consumes the 1st row: the column names
    for row in reader:
        print(row)               # ['2024-01-05', 'notebook', 'office', '2', '39.98']
```

Inconvénient : on doit accéder aux colonnes par **index** (`row[1]`), ce qui est illisible et fragile.

## `csv.DictReader` : chaque ligne devient un dictionnaire 

C'est **la** façon recommandée : la première ligne sert d'en-tête, et chaque ligne devient un `dict {colonne: valeur}`.

```python
import csv

with open("sales.csv", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = list(reader)        # materialises the list of dicts

print(rows[0])
# {'date': '2024-01-05', 'product': 'notebook', 'category': 'office',
#  'quantity': '2', 'amount': '39.98'}
```

On retrouve exactement notre **liste de dictionnaires** des étapes précédentes.

## Convertir les types (étape de nettoyage)

Tout est lu en **chaîne**. Avant tout calcul, on convertit les colonnes numériques.

```python
import csv

with open("sales.csv", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

for row in rows:
    row["quantity"] = int(row["quantity"])
    row["amount"] = float(row["amount"])

total = sum(row["amount"] for row in rows)
print(f"Total revenue: {total:,.2f} €")    # Total revenue: 98.98 €
```

## Écrire un CSV avec `DictWriter`

```python
import csv

summary = [
    {"category": "office", "revenue": 64.98},
    {"category": "home",   "revenue": 34.00},
]

with open("summary.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["category", "revenue"])
    writer.writeheader()
    writer.writerows(summary)
```

> **À retenir —** `csv.DictReader` transforme un CSV en liste de dictionnaires (clé = nom de colonne) — la structure idéale. **Pense à convertir** les colonnes numériques (`int`, `float`) juste après la lecture. À l'écriture, `DictWriter` + `newline=""`.
