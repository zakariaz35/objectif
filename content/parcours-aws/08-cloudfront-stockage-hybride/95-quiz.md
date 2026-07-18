---
title: "Quiz — CloudFront & stockage hybride"
type: quiz
questions:
  - prompt: |
      Un bucket S3 sert d'origine à une distribution CloudFront. L'équipe sécurité
      constate que les utilisateurs peuvent encore accéder aux fichiers en tapant
      directement l'URL du bucket, en contournant CloudFront. Quelle est la correction
      à apporter ?
    options:
      - "Activer la compression Gzip sur la distribution CloudFront"
      - "Configurer OAC (Origin Access Control) et bloquer l'accès public direct au bucket"
      - "Passer le bucket en classe de stockage Intelligent-Tiering"
      - "Ajouter une règle de geo restriction sur la distribution"
    answer: 1
    tags: [cloudfront, s3, securite]
    level: intermediaire
    explanation: >
      OAC restreint la lecture du bucket au seul service CloudFront, combiné à Block
      Public Access sur le bucket lui-même : l'accès direct par URL S3 devient
      impossible. La compression (option 0), la classe de stockage (option 2) et la
      geo restriction (option 3) n'ont aucun effet sur ce problème de contournement
      d'origine.
  - prompt: |
      Une application de jeu multijoueur en temps réel utilise un protocole UDP
      propriétaire et doit fournir à ses joueurs des adresses IP fixes à whitelister
      côté client. Quel service AWS répond à ce besoin ?
    options:
      - "Amazon CloudFront, avec une distribution configurée en mode TCP"
      - "AWS Global Accelerator"
      - "Amazon Route 53 avec un routing policy Latency-based"
      - "AWS Transfer Family"
    answer: 1
    tags: [global-accelerator, performance]
    level: intermediaire
    explanation: >
      CloudFront (option 0) ne gère que HTTP/HTTPS, jamais de protocole UDP
      propriétaire — l'option est un piège inventé. Route 53 latency-based (option 2)
      route au niveau DNS mais ne fournit pas d'IP statiques garanties ni de routage L4
      optimisé. Transfer Family (option 3) sert des protocoles de fichiers
      (SFTP/FTPS/FTP), hors sujet ici. Global Accelerator opère en couche 4 (TCP/UDP),
      fournit 2 IP Anycast statiques, et convient exactement à ce cas.
  - prompt: |
      Un site vitrine international sert des images et vidéos statiques, avec un fort
      trafic de lecture répété sur les mêmes ressources. On veut réduire la latence
      perçue sans changer d'architecture backend. Quel service privilégier en premier ?
    options:
      - "AWS Global Accelerator devant l'origine"
      - "Amazon CloudFront devant l'origine (S3 ou serveur web)"
      - "AWS DataSync entre l'origine et les utilisateurs"
      - "AWS Storage Gateway en mode Volume Gateway"
    answer: 1
    tags: [cloudfront, performance]
    level: intermediaire
    explanation: >
      Le contenu décrit est hautement cacheable (images/vidéos statiques, trafic
      répété) : c'est le cas d'usage central de CloudFront, qui met en cache aux edge
      locations. Global Accelerator (option 0) ne fait aucun cache et cible plutôt du
      contenu non cacheable ou des protocoles non-HTTP. DataSync (option 2) est un
      outil de transfert de données, pas de diffusion de contenu. Storage Gateway
      (option 3) sert à ponter du stockage on-premise, hors sujet ici.
  - prompt: |
      Une entreprise doit migrer 400 To de données archivées vers AWS depuis un site
      industriel dont la connexion Internet ne permettrait le transfert qu'en plusieurs
      mois. Quelle option est la plus adaptée ?
    options:
      - "AWS DataSync, en augmentant le nombre d'agents en parallèle"
      - "AWS Snowball Edge (un ou plusieurs appareils selon le volume)"
      - "Amazon S3 Transfer Acceleration"
      - "AWS Transfer Family avec un endpoint SFTP dédié"
    answer: 1
    tags: [snow, cout]
    level: intermediaire
    explanation: >
      Avec un lien réseau insuffisant pour transférer 400 To en un temps raisonnable
      (plusieurs mois estimés), la Snow Family est la réponse standard : un ou
      plusieurs appareils Snowball Edge, remplis sur site puis expédiés à AWS.
      DataSync (option 0) et Transfer Acceleration (option 2) restent limités par la
      même bande passante réseau insuffisante. Transfer Family (option 3) est un
      protocole de transfert de fichiers, pas une solution de migration massive
      déconnectée du réseau.
  - prompt: |
      Une entreprise veut continuer à utiliser son logiciel de sauvegarde existant,
      conçu historiquement pour écrire sur des bandes magnétiques physiques, tout en
      stockant réellement les données dans le cloud AWS. Quel service choisir ?
    options:
      - "AWS Storage Gateway — Tape Gateway"
      - "AWS Storage Gateway — S3 File Gateway"
      - "Amazon FSx for Windows File Server"
      - "AWS DataSync"
    answer: 0
    tags: [storage-gateway]
    level: intermediaire
    explanation: >
      Tape Gateway expose une interface de bibliothèque de bandes virtuelle
      (iSCSI-VTL) compatible avec les logiciels de sauvegarde existants, tout en
      stockant réellement les données sur S3/Glacier — exactement le besoin décrit.
      S3 File Gateway (option 1) expose un partage de fichiers NFS/SMB, pas une
      interface de bandes. FSx for Windows (option 2) est un système de fichiers SMB,
      sans rapport avec un outillage de bandes. DataSync (option 3) est un outil de
      transfert, pas une interface de sauvegarde permanente.
  - prompt: |
      Une équipe de recherche en machine learning a besoin d'un système de fichiers
      à très haute performance, capable de charger paresseusement des jeux de données
      volumineux directement depuis S3, pour du calcul massivement parallèle. Quel
      service choisir ?
    options:
      - "Amazon EFS"
      - "Amazon FSx for Lustre"
      - "Amazon FSx for Windows File Server"
      - "AWS Storage Gateway — Volume Gateway"
    answer: 1
    tags: [fsx, performance]
    level: avance
    explanation: >
      FSx for Lustre est conçu pour le calcul haute performance (HPC/ML), avec un lien
      natif vers S3 permettant un chargement paresseux des données. EFS (option 0) est
      un système de fichiers NFS généraliste, sans les optimisations HPC ni le lien
      natif S3 en mode lazy-load. FSx for Windows (option 2) cible des applications
      Windows/SMB, hors sujet pour du calcul Linux/HPC. Volume Gateway (option 3) est
      un service de stockage bloc hybride, pas un système de fichiers HPC.
---

CloudFront, le piège Global Accelerator, Snow Family, FSx et Storage Gateway.
