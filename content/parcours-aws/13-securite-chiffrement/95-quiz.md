---
title: "Quiz — Sécurité & chiffrement"
type: quiz
questions:
  - prompt: |
      Une application à très fort trafic lit en masse des objets S3 chiffrés avec une
      **customer managed key (CMK)** KMS et commence à recevoir des erreurs
      `ThrottlingException` côté KMS, alors que S3 lui-même ne montre aucune limitation.
      Quelle est l'explication la plus probable et une solution adaptée ?
    options:
      - "S3 est en panne ; il faut changer de région."
      - "L'API KMS a des quotas d'appels par seconde partagés par compte/région ; il faut demander une augmentation de quota ou mettre en cache les data keys côté client."
      - "Les CMK ne peuvent pas être utilisées avec S3 ; il faut migrer vers SSE-C."
      - "Le throttling vient toujours d'IAM, pas de KMS ; il faut revoir les policies."
    answer: 1
    tags: [kms, s3]
    level: avance
    explanation: >
      Chaque lecture/écriture d'un objet SSE-KMS déclenche un appel KMS (Decrypt/
      GenerateDataKey), et l'API KMS a des quotas par seconde. Un fort trafic peut les
      atteindre même si S3 n'est pas limité. La solution: demander un relèvement de
      quota KMS et/ou réduire le nombre d'appels (cache des data keys). Les CMK sont
      parfaitement utilisables avec S3 (SSE-KMS existe précisément pour ça), et le
      throttling ici est bien côté KMS, pas IAM.
  - prompt: |
      Une équipe doit stocker des centaines de paramètres de configuration applicative
      (URLs, feature flags) sans rotation nécessaire, avec un budget très serré. Quel
      service choisir ?
    options:
      - "Secrets Manager, pour sa robustesse malgré le coût."
      - "SSM Parameter Store, gratuit en tier standard pour ce type de besoin."
      - "KMS, en stockant directement les valeurs dans les key policies."
      - "CloudHSM, pour un contrôle matériel total."
    answer: 1
    tags: [secrets-manager, ssm]
    level: intermediaire
    explanation: >
      SSM Parameter Store (tier standard) est gratuit et parfaitement adapté au
      stockage de configuration/secrets simples sans besoin de rotation native.
      Secrets Manager est payant et se justifie surtout par sa rotation automatique
      native — inutile ici. KMS ne stocke pas de configuration applicative, et CloudHSM
      est hors sujet (matériel cryptographique dédié, pas un magasin de config).
  - prompt: |
      Une architecture utilise un Network Load Balancer (NLB) exposé directement sur
      Internet pour un usage TCP à très faible latence. L'équipe sécurité veut ajouter
      des règles WAF sur ce NLB pour filtrer les requêtes applicatives malveillantes.
      Est-ce possible ?
    options:
      - "Oui, WAF s'attache à n'importe quel load balancer AWS."
      - "Non, WAF opère en couche 7 (HTTP) et ne peut pas s'attacher à un NLB (couche 4)."
      - "Oui, mais uniquement si le NLB est configuré en mode HTTP."
      - "Non, WAF ne fonctionne qu'avec CloudFront."
    answer: 1
    tags: [waf, nlb]
    level: intermediaire
    explanation: >
      WAF filtre le trafic HTTP/HTTPS (couche 7). Le NLB opère en couche 4 (TCP/UDP) et
      ne comprend pas la sémantique HTTP : WAF ne peut donc pas s'y attacher. WAF
      fonctionne bien au-delà de CloudFront seul (ALB, API Gateway aussi), mais jamais
      sur un NLB, quel que soit son mode.
  - prompt: |
      Le service sécurité veut une protection DDoS avec visibilité en temps réel sur les
      attaques en cours, un accès à une équipe de réponse dédiée 24/7, et un
      remboursement des coûts de scaling engendrés par une attaque. Quelle offre choisir ?
    options:
      - "Shield Standard, qui couvre déjà tous ces besoins gratuitement."
      - "Shield Advanced, qui inclut visibilité, DRT 24/7 et garantie financière."
      - "AWS WAF seul, sans Shield."
      - "GuardDuty, qui détecte aussi les attaques DDoS."
    answer: 1
    tags: [shield, ddos]
    level: intermediaire
    explanation: >
      Shield Standard protège déjà gratuitement contre les DDoS communs, mais sans
      visibilité, ni support dédié, ni remboursement — ces trois éléments sont
      spécifiques à Shield Advanced (payant). WAF seul ne couvre pas les attaques
      volumétriques réseau, et GuardDuty est un service de détection de menaces, pas
      une protection anti-DDoS.
  - prompt: |
      GuardDuty émet un finding signalant qu'une instance EC2 communique avec un
      serveur connu de command-and-control. L'équipe veut qu'une Lambda isole
      automatiquement l'instance (modification du security group) dès qu'un tel finding
      apparaît, sans intervention humaine. Que manque-t-il dans l'architecture ?
    options:
      - "Rien : GuardDuty isole automatiquement les instances compromises par défaut."
      - "Une règle EventBridge qui capte le finding GuardDuty et déclenche la Lambda de remédiation."
      - "Il faut remplacer GuardDuty par Inspector, seul capable de déclencher des actions."
      - "Il faut activer Macie en complément pour permettre l'automatisation."
    answer: 1
    tags: [guardduty, eventbridge]
    level: avance
    explanation: >
      GuardDuty ne fait que détecter et émettre un finding — aucune action automatique
      native. Il faut une règle EventBridge qui capte ce finding et invoque la Lambda de
      remédiation. Inspector scanne des vulnérabilités logicielles (autre périmètre,
      pas de déclenchement d'action non plus), et Macie est scopé aux données sensibles
      S3, sans lien avec cette automatisation réseau.
  - prompt: |
      Une entreprise doit chiffrer des données de santé avec une exigence de conformité
      imposant un module cryptographique **certifié FIPS 140-2 niveau 3** et **dédié à
      un seul client (single-tenant)**. KMS standard suffit-il ?
    options:
      - "Oui, KMS garantit nativement le niveau 3 FIPS 140-2 sur toutes ses clés."
      - "Non, KMS est un service multi-tenant garantissant le niveau 2 sur ses endpoints standards ; il faut CloudHSM pour un HSM dédié single-tenant de niveau 3."
      - "Non, aucun service AWS ne peut répondre à cette exigence."
      - "Oui, à condition d'utiliser uniquement des clés AWS managed (pas customer managed)."
    answer: 1
    tags: [kms, cloudhsm]
    level: avance
    explanation: >
      KMS est un service managé multi-tenant, avec un niveau de certification FIPS
      140-2 niveau 2 sur ses endpoints standards. Pour une exigence explicite de niveau
      3 et d'isolation matérielle single-tenant, CloudHSM est le service adapté. AWS
      propose bien une réponse à cette exigence (option 3 fausse), et le type de clé KMS
      (managed vs customer managed) ne change rien au niveau de certification de la
      plateforme KMS elle-même.
---

Vérifie tes réflexes chiffrement, secrets, protection périmétrique et détection.
