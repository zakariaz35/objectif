---
title: "Quiz — Stockage EC2 : EBS, EFS, AMI"
type: quiz
questions:
  - prompt: |
      Une équipe doit déplacer les données d'un volume EBS attaché à une instance dans
      `eu-west-3a` vers une nouvelle instance qui va être lancée dans `eu-west-3b`.
      Quelle est la démarche correcte ?
    options:
      - "Attacher directement le volume EBS existant à l'instance dans eu-west-3b."
      - "Créer un snapshot du volume, puis créer un nouveau volume depuis ce snapshot dans eu-west-3b."
      - "Activer le multi-attach sur le volume pour le rendre disponible dans les deux AZ."
      - "Utiliser Instance Store, qui n'est pas limité à une AZ."
    answer: 1
    tags: [ebs, resilience]
    level: intermediaire
    explanation: >
      Un volume EBS est lié à son AZ d'origine : impossible de l'attacher directement
      dans une autre AZ. Le chemin correct passe par un snapshot (stocké de façon
      transparente sur S3, donc accessible à toute la région), depuis lequel on peut
      créer un nouveau volume dans l'AZ souhaitée. Le multi-attach (io1/io2) reste limité
      à une seule AZ, et l'Instance Store est encore plus contraint (lié à l'instance).
  - prompt: |
      Une base de données critique nécessite des performances IOPS élevées et stables,
      quelle que soit la taille du volume. Quel type de volume EBS choisir ?
    options:
      - "st1, optimisé pour le débit séquentiel"
      - "sc1, le moins cher pour des données peu accédées"
      - "io2, IOPS provisionnées indépendantes de la taille du volume"
      - "gp2, dont les IOPS de base augmentent avec la taille"
    answer: 2
    tags: [ebs, performance]
    level: intermediaire
    explanation: >
      io2 fournit des IOPS provisionnées, élevées et prévisibles, indépendamment de la
      taille du volume — le choix pour une base de données critique. st1/sc1 sont des
      HDD pensés pour du débit ou du stockage froid, pas des IOPS élevées ; gp2 lie ses
      IOPS de base à la taille du volume, moins prévisible pour un usage critique.
  - prompt: |
      Une application doit stocker un cache de rendu temporaire, régénérable en cas de
      perte, avec la meilleure performance I/O possible et sans besoin de persistance
      au-delà de la durée de vie de l'instance. Quelle option de stockage EC2 choisir ?
    options:
      - "EFS, pour sa haute disponibilité multi-AZ"
      - "EBS gp3, pour un compromis coût/performance"
      - "Instance Store, pour la performance brute, en acceptant la perte au stop/terminate"
      - "EBS sc1, pour son faible coût"
    answer: 2
    tags: [ec2, performance]
    level: intermediaire
    explanation: >
      Cache temporaire, régénérable, priorité absolue à la performance I/O : c'est
      exactement le profil d'usage de l'Instance Store, qui accepte la perte des données
      au stop/terminate en échange d'un accès disque local très rapide. EFS et EBS
      seraient plus coûteux et moins performants pour ce besoin précis.
  - prompt: |
      Plusieurs serveurs web Linux, répartis sur 3 Availability Zones, doivent partager
      en lecture/écriture le même répertoire de contenus utilisateurs (uploads). Quelle
      solution de stockage répond au besoin ?
    options:
      - "Un volume EBS io2 avec multi-attach activé"
      - "EFS, monté simultanément sur les instances des 3 AZ"
      - "De l'Instance Store répliqué manuellement entre instances"
      - "Une Elastic IP partagée entre les instances"
    answer: 1
    tags: [efs, resilience]
    level: intermediaire
    explanation: >
      Le besoin de partage en lecture/écriture entre plusieurs instances Linux réparties
      sur plusieurs AZ est le cas d'usage typique d'EFS (NFS managé, multi-AZ). Le
      multi-attach EBS reste limité à une seule AZ ; l'Instance Store n'est pas partagé
      nativement (et éphémère) ; l'Elastic IP n'a rien à voir avec le partage de fichiers.
  - prompt: |
      Un volume EBS non chiffré doit être mis en conformité (chiffrement obligatoire).
      L'instance qui l'utilise doit continuer à fonctionner avec ses données existantes.
      Quelle est la procédure correcte ?
    options:
      - "Cocher une case « chiffrer » directement sur le volume existant, sans redémarrage."
      - "Créer un snapshot du volume, copier ce snapshot en activant le chiffrement, créer un nouveau volume depuis ce snapshot chiffré, puis l'attacher à la place de l'ancien."
      - "Changer le type de volume en io2, qui chiffre automatiquement les données."
      - "Chiffrer uniquement les futurs snapshots, le volume existant restant en clair sans risque."
    answer: 1
    tags: [ebs, securite]
    level: avance
    explanation: >
      Le chiffrement d'un volume EBS se fixe à sa création, il n'existe pas de bascule
      « à chaud » sur un volume existant. La procédure standard : snapshot → copie
      chiffrée du snapshot → nouveau volume chiffré → attacher ce nouveau volume. Le
      type de volume (io2, gp3…) n'a aucun impact sur le chiffrement en lui-même.
  - prompt: |
      Une équipe configure un Auto Scaling Group pour une application dont
      l'installation complète (paquets système, dépendances, code) prend plusieurs
      minutes via un script user data à chaque lancement. Quelle optimisation réduit le
      temps de démarrage des nouvelles instances lors d'un scale-out ?
    options:
      - "Augmenter la taille (xlarge) des instances pour accélérer l'exécution du script."
      - "Construire une AMI personnalisée avec l'application déjà installée, et lancer les nouvelles instances depuis cette AMI."
      - "Réduire le cooldown de l'Auto Scaling Group à zéro."
      - "Déplacer le script user data vers de l'Instance Store pour un accès plus rapide."
    answer: 1
    tags: [ec2, performance]
    level: avance
    explanation: >
      Une AMI pré-construite avec l'application déjà installée élimine le temps
      d'installation à chaque démarrage : les nouvelles instances sont prêtes bien plus
      vite lors d'un scale-out. Augmenter la taille de l'instance n'accélère pas
      significativement une installation de paquets, réduire le cooldown à zéro est
      risqué (oscillations de scaling), et le user data n'est pas un fichier qu'on «
      déplace » vers un support de stockage.
---

Vérifie tes réflexes sur EBS, EFS, Instance Store et AMI.
