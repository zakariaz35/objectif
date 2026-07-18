---
title: "Quiz — Le log distribué"
type: quiz
questions:
  - prompt: |
      Quelle affirmation décrit le mieux la différence fondamentale entre Kafka
      et une file de messages classique comme RabbitMQ ?
    options:
      - |
        Kafka est plus rapide, mais fonctionne exactement comme une file : un message
        consommé disparaît.
      - |
        Kafka conserve les messages selon une politique de rétention, même après leur
        lecture ; un consommateur avance un pointeur (offset) au lieu de retirer le message.
      - |
        Kafka ne peut avoir qu'un seul consommateur par topic, contrairement à RabbitMQ.
    answer: 1
    tags: [log-distribue, fondamentaux]
    level: débutant
    explanation: |
      Le modèle de Kafka est un log append-only : un message reste disponible selon la
      rétention configurée, indépendamment du fait qu'il ait été lu. Le consommateur ne
      supprime rien : il avance sa position (offset) dans le log.
  - prompt: |
      Un topic `orders` a 3 partitions. Que garantit Kafka concernant l'ordre des
      messages ?
    options:
      - |
        L'ordre est garanti entre tous les messages du topic, quelle que soit la partition.
      - |
        L'ordre n'est garanti qu'à l'intérieur d'une même partition ; aucune garantie
        entre deux partitions différentes.
      - |
        L'ordre n'est jamais garanti, même au sein d'une partition.
    answer: 1
    tags: [partitions, ordonnancement]
    level: débutant
    explanation: |
      Kafka garantit l'ordre d'écriture strictement à l'intérieur d'une partition. Deux
      messages écrits dans des partitions différentes n'ont aucune relation d'ordre
      garantie entre eux.
  - prompt: |
      Un producteur envoie des messages avec `key = null` sur un topic à 4 partitions.
      Quel est l'effet le plus probable ?
    options:
      - |
        Tous les messages vont sur la partition 0.
      - |
        Les messages sont répartis (round-robin ou par lots) entre les partitions, sans
        garantie d'ordre entre eux.
      - |
        Le producteur lève une exception : une clé est obligatoire.
    answer: 1
    tags: [cle-partition, producteur]
    level: intermédiaire
    explanation: |
      Sans clé, Kafka répartit les messages entre les partitions disponibles pour
      équilibrer la charge — mais il n'y a alors plus de garantie d'ordre relatif entre
      deux messages, même consécutifs à l'émission.
  - prompt: |
      Pourquoi choisir l'identifiant de l'entité métier (ex. `orderId`) comme clé de
      partition est-il le bon réflexe quand l'ordre compte ?
    options:
      - |
        Parce que ça réduit la taille des messages sur le réseau.
      - |
        Parce que tous les messages portant la même clé sont dirigés, par hachage, vers
        la même partition — donc lus dans leur ordre d'écriture.
      - |
        Parce que Kafka trie automatiquement les messages par clé avant de les stocker.
    answer: 1
    tags: [cle-partition, ordonnancement]
    level: intermédiaire
    explanation: |
      Le hachage de la clé (hash(key) % nombre_de_partitions) est déterministe : la même
      clé produit toujours la même partition cible, ce qui garantit l'ordre relatif de
      tous les messages de cette clé.
  - prompt: |
      Que représentent les ISR (In-Sync Replicas) d'une partition ?
    options:
      - |
        L'ensemble des consommateurs actuellement abonnés à cette partition.
      - |
        L'ensemble des réplicas (leader inclus) suffisamment à jour pour être éligibles
        à devenir leader en cas de panne.
      - |
        Un cache en mémoire des derniers messages produits, indépendant du disque.
    answer: 1
    tags: [replication, haute-disponibilite]
    level: intermédiaire
    explanation: |
      Les ISR sont les réplicas (dont le leader) qui n'ont pas de retard significatif sur
      le log du leader. C'est parmi elles que le cluster élit un nouveau leader si le
      leader actuel devient indisponible, sans perte de données déjà répliquées.
  - prompt: |
      Que remplace le mode KRaft dans un cluster Kafka récent (par défaut depuis la
      version 4.0) ?
    options:
      - |
        Le protocole de réplication entre followers et leader.
      - |
        La dépendance à un cluster ZooKeeper externe pour gérer les métadonnées du
        cluster.
      - |
        Le mécanisme de compression des messages.
    answer: 1
    tags: [kraft, exploitation]
    level: avancé
    explanation: |
      KRaft (Kafka Raft) intègre nativement, via un sous-ensemble de brokers jouant le
      rôle de controller, la gestion des métadonnées auparavant déléguée à ZooKeeper —
      simplifiant le déploiement et accélérant le failover.
---
