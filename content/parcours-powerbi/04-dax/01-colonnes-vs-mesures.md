---
title: "Colonnes calculées vs mesures"
type: lesson
---

# DAX : la langue de l'analyse

**DAX** (Data Analysis Expressions) est le langage de calcul de Power BI. Il intervient **après** Power Query : la donnée est chargée et modélisée ; DAX sert à **analyser**. Première distinction à maîtriser : colonne calculée **ou** mesure ?

> **Objectif de l'étape —** écrire des mesures DAX correctes et idiomatiques, comprendre le contexte de filtre, et connaître `CALCULATE` + les bases de la time intelligence.

## Colonne calculée

Une **colonne calculée** ajoute une colonne à une table, **ligne par ligne**, et est **stockée** en mémoire. Elle se calcule au rafraîchissement.

```text
// Calculated column on the Sales table — one value per row
Line Total = Sales[quantity] * Sales[unit_price]
```

Chaque ligne de `Sales` reçoit sa valeur. Utile quand on a besoin d'une valeur **par ligne** pour grouper/filtrer (ex. une catégorie de prix `"cheap"` / `"expensive"`).

## Mesure

Une **mesure** ne calcule rien tant qu'on ne l'utilise pas. Elle est **dynamique** : elle se recalcule selon le **contexte** du visuel (la cellule, le filtre, la ligne du tableau où elle s'affiche). Elle n'est **pas stockée** — juste une formule.

```text
// Measure — recomputed for each cell of the visual
Total Sales = SUM ( Sales[amount] )
```

Dans une carte, `Total Sales` donne le total global. Dans un tableau par `category`, **la même mesure** donne le total *de chaque catégorie*. C'est tout l'intérêt.

## Laquelle choisir ?

| Besoin | Choix |
|---|---|
| Une valeur **par ligne** pour grouper / filtrer | Colonne calculée |
| Un **indicateur agrégé** (somme, moyenne, ratio) | **Mesure** |
| Une variation, un % du total, du temporel | **Mesure** |

> Règle pratique : **par défaut, écris une mesure.** Les colonnes calculées pèsent en mémoire et sont figées ; les mesures sont légères et s'adaptent au contexte. On ne crée une colonne que quand on a vraiment besoin d'une valeur stockée par ligne.

## Convention

On nomme les mesures de façon lisible (`Total Sales`, `Margin %`), on **qualifie** les colonnes par leur table (`Sales[amount]`) et **jamais** les mesures (on écrit `[Total Sales]`, pas `Sales[Total Sales]`). C'est la convention idiomatique.

> **À retenir —** Colonne calculée = valeur **stockée par ligne** (pour grouper/filtrer). Mesure = formule **dynamique agrégée** qui suit le contexte du visuel. En cas de doute : **mesure**.
