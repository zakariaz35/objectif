---
title: "Cartes mémo — Messaging & conteneurs"
type: flashcards
cards:
  - q: |
      Un consommateur SQS met plus de temps à traiter un message que le visibility
      timeout configuré. Que se passe-t-il, et quelle est la correction ?
    a: |
      Le message redevient **visible** avant la fin du traitement et peut être
      **récupéré par un autre consommateur** (double traitement possible). La
      correction est d'**augmenter le visibility timeout** au-dessus du temps de
      traitement maximum attendu (ou d'appeler `ChangeMessageVisibility`
      dynamiquement) — pas de le réduire.
  - q: |
      Pourquoi une file SQS FIFO a-t-elle un débit bien inférieur à une file
      Standard ?
    a: |
      Parce qu'elle garantit l'**ordre** et l'**exactly-once processing** au sein
      d'un **Message Group ID** — ces garanties ont un coût en parallélisme. La
      file Standard, sans garantie d'ordre stricte, peut traiter un débit quasi
      illimité.
  - q: |
      Un événement de commande doit déclencher trois traitements indépendants
      (facturation, expédition, notification), chacun devant continuer à
      fonctionner même si un autre est en panne. Quel pattern AWS utiliser ?
    a: |
      Le **fan-out SNS + SQS** : un topic SNS publie l'événement vers **trois
      files SQS distinctes**, une par système. Chaque système consomme sa propre
      file à son rythme, sans dépendre des deux autres.
  - q: |
      Quelle est la différence essentielle entre Kinesis Data Streams et Kinesis
      Data Firehose ?
    a: |
      **Data Streams** : streaming temps réel, tu écris ton propre code
      consommateur, données rejouables (24h à 365 jours), plusieurs
      consommateurs indépendants. **Data Firehose** : livraison managée
      near real-time vers une destination (S3, Redshift, OpenSearch), sans code
      consommateur, pas de rejeu possible.
  - q: |
      Quelle est la différence entre le task role et l'execution role d'une task
      ECS ?
    a: |
      Le **task role** est assumé par le **code applicatif** dans le conteneur
      pour appeler des API AWS (S3, DynamoDB…). L'**execution role** est utilisé
      par **l'agent ECS** pour démarrer la task : tirer l'image depuis ECR,
      écrire les logs CloudWatch, lire des secrets. Une erreur au **démarrage**
      pointe vers l'execution role ; une erreur **pendant l'exécution** de
      l'appli pointe vers le task role.
  - q: |
      Dans quel cas choisir EKS plutôt qu'ECS pour orchestrer des conteneurs sur
      AWS ?
    a: |
      Quand l'équipe a déjà une **expertise Kubernetes**, des workloads existants
      sur K8s, ou un besoin de **portabilité multi-cloud** (Kubernetes est un
      standard open-source, ECS est propriétaire AWS). Sinon, **ECS** reste le
      choix par défaut, plus simple à opérer.
---

Visibility timeout, FIFO vs Standard, fan-out, Kinesis, et le duo task role / execution role.
