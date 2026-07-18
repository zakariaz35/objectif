---
title: "Cartes mémo — VPC"
type: flashcards
cards:
  - q: |
      Qu'est-ce qui détermine réellement qu'un subnet est « public » dans un VPC AWS ?
    a: |
      **Sa route table** : un subnet est public si et seulement si sa route table
      contient une route vers un **Internet Gateway** (`0.0.0.0/0 → igw-xxxx`). Ni le
      nom du subnet, ni la présence d'une IP publique sur une instance ne le
      déterminent.
  - q: |
      Pourquoi faut-il déployer **une NAT Gateway par AZ** dans une architecture
      résiliente ?
    a: |
      Une NAT Gateway est liée à **une seule AZ**. Si cette AZ tombe, tous les subnets
      privés qui en dépendent perdent leur accès sortant, même si leurs instances
      tournent ailleurs. Il faut une NAT Gateway par AZ, chaque subnet privé routant vers
      celle de **sa propre** AZ.
  - q: |
      Une règle NACL autorise le trafic entrant sur le port 80, mais le client ne reçoit
      jamais la réponse du serveur. Quelle est la cause la plus probable ?
    a: |
      Les NACL sont **stateless** : il manque une règle **outbound** explicite
      autorisant les **ports éphémères** (ex. 1024-65535) utilisés par le client pour
      recevoir la réponse. Un Security Group n'aurait pas eu ce problème (stateful :
      réponse auto-autorisée).
  - q: |
      VPC A est peeré avec VPC B, et VPC B est peeré avec VPC C. VPC A peut-il
      communiquer avec VPC C à travers B ?
    a: |
      **Non.** Le VPC Peering n'est **pas transitif**. Il faudrait un peering direct
      A-C, ou remplacer les peerings par un **Transit Gateway** (hub-and-spoke,
      transitif) si le nombre de VPC à interconnecter grandit.
  - q: |
      Pour accéder à S3 depuis un subnet privé sans passer par Internet, quel type de
      VPC Endpoint choisir pour éviter des frais inutiles ?
    a: |
      Un **Gateway Endpoint** — gratuit, disponible uniquement pour S3 et DynamoDB.
      Un Interface Endpoint (PrivateLink) existe aussi techniquement mais est
      **payant** : à réserver aux services qui n'ont pas de Gateway Endpoint.
  - q: |
      Pourquoi Direct Connect ne convient-il pas à un besoin de connectivité hybride
      **immédiate**, et quelle alternative court terme choisir ?
    a: |
      Direct Connect nécessite un raccordement physique dont la mise en place prend
      **plusieurs semaines à plusieurs mois**. Pour un besoin immédiat, démarrer avec un
      **Site-to-Site VPN** (mise en place en heures/jours, chiffré nativement), puis
      migrer vers Direct Connect une fois la ligne dédiée disponible.
---

Lis, réfléchis, révèle, auto-évalue.
