---
title: "Quiz — Tool design & intégration MCP"
type: quiz
questions:
  - prompt: |
      Une équipe expose un outil `check_order_status` à Claude, avec la description
      suivante : `"Returns the current status of an order given its id."`. En
      production, Claude appelle parfois cet outil pour des demandes de remboursement,
      alors qu'un outil distinct `refund_order` existe déjà pour ce cas précis. Le
      schéma JSON des deux outils est correct et sans ambiguïté de type.

      Quelle est la correction la plus pertinente ?
    options:
      - "Passer tool_choice à {\"type\": \"tool\", \"name\": \"refund_order\"} pour forcer le bon outil."
      - "Réécrire la description de check_order_status pour préciser explicitement son usage (consulter un statut) et l'exclusion des demandes de remboursement, qui doivent passer par refund_order."
      - "Ajouter disable_parallel_tool_use: true pour empêcher Claude d'appeler le mauvais outil."
      - "Fusionner les deux outils en un seul, pour éviter toute confusion entre eux."
    answer: 1
    tags: [outils]
    level: intermediaire
    explanation: >
      Le problème est une description qui ne précise pas les cas d'exclusion : elle dit
      ce que fait l'outil mais pas ce qu'il ne faut PAS lui demander. La correction
      structurelle est de rendre la description prescriptive sur ce point précis.
      Forcer tool_choice sur un outil fixe (option 0) casserait tous les autres usages
      légitimes de check_order_status. disable_parallel_tool_use (option 2) contrôle le
      nombre d'outils appelés par tour, pas lequel est choisi. Fusionner les outils
      (option 3) est une régression : les deux actions ont des effets de bord et des
      permissions différents (consulter vs modifier), les garder distincts est la bonne
      pratique.
  - prompt: |
      Un développeur veut que Claude appelle systématiquement l'outil
      `search_knowledge_base` avant de répondre à toute question, tout en gardant un
      commentaire en langage naturel ("Je vais chercher dans la base de connaissances...")
      avant l'appel. Il configure tool_choice: {"type": "tool", "name":
      "search_knowledge_base"}, mais Claude n'émet jamais ce commentaire.

      Pourquoi, et quelle est la correction ?
    options:
      - "C'est un bug : tool_choice de type 'tool' devrait toujours permettre du texte avant l'appel."
      - "Avec tool_choice de type 'tool' (ou 'any'), l'API force l'appel en préremplissant le tour assistant : aucun texte n'est émis avant le tool_use. Il faut rester en 'auto' et guider via une instruction explicite dans le message utilisateur."
      - "Il faut passer à disable_parallel_tool_use: true pour libérer un tour de texte avant l'outil."
      - "Il faut ajouter strict: true sur l'outil pour autoriser un commentaire avant l'appel."
    answer: 1
    tags: [tool-choice]
    level: intermediaire
    explanation: >
      C'est un comportement documenté, pas un bug (option 0 fausse) : any/tool
      préremplissent le tour pour garantir l'appel, ce qui empêche tout texte avant le
      tool_use. disable_parallel_tool_use (option 2) ne change rien à cette contrainte,
      il contrôle uniquement le nombre d'outils appelés. strict (option 3) concerne la
      conformité du schéma des paramètres, sans lien avec l'émission de texte. La seule
      façon d'obtenir à la fois un commentaire et un appel quasi garanti est de rester
      en auto et de pousser le comportement par une instruction explicite.
  - prompt: |
      Un agent reçoit une tâche qui se décompose en trois vérifications indépendantes
      (stock d'un produit, statut de livraison d'une commande, solde de fidélité d'un
      client). Claude répond avec trois blocs tool_use dans un seul tour. Le harnais
      exécute les trois outils en parallèle avec asyncio.gather, puis renvoie chaque
      tool_result dans un message user séparé, dans l'ordre où chaque exécution se
      termine, pour "streamer" les résultats dès qu'ils sont prêts.

      Quel est le problème avec cette implémentation ?
    options:
      - "Aucun problème : streamer les résultats dès qu'ils sont prêts est une bonne pratique de latence."
      - "Les tool_result doivent tous revenir dans un seul message user, tool_use_id par tool_use_id ; les répartir sur plusieurs messages casse le format attendu et dégrade le parallélisme."
      - "Le problème est que l'exécution devrait être séquentielle, pas parallèle, pour ce type de vérifications."
      - "Le problème est l'absence de strict: true sur les trois outils."
    answer: 1
    tags: [tool-choice, outils]
    level: avance
    explanation: >
      Exécuter en parallèle est correct (option 2 fausse) ; le problème est uniquement
      dans le renvoi des résultats. Le format attendu regroupe tous les tool_result
      d'un même tour dans un seul message user, tool_result en premier avant tout
      texte. Les répartir en plusieurs messages (option 0, présentée comme un
      avantage) est justement le piège d'examen : cela dégrade le parallélisme et peut
      provoquer des erreurs de formatage. strict (option 3) concerne la validité des
      paramètres d'entrée, sans lien avec le format des résultats.
  - prompt: |
      Un outil `charge_payment` appelle un prestataire de paiement externe qui échoue de
      façon transitoire environ 5 % du temps (indisponibilité momentanée, 500). L'équipe
      envisage d'ajouter au system prompt : "Si le paiement échoue, réessaie
      automatiquement jusqu'à ce que ça fonctionne."

      Quelle est l'évaluation la plus juste de cette approche ?
    options:
      - "C'est suffisant : Claude relancera l'outil autant de fois que nécessaire selon l'instruction du system prompt."
      - "C'est insuffisant et risqué : il faut un retry avec backoff côté harnais applicatif pour absorber les échecs transitoires, un is_error informatif pour les cas remontés, et une échappatoire (secours ou escalade humaine) en cas d'échec persistant — pas une simple instruction de prompt sur une opération financière sensible."
      - "C'est suffisant, à condition d'ajouter strict: true sur l'outil charge_payment."
      - "C'est insuffisant : il faut simplement augmenter max_tokens pour laisser plus de place aux tentatives."
    answer: 1
    tags: [erreurs]
    level: avance
    explanation: >
      Compter sur une instruction de prompt pour gérer la résilience d'une opération de
      paiement est risqué et non structurel : rien ne garantit un nombre de tentatives
      borné, ni n'empêche un double débit en cas de retry mal maîtrisé. La réponse
      correcte combine retry/backoff applicatif, is_error informatif, et une
      échappatoire pour les échecs persistants. strict (option 2) ne concerne que la
      validité du schéma des paramètres, pas la résilience d'exécution. max_tokens
      (option 3) borne la longueur de la réponse générée, sans rapport avec les
      tentatives de paiement.
  - prompt: |
      Une équipe expose 80 outils MCP à Claude dans un même agent (facturation, CRM,
      support, infrastructure). Elle observe une dégradation notable de la précision de
      sélection d'outil, et un coût de tokens élevé dès le premier tour, avant même
      qu'une tâche ne commence.

      Quelle mesure structurelle répond le mieux à ce problème, sans réduire les
      capacités fonctionnelles de l'agent ?
    options:
      - "Réduire le nombre d'outils exposés à moins de 10, en supprimant les moins utilisés."
      - "Marquer les outils peu utilisés avec defer_loading: true et ajouter le tool search tool, pour que Claude charge leurs schémas complets seulement quand il les découvre par une recherche."
      - "Passer tool_choice à {\"type\": \"any\"} pour accélérer la sélection."
      - "Fusionner les 80 outils en 4 outils génériques, un par domaine métier."
    answer: 1
    tags: [mcp, outils]
    level: avance
    explanation: >
      Supprimer des outils (option 0) réduit les capacités, ce que la question exclut
      explicitement. tool_choice: any (option 2) force un appel d'outil par tour mais
      n'a aucun effet sur le nombre de définitions chargées en contexte. Fusionner en
      outils génériques (option 3) recrée le problème vu en leçon 1 : une description
      vague, difficile à utiliser correctement. Le tool search (defer_loading +
      tool_search_tool) est fait précisément pour ce cas : il charge les schémas à la
      demande, réduit drastiquement le coût de tokens initial, et préserve la précision
      de sélection en ne présentant que les outils pertinents à un instant donné.
  - prompt: |
      Une équipe doit connecter Claude à un outil interne de reporting, hébergé sur le
      cloud de l'entreprise et partagé par plusieurs applications internes, avec une
      authentification par token. Elle hésite entre un serveur MCP en transport stdio
      et un serveur MCP en transport HTTP.

      Quel choix est le plus adapté, et pourquoi ?
    options:
      - "stdio, car c'est le transport le plus performant pour tout usage MCP."
      - "HTTP : c'est le transport recommandé pour un service distant partagé, avec authentification par token et reconnexion automatique en cas de coupure."
      - "stdio, car il permet une authentification par token contrairement à HTTP."
      - "Aucun des deux : MCP ne supporte que le transport SSE pour les services distants."
    answer: 1
    tags: [mcp]
    level: intermediaire
    explanation: >
      stdio (options 0 et 2) est destiné à des serveurs locaux exécutés en process sur
      la même machine, pas à un service cloud partagé — et l'authentification par
      token n'est pas une exclusivité de stdio, HTTP la supporte nativement. SSE
      (option 3) existe mais est déprécié au profit de HTTP. Pour un service distant
      partagé par plusieurs applications, HTTP est le transport recommandé.
---

Descriptions prescriptives, tool_choice, parallélisme, gestion d'erreurs, tool search et transports MCP.
