---
title: "Agréger sous condition : la famille *IFS"
type: lesson
---

# Le cœur du calcul : SUMIFS, COUNTIFS, AVERAGEIFS

On travaille sur le tableau `Sales` :
`order_id | order_date | region | category | quantity | amount`.

La famille `*IFS` répond à la question la plus fréquente de l'analyste : « agréger
**selon des critères** ».

```
// Total revenue for the Nord region
=SUMIFS(Sales[amount], Sales[region], "Nord")

// Revenue for the Office category in the Nord region
=SUMIFS(Sales[amount], Sales[region], "Nord", Sales[category], "Office")

// Number of orders from the Sud region
=COUNTIFS(Sales[region], "Sud")

// Average order value for the Hardware category
=AVERAGEIFS(Sales[amount], Sales[category], "Hardware")
```

> **Ordre des arguments —** dans `SUMIFS`, la colonne à **sommer** vient en premier, puis
> les paires `(colonne critère, critère)`. C'est l'inverse de l'ancien `SUMIF`. Prends
> l'habitude de **toujours** utiliser `SUMIFS` : un seul réflexe, des critères multiples.

## Des critères plus riches

Les critères ne sont pas que des égalités. On peut comparer, et même faire référence à une
cellule :

```
// Orders with amount exceeding 200
=COUNTIFS(Sales[amount], ">200")

// Revenue since a date entered in cell G1
=SUMIFS(Sales[amount], Sales[order_date], ">=" & G1)

// Revenue for a region entered in G2 (dynamic criterion)
=SUMIFS(Sales[amount], Sales[region], G2)
```

Le `&` colle l'opérateur (`">="`) à la valeur de la cellule : c'est ce qui rend un
tableau de bord **interactif** sans toucher aux formules.

## SUMPRODUCT, quand *IFS ne suffit plus

Pour sommer un **produit** sous condition (ex. chiffre d'affaires = quantité × prix), on
utilise `SUMPRODUCT` :

```
// Recalculated revenue = sum of quantity * unit_price, for the Nord region only
=SUMPRODUCT((Sales[region]="Nord") * Sales[quantity] * Sales[unit_price])
```

Chaque `(condition)` vaut `1` ou `0` ; multipliée aux colonnes, elle filtre la somme.

## Cas d'usage métier supplémentaires

**Finance — budget vs réalisé par centre de coût :**

```
// Budget consumed by cost center "MKT" for month 3
=SUMIFS(Budget[consumed], Budget[cost_center], "MKT", Budget[month], 3)

// Variance: consumed - planned
=SUMIFS(Budget[consumed], Budget[cost_center], "MKT", Budget[month], 3)
 - SUMIFS(Budget[planned], Budget[cost_center], "MKT", Budget[month], 3)
```

**Logistique — commandes en retard :**

```
// Number of deliveries where actual_date > promised_date (late orders)
=COUNTIFS(Deliveries[actual_date], ">" & TODAY(),
          Deliveries[promised_date], "<" & TODAY())
```

**Achat — total fournisseur sur une plage de dates :**

```
// Total purchase amount from supplier "Acme" between two dates (D1 and D2)
=SUMIFS(Purchases[amount],
        Purchases[supplier], "Acme",
        Purchases[order_date], ">=" & D1,
        Purchases[order_date], "<=" & D2)
```

> **Piège —** `AVERAGEIFS` renvoie `#DIV/0!` si aucune ligne ne correspond aux critères.
> Protège avec `IFERROR(AVERAGEIFS(...), 0)` dans un tableau de bord.

> **À retenir —** `SUMIFS` / `COUNTIFS` / `AVERAGEIFS` couvrent l'essentiel des calculs
> conditionnels. Garde `SUMPRODUCT` pour les sommes de produits filtrés. Toujours vérifier
> qu'un critère sur une date est collé avec `&`, jamais mis entre guillemets seul.
