---
title: "Cartes mémo — S3"
type: flashcards
cards:
  - q: |
      Une bucket policy autorise explicitement un accès public en lecture, mais les
      requêtes échouent quand même. Quelle est la cause la plus probable ?
    a: |
      **Block Public Access** est activé sur le bucket (ou au niveau du compte) : c'est
      une couche de sécurité par-dessus la bucket policy, qui peut bloquer un accès
      public même explicitement autorisé par la policy elle-même.
  - q: |
      Le versioning est activé, et on fait un `DELETE` simple sur un objet (sans préciser
      de `versionId`). L'objet est-il supprimé définitivement ?
    a: |
      **Non.** Un `DELETE` sans versionId ajoute simplement un **delete marker** : la
      dernière version reste stockée. Pour une suppression définitive, il faut cibler
      explicitement le `versionId` de la version à effacer.
  - q: |
      Quelle est la différence entre le mode **Governance** et le mode **Compliance**
      d'Object Lock ?
    a: |
      En **Governance**, un utilisateur avec la permission spéciale
      `s3:BypassGovernanceRetention` peut lever la protection avant l'échéance. En
      **Compliance**, personne — pas même le compte root — ne peut la lever avant
      l'expiration de la période de rétention.
  - q: |
      Une réplication CRR est activée sur un bucket qui contenait déjà 10 000 objets.
      Ces 10 000 objets apparaissent-ils automatiquement dans le bucket destination ?
    a: |
      **Non.** La réplication S3 n'est **pas rétroactive** : seuls les objets créés
      après la mise en place de la règle sont répliqués. Pour les objets déjà
      existants, il faut lancer un job **S3 Batch Replication** séparé.
  - q: |
      Peut-on utiliser une lifecycle rule pour faire remonter un objet de Glacier Deep
      Archive vers S3 Standard ?
    a: |
      **Non.** Les lifecycle rules ne transitionnent que du chaud vers le froid. Pour
      relire un objet archivé, il faut lancer une **opération de restauration**
      (temporaire, avec un délai selon le tier choisi) — l'objet reste en Glacier,
      seule une copie temporaire redevient lisible.
  - q: |
      Pourquoi SSE-KMS peut-il poser problème sur un bucket à très fort trafic, et
      quelle est la parade recommandée ?
    a: |
      SSE-KMS dépend des **quotas d'appels API de KMS** (requêtes/seconde) : un fort
      trafic peut déclencher du throttling. La parade est d'activer les **S3 Bucket
      Keys**, qui réduisent fortement le nombre d'appels KMS nécessaires.
---

Contrôle d'accès, versioning/réplication, classes de stockage et chiffrement S3.
