---
title: "Exercice — group by en Python pur"
type: exercise
---

## Énoncé

On dispose des ventes suivantes :

```python
sales = [
    {"product": "notebook", "category": "office", "amount": 39.98},
    {"product": "lamp",     "category": "home",   "amount": 34.00},
    {"product": "pen",      "category": "office", "amount": 25.00},
    {"product": "desk",     "category": "home",   "amount": 149.00},
    {"product": "notebook", "category": "office", "amount": 99.95},
]
```

Sans pandas, écris une fonction `revenue_by_category(sales)` qui renvoie un dictionnaire `{category: total_revenue}`, où le total est **arrondi à 2 décimales**.

Résultat attendu :

```python
revenue_by_category(sales)
# {"office": 164.93, "home": 183.0}
```

> Python ne s'exécute pas dans le navigateur : écris ta solution à la main, puis déroule la correction.

<!--correction-->

## Correction

```python
from collections import defaultdict


def revenue_by_category(sales):
    totals = defaultdict(float)
    for row in sales:
        totals[row["category"]] += row["amount"]

    # Round each total, return a plain dict.
    return {category: round(total, 2) for category, total in totals.items()}
```

On accumule le montant par catégorie avec un `defaultdict(float)` (initialisé à `0.0` automatiquement), puis on arrondit dans une compréhension de dictionnaire.

Vérification : office = `39.98 + 25.00 + 99.95 = 164.93` ; home = `34.00 + 149.00 = 183.00`.

Sans `defaultdict`, la version équivalente avec `get` :

```python
def revenue_by_category(sales):
    totals = {}
    for row in sales:
        c = row["category"]
        totals[c] = totals.get(c, 0.0) + row["amount"]
    return {c: round(t, 2) for c, t in totals.items()}
```

> **Le pont vers pandas —** ce que tu viens d'écrire en 4 lignes, pandas l'exprime ainsi :
> `df.groupby("category")["amount"].sum().round(2)`. Même opération, même résultat.
