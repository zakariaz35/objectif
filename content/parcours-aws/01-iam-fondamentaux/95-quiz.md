---
title: "Quiz — IAM & fondamentaux AWS"
type: quiz
questions:
  - prompt: |
      Une startup vient de créer son compte AWS. Le développeur principal utilise
      l'identifiant **root** au quotidien pour lancer des instances EC2 et gérer S3,
      car « c'est plus simple, il a déjà tous les droits ». Quelle est la recommandation
      à appliquer ?
    options:
      - "C'est correct : le compte root est fait pour l'administration courante."
      - "Activer le MFA sur le root, le ranger, et créer un user IAM (dans un group avec les permissions nécessaires) pour le travail quotidien."
      - "Supprimer le compte root, il est inutile après la création du compte."
      - "Partager l'identifiant root avec toute l'équipe pour que chacun puisse travailler."
    answer: 1
    tags: [iam, securite]
    level: intermediaire
    explanation: >
      Le root a des droits illimités et non restreignables par policy : l'utiliser au
      quotidien maximise le risque en cas de fuite d'identifiants. La bonne pratique est
      de sécuriser le root (MFA) puis de ne plus s'en servir, au profit d'users IAM aux
      permissions limitées. Le root ne se supprime pas (option 3) et ne se partage jamais
      (option 4, qui casse toute traçabilité).
  - prompt: |
      Un statement de policy IAM a `"Effect": "Deny"` sur `s3:DeleteObject` pour le bucket
      `prod-backups`. Une autre policy attachée au même user a `"Effect": "Allow"` sur
      `s3:*` pour tous les buckets. L'utilisateur peut-il supprimer un objet dans
      `prod-backups` ?
    options:
      - "Oui, car Allow sur s3:* est plus générique et prime en cas de conflit."
      - "Non, car un Deny explicite l'emporte toujours sur un Allow explicite."
      - "Cela dépend de l'ordre dans lequel les policies ont été attachées."
      - "Oui, car IAM applique la dernière policy modifiée."
    answer: 1
    tags: [iam]
    level: intermediaire
    explanation: >
      En IAM, l'évaluation ne dépend ni de la généricité ni de l'ordre d'attachement :
      un Deny explicite (dans n'importe quelle policy applicable) gagne toujours sur un
      Allow explicite. IAM n'a pas de notion d'« ordre de policy » ni de « dernière
      modification » qui l'emporterait.
  - prompt: |
      Une application déployée sur des instances EC2 doit écrire des fichiers dans un
      bucket S3. L'équipe envisage de générer une Access Key IAM et de la coder en dur
      dans le fichier de configuration de l'application. Quelle alternative l'examen
      attend-il ?
    options:
      - "Créer un IAM Role avec les permissions S3 nécessaires et l'attacher aux instances via un instance profile."
      - "Générer une Access Key par instance et la stocker dans un fichier .env versionné."
      - "Utiliser le compte root pour l'application, plus simple à configurer."
      - "Désactiver IAM sur ces instances pour éviter la complexité."
    answer: 0
    tags: [iam, ec2, securite]
    level: intermediaire
    explanation: >
      Coder en dur une Access Key (statique, non tournante, risque de fuite) est
      systématiquement la mauvaise pratique visée par ce type de scénario. La réponse
      SAA-C03 est un IAM Role attaché à l'instance : credentials temporaires fournis
      automatiquement via STS, sans secret à gérer ni à faire tourner.
  - prompt: |
      Le RSSI demande d'identifier, pour chaque utilisateur IAM du compte, les services
      AWS que l'utilisateur est autorisé à appeler et la date de leur dernier appel réel,
      afin de retirer les permissions jamais utilisées (principe du moindre privilège).
      Quel outil utiliser ?
    options:
      - "IAM Credential Report"
      - "IAM Access Advisor"
      - "AWS Trusted Advisor uniquement"
      - "CloudTrail Insights"
    answer: 1
    tags: [iam, securite]
    level: avance
    explanation: >
      Access Advisor donne, par identité (user ou role), la liste des services
      autorisés et la date de dernier usage — exactement ce qu'il faut pour appliquer le
      moindre privilège. Credential Report est un rapport de compte (état des
      credentials de tous les users), pas un rapport de permissions par service.
  - prompt: |
      Une équipe conçoit une architecture web sur EC2 hébergée uniquement dans
      `eu-west-3a`, une seule Availability Zone, pour « simplifier le réseau ». Quel est
      le risque principal identifié par l'examen ?
    options:
      - "Aucun risque tant que l'instance a un stockage EBS chiffré."
      - "Un incident sur cette AZ (coupure électrique, incendie) rend l'application entièrement indisponible, quel que soit le nombre d'instances."
      - "Le risque est uniquement financier (coût plus élevé), pas de disponibilité."
      - "Les AZ d'une même région partagent déjà des back-ups automatiques inter-AZ."
    answer: 1
    tags: [ec2, resilience]
    level: intermediaire
    explanation: >
      Une AZ est un ensemble de datacenters isolés : si elle tombe, tout ce qui n'existe
      que dans cette AZ tombe avec elle. La haute disponibilité impose de répartir les
      ressources sur au moins deux AZ. Le chiffrement EBS (option 1) ne protège pas de
      la disponibilité, et AWS ne réplique rien automatiquement entre AZ ou régions par
      défaut.
  - prompt: |
      Un client a des contraintes réglementaires imposant que toutes les données restent
      hébergées dans l'Union Européenne, une base d'utilisateurs majoritairement située à
      Paris, et a besoin d'un service AWS qui n'est disponible que dans certaines
      régions. Quel critère doit primer sur les autres pour choisir la région ?
    options:
      - "Le coût, toujours prioritaire sur les autres critères."
      - "La conformité réglementaire (les données doivent rester en UE), qui élimine d'emblée les régions hors UE avant même de regarder la latence ou le coût."
      - "La proximité utilisateurs uniquement, la conformité se règle après coup avec du chiffrement."
      - "Le nombre d'Availability Zones de la région, critère le plus important."
    answer: 1
    tags: [iam, securite, cout]
    level: avance
    explanation: >
      Une contrainte réglementaire sur la localisation des données est **bloquante** :
      elle élimine des régions entières avant même d'évaluer latence ou coût (qui ne
      sont que des critères d'optimisation une fois le périmètre légal respecté). Le
      chiffrement (option 3) ne remplace pas une obligation de localisation des données.
---

Vérifie tes réflexes IAM et infrastructure globale AWS.
