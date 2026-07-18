---
title: "Quiz — RDS, Aurora & ElastiCache"
type: quiz
questions:
  - prompt: |
      Une équipe se plaint que les dashboards de reporting (requêtes de lecture lourdes,
      exécutées en continu par des analystes) ralentissent la base de production
      utilisée par l'application principale. Quelle solution AWS répond directement à ce
      problème ?
    options:
      - "Activer Multi-AZ sur l'instance de production"
      - "Créer une ou plusieurs Read Replicas et rediriger les requêtes de reporting vers elles"
      - "Augmenter la période de rétention des sauvegardes automatiques"
      - "Passer l'instance en chiffrement KMS"
    answer: 1
    tags: [rds, resilience]
    level: intermediaire
    explanation: >
      Le problème décrit est un excès de trafic de LECTURE, pas une panne. Multi-AZ
      (option 1) répond à la disponibilité, pas à la répartition de charge : son standby
      n'est même pas lisible sur une instance RDS classique. La rétention des sauvegardes
      (option 3) et le chiffrement (option 4) n'ont aucun effet sur la charge de lecture.
      Les Read Replicas sont conçues précisément pour absorber du trafic de lecture
      supplémentaire en le détournant de l'instance primaire.
  - prompt: |
      Une architecture nécessite un plan de reprise après sinistre : en cas de panne
      complète de la région principale, une autre région doit pouvoir reprendre le
      service en lecture/écriture en quelques minutes, avec un lag de réplication
      inférieur à la seconde en fonctionnement normal. Quelle option choisir ?
    options:
      - "Une Read Replica cross-région sur RDS MySQL classique"
      - "Aurora Global Database"
      - "Multi-AZ activé sur l'instance principale"
      - "ElastiCache Redis avec réplication cross-région"
    answer: 1
    tags: [aurora, resilience]
    level: avance
    explanation: >
      Aurora Global Database réplique au niveau du stockage vers des régions
      secondaires avec un lag typiquement sub-seconde, et permet de promouvoir une
      région secondaire en primaire en moins d'une minute — conçu exactement pour ce
      scénario. Une Read Replica RDS cross-région classique (option 0) a un lag plus
      élevé et une promotion plus lente. Multi-AZ (option 2) ne couvre qu'une panne d'AZ
      dans la MÊME région, pas une panne régionale complète. ElastiCache (option 3) est
      un cache, pas une base de données durable.
  - prompt: |
      Une base RDS PostgreSQL a été créée sans chiffrement au repos. La conformité
      impose maintenant de la chiffrer. Quelle est la procédure correcte ?
    options:
      - "Activer une case « Enable encryption » dans la console, sans interruption"
      - "Créer un snapshot de l'instance, le copier en activant le chiffrement, puis restaurer une nouvelle instance depuis ce snapshot chiffré"
      - "Ce n'est pas possible, il faut recréer la base et migrer les données manuellement avec un dump SQL"
      - "Activer IAM Database Authentication, qui chiffre automatiquement le stockage"
    answer: 1
    tags: [rds, securite]
    level: intermediaire
    explanation: >
      Le chiffrement at-rest ne peut être activé qu'à la création d'une instance ; il
      n'existe pas de bascule en place (option 0). La procédure standard est
      snapshot -> copie chiffrée -> restauration en nouvelle instance, ce qui reste plus
      simple qu'un dump/reload manuel complet (option 2). IAM Database Authentication
      (option 3) concerne l'authentification, pas le chiffrement du stockage.
  - prompt: |
      Une application Lambda très sollicitée se connecte directement à une base Aurora
      et rencontre des erreurs "too many connections" en période de pic. Quelle solution
      cible directement ce problème ?
    options:
      - "Passer à une instance Aurora plus grande (scaling vertical)"
      - "Ajouter RDS Proxy entre Lambda et Aurora pour mutualiser les connexions"
      - "Créer une Read Replica supplémentaire"
      - "Activer Aurora Serverless v2 à la place d'Aurora provisionné"
    answer: 1
    tags: [aurora, performance]
    level: intermediaire
    explanation: >
      Le problème vient du nombre de connexions ouvertes, propre au pattern
      Lambda (une connexion potentielle par invocation concurrente), pas de la capacité
      de calcul de la base. RDS Proxy mutualise ces connexions dans un pool restreint,
      ce qui résout le problème directement. Grossir l'instance (option 0) ou ajouter
      une réplica (option 2) n'empêche pas d'épuiser les connexions disponibles.
      Aurora Serverless (option 3) gère la capacité de calcul, pas le pooling de
      connexions.
  - prompt: |
      Un cache ElastiCache doit stocker des sessions utilisateur : la perte de ces
      sessions lors d'un redémarrage de nœud serait inacceptable, et un failover
      automatique est requis en cas de panne. Quel moteur choisir ?
    options:
      - "Memcached, car il scale plus simplement à l'horizontale"
      - "Redis, pour sa persistance et sa réplication Multi-AZ avec failover automatique"
      - "Peu importe, les deux moteurs offrent les mêmes garanties de durabilité"
      - "DynamoDB Accelerator (DAX), plus adapté qu'ElastiCache pour ce cas"
    answer: 1
    tags: [elasticache, resilience]
    level: intermediaire
    explanation: >
      Memcached (option 0) n'offre ni persistance ni réplication native — toute panne
      de nœud fait perdre les données qu'il contenait, inacceptable ici. Les deux
      moteurs ne sont donc pas équivalents (option 2). DAX (option 3) est un cache
      spécifique à DynamoDB, hors sujet pour ce scénario générique de session. Redis
      coche toutes les cases : persistance (snapshots) et failover automatique via
      réplication Multi-AZ.
  - prompt: |
      Une équipe met en place du lazy loading (cache-aside) pour son cache ElastiCache
      et constate parfois des données périmées affichées après une mise à jour en base.
      Quelle amélioration limite ce risque sans changer de stratégie de cache ?
    options:
      - "Passer à Memcached, qui gère mieux la fraîcheur des données"
      - "Définir un TTL raisonnable sur les entrées de cache"
      - "Désactiver totalement le cache pour ces données"
      - "Augmenter la taille du nœud ElastiCache"
    answer: 1
    tags: [elasticache, performance]
    level: intermediaire
    explanation: >
      Le lazy loading n'invalide pas activement le cache quand la base change ailleurs
      : un TTL borne la durée pendant laquelle une donnée périmée peut rester servie,
      en forçant un rechargement depuis la base après expiration. Changer de moteur
      (option 0) ne change rien à ce mécanisme. Désactiver le cache (option 2) annule
      le bénéfice recherché. La taille du nœud (option 3) n'a aucun rapport avec la
      fraîcheur des données.
---

Multi-AZ vs Read Replica, architecture Aurora, RDS Proxy et stratégies de cache ElastiCache.
