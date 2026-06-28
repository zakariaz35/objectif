---
title: "Quiz — DAX"
type: quiz
questions:
  - prompt: |
      Quelle mesure calcule correctement le **panier moyen** (CA par commande) ?
    options:
      - "AVERAGE(Sales[amount])"
      - "DIVIDE(SUM(Sales[amount]), COUNTROWS(Sales))"
      - "SUM(Sales[amount]) / COUNT(Sales[order_id])"
    answer: 1
    explanation: >
      AVERAGE(Sales[amount]) calcule la moyenne des montants par ligne de vente, pas
      par commande (plusieurs lignes peuvent appartenir à la même commande).
      DIVIDE(SUM, COUNTROWS) donne bien le CA moyen par ligne de la table de faits —
      et DIVIDE protège de la division par zéro. COUNT vs COUNTROWS : COUNT ignore les
      nulls, COUNTROWS compte toutes les lignes.
  - prompt: |
      `[Total Sales]` dans un tableau par `Products[category]` affiche le même grand
      total sur chaque ligne. Quelle est la cause la plus probable ?
    options:
      - "La mesure est une colonne calculée"
      - "La relation entre Products et Sales est absente ou dans le mauvais sens"
      - "Il faut ajouter ALL(Products) dans CALCULATE"
    answer: 1
    explanation: >
      Si le filtre de catégorie ne se propage pas vers Sales, la mesure ignore le
      découpage du visuel et affiche toujours le total global. La relation doit aller
      de Products (1) → Sales (*), avec la flèche pointant vers Sales.
  - prompt: |
      Que retourne `CALCULATE([Total Sales], Products[category] = "A", Products[category] = "B")` ?
    options:
      - "La somme des ventes de catégories A et B"
      - "Un blanc — les deux filtres forment un AND impossible"
      - "Une erreur de syntaxe"
    answer: 1
    explanation: >
      Plusieurs arguments dans CALCULATE = AND. Aucun produit n'appartient
      simultanément à A et B → résultat vide → BLANK.
      Pour un OR : Products[category] IN {"A","B"} ou FILTER avec ||.
  - prompt: |
      Quelle fonction retourne les ventes du même mois l'an dernier ?
    options:
      - "PREVIOUSMONTH('Date'[date])"
      - "CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[date]))"
      - "DATEADD('Date'[date], -30, DAY)"
    answer: 1
    explanation: >
      SAMEPERIODLASTYEAR décale d'exactement un an la même période (même mois, même
      trimestre…). PREVIOUSMONTH donne le mois d'avant (pas N-1). DATEADD(-30, DAY)
      donne 30 jours en arrière, pas le même mois l'an dernier.
  - prompt: |
      Quelle est la différence entre `ALL(Products[category])` et `ALL(Products)` dans CALCULATE ?
    options:
      - "Aucune, les deux font la même chose"
      - "ALL(Products[category]) retire uniquement le filtre sur cette colonne ; ALL(Products) retire tous les filtres de la table Products"
      - "ALL(Products) retire les filtres sur Sales aussi"
    answer: 1
    explanation: >
      ALL sur une colonne cible uniquement ce filtre. ALL sur la table entière retire
      tous les filtres de toutes ses colonnes — y compris ceux des slicers sur brand,
      price range, etc. Choisir la bonne granularité évite les surprises.
  - prompt: |
      Pourquoi `TOTALYTD` peut-il retourner BLANK dans un visuel ?
    options:
      - "Parce que la formule est incorrecte"
      - "Parce que la table Date n'est pas marquée comme table de dates, ou n'est pas continue"
      - "Parce que TOTALYTD ne fonctionne que sur des mesures de type SUM"
    answer: 1
    explanation: >
      La time intelligence DAX exige une table Date marquée (Mark as Date Table) et
      continue (sans trous). Sans ces conditions, les fonctions comme TOTALYTD,
      SAMEPERIODLASTYEAR ou PREVIOUSMONTH retournent BLANK sans erreur visible.
  - prompt: |
      On veut calculer `Marge % = (amount - unit_cost) / amount`. Quelle formule est correcte ?
    options:
      - "Sales[amount] - Sales[unit_cost] / Sales[amount]"
      - "DIVIDE(SUM(Sales[amount]) - SUM(Sales[unit_cost]), SUM(Sales[amount]))"
      - "(SUM(Sales[amount]) - SUM(Sales[unit_cost])) / SUM(Sales[amount])"
    answer: 1
    explanation: >
      DIVIDE gère la division par zéro (retourne BLANK plutôt qu'une erreur). Les deux
      autres formules ont des problèmes : la première souffre de la précédence des
      opérateurs (division avant soustraction), la troisième plante si SUM(amount) = 0.
---

Questions sur le cœur de DAX : mesures, contexte de filtre, CALCULATE et time intelligence.
