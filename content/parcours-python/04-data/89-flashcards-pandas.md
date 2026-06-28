---
title: "Cartes mémo — pandas"
type: flashcards
cards:
  - q: |
      Quelle est la convention d'import de pandas ?
    a: |
      `import pandas as pd`
  - q: |
      Quelle différence entre `df["amount"]` et `df[["amount"]]` ?
    a: |
      `df["amount"]` (chaîne) renvoie une **Series** (une colonne).
      `df[["amount"]]` (liste) renvoie un **DataFrame** à une colonne.
  - q: |
      Comment garder les lignes où `category == "home"` ET `amount > 50` ?
    a: |
      ```python
      df[(df["category"] == "home") & (df["amount"] > 50)]
      ```
      Opérateurs `&` / `|` / `~` et **parenthèses obligatoires** autour de chaque condition.
  - q: |
      `loc` vs `iloc` ?
    a: |
      `iloc` sélectionne par **position** (entier). `loc` sélectionne par **label**
      d'index — et c'est `loc` qu'on utilise avec des conditions booléennes.
  - q: |
      Écris le CA total et le nombre de commandes par catégorie.
    a: |
      ```python
      df.groupby("category").agg(
          revenue=("amount", "sum"),
          orders=("amount", "count"),
      )
      ```
  - q: |
      Quel est l'équivalent pandas de `Counter` pour compter les valeurs d'une colonne ?
    a: |
      `df["category"].value_counts()`
  - q: |
      Comment joindre un DataFrame `df` avec `categories` sur la colonne `category`,
      en gardant toutes les lignes de `df` ?
    a: |
      ```python
      df.merge(categories, on="category", how="left")
      ```
---

Les réflexes pandas indispensables d'un Data-Analyst.
