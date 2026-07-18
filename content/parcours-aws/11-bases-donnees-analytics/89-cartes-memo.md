---
title: "Cartes mémo — Bases de données & analytics"
type: flashcards
cards:
  - q: |
      Un scénario décrit un réseau social où il faut trouver « les amis
      d'amis » d'un utilisateur, avec des requêtes fortement relationnelles à
      plusieurs sauts. Quelle base de données choisir ?
    a: |
      **Neptune** (base de graphe) — conçue précisément pour les données
      fortement connectées (réseaux sociaux, recommandation, détection de
      fraude), là où une base relationnelle classique gérerait mal des
      requêtes à plusieurs sauts de relations.
  - q: |
      Une équipe migre une application déjà construite sur MongoDB vers AWS
      sans vouloir réécrire les requêtes. Quel service choisir, et pourquoi
      pas DynamoDB ?
    a: |
      **DocumentDB**, compatible avec l'API et les requêtes **MongoDB**.
      DynamoDB a sa propre API (malgré un modèle document similaire) et
      exigerait de réécrire les requêtes.
  - q: |
      Pourquoi la facture Athena explose-t-elle souvent, et quelle est la
      première correction à envisager ?
    a: |
      Athena facture au **volume de données scanné**. Sans partitionnement ni
      format colonne (Parquet/ORC), chaque requête scanne l'intégralité des
      données. La correction prioritaire : **partitionner** les données (ex.
      par date) et les convertir en **Parquet**.
  - q: |
      Quelle est la différence d'usage entre Athena et Redshift pour de
      l'analytique sur de gros volumes ?
    a: |
      **Athena** : serverless, requêtes SQL ad-hoc et ponctuelles directement
      sur S3, sans infrastructure à gérer. **Redshift** : entrepôt de données
      provisionné en continu, optimisé pour des requêtes analytiques
      **récurrentes et complexes** utilisées par de nombreux analystes BI.
  - q: |
      Quand choisir Amazon MSK plutôt que Kinesis Data Streams ?
    a: |
      Quand l'organisation a déjà un existant bâti sur **Apache Kafka**, a
      besoin de son écosystème spécifique (Kafka Connect, Kafka Streams), ou
      vise la portabilité multi-cloud. Pour une nouvelle application
      AWS-native, Kinesis reste plus simple à opérer.
  - q: |
      Un scénario demande d'extraire les montants et champs structurés de
      factures scannées. Textract ou Rekognition ?
    a: |
      **Textract** — conçu pour extraire du texte et des données
      **structurées** (formulaires, tableaux) depuis des documents. Rekognition
      analyse du contenu visuel générique (objets, visages, scènes), pas la
      structure d'un document.
---

Le grand tableau des bases de données, l'optimisation Athena, et le survol des services ML.
