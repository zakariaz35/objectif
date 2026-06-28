---
title: "Contexte & agrégats de base"
type: lesson
---

# Le contexte : la clé de DAX

La notion qui déroute tout le monde au début, mais qui rend DAX limpide une fois comprise : **une mesure se calcule toujours dans un contexte**. Le même `Total Sales` donne des résultats différents selon *où* il s'affiche, parce que le contexte filtre les lignes prises en compte.

## Contexte de filtre

Le **contexte de filtre** = l'ensemble des filtres actifs sur la cellule où la mesure s'évalue. Il vient :

- de la **ligne/colonne** du visuel (un tableau par `category`) ;
- des **slicers** et filtres de la page ;
- des relations (filtrer une dimension filtre le fait).

```text
Measure:  Total Sales = SUM ( Sales[amount] )

In a table grouped by category:
| category    | Total Sales |
| Electronics |     120 000 |   ← context = "category = Electronics"
| Furniture   |      78 000 |   ← context = "category = Furniture"
| Total       |     198 000 |   ← context = no category filter → everything
```

Une seule formule, autant de résultats que de cellules : chaque cellule **filtre** `Sales` selon son contexte, puis somme.

## Contexte de ligne

Le **contexte de ligne** existe quand on évalue ligne par ligne : c'est le cas d'une **colonne calculée** (chaque ligne « sait » qui elle est) ou des fonctions itératives (`SUMX`, `AVERAGEX`). Pour l'essentiel des mesures, c'est le **contexte de filtre** qui compte.

## Les agrégats de base

Le socle des mesures, à connaître par cœur :

```text
Total Sales   = SUM ( Sales[amount] )
Total Qty     = SUM ( Sales[quantity] )
Avg Ticket    = AVERAGE ( Sales[amount] )
Order Count   = COUNTROWS ( Sales )
Distinct Cust = DISTINCTCOUNT ( Sales[customer_id] )
```

- `SUM` / `AVERAGE` / `MIN` / `MAX` agrègent **une colonne** numérique.
- `COUNTROWS` compte les **lignes** d'une table (idéal pour « nombre de ventes »).
- `DISTINCTCOUNT` compte les **valeurs distinctes** (clients uniques).

## Les itérateurs (X) : agréger une expression

Quand la valeur à agréger n'existe pas en colonne, on calcule **ligne par ligne** puis on agrège :

```text
// Sum of (quantity * unit_price) computed row by row, then summed
Revenue = SUMX ( Sales, Sales[quantity] * Sales[unit_price] )
```

`SUMX` ouvre un contexte de ligne sur `Sales`, évalue l'expression pour chaque ligne, puis somme le tout.

> **À retenir —** Une mesure se lit **toujours dans son contexte de filtre** : c'est lui qui décide quelles lignes sont sommées. Agrégats de base : `SUM`, `AVERAGE`, `COUNTROWS`, `DISTINCTCOUNT`. Pour agréger un calcul ligne à ligne : les itérateurs `…X` (`SUMX`).
