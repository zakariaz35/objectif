---
title: "Cartes mémo — Architectures, DR & Well-Architected"
type: flashcards
cards:
  - q: |
      Un utilisateur doit rester sur la même instance EC2 pendant sa session (panier
      d'achat). La stickiness ALB suffit-elle à garantir que la session survivra à une
      panne de cette instance ?
    a: |
      **Non.** La stickiness résout un problème de **routage** (même client → même
      instance), pas de **durabilité** : si l'instance tombe, la session est perdue.
      Pour survivre à une panne d'instance, il faut externaliser la session dans un
      magasin partagé (ElastiCache pour la vitesse, DynamoDB pour la durabilité).
  - q: |
      Quelle est la différence entre RTO et RPO ?
    a: |
      **RTO (Recovery Time Objective)** = durée d'indisponibilité tolérée avant que le
      service soit rétabli. **RPO (Recovery Point Objective)** = quantité de données
      qu'on accepte de perdre, mesurée en temps depuis la dernière sauvegarde valide.
  - q: |
      Quelle est la différence entre les stratégies DR **Pilot Light** et **Warm
      Standby** ?
    a: |
      En **Pilot Light**, seule la donnée (souvent la base) tourne en continu ; le reste
      est éteint et doit être démarré à la bascule. En **Warm Standby**, une version
      réduite mais **déjà fonctionnelle** de toute l'architecture tourne en permanence —
      elle a juste besoin de **scaler**, pas de démarrer de zéro. D'où un RTO plus
      court en Warm Standby.
  - q: |
      Dans une migration hétérogène (ex. Oracle vers Aurora PostgreSQL), pourquoi DMS
      seul ne suffit-il pas ?
    a: |
      DMS migre les **données**, jamais le **schéma**. Dans une migration hétérogène,
      il faut d'abord convertir le schéma avec **SCT (Schema Conversion Tool)**, puis
      utiliser DMS pour répliquer les données vers ce schéma déjà créé.
  - q: |
      Un volume de données de plusieurs centaines de To doit être transféré vers AWS,
      et le calcul montre qu'il faudrait plusieurs semaines via la connexion Internet
      actuelle. Quelle solution est probablement plus rapide ?
    a: |
      **Snowball Edge** (ou Snowmobile pour des volumes encore plus massifs) : au-delà
      d'un temps de transfert réseau estimé à environ une semaine, le transport physique
      devient plus rapide que le réseau existant.
  - q: |
      CloudFormation et Elastic Beanstalk sont-ils deux solutions concurrentes pour
      déployer une application sur AWS ?
    a: |
      **Non.** CloudFormation décrit l'infrastructure en détail (IaC bas niveau).
      Elastic Beanstalk orchestre le déploiement applicatif à un niveau plus haut
      (PaaS-like) et **utilise CloudFormation en interne** pour provisionner les
      ressources — ce ne sont pas des alternatives, mais des niveaux d'abstraction
      différents.
---

Lis, réfléchis, révèle, auto-évalue.
