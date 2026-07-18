---
title: "Quiz — Monitoring, audit & IAM avancé"
type: quiz
questions:
  - prompt: |
      Une équipe SRE veut être alertée si l'espace disque libre d'une flotte d'instances
      EC2 descend sous 10 %. Après avoir créé une alarm CloudWatch sur une métrique
      `DiskSpaceUtilization`, l'alarm reste bloquée en `INSUFFICIENT_DATA`. Quelle est la
      cause la plus probable ?
    options:
      - "L'alarm a été mal configurée : le seuil est trop bas."
      - "Cette métrique n'est pas envoyée par défaut ; il faut installer le CloudWatch Agent unifié sur les instances pour la publier."
      - "CloudWatch ne supporte pas les alarms sur des métriques disque."
      - "Il faut attendre 15 mois pour que la métrique soit disponible."
    answer: 1
    tags: [cloudwatch]
    level: intermediaire
    explanation: >
      Les métriques disque/RAM ne sont jamais envoyées par défaut (seules les métriques
      hyperviseur CPU/réseau/IO le sont) : sans CloudWatch Agent configuré sur l'instance,
      aucune donnée n'existe pour cette métrique, d'où l'état INSUFFICIENT_DATA. Ce n'est ni
      un problème de seuil, ni une limitation de CloudWatch sur ce type de métrique, ni une
      question de rétention.
  - prompt: |
      Le service conformité demande de savoir précisément **quel utilisateur IAM** a
      désactivé le chiffrement par défaut d'un bucket S3 la semaine dernière, avec l'heure
      exacte et l'adresse IP source. Quel service consulter en priorité ?
    options:
      - "CloudWatch Logs Insights"
      - "AWS Config"
      - "CloudTrail"
      - "AWS Trusted Advisor"
    answer: 2
    tags: [cloudtrail, audit]
    level: intermediaire
    explanation: >
      CloudTrail enregistre chaque appel API (identité, action, ressource, IP source,
      horodatage) — exactement la question « qui a fait quoi ». Config donnerait l'historique
      de configuration du bucket (utile en complément) mais pas l'identité précise de
      l'auteur avec la même granularité d'audit ; CloudWatch mesure des métriques/logs
      applicatifs, pas des appels API ; Trusted Advisor ne fait pas d'audit d'API.
  - prompt: |
      Une SCP attachée à l'OU « Sandbox » contient un unique statement `Deny` sur
      `ec2:RunInstances` en dehors de la région `eu-west-3`. Un développeur de cette OU a
      par ailleurs une policy IAM `AdministratorAccess`. Peut-il lancer une instance EC2
      dans `us-east-1` ?
    options:
      - "Oui, car AdministratorAccess prime toujours sur une SCP."
      - "Non, le Deny explicite de la SCP s'applique quel que soit le contenu des policies IAM du compte."
      - "Cela dépend de l'ordre d'attachement entre la SCP et la policy IAM."
      - "Oui, car les SCP ne s'appliquent qu'aux comptes de production."
    answer: 1
    tags: [scp, organizations, iam]
    level: avance
    explanation: >
      Une SCP définit un plafond : un Deny explicite dans la SCP bloque l'action pour
      TOUT principal du compte, même un administrateur avec AdministratorAccess. L'ordre
      d'attachement ne joue aucun rôle, et rien dans les SCP ne les restreint par défaut
      aux comptes de production — elles s'appliquent à l'OU/au compte auquel elles sont
      rattachées.
  - prompt: |
      Un lead technique doit pouvoir créer des IAM roles pour son équipe, mais
      l'entreprise veut garantir qu'aucun role ainsi créé ne pourra jamais obtenir
      d'accès à IAM ou à Organizations, même si le lead attache par erreur une policy
      trop permissive. Quel mécanisme répond précisément à ce besoin ?
    options:
      - "Une Service Control Policy (SCP) sur le compte entier."
      - "Une permission boundary appliquée aux roles que le lead peut créer."
      - "Un IAM Access Advisor configuré en mode restrictif."
      - "Une resource-based policy sur chaque role créé."
    answer: 1
    tags: [iam, permission-boundary]
    level: avance
    explanation: >
      La permission boundary plafonne les permissions maximales d'une identité IAM
      précise (ici, les roles créés par le lead) — c'est l'outil de délégation sécurisée
      par excellence. La SCP agirait sur tout le compte (trop large, et le lead pourrait
      ne pas être seul concerné). Access Advisor n'est qu'un outil d'audit, pas de
      restriction. Une resource-based policy ne s'attache pas à un role IAM de cette façon.
  - prompt: |
      Une entreprise a un Active Directory on-premises critique et veut permettre à des
      applications AWS (RDS SQL Server notamment) de s'authentifier contre cet annuaire,
      tout en garantissant que l'authentification continue de fonctionner même en cas de
      coupure temporaire du lien Direct Connect vers l'on-premises. Quelle option choisir ?
    options:
      - "AD Connector, qui redirige simplement les requêtes vers l'AD on-premises."
      - "Simple AD, suffisant pour ce cas d'usage."
      - "AWS Managed Microsoft AD avec une relation de confiance (trust) vers l'AD on-premises."
      - "IAM Identity Center seul, sans Directory Service."
    answer: 2
    tags: [directory-service, iam]
    level: avance
    explanation: >
      AWS Managed Microsoft AD est un annuaire complet et autonome dans le cloud : configuré
      en trust avec l'AD on-premises, il continue de fonctionner même si le lien réseau
      tombe temporairement. AD Connector ne stocke rien et dépend en permanence de la
      connectivité vers l'on-premises (mauvais choix ici). Simple AD ne supporte pas les
      trust relationships. IAM Identity Center gère le SSO applicatif mais ne remplace pas
      un Directory Service pour l'authentification RDS SQL Server.
  - prompt: |
      Quelle affirmation décrit correctement le rôle d'EventBridge par rapport à
      CloudWatch Alarms ?
    options:
      - "EventBridge et CloudWatch Alarms font exactement la même chose, ce sont deux noms pour le même service."
      - "EventBridge réagit à des événements discrets (ex. changement d'état d'une ressource) ; CloudWatch Alarms réagit au franchissement d'un seuil sur une métrique continue."
      - "EventBridge ne peut cibler que des fonctions Lambda, contrairement à CloudWatch Alarms."
      - "CloudWatch Alarms remplace EventBridge depuis la dépréciation de ce dernier."
    answer: 1
    tags: [eventbridge, cloudwatch]
    level: intermediaire
    explanation: >
      EventBridge route des événements (bus + rules + targets) : idéal pour réagir à
      « quelque chose qui vient de se passer ». CloudWatch Alarms surveille une métrique
      numérique et réagit quand elle franchit un seuil. EventBridge n'est pas déprécié et
      cible bien plus que Lambda (SQS, SNS, Step Functions, Kinesis...).
---

Vérifie tes réflexes CloudWatch, CloudTrail/Config, Organizations/SCP et IAM avancé.
