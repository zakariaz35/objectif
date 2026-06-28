---
title: "Quiz — principes de dataviz"
type: quiz
questions:
  - prompt: |
      Le métier te demande : « Montre-moi **comment le CA a évolué** sur les 12 derniers
      mois. » Quel visuel ?
    options:
      - "Un camembert par mois"
      - "Une courbe (line chart) avec la Date en abscisse"
      - "Un grand nombre unique (carte)"
    answer: 1
    explanation: >
      Le verbe « évoluer » + une dimension `Date` → courbe. Elle relie les points et rend
      la tendance immédiatement lisible.
  - prompt: |
      Sur un graphique en **barres**, où doit commencer l'axe des valeurs ?
    options:
      - "Là où ça met le mieux en valeur les écarts"
      - "Toujours à zéro"
      - "À la plus petite valeur observée"
    answer: 1
    explanation: >
      Dans une barre, la longueur encode la valeur. Démarrer ailleurs qu'à zéro exagère
      artificiellement les écarts : c'est le piège de l'axe tronqué.
  - prompt: |
      Pour comparer la valeur de **9 catégories** de produits, quel choix est le plus
      lisible ?
    options:
      - "Un camembert à 9 parts"
      - "Des barres horizontales triées par valeur"
      - "Un graphique 3D en volume"
    answer: 1
    explanation: >
      L'œil compare mal des angles (camembert) et est déformé par la 3D. Des barres triées
      alignent les valeurs sur une base commune et révèlent le classement.
  - prompt: |
      Quel **titre** de visuel est le plus efficace ?
    options:
      - "Ventes par région"
      - "CA mensuel"
      - "La région Sud porte 40 % du CA à elle seule"
    answer: 2
    explanation: >
      Un bon titre porte le message, pas la description des axes. Il fait gagner au lecteur
      l'effort d'interprétation.
  - prompt: |
      Comment organiser l'information dans un dashboard pour une lecture efficace ?
    options:
      - "Tout au même niveau, l'utilisateur cherchera"
      - "Du général (KPI clés en haut) au détail (tableaux en bas)"
      - "Le détail d'abord, puis la synthèse"
    answer: 1
    explanation: >
      Principe de la pyramide : KPI clés en haut pour une lecture en 3 secondes, tendances
      au milieu, détail en bas pour qui veut creuser.
---

Vérifie tes réflexes de choix de visuel.
