---
title: "Quiz — Serverless"
type: quiz
questions:
  - prompt: |
      Une équipe veut migrer un traitement vidéo qui dure systématiquement
      entre 30 et 45 minutes vers une architecture serverless avec Lambda.
      Quel est le problème, et quelle alternative envisager ?
    options:
      - "Aucun problème, il suffit d'augmenter la mémoire allouée à la fonction"
      - "Le timeout maximum de Lambda est de 15 minutes : il faut envisager ECS/Fargate ou AWS Batch pour ce traitement"
      - "Il faut activer le provisioned concurrency pour dépasser la limite de durée"
      - "Il faut découper le traitement vidéo en plusieurs invocations Step Functions Express"
    answer: 1
    tags: [lambda, architecture]
    level: intermediaire
    explanation: >
      Le timeout maximum d'une fonction Lambda est de 15 minutes, quelle que
      soit la mémoire allouée (option 0 fausse) ou la concurrence configurée
      (option 2, sans rapport avec la durée max). Step Functions Express
      (option 3) est lui-même plafonné à 5 minutes par exécution, donc pas
      adapté non plus tel quel. Pour un traitement systématiquement plus long
      que 15 minutes, la bonne réponse est de sortir de Lambda et d'utiliser
      ECS/Fargate ou AWS Batch, sans cette contrainte de durée.
  - prompt: |
      Une table DynamoDB utilise un attribut `order_status` (3 valeurs
      possibles : pending, shipped, delivered) comme partition key. Les
      performances se dégradent fortement sous forte charge, malgré une
      capacité provisionnée largement suffisante au global. Quelle est la
      cause ?
    options:
      - "La table devrait utiliser DynamoDB Streams pour répartir la charge"
      - "Une hot partition : la faible cardinalité de la partition key concentre le trafic sur trois partitions physiques seulement"
      - "Il manque une Local Secondary Index"
      - "DAX doit être activé pour corriger ce problème"
    answer: 1
    tags: [dynamodb, performance]
    level: avance
    explanation: >
      Streams (option 0) capture des changements, ne répartit pas la charge.
      Une LSI (option 2) ajoute un axe de tri, sans effet sur la distribution
      de la clé primaire. DAX (option 3) cache les lectures mais n'adresse
      pas un déséquilibre d'écriture sur une clé à faible cardinalité. Le vrai
      problème est le choix de la partition key : avec seulement 3 valeurs
      possibles, tout le trafic converge vers 3 partitions physiques
      (hot partition) — il faut une clé à forte cardinalité (ex. combinée
      avec un `order_id`).
  - prompt: |
      Six mois après la mise en production d'une table DynamoDB, une équipe a
      besoin d'un nouvel axe de requête sur un attribut qui n'était pas prévu
      à la conception initiale. Quelle solution est possible sans recréer la
      table ?
    options:
      - "Ajouter une Local Secondary Index (LSI)"
      - "Ajouter une Global Secondary Index (GSI)"
      - "Ce n'est possible qu'en recréant entièrement la table"
      - "Activer DynamoDB Streams pour indexer l'attribut a posteriori"
    answer: 1
    tags: [dynamodb, architecture]
    level: intermediaire
    explanation: >
      Une LSI (option 0) ne peut être définie qu'à la création de la table :
      impossible d'en ajouter une six mois plus tard sans tout recréer. Une
      GSI (option 1), en revanche, peut être ajoutée à tout moment sur une
      table existante — c'est fait exactement pour ce besoin. Streams (option
      3) capture des changements d'items, ce n'est pas un mécanisme
      d'indexation.
  - prompt: |
      Une application mobile authentifie ses utilisateurs et a aussi besoin
      que l'application puisse uploader directement des fichiers vers un
      bucket S3, sans passer par un backend intermédiaire. Quelle combinaison
      Cognito est nécessaire ?
    options:
      - "Un User Pool seul suffit, il fournit déjà des identifiants IAM temporaires"
      - "Un User Pool pour authentifier, puis un Identity Pool pour échanger le JWT contre des identifiants IAM temporaires"
      - "Un Identity Pool seul suffit, il gère aussi les comptes utilisateurs"
      - "Il faut créer un rôle IAM directement lié à chaque utilisateur Cognito, sans Identity Pool"
    answer: 1
    tags: [cognito, securite]
    level: intermediaire
    explanation: >
      Un User Pool seul (option 0) authentifie et émet un JWT applicatif,
      mais ne fournit jamais d'identifiants IAM directs. Un Identity Pool seul
      (option 2) ne gère pas de comptes utilisateurs, il a besoin d'une
      identité déjà authentifiée en entrée. La combinaison correcte : le User
      Pool authentifie l'utilisateur, puis le JWT est échangé auprès de
      l'Identity Pool contre des identifiants AWS temporaires (via STS)
      permettant l'appel direct à S3. L'option 3 n'est pas un mécanisme
      Cognito standard.
  - prompt: |
      Une startup construit une API Lambda simple, sans besoin de clés API,
      de usage plans ni d'endpoint privé, avec une forte sensibilité au coût
      et à la latence. Quel type d'API Gateway choisir ?
    options:
      - "REST API, pour bénéficier de toutes les fonctionnalités futures possibles"
      - "HTTP API, plus économique et à latence plus faible, suffisant ici"
      - "Un endpoint API Gateway Private"
      - "Aucune API Gateway n'est nécessaire, Lambda peut être appelée directement par le client mobile"
    answer: 1
    tags: [api-gateway, cout]
    level: intermediaire
    explanation: >
      REST API (option 0) est plus cher et plus complexe que nécessaire ici.
      Un endpoint Private (option 2) rendrait l'API inaccessible depuis
      l'extérieur du VPC, contraire au besoin d'une API publique pour des
      clients mobiles. Appeler Lambda directement depuis un client (option 3)
      n'est pas un pattern recommandé pour une API publique (pas de gestion
      d'authentification/throttling standard). HTTP API répond exactement au
      besoin : coût réduit, latence faible, fonctionnalités suffisantes.
  - prompt: |
      Un pipeline doit traiter un flux d'événements IoT à très haut débit, où
      chaque traitement dure quelques secondes, et où une exécution
      occasionnellement dupliquée est acceptable. Standard ou Express
      Workflows pour Step Functions ?
    options:
      - "Standard Workflows, pour la garantie exactly-once"
      - "Express Workflows, pour le débit élevé et la facturation à la requête + durée"
      - "Cela dépend uniquement du prix, sans autre critère technique"
      - "Aucun des deux, Step Functions ne traite pas les événements IoT"
    answer: 1
    tags: [step-functions, performance]
    level: intermediaire
    explanation: >
      Standard Workflows (option 0) garantit exactly-once mais cible des
      workflows plus longs et moins fréquents, facturés par transition
      d'état — pas optimal pour un très haut débit d'événements courts. Le
      débit et la tolérance à un traitement occasionnellement dupliqué
      (at-least-once) pointent vers Express Workflows, conçu précisément pour
      ce profil à fort volume. Step Functions peut tout à fait orchestrer un
      pipeline IoT (option 3 fausse).
---

Limites Lambda, hot partition DynamoDB, GSI/LSI, Cognito, API Gateway et Step Functions.
