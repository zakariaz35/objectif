---
title: "Modules & bibliothèque standard"
type: lesson
---

# Modules et bibliothèque standard

Un module est un fichier de code réutilisable. Python en fournit des centaines « dans la boîte » (la **bibliothèque standard**), et l'écosystème data en ajoute (`pandas`, `numpy`…).

## Importer un module

```python
import statistics

values = [10, 20, 30, 40]
print(statistics.mean(values))     # 25
print(statistics.median(values))   # 25.0
```

On accède aux fonctions par `module.fonction(...)`.

## Importer des noms précis

`from ... import ...` amène directement un nom dans ton espace, sans préfixe.

```python
from statistics import mean, median

mean([10, 20, 30])     # 20
```

## Donner un alias

Convention universelle en data : `pandas` devient `pd`, `numpy` devient `np`.

```python
import pandas as pd
import numpy as np
```

## Quelques modules standard utiles en data

| Module | Pour quoi faire |
|---|---|
| `csv` | lire/écrire des fichiers CSV |
| `statistics` | moyenne, médiane, écart-type |
| `collections` | `Counter`, `defaultdict` (comptage, regroupement) |
| `datetime` | manipuler des dates |
| `json` | lire/écrire du JSON |
| `math` | fonctions mathématiques |

## Aperçu : `Counter` et `defaultdict`

On les reverra à l'étape data — ils simplifient énormément les comptages et regroupements.

```python
from collections import Counter

categories = ["office", "home", "office", "garden", "office"]
counts = Counter(categories)
print(counts)                 # Counter({'office': 3, 'home': 1, 'garden': 1})
print(counts.most_common(1))  # [('office', 3)]
```

```python
from datetime import datetime

d = datetime.strptime("2024-03-15", "%Y-%m-%d")   # parse a date string
print(d.month)    # 3
print(d.year)     # 2024
```

> **À retenir —** `import module` (accès par `module.x`) ou `from module import x` (accès direct). En data, l'alias `import pandas as pd` est une convention à respecter. La bibliothèque standard (`csv`, `collections`, `datetime`, `statistics`) couvre déjà beaucoup avant même `pandas`.
