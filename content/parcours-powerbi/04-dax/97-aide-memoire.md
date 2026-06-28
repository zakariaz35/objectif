---
title: "Aide-mémoire DAX + Power Query"
type: lesson
---

# Aide-mémoire DAX & Power Query — référence rapide

Une page à garder ouverte. Syntaxe → effet, exemples d'une ligne.

---

## DAX — mesures de base

> Toujours créer des **mesures** (pas des colonnes calculées) pour les agrégats affichés dans les visuels.

```text
Total Sales     = SUM ( Sales[amount] )
Total Qty       = SUM ( Sales[quantity] )
Order Count     = COUNTROWS ( Sales )
Distinct Cust   = DISTINCTCOUNT ( Sales[customer_id] )
Avg Basket      = DIVIDE ( [Total Sales], [Order Count] )
Max Amount      = MAX ( Sales[amount] )
Min Amount      = MIN ( Sales[amount] )
Avg Amount      = AVERAGE ( Sales[amount] )
```

| Fonction | Effet |
|---|---|
| `SUM(col)` | Somme |
| `AVERAGE(col)` | Moyenne |
| `MAX(col)` / `MIN(col)` | Maximum / minimum |
| `COUNTROWS(table)` | Nombre de lignes |
| `DISTINCTCOUNT(col)` | Valeurs distinctes |
| `DIVIDE(a, b [, alt])` | Division sécurisée (0 ou `alt` si b = 0) |

---

## CALCULATE — modifier le contexte de filtre

```text
// Hard-filter on a category
Electronics Sales = CALCULATE ( [Total Sales], Products[category] = "Electronics" )

// % of grand total (ignore category filter)
Category Share % =
DIVIDE (
    [Total Sales],
    CALCULATE ( [Total Sales], ALL ( Products[category] ) )
)

// % within region (keep region filter, remove category filter)
Category Share In Region % =
DIVIDE (
    [Total Sales],
    CALCULATE ( [Total Sales], ALLEXCEPT ( Products, Customers[region] ) )
)

// Multiple filters (both applied simultaneously)
Nord Electronics =
CALCULATE ( [Total Sales],
    Products[category] = "Electronics",
    Customers[region] = "Nord"
)
```

> `CALCULATE(expr, filtres…)` = évaluer `expr` dans un nouveau contexte de filtre. C'est la fonction la plus importante de DAX.

---

## FILTER — filtre tabulaire

```text
// Table filtered inline (passed to CALCULATE)
High Value Sales =
CALCULATE (
    [Total Sales],
    FILTER ( Sales, Sales[amount] > 500 )
)

// FILTER retourne une table — ne pas l'utiliser seul dans un visuel
// Préférer la syntaxe directe quand possible :
// CALCULATE([Total Sales], Sales[amount] > 500)  -- plus efficace
```

> Préférer la syntaxe directe (`col = val`) plutôt que `FILTER` quand la condition porte sur **une seule colonne** de la table de faits — c'est plus performant.

---

## ALL / ALLEXCEPT / ALLSELECTED

| Modificateur | Effet dans CALCULATE |
|---|---|
| `ALL(table)` | Retire tous les filtres de la table |
| `ALL(table[col])` | Retire le filtre sur cette colonne uniquement |
| `ALLEXCEPT(table, col1, col2…)` | Retire tous les filtres sauf ceux des colonnes listées |
| `ALLSELECTED([table/col])` | Respecte les slicers/filtres de page, ignore le contexte interne du visuel |

```text
// % of total regardless of any filter
Pct Total = DIVIDE ( [Total Sales], CALCULATE ( [Total Sales], ALL ( Sales ) ) )

// % within selected region (respects slicer)
Pct Selected =
DIVIDE ( [Total Sales], CALCULATE ( [Total Sales], ALLSELECTED ( Products[category] ) ) )
```

---

## Time Intelligence — variations temporelles

> Prérequis : une table de dates marquée (`Mark as Date Table`), reliée à la table de faits sur la colonne date.

