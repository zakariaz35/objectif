---
title: "Exercice — agréger par catégorie (Python, interactif)"
type: exercise
exercise:
  language: python
  starter: |
    # rows: a list of dicts, each with keys "category" and "amount".
    # Return a dict {category: total_amount}, summing the amounts per category.
    def revenue_by_category(rows):
        # TODO: implement
        return {}
  tests:
    - name: "agrège par catégorie"
      code: |
        rows = [
            {"category": "office", "amount": 10},
            {"category": "home", "amount": 20},
            {"category": "office", "amount": 5},
        ]
        got = revenue_by_category(rows)
        print("got:", got)
        assert_equal(got, {"office": 15, "home": 20}, "office=15, home=20")
    - name: "liste vide → dict vide"
      code: |
        assert_equal(revenue_by_category([]), {}, "no rows -> empty dict")
    - name: "une seule catégorie"
      code: |
        rows = [{"category": "tech", "amount": 7}, {"category": "tech", "amount": 3}]
        assert_equal(revenue_by_category(rows), {"tech": 10}, "tech=10")
---

## Énoncé

Premier exercice **Python exécuté dans le navigateur** ! On te donne une liste
d'enregistrements `{"category": ..., "amount": ...}` (la brique de base d'un jeu de
données). Écris `revenue_by_category(rows)` qui renvoie un dictionnaire
`{catégorie: somme des montants}`.

Indice : pars d'un dictionnaire vide et accumule avec `dict.get(key, 0)`.

> Aide-mémoire des tests : `assert_equal(obtenu, attendu, message)` compare, `print(...)`
> illustre (sa sortie s'affiche sous le test). Clique **« Lancer les tests »**.

<!--correction-->

## Correction

```python
def revenue_by_category(rows):
    totals = {}
    for row in rows:
        category = row["category"]
        totals[category] = totals.get(category, 0) + row["amount"]
    return totals
```

On parcourt les lignes une à une. `totals.get(category, 0)` renvoie le total courant de la
catégorie (ou `0` si elle n'a jamais été vue), auquel on ajoute le montant de la ligne.
C'est exactement un **GROUP BY … SUM** « à la main » — et avec `pandas`, ce serait
`df.groupby("category")["amount"].sum()`.
