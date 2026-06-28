---
title: "Étape 1 — Charger et inspecter"
type: exercise
---

## Énoncé

Charge `sales.csv` dans un DataFrame pandas, puis inspecte-le : combien de lignes, quelles colonnes, quels types, et un aperçu des premières lignes. Repère déjà les problèmes (types inattendus, valeurs manquantes).

> Écris le code à la main, puis déroule la correction. (Copiable dans un notebook si tu veux le voir tourner.)

<!--correction-->

## Correction

```python
import pandas as pd

df = pd.read_csv("sales.csv")

print(df.shape)       # (8, 5)  → 8 rows, 5 columns
print(df.columns.tolist())
# ['date', 'product', 'category', 'quantity', 'amount']

print(df.head())
print(df.dtypes)
print(df.info())
```

Ce qu'on observe en lisant la sortie :

- **`quantity` n'est pas un entier propre** : à cause de l'espace dans ` 2 ` et de la valeur manquante (ligne `pen` de février), pandas a typé la colonne en `float` (ou `object`) et une valeur est `NaN`.
- **`product` et `category` ont une casse incohérente** : `Lamp`/`lamp`, `Home`/`home`. Tels quels, un `groupby` les compterait comme des valeurs différentes.
- **`date` est une chaîne** : il faudra la convertir pour extraire le mois.

```python
# Spot missing values column by column
print(df.isna().sum())
# quantity    1   → one missing quantity to handle
```

> **À retenir —** avant toute analyse, on **inspecte** : `shape`, `dtypes`, `head()`, `info()`, `isna().sum()`. C'est ce diagnostic qui dicte le plan de nettoyage de l'étape suivante.
