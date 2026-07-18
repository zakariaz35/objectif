---
title: "Exercice — transformer en compréhension"
type: exercise
---

## Énoncé

À partir du même jeu de ventes :

```python
sales = [
    {"product": "notebook", "category": "office", "amount": 19.99},
    {"product": "pen",      "category": "office", "amount": 2.50},
    {"product": "lamp",     "category": "home",   "amount": 34.00},
    {"product": "desk",     "category": "home",   "amount": 149.00},
]
```

Écris une fonction `amount_by_product(sales, min_amount)` qui renvoie un **dictionnaire** `{product: amount}` ne contenant que les produits dont le montant est **supérieur ou égal** à `min_amount`. Utilise une **compréhension de dictionnaire**.

Exemple :

```python
amount_by_product(sales, 20)
# {"lamp": 34.0, "desk": 149.0}
```

> Python ne s'exécute pas dans le navigateur : écris ta solution à la main, puis déroule la correction.

<!--correction-->

## Correction

```python
def amount_by_product(sales, min_amount):
    return {
        row["product"]: row["amount"]
        for row in sales
        if row["amount"] >= min_amount
    }
```

La compréhension de dictionnaire produit une paire `product: amount` pour chaque ligne, mais seulement si `row["amount"] >= min_amount`. Pour `min_amount = 20`, on garde `lamp` (34.0) et `desk` (149.0) ; `notebook` (19.99) et `pen` (2.50) sont écartés.

> **À retenir —** une compréhension de dictionnaire `{k: v for ... if ...}` filtre et transforme en une seule expression — exactement ce qu'on fera avec `pandas` plus tard, mais ici à la main pour bien comprendre le mécanisme.
