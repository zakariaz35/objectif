---
title: "Cartes mémo — Serverless"
type: flashcards
cards:
  - q: |
      Quelle est la différence entre reserved concurrency et provisioned
      concurrency sur Lambda ?
    a: |
      **Reserved concurrency** réserve ET plafonne un nombre d'exécutions
      simultanées pour une fonction. **Provisioned concurrency** maintient des
      environnements d'exécution déjà initialisés, éliminant le cold start pour
      ce volume (facturé même sans trafic).
  - q: |
      Pourquoi une partition key DynamoDB à faible cardinalité (ex. un
      attribut `status` à 3 valeurs) peut-elle poser un problème de
      performance, même avec une capacité globale suffisante ?
    a: |
      Elle crée une **hot partition** : tout le trafic converge vers une seule
      partition physique au lieu d'être réparti, dégradant les performances
      localement. Une clé à forte cardinalité et bien distribuée (ex.
      `user_id`) évite ce piège.
  - q: |
      Peut-on ajouter une Local Secondary Index (LSI) à une table DynamoDB
      déjà en production ?
    a: |
      **Non.** Une LSI ne peut être définie qu'à la **création** de la table.
      Pour ajouter un nouvel axe de requête après coup, il faut une **Global
      Secondary Index (GSI)**, créable à tout moment.
  - q: |
      Un scénario décrit une API simple derrière Lambda, sans besoin de clés
      API ni de validation avancée, où le coût et la latence sont
      prioritaires. REST API ou HTTP API ?
    a: |
      **HTTP API** — moins cher, latence plus faible, largement suffisant
      quand les fonctionnalités avancées de REST API (usage plans, clés API,
      endpoints privés, WAF natif) ne sont pas nécessaires.
  - q: |
      Quelle est la différence fondamentale entre un Cognito User Pool et un
      Identity Pool ?
    a: |
      Le **User Pool** authentifie (annuaire d'utilisateurs, émission de JWT).
      L'**Identity Pool** autorise (échange une identité déjà authentifiée
      contre des identifiants **IAM temporaires** via STS, pour appeler
      directement des ressources AWS). Un User Pool ne donne jamais d'accès
      direct aux ressources AWS.
  - q: |
      Pourquoi choisir Step Functions Express plutôt que Standard pour un
      pipeline de traitement d'événements IoT à très haut débit ?
    a: |
      Express Workflows supporte un **débit beaucoup plus élevé**, une durée
      max de 5 minutes, et une facturation à la requête + durée (comme
      Lambda) — adapté à un fort volume d'événements courts. Standard, en
      exactly-once et facturé par transition, cible plutôt des workflows
      longs et auditables.
---

Cold start, hot partition, GSI/LSI, REST vs HTTP API, et le duo User Pool / Identity Pool.
