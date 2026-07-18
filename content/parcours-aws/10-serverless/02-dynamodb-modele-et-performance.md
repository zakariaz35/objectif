---
title: "DynamoDB : modèle et performance"
type: lesson
---

# DynamoDB : base clé-valeur/document, entièrement managée

**DynamoDB** est une base **NoSQL** (clé-valeur / document) managée par AWS, conçue pour une **latence à un chiffre de milliseconde** à n'importe quelle échelle. Une table contient des **items** (lignes), chacun composé d'**attributs** (colonnes, sans schéma fixe imposé par item).

## Partition key et sort key

- **Partition key seule** (clé de hachage) : détermine la **distribution physique** des données. DynamoDB hache la clé pour répartir les items entre partitions internes.
- **Partition key + sort key** (clé composite) : les items partageant la même partition key sont **regroupés** et **triés** par sort key — permet des requêtes de type « tous les items de cette partition, triés/filtrés par sort key » (ex. toutes les commandes d'un client, triées par date).

> 🎯 **Piège d'examen —** une **partition key mal choisie** (peu de valeurs distinctes, ou une valeur très sollicitée comme un `status` à seulement 2-3 états) crée une **hot partition** : tout le trafic converge vers une seule partition physique, dégradant les performances malgré une capacité globale suffisante. Choisir une clé à **forte cardinalité et distribution uniforme** (ex. un `user_id`) est la correction attendue.

## Provisioned vs On-Demand : deux modes de capacité

| | Provisioned | On-Demand |
|---|---|---|
| Capacité | RCU/WCU définies à l'avance (+ Auto Scaling possible) | aucune planification, DynamoDB scale automatiquement et instantanément |
| Coût | moins cher pour un trafic **stable et prévisible** | plus cher à l'unité, mais pas de sur/sous-provisionnement |
| Cas d'usage | charge connue, budget serré | trafic **imprévisible ou en pics soudains**, nouvelle application dont le profil est inconnu |

- **1 RCU** = une lecture **fortement cohérente** par seconde d'un item jusqu'à 4 KB (ou 2 lectures **éventuellement cohérentes** par seconde du même item).
- **1 WCU** = une écriture par seconde d'un item jusqu'à 1 KB.

## GSI vs LSI : les deux types d'index secondaires

| | Global Secondary Index (GSI) | Local Secondary Index (LSI) |
|---|---|---|
| Clé | partition key **et** sort key différentes de la table de base | même partition key, sort key **différente** |
| Création | à tout moment, même après création de la table | **uniquement à la création** de la table |
| Capacité | RCU/WCU propres (en mode provisioned) | partage les RCU/WCU de la table de base |
| Cohérence de lecture | uniquement **éventuellement cohérente** | fortement ou éventuellement cohérente, au choix |

> 🎯 **Piège d'examen —** si un besoin de nouvel axe de requête apparaît **après** la mise en production d'une table, seule une **GSI** peut être ajoutée (une LSI ne peut être créée qu'à la création de la table — impossible d'en ajouter une après coup sans recréer la table).

## DAX : cache en mémoire, compatible API

**DynamoDB Accelerator (DAX)** est un cache **in-memory** placé devant DynamoDB, offrant des latences de lecture de l'ordre de la **microseconde**. Il est **API-compatible** avec DynamoDB : le code applicatif change à peine (même SDK). Idéal pour des charges de lecture intenses avec des clés « chaudes » lues très fréquemment.

## Streams, TTL et Global Tables

- **DynamoDB Streams** : capture un flux **ordonné** des modifications (insert/update/delete) au niveau item, conservé 24h, consommable par une fonction **Lambda** — utile pour répliquer, agréger, ou construire un audit trail en temps réel.
- **TTL (Time To Live)** : supprime automatiquement un item passé une date d'expiration (attribut epoch), **sans coût de capacité d'écriture** pour la suppression — utile pour des données temporaires (sessions, tokens).
- **Global Tables** : réplication **multi-région, multi-active** (lecture ET écriture possibles dans chaque région), synchronisation quasi temps réel, résolution de conflit par **dernière écriture gagnante** (last writer wins).

## À retenir

- Partition key = distribution physique ; sort key = tri au sein d'une partition. Éviter les hot partitions (clé à forte cardinalité).
- On-Demand = trafic imprévisible/pics ; Provisioned (+ Auto Scaling) = trafic stable, coût optimisé.
- GSI = ajoutable à tout moment, capacité propre. LSI = seulement à la création, capacité partagée.
- DAX = cache microseconde, API-compatible. Streams = flux d'events → Lambda. TTL = purge auto sans coût. Global Tables = multi-région multi-active.
