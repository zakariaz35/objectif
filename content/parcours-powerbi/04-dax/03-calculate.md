---
title: "CALCULATE, la fonction reine"
type: lesson
---

# `CALCULATE` : modifier le contexte de filtre

Si tu ne devais retenir **qu'une** fonction DAX, ce serait `CALCULATE`. Elle évalue une expression **en modifiant le contexte de filtre**. C'est la porte d'entrée vers 90 % des mesures avancées (variations, % du total, time intelligence).

## La syntaxe

```text
CALCULATE ( <expression> , <filter1> , <filter2> , ... )
```

- `<expression>` : ce qu'on veut calculer (souvent une mesure existante) ;
- les `<filter>` : des conditions qui **s'ajoutent à / remplacent** le contexte courant.

## Exemple : forcer une catégorie

```text
// Total sales, but only for Electronics — whatever the visual's context
Electronics Sales = CALCULATE ( [Total Sales], Products[category] = "Electronics" )
```

Même dans un tableau découpé par `region`, cette mesure ne compte **que** les ventes d'Electronics. `CALCULATE` a **remplacé** le filtre sur `category` par `"Electronics"`.

## Exemple : ignorer un filtre avec `ALL`

`ALL` retire un filtre. Combiné à `CALCULATE`, il sert à calculer un **total de référence** pour faire un pourcentage du total :

```text
// Sales ignoring any category filter → the grand total
All Categories Sales = CALCULATE ( [Total Sales], ALL ( Products[category] ) )

// Share of each category in the grand total
Category Share % =
DIVIDE ( [Total Sales], [All Categories Sales] )
```

Dans un tableau par `category` : `[Total Sales]` suit le contexte (le CA de la ligne), tandis que `[All Categories Sales]` ignore le découpage et renvoie toujours le total → le ratio donne bien la **part** de chaque catégorie.

> Utilise **toujours** `DIVIDE(a, b)` plutôt que `a / b` : `DIVIDE` gère proprement la division par zéro (renvoie un blanc, ou une valeur par défaut) sans erreur.

## Comment lire `CALCULATE`

```mermaid
flowchart LR
    A["Contexte courant<br/>(visuel, slicers)"] --> B["CALCULATE applique<br/>ses arguments filtres"]
    B --> C["Nouveau contexte<br/>de filtre"]
    C --> D["Évalue l'expression<br/>dans ce contexte"]
```

`CALCULATE` part du contexte courant, applique ses filtres (qui ajoutent ou remplacent), puis évalue l'expression dans ce **nouveau** contexte.

> **À retenir —** `CALCULATE(expr, filtres…)` = évaluer `expr` en **changeant le contexte de filtre**. C'est l'outil de base des % du total (`ALL`), des sous-ensembles (`category = "…"`) et de la time intelligence. Et pour les ratios : `DIVIDE`.
