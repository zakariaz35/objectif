---
title: "Cartes mémo — Les examens en pratique"
type: flashcards
cards:
  - q: |
      Quelle est la différence d'angle entre CCDV-F (Developer) et CCA-F (Architect),
      sachant qu'ils couvrent les mêmes cinq domaines ?
    a: |
      CCDV-F teste le **comment implémenter** (quel paramètre, quel appel d'API,
      quelle configuration précise). CCA-F teste le **quoi choisir et pourquoi**
      (quelle architecture, quel compromis, quelle approche pour un système donné).
      Même socle de connaissances, focus différent.
  - q: |
      Quels sont le score de réussite et la durée de validité d'une certification
      Anthropic Foundations, et où faut-il vérifier ces informations avant de
      s'inscrire ?
    a: |
      Score de réussite : **720/1000**. Validité : **12 mois**. Ces chiffres — et
      surtout les tarifs et modalités — doivent être **reconfirmés** sur
      `anthropic-partners.skilljar.com` et `pearsonvue.com` avant inscription, car
      ils évoluent.
  - q: |
      Une question scénario propose, parmi ses options, d'ajouter une phrase au system
      prompt pour corriger un comportement indésirable observé en production. Faut-il
      s'en méfier par défaut ?
    a: |
      Oui, quand la question porte sur une **garantie technique** (idempotence,
      fraîcheur de donnée, format de sortie, résilience) : une reformulation de prompt
      n'apporte aucune garantie structurelle. Chercher plutôt un paramètre d'API, une
      architecture, ou un garde-fou applicatif.
  - q: |
      60 questions, 120 minutes. Quel est le budget de temps moyen par question, et
      quelle est la bonne stratégie face à une question qui résiste ?
    a: |
      **2 minutes par question** en moyenne. Face à une question qui résiste après une
      lecture attentive : **marquer et revenir** plus tard plutôt que de s'enliser — le
      temps perdu pénaliserait toutes les questions suivantes.
  - q: |
      Pour quelqu'un qui utilise déjà Claude Code au quotidien, où concentrer l'effort
      de révision plutôt que de tout reprendre uniformément ?
    a: |
      Sur ce que la pratique quotidienne **ne** couvre pas nécessairement : les
      paramètres exacts de l'API (noms, valeurs de `stop_reason`, mécanique du
      prompt caching), les ordres de grandeur de coûts, et la méthode de lecture des
      questions scénario — pas les bases déjà pratiquées intuitivement.
---

CCDV-F vs CCA-F, logistique, méthode anti-piège, gestion du temps, plan de révision ciblé.
