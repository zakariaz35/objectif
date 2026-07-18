---
title: "Cartes mémo — collections"
type: flashcards
cards:
  - q: |
      Comment obtenir les 3 derniers éléments d'une liste `data` ?
    a: |
      `data[-3:]` — le slicing avec un index négatif part de la fin.
  - q: |
      Quelle est la différence entre `liste.sort()` et `sorted(liste)` ?
    a: |
      `sort()` trie **en place** (modifie la liste, renvoie `None`).
      `sorted()` renvoie une **nouvelle** liste triée sans toucher l'original.
  - q: |
      Pourquoi préférer `sale.get("discount", 0.0)` à `sale["discount"]` ?
    a: |
      `[]` lève une `KeyError` si la clé est absente. `get(key, default)` renvoie
      la valeur par défaut sans planter — indispensable face à des données incomplètes.
  - q: |
      Écris une compréhension qui extrait la colonne `amount` des lignes
      de catégorie `"office"`.
    a: |
      ```python
      [row["amount"] for row in sales if row["category"] == "office"]
      ```
  - q: |
      Comment compter le nombre de catégories **distinctes** dans une liste
      `categories` ?
    a: |
      `len(set(categories))` — `set` supprime les doublons, `len` les compte.
  - q: |
      Comment trier une liste de dictionnaires `sales` par `amount` décroissant ?
    a: |
      ```python
      sorted(sales, key=lambda row: row["amount"], reverse=True)
      ```
---

Révise les réflexes « collections » avant de passer aux fonctions et fichiers.
