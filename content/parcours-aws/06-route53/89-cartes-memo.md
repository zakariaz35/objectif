---
title: "Cartes mémo — Route 53 & DNS"
type: flashcards
cards:
  - q: |
      Pourquoi ne peut-on pas poser un enregistrement CNAME sur l'apex d'un domaine
      (`example.com`, sans sous-domaine) ?
    a: |
      Parce que le standard DNS interdit qu'un nom portant un CNAME ait un autre
      enregistrement — or l'apex d'une zone **doit** porter des enregistrements SOA et
      NS obligatoires. C'est une restriction du DNS lui-même, pas une limite d'AWS.
  - q: |
      Comment Route 53 permet-il quand même de pointer un apex domain vers un Application
      Load Balancer ?
    a: |
      Via un enregistrement **Alias** — une extension propriétaire de Route 53 qui se
      comporte comme un CNAME (pointe vers un nom, pas une IP) mais reste utilisable à
      l'apex. Bonus : gratuit vers des ressources AWS, et suit automatiquement les
      changements d'IP de la cible.
  - q: |
      Quelle routing policy choisir pour restreindre l'accès à un contenu selon le pays
      de l'utilisateur (conformité/licence), même si ce n'est pas la ressource la plus
      rapide pour lui ?
    a: |
      **Geolocation.** Elle route selon la localisation géographique déclarée de
      l'utilisateur, indépendamment de la latence réseau — contrairement à
      **Latency-based**, qui optimise la performance sans notion de pays.
  - q: |
      Une ressource à surveiller (ex. une base RDS privée) n'a pas d'endpoint HTTP/TCP
      joignable directement par Route 53. Quel type de health check utiliser ?
    a: |
      Un **health check basé sur une alarme CloudWatch** : il suit l'état (OK/ALARM)
      d'une alarme existante plutôt que d'interroger un endpoint réseau directement.
  - q: |
      Dans une architecture hybride VPC + datacenter on-premise, quels composants
      Route 53 Resolver permettent une résolution DNS dans les DEUX sens ?
    a: |
      Le **Inbound Endpoint** (le on-premise interroge le VPC) et l'**Outbound
      Endpoint** (le VPC interroge le on-premise, via des règles de forwarding
      conditionnel sur certains suffixes de domaine).
  - q: |
      Multi-value answer routing peut-il remplacer un Application Load Balancer ?
    a: |
      **Non.** Il renvoie jusqu'à 8 adresses IP saines (avec health check basique),
      mais ne fait ni terminaison SSL, ni routage applicatif (L7), ni répartition
      pondérée fine — c'est un plus par rapport au routing Simple, pas un ALB.
---

Le piège Alias/apex, les huit routing policies, et les health checks Route 53.
