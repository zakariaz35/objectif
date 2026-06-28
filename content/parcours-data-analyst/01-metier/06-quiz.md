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
  - prompt: |
      Un manager demande « le CA du mois ». Tu constates que la colonne `region` contient
      `nord`, `Nord` et `Nord ` (avec espace). À quelle **étape du workflow** appartient
      ce problème, et quelle en est la conséquence si on l'ignore ?
    options:
      - "Étape Collecte — on duplique les lignes"
      - "Étape Nettoyage — le CA Nord sera fragmenté en 3 groupes erronés"
      - "Étape Analyse — le GROUP BY donnera un résultat aléatoire"
    answer: 1
    explanation: >
      C'est un problème de **nettoyage** (casse et espaces). Sans correction, un `GROUP BY region`
      crée 3 groupes distincts au lieu d'un seul « Nord ». Le CA Nord affiché sera fragmenté
      et faussement bas pour chaque variante.
  - prompt: |
      Un analyste calcule « CA mensuel 85 000 € ». Un KPI manager dit
      « CA mensuel 85 000 € vs objectif 80 000 €, +6,25 % — cible dépassée ».
      Quelle est la différence fondamentale ?
    options:
      - "Aucune — ce sont les mêmes informations"
      - "Le KPI ajoute la comparaison à un objectif et la décision associée"
      - "Le KPI est moins précis car il ajoute un commentaire"
    answer: 1
    explanation: >
      Une métrique est un chiffre brut. Un KPI est une métrique **comparée à un objectif
      et reliée à une décision**. Le seuil de performance transforme la donnée en
      instrument de pilotage.
---

Quelques questions pour ancrer le vocabulaire et le workflow.
