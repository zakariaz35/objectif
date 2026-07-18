---
title: "Travailler avec les dates"
type: lesson
---

# Les dates : le nerf de l'analyse temporelle

Dans Excel, une date est un **nombre** (le nombre de jours depuis 1900). C'est ce qui
permet de faire des calculs dessus — à condition que la cellule soit bien typée *date* et
non *texte*.

## Extraire des composantes

```
=YEAR([@order_date])     // 2024
=MONTH([@order_date])    // 1 to 12
=DAY([@order_date])      // 1 to 31
=TODAY()                 // today's date (recalculates each time the workbook opens)
```

## Grouper par mois ou trimestre

Pour agréger par période, on fabrique une **clé** texte triable :

```
// "2024-01": groups by month, sorts correctly
=YEAR([@order_date]) & "-" & TEXT(MONTH([@order_date]), "00")

// Quarter number (1 to 4)
=ROUNDUP(MONTH([@order_date]) / 3, 0)
```

Le format `"00"` force deux chiffres : `"2024-01"` plutôt que `"2024-1"`, indispensable
pour un tri propre. (Dans un TCD, on peut aussi grouper les dates directement, on le verra
plus loin.)

## Fin de mois et bornes de période

```
// Last day of the order's month
=EOMONTH([@order_date], 0)

// Last day of the following month (30-day end-of-month due date)
=EOMONTH([@order_date], 1)
```

`EOMONTH(date, n)` renvoie le dernier jour du mois `n` mois plus tard. Très utile pour des
échéances de facturation.

## Calculer une durée : DATEDIF

```
// Seniority in years (HR), from hire_date to today
=DATEDIF([@hire_date], TODAY(), "Y")

// Number of complete months between two dates
=DATEDIF([@start_date], [@end_date], "M")

// Simple difference in days
=[@end_date] - [@start_date]
```

`DATEDIF(start, end, unité)` accepte `"Y"` (années), `"M"` (mois), `"D"` (jours).

## NETWORKDAYS : délais hors week-ends

En logistique ou en achat, les délais s'expriment souvent en **jours ouvrés** (hors
week-ends et jours fériés) :

```
// Working days between order_date and delivery_date (Mon-Fri only)
=NETWORKDAYS([@order_date], [@delivery_date])

// With public holidays listed in a range named "Holidays"
=NETWORKDAYS([@order_date], [@delivery_date], Holidays)
```

Un délai négatif ou nul signifie que la livraison est arrivée avant ou le jour même de la
commande — souvent une anomalie à vérifier.

## Pièges courants sur les dates

| Symptôme | Cause probable | Solution |
|---|---|---|
| Date alignée à **gauche** | Stockée en texte | `=DATEVALUE([@col])` |
| `YEAR()` renvoie `1900` | Cellule contient `0` (vide de date) | `=IF([@date]="","",YEAR([@date]))` |
| Clé mois `"2024-1"` au lieu de `"2024-01"` | Oubli du format `"00"` | `TEXT(MONTH(...),"00")` |
| `DATEDIF` renvoie une erreur | `start > end` | Vérifier la cohérence des colonnes |

> **À retenir —** vérifie d'abord qu'une date est bien typée (alignée à droite). Ensuite :
> `YEAR`/`MONTH` pour grouper, `EOMONTH` pour les échéances, `DATEDIF` pour les durées,
> `NETWORKDAYS` pour les délais en jours ouvrés.
