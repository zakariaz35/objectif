---
title: "Quiz — EC2"
type: quiz
questions:
  - prompt: |
      Une entreprise fait tourner un cluster de calcul scientifique pendant 6 heures,
      une fois par mois, pour produire un rapport. Le job peut être interrompu et
      relancé sans perte (il sauvegarde son état régulièrement). Le budget est serré.
      Quelle option d'achat EC2 minimise le coût ?
    options:
      - "Reserved Instances sur 1 an"
      - "On-Demand, car le job ne dure que 6 heures"
      - "Spot Instances, avec une stratégie tolérante aux interruptions"
      - "Dedicated Host, pour garantir la performance"
    answer: 2
    tags: [ec2, spot, cout]
    level: intermediaire
    explanation: >
      Charge courte, ponctuelle, interruptible, avec sauvegarde d'état régulière : c'est
      le profil exact du Spot (jusqu'à ~90 % de remise). Reserved n'a pas de sens pour un
      usage aussi ponctuel (engagement 1 an payé même sans usage), et On-Demand coûterait
      bien plus cher qu'une solution tolérante à l'interruption alors que la contrainte
      métier ne l'exige pas.
  - prompt: |
      Une base de données critique sur EC2 doit tourner 24h/24 pendant au moins 2 ans, sur
      un type d'instance déjà validé par les équipes et qui ne changera pas. Quelle
      option d'achat est la plus adaptée pour réduire le coût sans risque d'interruption ?
    options:
      - "Spot Instances, le moins cher du marché"
      - "Standard Reserved Instance sur 3 ans"
      - "On-Demand, pour garder toute la flexibilité"
      - "Spot Fleet avec stratégie diversifiée"
    answer: 1
    tags: [ec2, cout, resilience]
    level: intermediaire
    explanation: >
      Charge stable, prévisible, longue durée, type d'instance fixé : c'est exactement le
      profil d'une Reserved Instance Standard (fort rabais en échange de l'engagement).
      Le Spot est à exclure (base critique, ne supporte pas l'interruption). On-Demand
      coûterait bien plus cher pour un usage aussi prévisible.
  - prompt: |
      Une application de traitement d'images tourne sur des instances `t3.large`. Sous
      charge modérée elle est fluide, mais sous forte charge soutenue (plusieurs heures),
      les temps de réponse se dégradent fortement et de façon persistante. Quelle est la
      cause la plus probable, et la correction ?
    options:
      - "Le Security Group bloque une partie du trafic sous forte charge : ouvrir plus de ports."
      - "Les crédits CPU de la famille T sont épuisés sous charge soutenue : migrer vers une famille M ou C."
      - "L'AMI utilisée est corrompue : il faut en générer une nouvelle."
      - "Le user data s'exécute à chaque requête et ralentit l'instance."
    answer: 1
    tags: [ec2, performance]
    level: intermediaire
    explanation: >
      Les instances de la famille T (burstable) ont une performance de base limitée et
      consomment des crédits CPU pour les pics. Sous charge soutenue, les crédits
      s'épuisent et la performance retombe au niveau de base — durablement. La solution
      est de migrer vers une famille sans mécanisme de crédit (M généraliste, C calcul
      intensif). Le user data (option 4) ne s'exécute qu'au premier démarrage, jamais par
      requête.
  - prompt: |
      Une application ne répond plus du tout depuis l'extérieur : les requêtes HTTP
      restent bloquées jusqu'au timeout, sans aucune réponse (ni succès, ni erreur).
      L'application elle-même est démarrée et fonctionne correctement en local sur
      l'instance. Où chercher en priorité ?
    options:
      - "Dans le code applicatif, qui contient probablement un bug logique"
      - "Dans les règles du Security Group attaché à l'instance (port non autorisé en entrée)"
      - "Dans la taille de l'instance, probablement insuffisante"
      - "Dans l'AMI, qui serait périmée"
    answer: 1
    tags: [ec2, securite]
    level: intermediaire
    explanation: >
      Un timeout réseau (aucune réponse, pas d'erreur applicative) est la signature
      classique d'un Security Group (ou d'une NACL) qui bloque silencieusement le trafic
      entrant. L'application fonctionnant correctement en local exclut un bug logique
      pur ou un souci d'AMI/dimensionnement.
  - prompt: |
      Un cluster Hadoop doit être déployé sur plusieurs centaines d'instances EC2, avec
      pour objectif de limiter l'impact d'une panne de rack à un sous-ensemble
      d'instances plutôt qu'à l'ensemble du cluster. Quel Placement Group choisir ?
    options:
      - "Cluster Placement Group"
      - "Spread Placement Group"
      - "Partition Placement Group"
      - "Aucun Placement Group n'est nécessaire pour Hadoop"
    answer: 2
    tags: [ec2, resilience]
    level: avance
    explanation: >
      Le Partition Placement Group est conçu pour un grand nombre d'instances réparties
      en partitions sur des racks distincts (alimentation/réseau séparés) — le profil
      Big Data distribué type Hadoop/Cassandra/Kafka. Spread ne supporte qu'un petit
      nombre d'instances par AZ (isolation individuelle), et Cluster maximise la
      proximité (donc le risque de panne groupée), l'inverse de l'objectif recherché.
  - prompt: |
      Une équipe attache une Elastic IP à une instance EC2 pour exposer un service, puis
      arrête l'instance plusieurs jours pour analyse (l'Elastic IP reste associée).
      Que va-t-il se passer côté facturation ?
    options:
      - "Rien, les Elastic IP sont toujours gratuites tant qu'elles sont associées à une instance."
      - "Des frais s'appliquent, car l'Elastic IP est associée à une instance arrêtée (donc non utilisée activement)."
      - "Des frais s'appliquent uniquement si l'instance dépasse 30 jours d'arrêt."
      - "L'Elastic IP est automatiquement libérée par AWS après 24h d'arrêt de l'instance."
    answer: 1
    tags: [ec2, cout]
    level: avance
    explanation: >
      Une Elastic IP n'est gratuite que tant qu'elle est attachée à une instance **en
      cours d'exécution**. Associée à une instance arrêtée (ou non attachée du tout),
      elle est facturée — pour dissuader de mobiliser des IPv4 sans les utiliser. AWS ne
      la libère pas automatiquement.
---

Vérifie tes réflexes sur EC2 : types d'instances, security groups, options d'achat, placement.
