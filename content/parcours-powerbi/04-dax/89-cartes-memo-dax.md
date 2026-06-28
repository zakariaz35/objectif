---
title: "Cartes mémo — DAX"
type: flashcards
cards:
  - q: |
      Quelle est la différence entre une **colonne calculée** et une **mesure** en DAX ?
    a: |
      La **colonne calculée** ajoute une valeur **stockée par ligne** au moment du
      rafraîchissement (utile pour grouper/filtrer). La **mesure** est une formule
      **dynamique** recalculée selon le contexte de filtre du visuel — elle n'est pas
      stockée. En cas de doute : écris une **mesure**.
  - q: |
      Qu'est-ce que le **contexte de filtre** en DAX ?
    a: |
      L'ensemble des filtres actifs au moment où une mesure s'évalue : découpage du
      visuel (ligne/colonne du tableau), slicers de la page, propagation des relations.
      C'est lui qui détermine quelles lignes de la table de faits sont prises en compte
      dans l'agrégat.
  - q: |
      À quoi sert `CALCULATE` ?
    a: |
      À évaluer une expression dans un **contexte de filtre modifié**. Ses arguments
      filtres **s'ajoutent à** ou **remplacent** le contexte courant. C'est la base de
      tous les calculs avancés : % du total, sous-ensembles, time intelligence.
  - q: |
      Comment calculer le **pourcentage d'une catégorie** dans le total global ?
    a: |
      ```text
      Category Share % =
      DIVIDE (
          [Total Sales],
          CALCULATE ( [Total Sales], ALL ( Products[category] ) )
      )
      ```
      `ALL(Products[category])` retire le filtre de catégorie → le dénominateur est
      toujours le total global.
  - q: |
      Pourquoi utiliser `DIVIDE(a, b)` plutôt que `a / b` ?
    a: |
      `DIVIDE` gère proprement la **division par zéro** : il retourne un blanc (ou une
      valeur par défaut optionnelle) au lieu d'une erreur qui casse le visuel.
  - q: |
      Quelle est la différence entre `PREVIOUSMONTH` et `DATEADD(..., -1, MONTH)` ?
    a: |
      `PREVIOUSMONTH(date)` retourne toujours le **mois calendaire complet** précédant
      le contexte. `DATEADD(date, -1, MONTH)` décale de 30 jours — plus flexible mais
      potentiellement partiel. Pour comparer mois complets, `PREVIOUSMONTH` est plus
      fiable.
  - q: |
      Que retourne `CALCULATE([Total Sales], Products[category] = "A", Products[category] = "B")` ?
    a: |
      **Blank** — les deux arguments de filtre s'appliquent comme un `AND` : aucun
      produit ne peut appartenir à la fois à `"A"` et `"B"`. Pour un `OR`, utilise
      `FILTER(ALL(Products[category]), ... || ...)` ou `Products[category] IN {"A","B"}`.
  - q: |
      Quel prérequis est indispensable pour que `TOTALYTD`, `SAMEPERIODLASTYEAR` et
      `PREVIOUSMONTH` fonctionnent ?
    a: |
      Une **table de dates dédiée, continue** (toutes les dates de la plage, sans trou),
      reliée à la table de faits sur `order_date`, et **marquée comme table de dates**
      (*Mark as Date Table*) dans Power BI.
  - q: |
      Comment calculer la **marge brute par ligne** en évitant les erreurs courantes ?
    a: |
      ```text
      Margin % =
      DIVIDE ( Sales[amount] - Sales[unit_cost], Sales[amount] )
      ```
      Utiliser `DIVIDE` (protection division par zéro) et des parenthèses explicites
      (évite les erreurs de précédence d'opérateurs).
  - q: |
      À quoi sert `SUMX` et quand l'utilise-t-on à la place de `SUM` ?
    a: |
      `SUMX(table, expression)` évalue une **expression ligne par ligne** puis somme
      les résultats. On l'utilise quand la valeur à agréger n'existe pas en colonne :
      ex. `SUMX(Sales, Sales[quantity] * Sales[unit_price])` pour le CA quand seuls
      `quantity` et `unit_price` sont stockés.
---

Cartes DAX — des fondations (contexte, mesure) aux fonctions avancées (CALCULATE, time intelligence).
