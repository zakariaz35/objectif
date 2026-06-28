---
title: "Exercice — analyse avec pandas"
type: exercise
---

## Énoncé

On charge un fichier `sales.csv` :

```
date,product,category,quantity,amount
2024-01-05,notebook,office,2,39.98
2024-01-08,lamp,home,1,34.00
2024-01-12,pen,office,10,25.00
2024-02-03,desk,home,1,149.00
2024-02-15,notebook,office,5,99.95
```

En **pandas**, écris une fonction `category_report(path)` qui :

1. charge le fichier avec `pd.read_csv` ;
2. renvoie un DataFrame avec, **par catégorie** : le CA total (`revenue`), le nombre de commandes (`orders`) et le panier moyen (`avg_order`) ;
3. trie ce rapport par `revenue` **décroissant**.

> Python ne s'exécute pas dans le navigateur : écris ta solution à la main, puis déroule la correction.

<!--correction-->

## Correction

```python
import pandas as pd


def category_report(path):
    df = pd.read_csv(path)

    report = df.groupby("category").agg(
        revenue=("amount", "sum"),
        orders=("amount", "count"),
        avg_order=("amount", "mean"),
    )

    return report.sort_values("revenue", ascending=False)
```

`read_csv` charge et type le fichier. `groupby("category").agg(...)` produit les trois mesures nommées en une expression. `sort_values("revenue", ascending=False)` classe les catégories.

Résultat (indexé par `category`) :

```
          revenue  orders  avg_order
category
office     164.93       3  54.976667
home       183.00       2  91.500000
```

Après tri par `revenue` décroissant, `home` (183.00) passe en tête, puis `office` (164.93).

> **À retenir —** la même analyse en Python pur t'aurait demandé un `defaultdict` de dicts et une boucle. pandas la condense en `read_csv` → `groupby().agg()` → `sort_values()`. C'est le quotidien du Data-Analyst.
