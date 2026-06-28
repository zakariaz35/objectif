---
title: "Compréhensions & tri"
type: lesson
---

# Compréhensions et tri

Deux outils qui rendent le code data **concis** et **lisible**. À maîtriser absolument : on les utilise en permanence.

## Compréhension de liste

L'équivalent de `filter` + `map` en une seule expression. Lis-la « de gauche à droite » : « *l'expression*, pour chaque élément, si *condition* ».

```python
amounts = [19.99, 2.50, 34.00, 12.00]

# Transform: apply 20% VAT
with_tax = [a * 1.2 for a in amounts]
# [23.988, 3.0, 40.8, 14.4]

# Filter: keep amounts >= 15
big = [a for a in amounts if a >= 15]
# [19.99, 34.0]

# Transform AND filter
big_with_tax = [a * 1.2 for a in amounts if a >= 15]
# [23.988, 40.8]
```

### Sur une liste de dictionnaires

C'est là qu'elles brillent — extraire une colonne, filtrer des lignes :

```python
sales = [
    {"product": "notebook", "category": "office", "amount": 19.99},
    {"product": "pen",      "category": "office", "amount": 2.50},
    {"product": "lamp",     "category": "home",   "amount": 34.00},
]

# Extract a "column"
products = [row["product"] for row in sales]
# ["notebook", "pen", "lamp"]

# Filter rows
office = [row for row in sales if row["category"] == "office"]
# the first two rows
```

## Compréhension de dictionnaire

Même principe, mais on produit des paires `clé: valeur`.

```python
# product -> amount
price_by_product = {row["product"]: row["amount"] for row in sales}
# {"notebook": 19.99, "pen": 2.5, "lamp": 34.0}

# With a filter
expensive = {p: a for p, a in price_by_product.items() if a >= 15}
# {"notebook": 19.99, "lamp": 34.0}
```

## Trier avec `sorted` et `key=`

`sorted` renvoie une **nouvelle** liste triée (sans modifier l'original).

```python
sorted([3, 1, 2])              # [1, 2, 3]
sorted([3, 1, 2], reverse=True) # [3, 2, 1]
```

Le paramètre `key=` indique **sur quoi** trier — essentiel pour des dictionnaires. On lui passe une fonction qui, pour chaque élément, renvoie la valeur de tri.

```python
# Sort sales by amount, highest first
by_amount = sorted(sales, key=lambda row: row["amount"], reverse=True)
# lamp (34.0), notebook (19.99), pen (2.5)

# Top 2
top2 = by_amount[:2]
```

`lambda row: row["amount"]` est une petite fonction anonyme : « pour une ligne, prends son montant ».

> **À retenir —** la compréhension `[expr for x in coll if cond]` remplace `filter`+`map` de façon lisible. `sorted(data, key=lambda r: r["col"], reverse=True)` est ton outil de tri/classement (ex. top produits). Toutes deux renvoient du **neuf** sans modifier la source.
