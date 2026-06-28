---
title: "Logique conditionnelle et gestion des erreurs"
type: lesson
---

# Décider avec IF, IFS et gérer les erreurs

## IF : une condition, deux issues

```
// Label large orders
=IF([@amount] >= 200, "Grande", "Petite")
```

Trois arguments : la condition, la valeur si **vrai**, la valeur si **faux**.

## IFS : plusieurs cas sans imbrication

Empiler des `IF` dans des `IF` devient vite illisible. `IFS` enchaîne des paires
`(condition, résultat)`, évaluées dans l'ordre :

```
// Segment by order size
=IFS([@amount] >= 500, "A", [@amount] >= 200, "B", TRUE, "C")
```

Le dernier `TRUE` joue le rôle de « sinon » : il attrape tout ce qui reste.

## Combiner des conditions : AND, OR

```
// Priority order: large AND in the Nord region
=IF(AND([@amount] >= 500, [@region] = "Nord"), "Prioritaire", "Standard")

// Flag: zero amount OR zero quantity
=IF(OR([@amount] = 0, [@quantity] = 0), "Anomalie", "OK")
```

## IFERROR : ne jamais laisser un #N/A traîner

Une division par une cellule vide, une recherche infructueuse… et la colonne se remplit
de `#DIV/0!` ou `#N/A`. `IFERROR` remplace l'erreur par une valeur propre :

```
// Unit price = amount / quantity, 0 if quantity is empty
=IFERROR([@amount] / [@quantity], 0)

// Lookup with explicit fallback
=IFERROR(VLOOKUP([@product_id], Products, 2, FALSE), "unknown")
```

> **Attention —** `IFERROR` masque **toutes** les erreurs. Ne t'en sers pas pour cacher un
> vrai problème : assure-toi d'abord de comprendre *pourquoi* l'erreur apparaît.

## Cas concrets : segmenter pour analyser

**Segmentation achat — statut de paiement :**

```
// Payment status based on due_date
=IFS([@paid_date] <> "", "Paid",
     TODAY() > [@due_date], "Overdue",
     TRUE, "Pending")
```

**RH — plage salariale :**

```
// Salary band classification
=IFS([@salary] >= 60000, "Senior",
     [@salary] >= 40000, "Mid",
     [@salary] >= 25000, "Junior",
     TRUE, "Unclassified")
```

**Logistique — alerte de stock :**

```
// Stock alert: critical if below safety level AND reorder not placed
=IF(AND([@stock_qty] < [@safety_stock], [@reorder_placed] = "No"),
    "CRITICAL", "OK")
```

## IFNA : cibler uniquement les #N/A

`IFERROR` capture **toutes** les erreurs. Quand tu veux uniquement intercepter les
`#N/A` d'une recherche (pour laisser passer les vraies erreurs de formule) :

```
// Replace only #N/A (missing key), let other errors surface
=IFNA(XLOOKUP([@product_id], Products[product_id], Products[name]), "unknown")
```

> **À retenir —** `IF` pour un choix binaire, `IFS` pour des paliers, `AND`/`OR` pour
> combiner, `IFERROR` pour afficher un résultat propre, `IFNA` pour cibler uniquement les
> clés manquantes d'une recherche.
