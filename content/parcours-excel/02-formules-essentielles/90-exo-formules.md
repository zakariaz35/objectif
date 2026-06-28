---
title: "Exercice — écrire les bonnes formules"
type: exercise
---

## Énoncé

Tu as un tableau structuré `Sales` avec les colonnes :
`order_id | order_date | region | category | quantity | amount`,
et un tableau `Products` : `product_id | name | unit_price`.

Écris la **formule Excel** (références structurées) pour chaque besoin :

1. Le **CA total** de la région `"Sud"`.
2. Le **nombre de commandes** de catégorie `"Office"` dans la région `"Nord"`.
3. Le **panier moyen** (moyenne d'`amount`) de la catégorie `"Hardware"`.
4. Une colonne calculée qui vaut `"Grande"` si `amount >= 200`, sinon `"Petite"`.
5. Le **CA depuis le 1er février 2024**, la date étant saisie en cellule `G1`.
6. Une clé de regroupement **mensuelle** au format `"2024-01"` à partir d'`order_date`.

<!--correction-->

## Correction

```
// 1. Total revenue for the Sud region
=SUMIFS(Sales[amount], Sales[region], "Sud")

// 2. Number of Office orders in the Nord region
=COUNTIFS(Sales[category], "Office", Sales[region], "Nord")

// 3. Average order value for Hardware
=AVERAGEIFS(Sales[amount], Sales[category], "Hardware")

// 4. Size label (calculated column)
=IF([@amount] >= 200, "Grande", "Petite")

// 5. Revenue since a date entered in G1 (dynamic criterion)
=SUMIFS(Sales[amount], Sales[order_date], ">=" & G1)

// 6. Sortable monthly key "YYYY-MM"
=YEAR([@order_date]) & "-" & TEXT(MONTH([@order_date]), "00")
```

Points clés :

- Dans `SUMIFS`/`AVERAGEIFS`, la colonne à agréger vient **en premier** ; chaque critère
  est une paire `(colonne, valeur)`.
- Pour un critère comparatif dynamique, on **colle** l'opérateur à la cellule avec `&` :
  `">=" & G1`.
- Le format `"00"` garantit deux chiffres sur le mois, ce qui rend la clé triable.
