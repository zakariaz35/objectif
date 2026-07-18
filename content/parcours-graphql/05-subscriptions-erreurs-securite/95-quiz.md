---
title: "Quiz — subscriptions, erreurs, sécurité"
type: quiz
questions:
  - prompt: |
      Quelle est la différence fondamentale entre une `Subscription` et le
      « polling » (`useQuery` avec `pollInterval`) ?
    options:
      - |
        Une `Subscription` garde une connexion WebSocket persistante et
        POUSSE la donnée dès qu'un événement survient ; le polling relance
        une `Query` HTTP à intervalle régulier, sans connexion persistante.
      - "Aucune différence : les deux utilisent WebSocket en interne."
      - "Le polling n'existe qu'en REST, jamais en GraphQL."
    answer: 0
    tags: ["subscriptions", "polling"]
    level: debutant
    explanation: |
      Le polling reste une `Query` classique sur HTTP, relancée à
      intervalle fixe (latence + requêtes parfois inutiles). Une
      `Subscription` ouvre une connexion WebSocket que le serveur utilise
      pour pousser l'événement dès qu'il survient, sans round-trip répété.
  - prompt: |
      Pourquoi un `PubSub` en mémoire (`graphql-subscriptions`) pose
      problème dès que le serveur tourne sur PLUSIEURS instances ?
    options:
      - "Ce n'est jamais un problème, `PubSub` se synchronise automatiquement."
      - |
        Un événement publié sur une instance n'atteint PAS les clients
        connectés à une autre instance — il faut un backend partagé (Redis)
        pour relayer entre instances.
      - "Parce que `PubSub` ne fonctionne qu'avec une seule Subscription déclarée."
    answer: 1
    tags: ["subscriptions", "pubsub", "scalabilite"]
    level: intermediaire
    explanation: |
      Le `PubSub` par défaut est un simple bus d'événements EN MÉMOIRE,
      local au process. À plusieurs instances (scaling horizontal), il faut
      une implémentation adossée à Redis (ou équivalent) pour que l'événement
      atteigne tous les clients, quelle que soit l'instance à laquelle ils
      sont connectés.
  - prompt: |
      Une réponse GraphQL peut-elle contenir À LA FOIS des données valides
      ET des erreurs ?
    options:
      - "Non : soit `data` est complète, soit la requête échoue entièrement, comme en REST."
      - |
        Oui : chaque champ est résolu indépendamment, donc `data` (parfois
        partielle) et `errors[]` peuvent coexister dans la même réponse.
      - "Oui, mais uniquement pour les mutations, jamais pour les queries."
    answer: 1
    tags: ["erreurs", "data-partielle"]
    level: debutant
    explanation: |
      C'est une conséquence directe du modèle d'exécution champ par champ
      (module 3) : un champ peut échouer sans empêcher les autres d'être
      résolus normalement — d'où la coexistence possible de `data` et
      `errors` dans une même réponse HTTP 200.
  - prompt: |
      Un champ `author: Author!` (non-null) échoue à résoudre. Que devient
      le champ PARENT si celui-ci est nullable ?
    options:
      - "Rien : seul `author` devient `null`, le reste du parent est inchangé."
      - |
        Le parent ENTIER devient `null` — y compris ses autres champs
        pourtant résolus avec succès — car l'échec remonte jusqu'au premier
        ancêtre nullable rencontré.
      - "Le serveur renvoie une erreur HTTP 500, sans aucune donnée."
    answer: 1
    tags: ["propagation-null", "non-null"]
    level: avance
    explanation: |
      Un champ non-null (`!`) ne peut jamais valoir `null` : son échec
      remonte au parent, et s'arrête au premier ancêtre NULLABLE rencontré
      en remontant — qui devient `null` en entier, effaçant au passage ses
      autres champs déjà résolus.
  - prompt: |
      Pourquoi le depth limiting (`graphql-depth-limit`) ET la query
      complexity (`graphql-validation-complexity`) sont-ils DEUX protections
      distinctes, pas une seule ?
    options:
      - "Ce sont deux noms différents pour exactement la même protection."
      - |
        Le depth limiting borne le nombre de NIVEAUX d'imbrication ; la
        query complexity borne le COÛT total (ex. de grandes listes, même
        peu profondes) — une requête peut être coûteuse sans être profonde.
      - "Le depth limiting protège le client, la query complexity protège le serveur."
    answer: 1
    tags: ["securite", "depth-limit", "query-complexity"]
    level: intermediaire
    explanation: |
      Une requête `books(limit: 10000) { reviews(limit: 10000) { ... } }`
      n'est pas particulièrement profonde, mais très coûteuse — le depth
      limiting seul ne l'arrêterait pas. Les deux protections sont
      complémentaires, pas interchangeables.
  - prompt: |
      Pourquoi un Guard NestJS classique a-t-il besoin de
      `GqlExecutionContext.create(context)` pour fonctionner sur un
      resolver GraphQL ?
    options:
      - "Ce n'est pas nécessaire : les Guards REST fonctionnent tels quels sur GraphQL."
      - |
        Parce que l'`ExecutionContext` de NestJS ne pointe pas directement
        sur la requête HTTP dans un contexte GraphQL — l'adaptateur permet
        de la retrouver malgré tout.
      - "Parce que GraphQL n'utilise jamais de requête HTTP sous-jacente."
    answer: 1
    tags: ["securite", "guards", "nestjs"]
    level: avance
    explanation: |
      Un Guard REST lit typiquement `request.headers`/`request.user`
      directement depuis l'`ExecutionContext`. En GraphQL, ces informations
      sont accessibles via le CONTEXTE de la requête GraphQL (le même
      `context` passé à chaque resolver) — `GqlExecutionContext` fait ce
      pont, pour que le MÊME mécanisme de Guard fonctionne des deux côtés.
---

Six questions pour clore le parcours : subscriptions et WebSocket, données
partielles et propagation du `null`, et les réflexes de sécurité (depth
limiting, query complexity, Guards) à appliquer avant toute mise en
production.
