---
title: "Variables & types"
type: lesson
---

# Variables et types

En Python, une variable n'a pas besoin d'être déclarée : on l'affecte, et son type est déduit automatiquement.

```python
city = "Paris"        # str
population = 2148000   # int
density = 20754.5      # float
is_capital = True      # bool
```

Le type n'est pas figé à une variable : tu peux réaffecter une valeur d'un autre type (Python est **dynamiquement typé**). En analyse de données, on évite quand même de changer le sens d'une variable en cours de route — ça rend le code illisible.

## Les quatre types de base

| Type | Exemple | Usage en data |
|---|---|---|
| `int` | `42` | comptages, quantités |
| `float` | `19.99` | montants, mesures, moyennes |
| `str` | `"product"` | libellés, catégories, dates brutes |
| `bool` | `True` / `False` | filtres, indicateurs |

## Inspecter et convertir

```python
amount = "19.99"            # a string read from a CSV
print(type(amount))         # <class 'str'>

amount = float(amount)      # convert to a number
print(type(amount))         # <class 'float'>
print(amount * 2)           # 39.98
```

> **Crucial pour la data —** ce qui sort d'un fichier CSV est **toujours une chaîne**. Convertir au bon type (`int(...)`, `float(...)`) est l'une des toutes premières étapes de nettoyage.

## Opérateurs

```python
a, b = 7, 2
print(a + b)    # 9
print(a / b)    # 3.5   (division flottante)
print(a // b)   # 3     (integer division)
print(a % b)    # 1     (reste / modulo)
print(a ** b)   # 49    (puissance)
```

L'affectation multiple `a, b = 7, 2` est très idiomatique en Python — on la retrouvera partout (échange de valeurs, décomposition de tuples…).

## La valeur `None`

`None` représente l'absence de valeur (équivalent du `null` ailleurs). On le rencontre dès qu'une donnée manque.

```python
discount = None
if discount is None:
    discount = 0.0
```

> **À retenir —** un type par variable, et on **convertit** explicitement les chaînes du CSV en nombres avant de calculer. `None` se teste avec `is None`, jamais avec `==`.
