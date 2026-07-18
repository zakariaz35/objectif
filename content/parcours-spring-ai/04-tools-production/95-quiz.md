---
title: "Quiz — Tools / function calling & mise en production"
type: quiz
questions:
  - prompt: |
      Dans le function calling, qui exécute réellement le code d'un tool
      demandé par le LLM ?
    options:
      - "Le LLM lui-même, dans un environnement d'exécution isolé fourni par le fournisseur."
      - "Ton application : le modèle demande l'exécution, mais c'est ton code Java qui s'exécute réellement."
      - "Aucune exécution réelle n'a lieu ; le modèle simule le résultat."
    answer: 1
    tags: ["tools", "function-calling"]
    level: debutant
    explanation: |
      Le LLM ne fait qu'orchestrer : il demande l'exécution d'un tool avec
      certains paramètres, mais c'est toujours l'application (ton code Java)
      qui exécute réellement la méthode et renvoie le résultat au modèle.
  - prompt: |
      À quoi sert concrètement la `description` d'un `@Tool` et de ses
      `@ToolParam` ?
    options:
      - "C'est un simple commentaire, ignoré à l'exécution."
      - "Elle guide le modèle sur QUAND et COMMENT appeler ce tool — une description vague donne un tool mal utilisé."
      - "Elle sert uniquement à générer la documentation Javadoc du projet."
    answer: 1
    tags: ["tools", "annotation"]
    level: debutant
    explanation: |
      Le modèle lit ces descriptions pour décider s'il doit appeler le tool
      et avec quels paramètres. Une description imprécise mène à des appels
      de tool incorrects ou à des occasions manquées de l'utiliser.
  - prompt: |
      Pourquoi faut-il éviter d'exposer un tool trop large (ex. exécuter du
      SQL arbitraire) au LLM ?
    options:
      - "Parce que Spring AI limite techniquement chaque tool à un seul paramètre."
      - "Parce qu'un tool large augmente le risque qu'une injection de prompt ou une décision imprévue du modèle déclenche une action non voulue."
      - "Ce n'est pas un problème : plus un tool est large, plus il est utile."
    answer: 1
    tags: ["tools", "securite"]
    level: intermediaire
    explanation: |
      Un tool doit être étroit et typé, avec ses propres contrôles d'accès.
      Un tool trop générique transforme une question utilisateur anodine (ou
      un document empoisonné ingéré par du RAG) en risque de sécurité réel.
  - prompt: |
      Quelle différence de prudence faut-il appliquer entre un tool en
      lecture seule (`getOrderStatus`) et un tool à effet de bord
      (`cancelOrder`) ?
    options:
      - "Aucune : tous les tools doivent être traités de façon strictement identique."
      - "Un tool à effet de bord (irréversible ou coûteux) doit exiger une étape de confirmation explicite côté application, pas une confiance aveugle dans la décision du modèle."
      - "Un tool en lecture seule est plus dangereux, car il expose des données."
    answer: 1
    tags: ["tools", "effets-de-bord"]
    level: intermediaire
    explanation: |
      Un tool en lecture seule a un impact limité en cas d'erreur. Un tool
      qui modifie un état réel (annulation, remboursement, envoi d'email)
      doit être protégé par une confirmation explicite, car une décision
      erronée du modèle a des conséquences réelles et parfois irréversibles.
  - prompt: |
      Que permet de suivre le `Usage` (tokens) exposé par le `ChatResponse`
      d'un appel Spring AI ?
    options:
      - "Le temps CPU consommé par le serveur Spring Boot lui-même."
      - "Le volume de tokens en entrée/sortie d'un appel — la base du suivi de coût par fonctionnalité ou par client."
      - "Le nombre de tools disponibles pour cet appel."
    answer: 1
    tags: ["observabilite", "couts"]
    level: intermediaire
    explanation: |
      Le Usage rapporte les tokens de prompt, de génération et le total —
      exactement ce qu'il faut historiser pour comprendre et maîtriser le
      coût réel d'une fonctionnalité utilisant un LLM.
  - prompt: |
      Pourquoi traiter un appel `ChatClient` avec la même discipline
      (timeout, retry, supervision) qu'un appel HTTP externe classique ?
    options:
      - "Parce qu'un appel LLM a une latence et un taux d'échec variables, exactement comme n'importe quelle dépendance externe."
      - "Ce n'est pas nécessaire : Spring AI gère automatiquement tous les cas d'échec sans configuration."
      - "Uniquement par convention de style, sans réel impact en production."
    answer: 0
    tags: ["production", "resilience"]
    level: avance
    explanation: |
      Un LLM reste un service externe (réseau, latence variable, possibilité
      d'échec). Les mêmes outils Spring habituels (Resilience4j, Spring
      Retry, Actuator/Micrometer) s'appliquent, comme sur toute intégration
      externe déjà en place côté Symfony/Python.
---

Six questions pour vérifier le mécanisme de function calling, la rigueur des
descriptions de tools, la distinction lecture seule/effet de bord, et les
réflexes de production (coûts, observabilité, résilience).
