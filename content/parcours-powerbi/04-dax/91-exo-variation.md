---
title: "Exercice — mesure de variation"
type: exercise
---

## Énoncé

Avec le même modèle (et une table `Date` marquée), écris les mesures pour un tableau de bord
affiché **par mois** :

1. Le **CA du mois précédent**.
2. La **variation absolue** vs le mois précédent (MoM).
3. La **variation en %** vs le mois précédent.
4. Bonus : le **CA du même mois l'an dernier** et la **croissance YoY en %**.

<!--correction-->

## Correction

```text
// 1. Previous month's sales
Sales Prev Month =
CALCULATE ( [Total Sales], PREVIOUSMONTH ( 'Date'[date] ) )

// 2. Absolute variation vs previous month
Sales MoM = [Total Sales] - [Sales Prev Month]

// 3. Relative variation vs previous month
Sales MoM % = DIVIDE ( [Sales MoM], [Sales Prev Month] )

// 4 bonus. Same month last year, and year-over-year growth
Sales LY =
CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[date] ) )

Sales YoY % = DIVIDE ( [Total Sales] - [Sales LY], [Sales LY] )
```

Points clés :

- on **décompose** : `Prev Month` d'abord, puis `MoM`, puis `MoM %`. Des mesures courtes et réutilisables valent mieux qu'une formule géante ;
- la **table de dates marquée** est indispensable : `PREVIOUSMONTH` et `SAMEPERIODLASTYEAR` ne fonctionnent que sur une vraie dimension date ;
- `DIVIDE` évite l'erreur quand le mois précédent (ou l'an dernier) n'a pas de données.
