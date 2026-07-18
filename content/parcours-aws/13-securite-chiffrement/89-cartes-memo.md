---
title: "Cartes mémo — Sécurité & chiffrement"
type: flashcards
cards:
  - q: |
      Qu'est-ce que l'« envelope encryption » utilisée par KMS, et pourquoi ne pas
      chiffrer directement de gros volumes de données avec la clé maître ?
    a: |
      Une **data key** chiffre les données elles-mêmes ; cette data key est elle-même
      chiffrée par la **clé maître** (CMK), qui ne quitte jamais KMS. Chiffrer
      directement de gros volumes avec la clé maître serait lent et l'exposerait trop —
      on ne chiffre que de petites clés de données avec elle.
  - q: |
      Un scénario exige une rotation **automatique native** de mots de passe RDS, sans
      écrire de code de rotation. SSM Parameter Store ou Secrets Manager ?
    a: |
      **Secrets Manager** — il propose une rotation automatique **native**, intégrée
      avec RDS/Aurora/DocumentDB/Redshift. SSM Parameter Store peut stocker un secret
      mais n'a pas de rotation native (il faudrait l'implémenter soi-même via Lambda).
  - q: |
      Pourquoi ne peut-on pas attacher WAF à un Network Load Balancer (NLB) ?
    a: |
      WAF filtre au niveau **couche 7 (HTTP)**. Le NLB opère en **couche 4 (TCP/UDP)** et
      ne comprend pas le HTTP — WAF ne peut s'attacher qu'à un ALB, API Gateway ou
      CloudFront.
  - q: |
      GuardDuty détecte une activité suspecte sur une instance EC2. Bloque-t-il
      automatiquement le trafic ou isole-t-il l'instance tout seul ?
    a: |
      **Non.** GuardDuty ne fait que **détecter** et émettre un *finding*. Pour une
      réaction automatique (isoler l'instance, révoquer des credentials), il faut
      brancher **EventBridge** en aval, qui déclenche une Lambda de remédiation.
  - q: |
      Dans quel cas choisir **CloudHSM** plutôt que **KMS** ?
    a: |
      Quand une exigence de conformité impose un HSM **dédié single-tenant** (isolation
      physique complète) ou une certification **FIPS 140-2 niveau 3** — KMS est
      multi-tenant et ne garantit que le niveau 2 sur ses endpoints standards.
  - q: |
      Un bucket S3 contient des données personnelles (PII) et devient accidentellement
      public. Quel service AWS est conçu pour détecter précisément ce cas ?
    a: |
      **Macie** — il classifie automatiquement les données sensibles dans S3 (PII,
      cartes bancaires...) et alerte si un bucket qui en contient devient public ou est
      partagé de façon inattendue. Inspector et GuardDuty ne couvrent pas ce périmètre.
---

Lis, réfléchis, révèle, auto-évalue.
