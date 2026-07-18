---
title: "Quiz — S3 de A à Z"
type: quiz
questions:
  - prompt: |
      Un bucket S3 a une bucket policy autorisant explicitement `s3:GetObject` à
      "Principal": "*". Pourtant, les visiteurs anonymes reçoivent une erreur d'accès
      refusé. Quelle est la cause la plus probable ?
    options:
      - "La bucket policy doit aussi être dupliquée en IAM policy pour être effective"
      - "Block Public Access est activé sur le bucket, ce qui bloque l'accès public malgré la policy"
      - "Il manque un enregistrement DNS Route 53 pointant vers le bucket"
      - "Les bucket policies ne supportent pas le principal générique *"
    answer: 1
    tags: [s3, securite]
    level: intermediaire
    explanation: >
      Block Public Access est une couche de sécurité supplémentaire, indépendante de la
      bucket policy, qui peut bloquer un accès public même explicitement autorisé.
      Une IAM policy dupliquée (option 0) n'est pas nécessaire pour un accès anonyme.
      Route 53 (option 2) n'a aucun rapport avec le contrôle d'accès S3. Le principal
      générique * est parfaitement valide en bucket policy (option 3, fausse).
  - prompt: |
      Une entreprise stocke des rapports financiers peu consultés mais qui doivent
      rester lisibles instantanément en cas d'audit surprise. Le budget de stockage est
      serré. Quelle classe S3 correspond le mieux ?
    options:
      - "S3 Standard"
      - "S3 Glacier Flexible Retrieval"
      - "S3 Standard-IA (ou One Zone-IA selon la criticité de la donnée)"
      - "S3 Glacier Deep Archive"
    answer: 2
    tags: [s3, cout]
    level: intermediaire
    explanation: >
      Le besoin d'un accès INSTANTANÉ élimine Glacier Flexible Retrieval (minutes à
      heures) et Deep Archive (heures) — options 1 et 3. Standard (option 0) coûte plus
      cher que nécessaire pour un accès peu fréquent. Standard-IA (voire One Zone-IA si
      la donnée est recréable/non critique) offre un accès immédiat à moindre coût de
      stockage, avec un léger coût de récupération à l'usage — cohérent avec un accès
      rare mais devant rester instantané.
  - prompt: |
      Une lifecycle rule a transitionné un objet vers S3 Glacier Deep Archive il y a 3
      mois. L'équipe a soudainement besoin de le relire aujourd'hui. Que doit-elle
      faire ?
    options:
      - "Modifier la lifecycle rule pour transitionner l'objet vers Standard"
      - "Lancer une opération de restauration (restore) de l'objet, avec un délai selon le tier choisi"
      - "Rien : les objets Glacier restent automatiquement lisibles en lecture directe"
      - "Supprimer l'objet et le re-uploader en Standard"
    answer: 1
    tags: [s3, cout]
    level: intermediaire
    explanation: >
      Les lifecycle rules ne transitionnent que vers le froid, jamais l'inverse
      (option 0 impossible). Un objet Glacier n'est pas lisible directement (option 2,
      fausse) : il faut une opération de restauration explicite qui crée une copie
      temporaire lisible, selon un délai propre au tier de récupération choisi
      (standard, expedited, bulk). Supprimer/re-uploader (option 3) ferait perdre
      l'historique et n'est pas la pratique attendue.
  - prompt: |
      Une application chiffre ses objets S3 avec SSE-KMS et connaît des erreurs de
      throttling ("ThrottlingException" sur les appels KMS) lors de pics de trafic très
      élevés. Quelle solution réduit ce risque sans changer de mode de chiffrement ?
    options:
      - "Passer à SSE-C pour éviter tout appel à KMS"
      - "Activer les S3 Bucket Keys, qui réduisent le nombre d'appels API vers KMS"
      - "Désactiver le chiffrement au repos pour supprimer la dépendance à KMS"
      - "Augmenter la taille de l'instance EC2 qui appelle S3"
    answer: 1
    tags: [s3, performance, securite]
    level: avance
    explanation: >
      Les S3 Bucket Keys mettent en cache une clé de données au niveau du bucket,
      réduisant drastiquement le nombre d'appels individuels à KMS, sans changer de
      mode de chiffrement (SSE-KMS reste actif). Passer à SSE-C (option 0) change de
      mode et transfère la gestion de clé au client, ce qui n'est pas demandé.
      Désactiver le chiffrement (option 2) n'est pas acceptable en pratique. La taille
      de l'instance appelante (option 3) n'a aucun impact sur le quota KMS.
  - prompt: |
      Une réplication Cross-Region Replication (CRR) a été activée aujourd'hui sur un
      bucket qui contenait déjà des objets. Une semaine plus tard, ces anciens objets
      ne sont toujours pas présents dans le bucket de destination. Est-ce normal ?
    options:
      - "Non, c'est un bug : la réplication CRR est censée être rétroactive automatiquement"
      - "Oui, c'est le comportement attendu : la réplication ne couvre que les nouveaux objets, sauf à lancer un job S3 Batch Replication"
      - "Non, il faut d'abord désactiver puis réactiver le versioning sur les deux buckets"
      - "Oui, mais uniquement si le bucket source est en Intelligent-Tiering"
    answer: 1
    tags: [s3, resilience]
    level: intermediaire
    explanation: >
      La réplication S3 (CRR comme SRR) ne s'applique par défaut qu'aux objets créés
      après la mise en place de la règle. Pour répliquer les objets préexistants, il
      faut un job S3 Batch Replication dédié. Ce n'est ni un bug (option 0), ni lié au
      versioning à réactiver (option 2), ni conditionné à la classe de stockage
      (option 3).
  - prompt: |
      Des utilisateurs situés à l'autre bout du monde par rapport à la région d'un
      bucket S3 se plaignent de la lenteur de leurs **uploads** de fichiers volumineux.
      Quelle fonctionnalité S3 est conçue spécifiquement pour ce problème ?
    options:
      - "CloudFront devant le bucket en origine"
      - "S3 Transfer Acceleration"
      - "Passer le bucket en classe Intelligent-Tiering"
      - "Activer la réplication Same-Region Replication"
    answer: 1
    tags: [s3, performance]
    level: intermediaire
    explanation: >
      S3 Transfer Acceleration route les uploads via les edge locations du réseau
      CloudFront, optimisé pour les transferts longue distance en écriture.
      CloudFront classique (option 0) accélère surtout la lecture/diffusion de
      contenu, pas l'upload vers un bucket. La classe de stockage (option 2) n'a aucun
      effet sur la vitesse de transfert réseau. SRR (option 3) réplique entre buckets
      d'une même région, sans rapport avec la vitesse d'upload initial.
---

Contrôle d'accès, versioning/réplication, classes de stockage/lifecycle et chiffrement/performance S3.
