---
title: "Quiz — Context management & fiabilité"
type: quiz
questions:
  - prompt: |
      Une équipe met en cache son system prompt (règles métier stables, plusieurs
      milliers de tokens) via `cache_control: {"type": "ephemeral"}`. Elle insère aussi,
      dans ce même bloc système mis en cache, la date et l'heure du jour, pour donner
      un repère temporel à Claude. Après plusieurs jours d'observation, `usage.
      cache_read_input_tokens` reste obstinément à 0 sur toutes les requêtes.

      Quelle est la cause la plus probable, et la correction ?
    options:
      - "Le cache expire trop vite (5 minutes) ; il faut passer systématiquement au cache 1 heure."
      - "L'horodatage vivant change à chaque requête à l'intérieur du préfixe mis en cache, invalidant silencieusement le cache à chaque appel ; il faut sortir l'horodatage du bloc caché, en le plaçant après le dernier breakpoint."
      - "Le nombre de breakpoints (1 seul ici) est insuffisant ; il en faut au minimum 4."
      - "cache_control doit être placé sur les messages, jamais sur le system prompt."
    answer: 1
    tags: [prompt-caching]
    level: avance
    explanation: >
      Le TTL de 5 minutes (option 0) n'est pas en cause : la fréquence des requêtes
      n'est pas précisée comme un problème, et le TTL 1h n'aurait pas résolu une
      invalidation à CHAQUE requête. Le nombre de breakpoints (option 2) n'a pas
      d'impact ici : un seul breakpoint bien placé suffit à mettre en cache un
      préfixe stable. cache_control peut parfaitement être posé sur le system prompt
      (option 3 fausse) — c'est même l'un des usages les plus courants. Le vrai
      problème est le contenu volatile (l'horodatage) placé À L'INTÉRIEUR du bloc mis
      en cache : chaque requête a un préfixe légèrement différent, donc jamais de
      correspondance de hash, sans qu'aucune erreur ne le signale.
  - prompt: |
      Une requête déclare ses outils dans l'ordre [search_orders, refund_order,
      get_customer] au premier appel, puis [refund_order, search_orders, get_customer]
      au second appel (le système qui génère la liste des outils ne garantit pas un
      ordre stable). Le system prompt et les messages sont par ailleurs rigoureusement
      identiques entre les deux appels.

      Quel est l'effet le plus probable sur le prompt caching ?
    options:
      - "Aucun effet : seul le contenu textuel des outils compte, pas leur ordre."
      - "Le cache est invalidé dès le niveau tools, ce qui invalide en cascade le system et les messages mis en cache, même si leur contenu n'a pas changé."
      - "Seul le cache du niveau messages est affecté ; tools et system restent valides."
      - "L'ordre des outils n'a d'impact que si tool_choice est de type 'tool'."
    answer: 1
    tags: [prompt-caching]
    level: avance
    explanation: >
      La mise en cache suit la hiérarchie tools → system → messages : un changement
      au niveau tools (ici, l'ordre de sérialisation) modifie le hash du préfixe dès
      ce niveau, ce qui invalide en cascade tout ce qui suit, même si system et
      messages sont identiques mot pour mot (option 2 fausse, tools n'est justement
      pas épargné - option 0 fausse). Ce n'est pas conditionné au type de tool_choice
      (option 3) : c'est une propriété de la hiérarchie de cache elle-même, active dans
      tous les cas.
  - prompt: |
      Une base de connaissances interne totalise 3 millions de documents, mise à jour en
      continu par plusieurs équipes tout au long de la journée. Un ingénieur propose de
      charger l'intégralité du corpus dans le contexte d'un modèle à fenêtre de 1M
      tokens, avec du prompt caching pour maîtriser le coût, en argumentant que "ça
      tiendrait presque".

      Quelle est l'évaluation la plus juste de cette proposition ?
    options:
      - "Bonne idée : avec une fenêtre de 1M tokens et du prompt caching, le coût par requête resterait maîtrisé."
      - "Mauvaise idée : au-delà de la taille probable du corpus par rapport à la fenêtre, sa mise à jour continue rend une copie en contexte rapidement obsolète — RAG est plus adapté pour la taille et la fraîcheur."
      - "Mauvaise idée, mais uniquement à cause du coût : sans prompt caching ce serait injouable, avec c'est parfaitement viable."
      - "Bonne idée à condition d'augmenter effort à max pour compenser la taille du corpus."
    answer: 1
    tags: [rag, contexte]
    level: intermediaire
    explanation: >
      Le prompt caching (options 0 et 2) réduit le coût de RE-lecture d'un préfixe
      IDENTIQUE, mais ne résout ni le problème de taille (3 millions de documents
      dépasse très probablement toute fenêtre de contexte disponible), ni celui de la
      fraîcheur (un corpus mis à jour en continu invaliderait le cache en permanence,
      annulant justement son bénéfice). effort (option 3) ajuste l'intensité de
      raisonnement du modèle, sans rapport avec la taille du corpus accessible. RAG
      répond structurellement aux deux problèmes : récupération ciblée à la demande,
      toujours sur la version la plus fraîche.
  - prompt: |
      Un agent de support doit conserver certaines préférences exprimées par un client
      (langue préférée, historique de ses demandes précédentes) d'une conversation à
      l'autre, potentiellement plusieurs jours après. L'équipe a déjà mis en place la
      compaction pour gérer la croissance du contexte au sein de chaque conversation.

      Cette mise en place suffit-elle au besoin décrit ?
    options:
      - "Oui : la compaction résume déjà le contexte, ce résumé sera disponible à la prochaine conversation."
      - "Non : la compaction gère la croissance du contexte À L'INTÉRIEUR d'une conversation ; faire persister de l'information ENTRE conversations est le rôle de memory, un outil distinct."
      - "Oui, à condition d'augmenter le seuil de déclenchement de la compaction."
      - "Non : il faut désactiver la compaction et la remplacer entièrement par du context editing."
    answer: 1
    tags: [contexte]
    level: intermediaire
    explanation: >
      La compaction (options 0 et 2) résume le contenu ancien D'UNE conversation
      quand elle approche la limite de contexte ; elle n'a aucun mécanisme pour faire
      survivre cette information à la fin de la session ou à une conversation future.
      Le context editing (option 3) a la même portée intra-conversation que la
      compaction — le remplacement proposé ne changerait rien au problème de
      persistance inter-session. Seul memory est conçu pour cet usage : un outil qui
      écrit et relit des fichiers persistants, consultés au début d'une session
      future.
  - prompt: |
      Un pipeline de génération de rapports appelle Claude avec max_tokens=4096 pour
      produire un document détaillé. Sur environ 15 % des requêtes, la réponse revient
      avec stop_reason: "max_tokens" et un contenu visiblement incomplet. L'équipe
      ajoute un retry automatique qui relance exactement la même requête jusqu'à trois
      fois en cas de troncature.

      Quel est le problème avec cette stratégie, et quelle est la correction ?
    options:
      - "Aucun problème : c'est exactement le rôle du retry automatique du SDK, déjà conçu pour ce cas."
      - "Le retry à l'identique reproduira la même troncature (le problème n'est pas transitoire) ; la correction est d'augmenter max_tokens ou de streamer/reprendre la génération pour les sorties longues."
      - "Le problème est l'absence de prompt caching, qui seul peut éviter la troncature."
      - "Le problème est que max_tokens=4096 est déjà trop élevé ; il faut le réduire pour éviter la troncature."
    answer: 1
    tags: [fiabilite]
    level: intermediaire
    explanation: >
      Le retry automatique du SDK (option 0) cible les erreurs de TRANSPORT (429,
      5xx, coupures réseau) — pas les troncatures dues à max_tokens, qui sont
      déterministes pour un contenu de longueur donnée : relancer à l'identique
      redonnera la même limite atteinte. Le prompt caching (option 2) réduit le coût
      d'un préfixe réutilisé, sans rapport avec la longueur de sortie autorisée.
      Réduire max_tokens (option 3) aggraverait la troncature. La correction
      structurelle est d'augmenter max_tokens ou de mettre en place le streaming pour
      gérer proprement une sortie longue.
  - prompt: |
      Une application classifie chaque nuit environ 200 000 tickets de support archivés
      de la veille, sans contrainte de délai de réponse immédiat (le résultat n'est
      consulté que le lendemain matin par les équipes). Le budget de l'équipe est serré.

      Quelle option réduit le plus directement le coût de ce traitement, sans changer
      la qualité de classification obtenue ?
    options:
      - "Passer effort à low sur un modèle plus capable, pour compenser la perte de qualité par la puissance du modèle."
      - "Utiliser la Message Batches API pour ce traitement asynchrone : -50% sur le tarif standard, avec un traitement complété en général sous une heure."
      - "Activer le prompt caching uniquement, sans autre changement, en espérant une remise équivalente à celle de l'API Batches."
      - "Répartir la charge sur plusieurs comptes API pour multiplier les remises de volume."
    answer: 1
    tags: [couts]
    level: intermediaire
    explanation: >
      Ce cas (fort volume, asynchrone, pas de contrainte de latence immédiate) est
      exactement le cas d'usage central de la Batches API, avec une remise de -50%
      indépendante du prompt caching. Baisser effort en visant un modèle plus capable
      pour compenser (option 0) est une manipulation indirecte et incertaine, sans
      rapport avec le vrai levier disponible ici. Le prompt caching (option 2) réduit
      le coût d'un préfixe réutilisé mais n'atteint pas -50% sur l'ensemble du
      traitement à lui seul, et ne remplace pas la Batches API. Multiplier les comptes
      (option 3) n'est pas un mécanisme de remise reconnu.
---

Invalidateurs silencieux du cache, hiérarchie de cache, RAG vs long contexte, portée de memory, stop_reason max_tokens, Batches API.
