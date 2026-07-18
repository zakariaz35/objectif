---
title: "Quiz — VPC"
type: quiz
questions:
  - prompt: |
      Une équipe crée un subnet, lui donne le nom `subnet-public-01`, et y place une
      instance EC2 avec une IP publique assignée automatiquement. La route table de ce
      subnet ne contient qu'une route locale (pas de route vers un Internet Gateway).
      Ce subnet est-il réellement public ?
    options:
      - "Oui, le nom du subnet suffit à le déclarer public."
      - "Oui, car l'instance a une IP publique."
      - "Non, un subnet n'est public que si sa route table contient une route vers un Internet Gateway."
      - "Cela dépend du security group attaché à l'instance."
    answer: 2
    tags: [vpc, security-groups]
    level: intermediaire
    explanation: >
      Seule la route table détermine si un subnet est public (route 0.0.0.0/0 vers un
      IGW). Le nom donné au subnet n'a aucune incidence technique, et une IP publique
      sur une instance sans route vers un IGW ne rend pas le trafic Internet possible.
      Le security group filtre le trafic mais ne change pas la nature public/privé du
      subnet.
  - prompt: |
      Une architecture répartit des instances applicatives sur deux AZ pour la haute
      disponibilité, avec une seule NAT Gateway déployée dans l'AZ-a. Que se passe-t-il
      si l'AZ-a subit une panne ?
    options:
      - "Rien, la NAT Gateway continue de fonctionner car elle est un service régional."
      - "Les instances de l'AZ-b perdent leur accès Internet sortant, car elles dépendent de la NAT Gateway de l'AZ-a."
      - "Seules les instances de l'AZ-a sont affectées, l'AZ-b n'est pas concernée."
      - "AWS bascule automatiquement la NAT Gateway vers l'AZ-b sans interruption."
    answer: 1
    tags: [nat, vpc, resilience]
    level: intermediaire
    explanation: >
      Une NAT Gateway est une ressource liée à une AZ précise (pas régionale). Si les
      subnets privés de l'AZ-b routent leur trafic sortant vers la NAT Gateway de
      l'AZ-a, une panne de l'AZ-a coupe leur accès sortant aussi. La bonne pratique est
      une NAT Gateway par AZ, chaque subnet routant vers celle de sa propre AZ.
  - prompt: |
      Une équipe diagnostique un problème : les logs applicatifs du serveur montrent
      bien la réception des requêtes clients sur le port 443, mais les clients ne
      reçoivent jamais de réponse. Le Security Group autorise le port 443 en entrée. Que
      vérifier en priorité côté NACL ?
    options:
      - "Que la règle NACL inbound sur le port 443 existe (le Security Group ne suffit jamais)."
      - "Que la NACL autorise une règle outbound sur la plage des ports éphémères utilisés par les clients."
      - "Que le VPC dispose bien d'un Internet Gateway."
      - "Que la table de routage pointe vers la bonne NAT Gateway."
    answer: 1
    tags: [nacl, security-groups]
    level: avance
    explanation: >
      Les logs applicatifs prouvent que la requête entrante est bien arrivée jusqu'au
      serveur (donc le SG et la NACL inbound laissent déjà passer le trafic) ; le
      problème est la réponse SORTANTE, bloquée par une NACL stateless sans règle
      outbound sur les ports éphémères du client. Un Security Group n'aurait pas ce
      souci (stateful). L'IGW et la route NAT ne sont pas en cause puisque la requête
      arrive déjà au serveur.
  - prompt: |
      Une entreprise a 8 VPC à interconnecter dans plusieurs comptes, avec un besoin de
      routage transitif entre tous (chaque VPC doit pouvoir atteindre tous les autres),
      et veut minimiser le nombre de connexions à gérer. Quelle solution privilégier ?
    options:
      - "Créer un VPC Peering entre chaque paire de VPC (mesh complet)."
      - "Un Transit Gateway central auquel chaque VPC se rattache."
      - "Un unique VPC Endpoint partagé entre tous les comptes."
      - "Un Site-to-Site VPN entre chaque paire de VPC."
    answer: 1
    tags: [transit-gateway, vpc]
    level: intermediaire
    explanation: >
      Le Transit Gateway offre un routage transitif centralisé (hub-and-spoke) : chaque
      VPC ne se connecte qu'au TGW, qui route vers tous les autres. Le VPC Peering en
      mesh complet exigerait 28 connexions (8×7/2) et resterait non transitif de toute
      façon. Un VPC Endpoint ne relie pas des VPC entre eux (il relie un VPC à un
      service AWS), et un VPN entre chaque paire poserait les mêmes limites que le
      peering, en plus complexe.
  - prompt: |
      Une application en subnet privé effectue un grand volume de lectures/écritures
      S3. L'équipe FinOps veut éliminer tout coût de trafic évitable lié à cet accès.
      Quelle configuration réseau adopter ?
    options:
      - "Ajouter une NAT Gateway dédiée pour router le trafic S3."
      - "Créer un Interface Endpoint (PrivateLink) pointant vers S3."
      - "Créer un Gateway Endpoint pour S3, gratuit et suffisant pour ce cas d'usage."
      - "Donner une IP publique à l'instance pour accéder à S3 directement via Internet."
    answer: 2
    tags: [vpc-endpoints, cout]
    level: avance
    explanation: >
      S3 (comme DynamoDB) bénéficie d'un Gateway Endpoint gratuit, la solution
      recommandée pour éliminer à la fois les frais de NAT Gateway et de data transfer
      Internet sur ce trafic. Un Interface Endpoint fonctionnerait mais serait payant
      sans bénéfice ici. Une NAT Gateway route via Internet et facture le Go transféré ;
      exposer l'instance avec une IP publique casse l'isolation du subnet privé sans
      nécessité.
  - prompt: |
      Une entreprise doit connecter en urgence (sous 48h) son datacenter à un VPC AWS
      pour un projet de migration, avec un besoin de chiffrement natif du trafic. Que
      choisir en première intention ?
    options:
      - "Direct Connect, plus performant à long terme."
      - "Site-to-Site VPN, disponible en heures/jours et chiffré nativement (IPsec)."
      - "VPC Peering entre le datacenter et le VPC."
      - "Attendre la mise en place de Direct Connect avant de démarrer le projet."
    answer: 1
    tags: [vpc, direct-connect]
    level: intermediaire
    explanation: >
      Direct Connect nécessite un raccordement physique dont la mise en place prend
      typiquement plusieurs semaines à plusieurs mois — incompatible avec un délai de
      48h. Le Site-to-Site VPN se met en place rapidement et chiffre nativement le
      trafic (IPsec). Le VPC Peering ne s'applique pas à un datacenter on-premises (ce
      n'est pas un VPC). Différer le projet en attendant Direct Connect ignore une
      solution immédiatement disponible et suffisante.
---

Vérifie tes réflexes CIDR/subnets, SG vs NACL, peering/endpoints/Transit Gateway et connexions hybrides.
