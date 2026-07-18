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

## Pas-à-pas : colonne de statut de paiement (suivi fournisseurs)

Contexte : tu as une table `Invoices`
(`invoice_id | supplier | amount | due_date | paid_date`). Tu veux ajouter une colonne
`status` — trois états possibles : payée, en retard, en attente — puis compter et sommer
chaque catégorie dans un onglet `Synthese`.

**Étape 1 — Ajouter la colonne `status` dans le Tableau.**
Clique sur la cellule vide à droite des données (`G2` si les colonnes A à F sont déjà
occupées), frappe le titre `status`, valide. Excel étend automatiquement le Tableau.
Entre en `G2` :

```
// Invoice status: Paid / Overdue / Pending
=IFS([@paid_date] <> "", "Paid",
     TODAY() > [@due_date], "Overdue",
     TRUE, "Pending")
```

La formule se propage sur toutes les lignes.

**Étape 2 — Compter chaque statut dans l'onglet Synthese.**
En `Synthese!B2`, `B3`, `B4` :

```
=COUNTIFS(Invoices[status], "Paid")
=COUNTIFS(Invoices[status], "Overdue")
=COUNTIFS(Invoices[status], "Pending")
```

**Étape 3 — Montant total des factures en retard.**
En `Synthese!C3` :

```
// Total amount of overdue invoices
=SUMIFS(Invoices[amount], Invoices[status], "Overdue")
```

> **Repère —** si tu modifies une `due_date` dans la table, le statut et les totaux de la
> synthèse se mettent à jour immédiatement. C'est la puissance des formules dynamiques
> comparée à un tableau de bord saisi à la main.

## Pièges fréquents sur IF et la gestion des erreurs

**Mélange de types dans la condition.** Si `paid_date` est vide, certaines versions Excel
stockent une cellule vide, d'autres `0` (valeur numérique). La condition `[@paid_date] <> ""`
fonctionne pour les cellules vraiment vides, mais pas pour `0`. Vérifie le type d'une
cellule vide en regardant son alignement : si elle est alignée à droite, c'est un `0`.
Utilise alors `[@paid_date] <> 0` ou `[@paid_date] > 0`.

**`IFERROR` masque les vraies erreurs.** Envelopper une formule dans `IFERROR(…, "")` est
utile pour afficher un résultat propre, mais si toute une colonne affiche `""`, tu n'as
peut-être pas une clé manquante — tu as peut-être une faute de frappe dans le nom du
Tableau ou un type de clé incompatible. Retire `IFERROR` temporairement, observe
l'erreur réelle (`#N/A`, `#VALEUR!`, `#REF!`), diagnostique, puis remets-le.

**`#VALEUR!` dans une formule `IF` utilisée plus tard en agrégat.** La formule
`=IF([@amount] > 0, [@amount] * 1.2, "N/A")` renvoie la chaîne `"N/A"` pour les montants
nuls. Si tu fais ensuite `SUMIFS` sur cette colonne, Excel rencontre du texte là où il
attend un nombre et renvoie `#VALEUR!`. Préfère `0` comme fallback dans toute colonne
destinée à être agrégée :

```
// Correct fallback for a column that will be aggregated
=IF([@amount] > 0, [@amount] * 1.2, 0)
```

> **À retenir —** `IF` pour un choix binaire, `IFS` pour des paliers, `AND`/`OR` pour
> combiner, `IFERROR` pour afficher un résultat propre, `IFNA` pour cibler uniquement les
> clés manquantes d'une recherche.
