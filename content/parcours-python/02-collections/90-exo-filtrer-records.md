---
title: "Exercice — filtrer des enregistrements"
type: exercise
---

## Énoncé

On dispose d'un jeu de ventes (liste de dictionnaires) :

```python
sales = [
    {"product": "notebook", "category": "office", "amount": 19.99},
    {"product": "pen",      "category": "office", "amount": 2.50},
    {"product": "lamp",     "category": "home",   "amount": 34.00},
    {"product": "desk",     "category": "home",   "amount": 149.00},
    {"product": "stapler",  "category": "office", "amount": 8.00},
]
```

Écris une fonction `top_products(sales, category, n)` qui renvoie la liste des **noms de produits** (`product`) de la catégorie donnée, triés par **montant décroissant**, limitée aux `n` premiers.

Exemple :

```python
top_products(sales, "office", 2)
# ["notebook", "stapler"]
```

> Python ne s'exécute pas dans le navigateur : écris ta solution à la main, puis déroule la correction.

<!--correction-->

## Correction

```python
def top_products(sales, category, n):
    # 1. Keep only the rows of the requested category.
    filtered = [row for row in sales if row["category"] == category]

    # 2. Sort them by amount, highest first.
    ranked = sorted(filtered, key=lambda row: row["amount"], reverse=True)

    # 3. Take the top n, then extract the product names.
    return [row["product"] for row in ranked[:n]]
```

Trois étapes claires : **filtrer** (compréhension avec `if`), **trier** (`sorted` + `key` + `reverse=True`), puis **découper** (`[:n]`) et **extraire** la colonne `product`.

Pour `"office"` : on garde `notebook` (19.99), `pen` (2.50), `stapler` (8.00) ; triés → `notebook`, `stapler`, `pen` ; les 2 premiers → `["notebook", "stapler"]`.

Version condensée (même logique, en une expression) :

```python
def top_products(sales, category, n):
    ranked = sorted(
        (r for r in sales if r["category"] == category),
        key=lambda r: r["amount"],
        reverse=True,
    )
    return [r["product"] for r in ranked[:n]]
```
