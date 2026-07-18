---
title: "Quiz — Pourquoi Spring AI & le ChatClient"
type: quiz
questions:
  - prompt: |
      Quel est le rôle principal de Spring AI vis-à-vis des fournisseurs de
      LLM (Anthropic, OpenAI, Ollama...) ?
    options:
      - "Fournir une API portable, indépendante du fournisseur choisi."
      - "Remplacer entièrement l'API HTTP du fournisseur par un protocole propriétaire Spring."
      - "Héberger lui-même des modèles de langage pour éviter tout fournisseur externe."
    answer: 0
    tags: ["chatclient", "abstraction"]
    level: debutant
    explanation: |
      Spring AI ne réinvente pas les LLM : il fournit une couche d'abstraction
      (ChatModel/ChatClient) qui reste stable quel que soit le fournisseur
      réel derrière, exactement comme la Platform d'ai-bundle côté Symfony AI.
  - prompt: |
      Pour basculer une application Spring AI de Claude (Anthropic) vers
      OpenAI, que faut-il changer, en principe ?
    options:
      - "Réécrire entièrement le code métier qui construit les prompts."
      - "Changer le starter Maven/Gradle et les propriétés de configuration, sans toucher au code métier."
      - "Rien : Spring AI détecte automatiquement le meilleur fournisseur disponible."
    answer: 1
    tags: ["starter", "abstraction"]
    level: debutant
    explanation: |
      C'est tout l'intérêt de l'abstraction : le code qui utilise ChatClient
      reste identique. Seuls le starter (spring-ai-starter-model-openai) et
      les propriétés application.properties changent.
  - prompt: |
      Dans un prompt Spring AI, à quoi sert le message `system`, par
      opposition au message `user` ?
    options:
      - "Il porte la demande ponctuelle de l'utilisateur, différente à chaque appel."
      - "Il porte les instructions stables et le comportement attendu du modèle, fixés une fois pour toutes."
      - "Il n'existe pas en Spring AI, seul `user` est disponible."
    answer: 1
    tags: ["prompt", "system-message"]
    level: debutant
    explanation: |
      Le message système fixe le rôle, le ton et les contraintes du modèle,
      de manière stable — le même découpage que l'API Messages d'Anthropic
      (system + messages).
  - prompt: |
      Pourquoi préférer une `temperature` basse (proche de 0) pour une tâche
      de classification ou d'extraction de données ?
    options:
      - "Parce qu'une température basse réduit le nombre de tokens facturés."
      - "Parce qu'une température basse rend les réponses plus stables et reproductibles, utile quand on veut de la fiabilité."
      - "Parce que la température n'a aucun effet sur ce type de tâche."
    answer: 1
    tags: ["chatoptions", "temperature"]
    level: intermediaire
    explanation: |
      La température contrôle la variabilité de la génération. Pour des
      tâches où l'on veut un résultat cohérent d'un appel à l'autre
      (classification, extraction), on vise une température basse (0 à 0.2).
  - prompt: |
      Que fait concrètement `.entity(MonRecord.class)` sur une réponse de
      ChatClient ?
    options:
      - "Il ajoute une instruction de format au prompt ET parse la réponse JSON du modèle vers une instance du record."
      - "Il valide la réponse contre un schéma JSON strict côté serveur Spring, en rejetant l'appel si le modèle se trompe."
      - "Il transforme automatiquement le record en table de base de données."
    answer: 0
    tags: ["structured-output", "entity"]
    level: intermediaire
    explanation: |
      .entity(...) combine deux étapes : injecter une instruction de format
      dérivée du record dans le prompt, puis parser le JSON renvoyé par le
      modèle vers cette structure Java.
  - prompt: |
      Pourquoi faut-il tout de même prévoir une gestion d'erreur (try/catch,
      validation) autour d'un appel `.entity(...)` ?
    options:
      - "Parce que Spring AI ne fournit aucune garantie que le modèle renvoie un JSON strictement conforme au record demandé."
      - "Parce que .entity(...) est expérimental et sera bientôt supprimé."
      - "Ce n'est pas nécessaire : Spring AI garantit un parsing sans erreur possible."
    answer: 0
    tags: ["structured-output", "fiabilite"]
    level: intermediaire
    explanation: |
      Un LLM reste probabiliste : il peut produire un JSON légèrement
      invalide ou une valeur hors des attentes métier. Un appel .entity(...)
      doit être traité comme n'importe quel appel externe non fiable.
---

Six questions pour vérifier l'abstraction multi-modèles de Spring AI, le
rôle du `ChatClient`, la distinction system/user, le réglage de la
température et le mapping vers des réponses structurées.
