---
title: "Quiz — Route 53 & DNS"
type: quiz
questions:
  - prompt: |
      Une équipe veut faire pointer `example.com` (sans `www.`) directement vers un
      Application Load Balancer. Le CNAME classique échoue. Quelle est la cause et la
      solution ?
    options:
      - "Route 53 ne supporte pas les ALB comme cible ; il faut utiliser une IP Elastic fixe"
      - "Le CNAME est interdit à l'apex d'une zone par le standard DNS ; il faut utiliser un enregistrement Alias"
      - "Il faut d'abord créer un enregistrement NS pointant vers l'ALB"
      - "Le TTL du CNAME est trop long ; il faut le réduire à 0"
    answer: 1
    tags: [route53, resilience]
    level: intermediaire
    explanation: >
      L'apex d'une zone porte obligatoirement des enregistrements SOA/NS, incompatibles
      avec un CNAME sur ce même nom (restriction DNS standard, pas propre à AWS).
      L'Alias Route 53 contourne cette limite en se comportant comme un CNAME tout en
      étant utilisable à l'apex. Les options 0, 2 et 3 ne correspondent à aucun
      mécanisme réel résolvant ce problème.
  - prompt: |
      Un site e-commerce doit afficher un contenu et des prix différents selon que
      l'utilisateur se connecte depuis la France ou le Canada, indépendamment de la
      région AWS la plus rapide pour lui. Quelle routing policy choisir ?
    options:
      - "Latency-based routing"
      - "Geolocation routing"
      - "Weighted routing"
      - "Multi-value answer routing"
    answer: 1
    tags: [route53]
    level: intermediaire
    explanation: >
      Geolocation route selon le pays/continent déclaré de l'utilisateur, exactement
      ce que demande ce scénario de localisation de contenu. Latency-based (option 0)
      optimiserait la performance réseau mais ignore le pays. Weighted (option 2)
      répartit un pourcentage de trafic sans notion géographique. Multi-value
      (option 3) renvoie plusieurs IP avec health check, sans logique géographique.
  - prompt: |
      Une architecture de reprise après sinistre doit basculer automatiquement vers un
      site statique S3 de secours dès que le site principal (hébergé sur EC2 derrière un
      ALB) ne répond plus à un contrôle de santé. Quelle routing policy est conçue pour
      ce cas ?
    options:
      - "Simple routing"
      - "Failover routing"
      - "Geoproximity routing"
      - "IP-based routing"
    answer: 1
    tags: [route53, resilience]
    level: intermediaire
    explanation: >
      Failover routing sert la ressource primaire tant que son health check est sain,
      et bascule automatiquement sur la secondaire sinon — exactement le comportement
      actif/passif décrit. Simple (option 0) n'a aucune logique de bascule. Geoproximity
      (option 2) et IP-based (option 3) répondent à des besoins de localisation/réseau,
      pas de disaster recovery actif/passif.
  - prompt: |
      Une base de données RDS privée (sans endpoint HTTP/TCP public) doit néanmoins
      influencer un routing policy Failover : on veut basculer si son taux d'erreur
      applicatif dépasse un seuil métier remonté en CloudWatch. Quel type de health
      check utiliser ?
    options:
      - "Un endpoint health check HTTP standard"
      - "Un health check basé sur une alarme CloudWatch"
      - "Un health check calculé combinant plusieurs endpoints publics"
      - "Aucun health check n'est possible sur une ressource privée"
    answer: 1
    tags: [route53, resilience]
    level: avance
    explanation: >
      Un endpoint health check (option 0) exige une cible joignable directement par les
      vérificateurs Route 53, ce qui n'est pas le cas ici. Le health check basé sur une
      alarme CloudWatch permet justement de piloter un failover à partir d'une métrique
      applicative interne, sans exposer la ressource. Le health check calculé (option 2)
      agrège des checks existants mais ne résout pas le problème de non-accessibilité
      initiale. L'option 3 est fausse : c'est précisément le cas d'usage de l'alarme
      CloudWatch.
  - prompt: |
      Une entreprise migre vers un modèle hybride : le réseau on-premise doit pouvoir
      résoudre les noms de domaine d'une hosted zone privée AWS, et les ressources du VPC
      doivent résoudre certains noms internes du datacenter on-premise. Quelle solution
      Route 53 couvre les deux sens ?
    options:
      - "Une hosted zone publique partagée entre les deux réseaux"
      - "Route 53 Resolver avec un Inbound Endpoint et un Outbound Endpoint"
      - "Un enregistrement Alias pointant vers l'IP du résolveur on-premise"
      - "Une routing policy Geoproximity entre les deux réseaux"
    answer: 1
    tags: [route53]
    level: avance
    explanation: >
      L'Inbound Endpoint permet aux résolveurs on-premise d'interroger le VPC ;
      l'Outbound Endpoint permet aux ressources du VPC d'interroger (via forwarding
      conditionnel) les résolveurs on-premise. Une hosted zone publique (option 0) ne
      gère pas la résolution privée bidirectionnelle. Un Alias (option 2) pointe vers
      un nom de domaine, pas un mécanisme de forwarding DNS. Geoproximity (option 3) est
      une routing policy, sans rapport avec la résolution hybride.
  - prompt: |
      Quelle affirmation décrit correctement Multi-value answer routing ?
    options:
      - "Il remplace un Application Load Balancer, avec terminaison SSL incluse"
      - "Il renvoie jusqu'à 8 adresses saines avec health check, sans routage applicatif ni terminaison SSL"
      - "Il ne fonctionne qu'avec des enregistrements Alias"
      - "Il répartit le trafic selon un pourcentage configurable par enregistrement"
    answer: 1
    tags: [route53, performance]
    level: intermediaire
    explanation: >
      Multi-value answer ajoute un health check basique au routing Simple et renvoie
      jusqu'à 8 IP saines, mais reste une réponse DNS : pas de terminaison SSL, pas de
      routage L7 — donc pas un substitut à un Load Balancer (option 0, fausse). Il n'est
      pas limité aux Alias (option 2). La répartition pondérée (option 3) décrit
      Weighted routing, pas Multi-value.
---

Les huit routing policies, le piège Alias/apex, et les health checks Route 53.
