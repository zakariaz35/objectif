---
title: "Quiz — GraphQL, le paradigme"
type: quiz
questions:
  - prompt: |
      Un endpoint REST `GET /products/42` renvoie 15 champs alors que l'écran
      n'en affiche que 2. Comment appelle-t-on ce problème ?
    options:
      - "L'under-fetching"
      - "L'over-fetching"
      - "Une fuite mémoire"
    answer: 1
    tags: ["paradigme", "rest", "over-fetching"]
    level: debutant
    explanation: |
      L'over-fetching, c'est recevoir PLUS de champs que ce dont le client a
      réellement besoin — inévitable dès qu'une même ressource REST doit
      servir plusieurs écrans avec des besoins différents.
  - prompt: |
      Pour afficher un produit, ses avis et des produits similaires, il faut
      enchaîner 3 appels REST successifs. Comment appelle-t-on ce problème ?
    options:
      - "L'over-fetching"
      - "L'under-fetching"
      - "Le sur-provisionnement"
    answer: 1
    tags: ["paradigme", "rest", "under-fetching"]
    level: debutant
    explanation: |
      L'under-fetching, c'est le problème symétrique de l'over-fetching :
      une seule requête ne suffit pas, il faut en enchaîner plusieurs pour
      obtenir toutes les données nécessaires à un écran.
  - prompt: |
      Combien d'endpoints expose typiquement un serveur GraphQL ?
    options:
      - "Un par type de ressource, comme en REST."
      - |
        Un seul (généralement `POST /graphql`) ; ce qui varie, c'est le
        contenu de la requête envoyée dans le corps.
      - "Un par champ du schéma."
    answer: 1
    tags: ["paradigme", "endpoint"]
    level: debutant
    explanation: |
      GraphQL expose (presque toujours) un unique endpoint. Le routage
      métier ne se fait plus par l'URL, mais par le contenu de la requête
      GraphQL envoyée dans le corps de la requête HTTP.
  - prompt: |
      Qui décide de la FORME exacte de la réponse (quels champs, quelles
      relations) dans le modèle GraphQL ?
    options:
      - "Le serveur, une fois pour toutes, pour tous les clients."
      - "Le client, à chaque requête, via les champs qu'il sélectionne."
      - "Le navigateur, automatiquement, selon la taille d'écran."
    answer: 1
    tags: ["paradigme", "client-decrit"]
    level: debutant
    explanation: |
      C'est le changement de paradigme central : en REST, la forme de la
      réponse est fixée côté serveur (une route = une forme). En GraphQL,
      c'est le client qui choisit, requête par requête, quels champs il veut.
  - prompt: |
      Que permet l'introspection d'un schéma GraphQL ?
    options:
      - |
        Interroger le schéma lui-même pour découvrir les types et champs
        disponibles (utilisé par l'auto-complétion des outils comme Apollo
        Sandbox).
      - "Modifier le schéma à distance, sans redéployer le serveur."
      - "Chiffrer automatiquement les réponses sensibles."
    answer: 0
    tags: ["introspection", "schema"]
    level: intermediaire
    explanation: |
      L'introspection est une fonctionnalité du protocole GraphQL qui permet
      d'interroger le serveur sur son propre schéma. Très utile en
      développement ; à désactiver en production (module 5) pour ne pas
      exposer toute la cartographie de l'API.
  - prompt: |
      Une requête GraphQL demande un champ qui n'existe pas dans le schéma.
      Que se passe-t-il ?
    options:
      - "Le champ est ignoré silencieusement, la requête s'exécute quand même."
      - |
        La requête est rejetée à l'étape de VALIDATION, avant l'exécution du
        moindre resolver.
      - "Le serveur crashe."
    answer: 1
    tags: ["validation", "execution"]
    level: intermediaire
    explanation: |
      Le flux d'une requête suit trois étapes : parsing, validation (contre
      le schéma), puis exécution. Un champ inconnu est détecté à la
      validation — aucun resolver n'est appelé si la requête est invalide.
  - prompt: |
      Quel type de projet tire le MOINS de bénéfice à adopter GraphQL plutôt
      que REST ?
    options:
      - |
        Une API CRUD simple, un seul client, où chaque écran correspond
        presque exactement à une ressource.
      - |
        Une plateforme avec une appli web, une appli mobile et un
        back-office, aux besoins d'affichage très différents.
      - "Une API avec des relations profondément imbriquées entre entités."
    answer: 0
    tags: ["quand-choisir", "tradeoffs"]
    level: intermediaire
    explanation: |
      Sur une API CRUD simple avec un client unique, l'over/under-fetching
      n'est pas un vrai problème : le coût d'ajouter un schéma GraphQL et de
      gérer sa complexité propre (N+1, sécurité...) ne se justifie pas
      forcément. GraphQL brille avec des clients multiples ou des relations
      profondes.
---

Sept questions pour ancrer le problème que GraphQL résout (over/under-fetching),
le modèle « un seul endpoint, le client décrit ce qu'il veut », et les critères
pour choisir GraphQL à bon escient.
