---
title: "Quiz final — Power BI"
type: quiz
questions:
  - prompt: |
      Dans quel ordre passe la donnée dans Power BI ?
    options:
      - "Rapport → Modèle → Power Query → Source"
      - "Source → Power Query → Modèle → Rapport"
      - "Source → Modèle → Power Query → Rapport"
    answer: 1
    explanation: >
      Extract (source) → Transform (Power Query) → Load (modèle), puis on construit le
      rapport sur le modèle. C'est la boucle ETL, rejouée à chaque rafraîchissement.
  - prompt: |
      `Sales(order_id, order_date, product_id, amount)` est plutôt…
    options:
      - "une table de dimension"
      - "une table de faits"
      - "une table de dates"
    answer: 1
    explanation: >
      Elle contient les événements mesurables (mesures `amount` + clés `product_id`,
      `order_date`). C'est le fait, au centre de l'étoile.
  - prompt: |
      Tu veux un indicateur « CA total » qui s'adapte au découpage de chaque visuel.
      Colonne calculée ou mesure ?
    options:
      - "Une colonne calculée"
      - "Une mesure"
      - "Les deux conviennent également"
    answer: 1
    explanation: >
      Une mesure est dynamique : `SUM(Sales[amount])` se recalcule selon le contexte de
      filtre de chaque cellule. La colonne calculée est figée, stockée par ligne.
  - prompt: |
      Quel est le rôle de `CALCULATE` ?
    options:
      - "Importer des données depuis une source"
      - "Évaluer une expression en modifiant le contexte de filtre"
      - "Créer une relation entre deux tables"
    answer: 1
    explanation: >
      `CALCULATE(expr, filtres…)` évalue `expr` dans un contexte de filtre modifié. C'est
      la base des % du total (`ALL`), des sous-ensembles et de la time intelligence.
  - prompt: |
      Quel prérequis rend possible `TOTALYTD` et `SAMEPERIODLASTYEAR` ?
    options:
      - "Un camembert sur la page"
      - "Une table de dates dédiée, continue et marquée comme table de dates"
      - "Un slicer sur la région"
    answer: 1
    explanation: >
      La time intelligence DAX exige une vraie dimension date, continue et marquée comme
      telle. Sans elle, ces fonctions ne renvoient rien de fiable.
  - prompt: |
      Pour partager un rapport à jour automatiquement, que fais-tu ?
    options:
      - "J'envoie le fichier .pbix par mail chaque matin"
      - "Je publie dans un workspace du service Power BI et je planifie le rafraîchissement"
      - "J'exporte un PDF figé"
    answer: 1
    explanation: >
      On publie vers le service Power BI (cloud), on partage via un workspace/app avec des
      permissions, et le rafraîchissement planifié rejoue l'ETL pour garder le tout à jour.
  - prompt: |
      Lequel de ces choix est un **piège visuel** à éviter ?
    options:
      - "Trier des barres par valeur"
      - "Mettre l'axe Y des barres à zéro"
      - "Tronquer l'axe Y de barres pour grossir les écarts"
    answer: 2
    explanation: >
      Tronquer l'axe d'un graphique en barres exagère artificiellement les écarts : la
      longueur n'encode plus la valeur. Trier par valeur et partir de zéro sont, eux, de
      bonnes pratiques.
---

Le grand récapitulatif : data → modèle → DAX → restitution.
