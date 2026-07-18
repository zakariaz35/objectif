---
title: "Quiz — Bases de données & analytics"
type: quiz
questions:
  - prompt: |
      Un système de détection de fraude bancaire doit analyser des relations
      complexes entre comptes, transactions et appareils, avec des requêtes
      du type "trouver tous les comptes reliés indirectement à ce compte par
      au maximum 3 transactions intermédiaires". Quelle base de données
      choisir ?
    options:
      - "DynamoDB, pour sa faible latence"
      - "Neptune, base de graphe conçue pour les relations à plusieurs sauts"
      - "Redshift, pour ses capacités analytiques"
      - "RDS avec de nombreuses jointures SQL"
    answer: 1
    tags: [bases-donnees, architecture]
    level: avance
    explanation: >
      DynamoDB (option 0) est excellent en clé-valeur simple, mais mal adapté
      à des requêtes de parcours de relations à plusieurs sauts. Redshift
      (option 2) cible l'analytique agrégée sur des données structurées, pas
      le parcours de graphe. RDS avec de multiples jointures (option 3)
      devient rapidement inefficace à mesure que le nombre de sauts augmente.
      Neptune est conçu spécifiquement pour ce type de requêtes fortement
      relationnelles (détection de fraude, réseaux sociaux, recommandation).
  - prompt: |
      Une flotte de capteurs IoT envoie des millions de mesures horodatées
      par seconde, et l'application doit calculer des agrégations sur des
      fenêtres de temps glissantes (moyenne sur les 5 dernières minutes, par
      exemple). Quel service de données est le plus adapté ?
    options:
      - "DynamoDB avec une sort key basée sur le timestamp"
      - "Timestream, base de données optimisée séries temporelles"
      - "ElastiCache, pour la faible latence"
      - "Neptune, pour gérer les relations entre capteurs"
    answer: 1
    tags: [bases-donnees, performance]
    level: intermediaire
    explanation: >
      DynamoDB (option 0) pourrait techniquement stocker ces données mais
      sans les fonctions d'agrégation temporelle natives ni l'optimisation de
      coût d'une base time-series dédiée. ElastiCache (option 2) est un
      cache, pas une base de stockage durable pour de l'historique de
      mesures. Neptune (option 3) répond à un besoin de relations, absent de
      cet énoncé. Timestream est conçu précisément pour l'ingestion à très
      haute fréquence et les requêtes d'agrégation temporelle.
  - prompt: |
      Un site e-commerce a besoin d'une recherche plein texte performante
      dans son catalogue produit (recherche approximative, autocomplétion,
      tolérance aux fautes de frappe), ainsi que d'un tableau de bord
      d'analyse de logs applicatifs quasi temps réel. Quel service couvre ces
      deux besoins ?
    options:
      - "Athena, en interrogeant directement les logs et le catalogue en S3"
      - "OpenSearch, conçu pour la recherche plein texte et l'analyse de logs"
      - "Redshift, avec des requêtes SQL complexes sur le catalogue"
      - "DynamoDB avec une Global Secondary Index sur le nom du produit"
    answer: 1
    tags: [bases-donnees, architecture]
    level: intermediaire
    explanation: >
      Athena (option 0) exécute des requêtes SQL ponctuelles sur S3, sans les
      capacités de recherche plein texte approximative attendues ici.
      Redshift (option 2) cible l'analytique structurée classique, pas la
      recherche floue de texte. Une GSI DynamoDB (option 3) permet une
      recherche exacte sur un attribut, pas une recherche plein texte
      tolérante aux fautes. OpenSearch est conçu exactement pour ces deux cas
      : recherche plein texte et analyse de logs/métriques quasi temps réel.
  - prompt: |
      Une équipe interroge régulièrement des fichiers CSV bruts (non
      partitionnés) stockés dans S3 via Athena, et la facture mensuelle est
      jugée trop élevée pour le volume de requêtes réellement exécutées.
      Quelle action réduit le plus directement le coût ?
    options:
      - "Migrer les requêtes vers Redshift Spectrum, qui ne facture pas au volume scanné"
      - "Partitionner les données par date et les convertir en Parquet"
      - "Augmenter la rétention des logs CloudTrail liés à Athena"
      - "Passer les fichiers CSV en compression gzip sans autre changement"
    answer: 1
    tags: [athena, cout]
    level: intermediaire
    explanation: >
      Redshift Spectrum (option 0) facture aussi en fonction des données
      scannées dans S3 — ce n'est pas un moyen d'échapper à ce modèle de
      coût. La rétention CloudTrail (option 2) est sans rapport avec le coût
      des requêtes Athena. La compression seule (option 3) aide un peu, mais
      bien moins qu'un format colonne : Athena continuerait de lire des lignes
      entières. Partitionner (réduit les données parcourues par requête) et
      passer en Parquet (format colonne, ne lit que les colonnes utiles) sont
      les deux leviers qui réduisent le plus directement le volume scanné,
      donc la facture.
  - prompt: |
      Une entreprise a une partie de ses données déjà chargées dans un
      cluster Redshift, mais une autre partie, plus volumineuse et moins
      fréquemment interrogée, reste dans un data lake S3. Elle veut pouvoir
      croiser les deux dans une même requête SQL, sans dupliquer les données
      froides dans Redshift. Quelle fonctionnalité utiliser ?
    options:
      - "Redshift Spectrum, pour interroger directement les données de S3 depuis Redshift"
      - "Un Glue Job qui recopie quotidiennement les données S3 dans Redshift"
      - "Athena, en abandonnant complètement Redshift"
      - "DynamoDB Streams, pour synchroniser les deux sources"
    answer: 0
    tags: [redshift, cout]
    level: intermediaire
    explanation: >
      Un Glue Job de recopie (option 1) dupliquerait les données et ajouterait
      un coût de stockage et de maintenance ETL évitable. Abandonner Redshift
      pour Athena seul (option 2) ferait perdre les données déjà optimisées
      dans l'entrepôt. DynamoDB Streams (option 3) n'a aucun rapport avec
      Redshift ou S3 ici. Redshift Spectrum permet justement de requêter les
      données S3 directement depuis Redshift, avec le même SQL, sans
      dupliquer les données froides dans l'entrepôt.
  - prompt: |
      Une application doit numériser des factures fournisseurs scannées et en
      extraire automatiquement les montants, dates et numéros de commande
      pour alimenter un système comptable. Quel service AWS choisir ?
    options:
      - "Rekognition, pour analyser le contenu visuel des factures"
      - "Textract, pour extraire du texte et des données structurées de documents scannés"
      - "Comprehend, pour analyser le sentiment du texte des factures"
      - "SageMaker, en entraînant un modèle personnalisé d'OCR"
    answer: 1
    tags: [architecture]
    level: intermediaire
    explanation: >
      Rekognition (option 0) analyse du contenu visuel générique (objets,
      scènes, visages), pas la structure d'un document administratif.
      Comprehend (option 2) fait de l'analyse de langage naturel (sentiment,
      entités), pas de l'extraction de champs depuis une mise en page de
      document. Entraîner un modèle SageMaker sur mesure (option 3) est
      disproportionné alors qu'un service pré-entraîné répond déjà au besoin.
      Textract est conçu précisément pour extraire du texte et des données
      structurées (formulaires, tableaux, montants) depuis des documents
      scannés.
---

Le grand tableau des bases de données, l'optimisation du coût Athena, Redshift Spectrum et le choix du bon service ML.
