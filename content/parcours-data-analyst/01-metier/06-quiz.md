---
title: "Quiz — le métier"
type: quiz
questions:
  - prompt: |
      Dans la table de ventes `(order_id, region, category, quantity, amount)`, lesquelles
      sont des **dimensions** ?
    options:
      - "quantity et amount"
      - "region et category"
      - "order_id et amount"
    answer: 1
    explanation: >
      `region` et `category` sont des axes de découpage (dimensions). `quantity` et
      `amount` sont des mesures (numériques, qu'on agrège). `order_id` est un identifiant.
  - prompt: |
      Quelle est la **première** étape du workflow de l'analyste ?
    options:
      - "Nettoyer les données"
      - "Construire le dashboard"
      - "Cadrer la question métier"
    answer: 2
    explanation: >
      Sans question claire, on produit un livrable qui ne répond à rien. On cadre d'abord
      le *pourquoi*, puis on collecte, nettoie, analyse et restitue.
  - prompt: |
      Tu as déjà un export agrégé « CA total par mois ». On te demande le CA par jour.
      Peux-tu le produire ?
    options:
      - "Oui, en redécoupant le total mensuel"
      - "Non : on ne peut pas redescendre sous la granularité agrégée"
      - "Oui, en divisant par 30"
    answer: 1
    explanation: >
      Une fois agrégé au mois, le détail journalier est perdu. On peut agréger du fin vers
      le grossier, jamais l'inverse. Il faut repartir de la donnée fine.
  - prompt: |
      Quel outil est le plus adapté pour **partager un tableau de bord interactif** qui se
      met à jour automatiquement ?
    options:
      - "Excel"
      - "Power BI"
      - "Un fichier texte"
    answer: 1
    explanation: >
      Power BI (ou Tableau) est conçu pour modéliser et publier des dashboards
      interactifs. Excel reste excellent pour l'exploration rapide et les petits volumes.
---

Quelques questions pour ancrer le vocabulaire et le workflow.
