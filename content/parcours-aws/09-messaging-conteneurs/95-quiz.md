---
title: "Quiz — Messaging & conteneurs"
type: quiz
questions:
  - prompt: |
      Une équipe observe qu'un même message SQS est parfois traité deux fois par
      deux workers différents. Le traitement applicatif prend en moyenne 45
      secondes, et le visibility timeout de la file est resté à sa valeur par
      défaut (30 secondes). Quelle est la cause la plus probable, et la
      correction ?
    options:
      - "La file devrait être en mode FIFO pour éviter les doublons"
      - "Le visibility timeout expire avant la fin du traitement : il faut l'augmenter au-delà de 45 secondes"
      - "Le long polling n'est pas activé"
      - "La DLQ n'est pas configurée"
    answer: 1
    tags: [sqs, resilience]
    level: intermediaire
    explanation: >
      Le visibility timeout par défaut (30 s) est inférieur au temps de
      traitement réel (45 s) : le message redevient visible avant la fin du
      traitement et un second worker le récupère. La correction directe est
      d'augmenter le visibility timeout au-dessus du temps de traitement
      maximum. Passer en FIFO (option 0) change le modèle de débit et d'ordre,
      pas ce problème précis. Le long polling (option 2) réduit le nombre
      d'appels vides, sans lien avec le double traitement. La DLQ (option 3)
      isole les messages en échec répété, mais n'empêche pas ce scénario.
  - prompt: |
      Un événement "commande créée" doit déclencher trois traitements
      indépendants (facturation, préparation d'expédition, envoi d'un email de
      confirmation), chacun devant continuer à fonctionner même si l'un des
      trois est temporairement en panne. Quelle architecture répond
      précisément à ce besoin ?
    options:
      - "Une seule file SQS lue par les trois systèmes"
      - "Un topic SNS avec une file SQS dédiée par système, abonnée au topic (fan-out)"
      - "Un appel HTTP synchrone séquentiel vers les trois systèmes"
      - "Kinesis Data Streams avec un seul shard"
    answer: 1
    tags: [sns, sqs, resilience]
    level: intermediaire
    explanation: >
      Une seule file SQS (option 0) ne délivre chaque message qu'à UN SEUL
      consommateur, pas aux trois. Un appel HTTP synchrone (option 2) couple
      fortement les trois systèmes et propage les pannes. Kinesis (option 3)
      est surdimensionné pour ce besoin d'événement métier ponctuel. Le
      fan-out SNS + SQS publie l'événement une fois et le réplique vers trois
      files indépendantes, chacune consommée à son rythme, sans dépendance
      entre les trois systèmes.
  - prompt: |
      Une application Kinesis Data Streams utilise le user_id comme partition
      key. Un développeur s'étonne que l'ordre des événements ne soit garanti
      que par utilisateur, mais pas entre deux utilisateurs différents.
      Pourquoi ?
    options:
      - "C'est un bug de configuration du stream, l'ordre devrait être global"
      - "Les événements d'un même partition key vont toujours dans le même shard, où l'ordre est garanti ; des clés différentes peuvent aller dans des shards différents, sans ordre garanti entre eux"
      - "Kinesis ne garantit jamais l'ordre, quelle que soit la configuration"
      - "Il faut passer à Kinesis Data Firehose pour garantir l'ordre global"
    answer: 1
    tags: [kinesis, performance]
    level: avance
    explanation: >
      C'est le comportement normal et attendu de Kinesis (pas un bug, option
      0) : l'ordre est garanti au sein d'un shard, déterminé par la partition
      key. Kinesis garantit bien un ordre, mais seulement par shard (option
      2 fausse). Firehose (option 3) ne fait pas de traitement ordonné par
      clé, ce n'est pas sa vocation (livraison managée vers une destination).
      Pour un ordre global, il faudrait concentrer les données sur un seul
      shard, au prix du débit.
  - prompt: |
      Un pipeline doit ingérer un flux de logs applicatifs à très haut débit et
      les charger automatiquement dans un bucket S3, avec transformation légère
      du format, sans qu'aucune équipe n'ait à écrire ou opérer de code
      consommateur. Quel service choisir ?
    options:
      - "Kinesis Data Streams avec une application consommatrice sur mesure"
      - "Kinesis Data Firehose, avec une transformation Lambda optionnelle avant livraison"
      - "SQS Standard avec un worker qui écrit dans S3"
      - "SNS avec un abonnement S3 direct"
    answer: 1
    tags: [kinesis, architecture]
    level: intermediaire
    explanation: >
      Data Streams (option 0) exige d'écrire et d'opérer un consommateur,
      contraire à la contrainte énoncée. SNS n'a pas d'intégration de
      livraison directe vers S3 comme destination de flux (option 3, hors
      sujet). SQS (option 2) nécessiterait aussi un worker à opérer. Data
      Firehose est fait exactement pour ce cas : ingestion à haut débit,
      livraison managée vers S3, avec transformation Lambda optionnelle, sans
      code de consommateur à maintenir.
  - prompt: |
      Une task ECS échoue systématiquement au démarrage avec une erreur
      indiquant qu'elle ne parvient pas à tirer l'image depuis ECR. Quel rôle
      IAM faut-il vérifier en priorité ?
    options:
      - "Le task role"
      - "L'execution role"
      - "Le rôle IAM de l'utilisateur qui a lancé le déploiement"
      - "Aucun rôle IAM n'est impliqué dans le pull d'image"
    answer: 1
    tags: [ecs, securite]
    level: intermediaire
    explanation: >
      Le task role (option 0) concerne les permissions du CODE APPLICATIF une
      fois la task démarrée (ex. appeler S3/DynamoDB), pas le démarrage
      lui-même. Le pull d'image, l'écriture des logs et la lecture de secrets
      au démarrage sont des actions de l'AGENT ECS, couvertes par
      l'execution role — c'est lui qu'il faut vérifier ici. Le rôle de
      l'utilisateur qui déploie (option 2) n'intervient pas dans l'exécution
      de la task elle-même.
  - prompt: |
      Une startup veut déployer des conteneurs sans gérer aucun serveur
      sous-jacent, avec une facturation strictement proportionnelle aux
      ressources (vCPU/mémoire) réellement consommées par chaque tâche, et sans
      besoin particulier de Kubernetes. Quelle combinaison est la plus adaptée ?
    options:
      - "ECS avec launch type EC2"
      - "ECS avec launch type Fargate"
      - "EKS avec des nœuds EC2 auto-gérés"
      - "EC2 classique avec Docker installé manuellement"
    answer: 1
    tags: [ecs, fargate, cout]
    level: intermediaire
    explanation: >
      Le launch type EC2 (option 0) impose de gérer les instances
      sous-jacentes, contraire à la contrainte "sans gérer de serveur". EKS
      avec nœuds EC2 (option 2) ajoute la complexité de Kubernetes, non
      nécessaire ici, et ne retire pas la gestion de serveurs. EC2 classique
      avec Docker manuel (option 3) est l'option la plus lourde
      opérationnellement. Fargate correspond exactement au besoin :
      serverless, facturation à la tâche selon les ressources allouées, sans
      Kubernetes.
---

Visibility timeout, fan-out SNS/SQS, ordre Kinesis, Firehose, et les rôles IAM d'ECS.
