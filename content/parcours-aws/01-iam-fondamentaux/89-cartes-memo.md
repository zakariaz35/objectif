---
title: "Cartes mémo — IAM & fondamentaux"
type: flashcards
cards:
  - q: |
      Une architecture tourne sur **une seule Availability Zone** avec 10 instances EC2
      en load balancing. Est-ce « hautement disponible » au sens AWS ?
    a: |
      **Non.** La haute disponibilité exige un minimum de **2 AZ**. Si l'AZ unique tombe
      (coupure électrique, incendie), toutes les instances tombent avec elle, peu importe
      leur nombre.
  - q: |
      Dans une policy IAM, un `Deny` explicite existe sur une action, et un `Allow`
      explicite existe aussi sur cette même action (une autre policy). Qui gagne ?
    a: |
      Le **`Deny` explicite gagne toujours**. L'ordre d'évaluation : Deny explicite >
      Allow explicite > refus implicite par défaut.
  - q: |
      Une application tourne sur EC2 et appelle S3 avec des Access Keys codées en dur
      dans le code. Quel est le problème et la correction attendue à l'examen ?
    a: |
      Des Access Keys statiques en dur sont un risque de fuite et ne tournent pas.
      La bonne pratique : attacher un **IAM Role** à l'instance (instance profile) —
      des credentials **temporaires** sont fournis automatiquement via STS.
  - q: |
      Quelle est la différence entre l'**IAM Credential Report** et l'**IAM Access
      Advisor** ?
    a: |
      Le Credential Report est un audit **au niveau du compte** (tous les users, état de
      leurs credentials). L'Access Advisor est un audit **par identité** (services
      autorisés + date de dernier usage) — l'outil pour appliquer le moindre privilège.
  - q: |
      Pourquoi attache-t-on les policies IAM à des **groups** plutôt qu'à des **users**
      directement ?
    a: |
      Pour garder les permissions **auditables et cohérentes** : on gère les droits au
      niveau du group, et on ajoute/retire des users du group. Des policies attachées
      individuellement à chaque user deviennent vite impossibles à suivre.
  - q: |
      Le modèle de responsabilité partagée change-t-il selon le service AWS utilisé
      (EC2 vs RDS, par exemple) ?
    a: |
      **Oui.** Plus le service est managé (RDS) plus AWS remonte dans la pile
      (OS, patchs inclus) ; pour un service non managé (EC2), le client garde la
      responsabilité de l'OS et des patchs. Mais la sécurité des **données** et des
      **accès IAM** reste toujours côté client, quel que soit le service.
---

Lis, réfléchis, révèle, auto-évalue.
