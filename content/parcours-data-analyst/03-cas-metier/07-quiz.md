---
title: "Quiz — KPI par domaine"
type: quiz
questions:
  - prompt: |
      Une commande contient 3 lignes (3 produits). Pour le **panier moyen**, comment
      compter cette commande au dénominateur ?
    options:
      - "3 fois (une par ligne)"
      - "1 fois (une commande distincte)"
      - "selon le montant de chaque ligne"
    answer: 1
    explanation: >
      Le panier moyen = CA / **commandes distinctes**. Une commande, même multi-lignes,
      compte une seule fois (on dédoublonne les orderId).
  - prompt: |
      Deux produits : A fait 1 M€ de CA à 5 % de marge, B fait 300 k€ à 40 % de marge.
      Lequel rapporte le plus en valeur de marge ?
    options:
      - "A : 50 000 € de marge"
      - "B : 120 000 € de marge"
      - "Impossible à dire avec le CA seul"
    answer: 1
    explanation: >
      A : 1 000 000 × 5 % = 50 000 €. B : 300 000 × 40 % = 120 000 €. B rapporte plus, alors
      que son CA est bien plus faible : le CA seul ne suffit pas, regarde la marge.
  - prompt: |
      Le **turnover** RH se rapporte à quel effectif ?
    options:
      - "L'effectif de début de période"
      - "L'effectif moyen (début + fin) / 2"
      - "L'effectif de fin de période"
    answer: 1
    explanation: >
      On divise les départs par l'effectif **moyen**, car l'effectif varie sur la période ;
      un instantané biaiserait le taux.
  - prompt: |
      Le **DSO** d'une entreprise passe de 30 à 55 jours. Qu'est-ce que cela signale ?
    options:
      - "Les clients paient plus vite, trésorerie au top"
      - "Les clients paient plus lentement, trésorerie sous tension"
      - "Le chiffre d'affaires a doublé"
    answer: 1
    explanation: >
      Le DSO est le délai moyen d'encaissement. Plus il est élevé, plus l'argent met de
      temps à rentrer : la trésorerie se tend.
  - prompt: |
      Sur un poste de **dépenses**, le réel dépasse le budget de 12 %. Comment le qualifier ?
    options:
      - "Une bonne surperformance"
      - "Un dépassement budgétaire (à surveiller)"
      - "Neutre, sans interprétation possible"
    answer: 1
    explanation: >
      Sur des coûts, réel > budget = dépassement. Le même signe sur des **revenus** serait
      au contraire une bonne nouvelle : c'est le sens du poste qui décide.
  - prompt: |
      COGS annuels = 240 000 €. Stock début = 30 000 €, stock fin = 50 000 €.
      Quelle est la **rotation de stock** ?
    options:
      - "4× (240 000 / 60 000)"
      - "6× (240 000 / 40 000)"
      - "8× (240 000 / 30 000)"
    answer: 1
    explanation: >
      Stock moyen = (30 000 + 50 000) / 2 = 40 000 €. Rotation = 240 000 / 40 000 = **6×**.
      Le stock se renouvelle 6 fois par an (~toutes les 2 mois).
  - prompt: |
      Le CA de décembre est en hausse de **+70 %** par rapport à novembre. Le manager crie
      victoire. Quel KPI complémentaire doit absolument regarder l'analyste ?
    options:
      - "Le taux de retour des commandes uniquement"
      - "La comparaison YoY (décembre N-1) pour séparer la saisonnalité de la vraie tendance"
      - "La masse salariale du mois"
    answer: 1
    explanation: >
      La hausse MoM en décembre est souvent de la **saisonnalité Noël**. La vraie tendance
      se lit en **YoY** (même mois N-1). Un +70 % MoM peut cacher un −5 % YoY si l'année
      précédente était encore meilleure.
---

Dernier quiz du HUB : valide que tu sais calculer **et interpréter** les KPI métier.