```text
// Same period last year
Sales LY = CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( Dates[date] ) )

// Year-over-year variation
YoY Var    = [Total Sales] - [Sales LY]
YoY Var %  = DIVIDE ( [YoY Var], [Sales LY] )

// Cumulative year-to-date
Sales YTD  = TOTALYTD ( [Total Sales], Dates[date] )
Sales MTD  = TOTALMTD ( [Total Sales], Dates[date] )
Sales QTD  = TOTALQTD ( [Total Sales], Dates[date] )

// Rolling 3 months
Sales Rolling 3M =
CALCULATE (
    [Total Sales],
    DATESINPERIOD ( Dates[date], LASTDATE ( Dates[date] ), -3, MONTH )
)

// Previous month
Sales PM = CALCULATE ( [Total Sales], PREVIOUSMONTH ( Dates[date] ) )
```

| Fonction | Effet |
|---|---|
| `SAMEPERIODLASTYEAR(dates)` | Même période N-1 |
| `TOTALYTD(expr, dates)` | Cumul depuis le 1er janvier |
| `TOTALMTD(expr, dates)` | Cumul depuis le 1er du mois |
| `TOTALQTD(expr, dates)` | Cumul depuis le 1er du trimestre |
| `PREVIOUSMONTH(dates)` | Mois précédent |
| `PREVIOUSQUARTER(dates)` | Trimestre précédent |
| `DATESINPERIOD(dates, last, n, interval)` | Fenêtre glissante de n périodes |
| `DATESBETWEEN(dates, start, end)` | Plage explicite |

---

## Variables (VAR / RETURN)

```text
// Use VAR to avoid repeating sub-expressions
Margin % =
VAR total_sales = [Total Sales]
VAR total_cost  = SUM ( Sales[cost] )
RETURN
    DIVIDE ( total_sales - total_cost, total_sales )
```

> `VAR` améliore la lisibilité et les performances (l'expression n'est évaluée qu'une fois). `RETURN` est obligatoire.

---

## Colonnes calculées (vs mesures)

| | Mesure | Colonne calculée |
|---|---|---|
| Évaluée | À chaque interaction visuelle | Au rafraîchissement du modèle |
| Contexte | Contexte de filtre | Contexte de ligne (ligne par ligne) |
| Stockage | Non (calculé à la volée) | Oui (en mémoire, charge le modèle) |
| Usage | Agrégats dans visuels | Segmentation, relation, axe |

```text
// Calculated column — evaluated row by row
Margin = Sales[amount] - Sales[cost]
Category Label = UPPER ( Products[category] )
Year = YEAR ( Sales[order_date] )
```

---

## Power Query — transformations courantes

| Opération | Où / comment |
|---|---|
| Importer CSV / Excel | Accueil → Nouvelle source |
| Filtrer des lignes | Flèche colonne → Filtres de texte / de nombre |
| Supprimer des colonnes | Clic droit colonne → Supprimer |
| Renommer une colonne | Double-clic sur l'en-tête |
| Changer le type | Icône type à gauche de l'en-tête (ou Transformer → Type de données) |
| Fractionner une colonne | Transformer → Fractionner la colonne → par délimiteur |
| Fusionner des requêtes | Accueil → Fusionner les requêtes (= JOIN) |
| Ajouter des requêtes | Accueil → Ajouter des requêtes (= UNION) |
| Grouper / agréger | Transformer → Regrouper par |
| Dépivoter | Sélectionner les colonnes → Transformer → Dépivoter les colonnes |
| Ajouter une colonne personnalisée | Ajouter une colonne → Colonne personnalisée |
| Référencer une autre requête | Clic droit requête → Référence (pas de copie, dépendance) |

### Formules M courantes

```
// Conditional column
= Table.AddColumn(Source, "Label",
    each if [amount] > 500 then "Big" else "Small")

// Clean text
= Table.TransformColumns(Source, {{"name", Text.Trim, type text}})

// Extract year from date
= Table.AddColumn(Source, "Year",
    each Date.Year([order_date]), Int64.Type)

// Filter rows
= Table.SelectRows(Source, each [region] = "Nord")

// Rename columns
= Table.RenameColumns(Source, {{"old_name", "new_name"}})
```

> **À retenir —** DAX : `CALCULATE` + `ALL/ALLEXCEPT` pour les ratios, fonctions `TOTAL*` / `SAMEPERIODLASTYEAR` pour le time intelligence, `DIVIDE` pour tous les ratios, `VAR` pour la lisibilité. Power Query : transforme **avant** de charger — moins de colonnes calculées DAX = modèle plus léger.
