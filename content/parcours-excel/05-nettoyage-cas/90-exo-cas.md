---
title: "Exercice — du besoin métier à la solution"
type: exercise
---

## Énoncé

Tu disposes de deux tableaux structurés.

`Sales` : `order_id | order_date | region | category | product_id | quantity | amount`
`Employees` : `employee_id | name | department | hire_date | salary | manager_id`

Pour chaque question, indique **l'outil** (formule `*IFS`, recherche, ou TCD) et écris la
**formule** quand c'en est une.

1. Le nombre de commandes de catégorie `"Hardware"` passées en 2024.
2. La répartition du CA par `region` et par mois, qu'on doit pouvoir réarranger.
3. Le salaire moyen du département `"IT"`.
4. L'ancienneté (en années) de chaque employé, depuis `hire_date`.
5. Le nom du manager de chaque employé, à partir de `manager_id` (`"—"` si aucun).
6. Détecter les lignes de `Sales` au montant négatif (anomalie à surligner).

<!--correction-->

## Correction

**1. Chiffre ciblé, deux critères → `COUNTIFS`** (avec bornes de date) :

```
=COUNTIFS(Sales[category], "Hardware",
          Sales[order_date], ">=" & DATE(2024,1,1),
          Sales[order_date], "<=" & DATE(2024,12,31))
```

**2. Croiser deux dimensions et réarranger → TCD.** `region` en lignes, `order_date`
groupé par mois en colonnes, **Somme** d'`amount` en valeurs. Pas de formule : c'est
justement le rôle du TCD.

**3. Mesure agrégée selon un critère → `AVERAGEIFS`** :

```
=AVERAGEIFS(Employees[salary], Employees[department], "IT")
```

**4. Durée → `DATEDIF`** (colonne calculée) :

```
=DATEDIF([@hire_date], TODAY(), "Y")
```

**5. Valeur venue d'une autre ligne → recherche (auto-jointure)** :

```
=XLOOKUP([@manager_id], Employees[employee_id], Employees[name], "—")
```

**6. Détection d'anomalie → mise en forme conditionnelle** sur la règle :

```
=[@amount] < 0
```

Le réflexe clé : classer la question **avant** d'écrire quoi que ce soit. Un seul chiffre
sous conditions → `*IFS` ; une exploration multi-dimensions → TCD ; une valeur d'une autre
table → `XLOOKUP` / `INDEX+MATCH`.
