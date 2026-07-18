---
title: "Cartes mémo — RDS, Aurora, ElastiCache"
type: flashcards
cards:
  - q: |
      Un scénario décrit une base RDS qui doit **survivre automatiquement** à la panne
      d'une Availability Zone, sans intervention manuelle. Multi-AZ ou Read Replica ?
    a: |
      **Multi-AZ.** Réplication **synchrone** vers un standby dans une autre AZ, avec
      **failover automatique** (l'endpoint DNS ne change pas). La Read Replica est
      asynchrone et sa promotion est **manuelle** — elle répond à un besoin de
      scalabilité en lecture, pas de disponibilité automatique.
  - q: |
      Peut-on lire directement sur le standby Multi-AZ d'une instance RDS classique ?
    a: |
      **Non.** Le standby Multi-AZ (instance classique) n'est pas interrogeable — il
      n'existe que pour prendre le relais en cas de panne. Pour absorber du trafic de
      lecture, il faut une **Read Replica**, qui elle est lisible.
  - q: |
      Pourquoi Aurora peut-il promouvoir une réplica en primaire en quelques secondes,
      bien plus vite qu'un failover Multi-AZ RDS classique ?
    a: |
      Parce que le **stockage Aurora est déjà partagé** entre toutes les instances du
      cluster (6 copies sur 3 AZ) — il n'y a pas de resynchronisation de données à
      faire. Un failover Multi-AZ RDS classique doit, lui, basculer vers un stockage
      EBS distinct.
  - q: |
      Une application Lambda ouvre une connexion RDS à chaque invocation et la base
      atteint sa limite de connexions sous forte concurrence. Quelle solution AWS
      adresse spécifiquement ce problème ?
    a: |
      **RDS Proxy** — il mutualise un pool de connexions réellement ouvertes vers la
      base, indépendamment du nombre d'invocations Lambda concurrentes. Il accélère
      aussi le failover en gardant les connexions applicatives ouvertes pendant la
      bascule interne.
  - q: |
      Pourquoi choisir Memcached plutôt que Redis dans ElastiCache, alors que Redis a
      plus de fonctionnalités ?
    a: |
      Quand le besoin est un **cache pur et simple**, facilement reconstructible et à
      scaler horizontalement (architecture multi-threadée), sans exigence de
      persistance ni de haute disponibilité. Redis apporte des coûts/complexité
      supplémentaires (réplication, persistance) inutiles dans ce cas précis.
  - q: |
      Quel est le rôle du TTL dans une stratégie de cache en **lazy loading**, et
      pourquoi reste-t-il nécessaire même avec du write-through ?
    a: |
      Le TTL borne la durée de vie d'une entrée de cache, limitant la **péremption**
      des données si la source change sans invalidation active. Même en write-through
      (cache mis à jour à chaque écriture), le TTL reste un filet de sécurité pour les
      entrées qui n'ont jamais été réécrites depuis leur création.
---

Le duo Multi-AZ / Read Replica, l'architecture Aurora, et les réflexes ElastiCache.
