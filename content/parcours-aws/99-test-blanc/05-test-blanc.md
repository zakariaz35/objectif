---
title: "Test blanc — SAA-C03 (65 questions, conditions réelles)"
type: quiz
strategy: linear
questions:
  # ============================= SÉCURITÉ (20) =============================
  - prompt: |
      Une application tourne sur des instances EC2 et doit lire/écrire des objets dans un
      bucket S3. Actuellement, les clés d'accès IAM d'un utilisateur sont codées en dur
      dans le fichier de configuration de l'application. Quelle solution est la plus sûre
      et la plus simple à opérer ?
    options:
      - |
        Continuer à utiliser les mêmes clés d'accès mais les faire tourner manuellement
        toutes les 24h.
      - |
        Créer un rôle IAM avec une politique limitée au bucket concerné, et l'attacher aux
        instances EC2 via un profil d'instance.
      - |
        Stocker les clés d'accès chiffrées dans un fichier .env sur chaque instance.
      - |
        Créer un utilisateur IAM dédié par instance, avec des clés distinctes pour chacune.
    answer: 1
    level: intermediaire
    tags: [securite, iam, ec2]
    explanation: |
      Un rôle IAM attaché à l'instance (profil d'instance) fournit des identifiants
      temporaires gérés et renouvelés automatiquement par AWS, sans aucun secret à stocker
      ni à faire tourner manuellement — c'est la pratique recommandée. La rotation manuelle
      (option 1) est source d'erreurs et de fuites. Stocker les clés dans un fichier local
      (option 3) laisse toujours un secret long terme exposé en cas de compromission de
      l'instance. Multiplier les utilisateurs IAM (option 4) alourdit la gestion sans
      bénéfice, alors qu'un rôle est mutualisable et sans secret à gérer.

  - prompt: |
      Le compte A possède un bucket S3 contenant des rapports. Le compte B doit pouvoir lire
      ces objets. Quelle est l'approche recommandée pour donner cet accès sans créer
      d'utilisateur IAM dans le compte A ?
    options:
      - |
        Rendre le bucket public en lecture.
      - |
        Ajouter une politique de bucket (resource-based policy) dans le compte A qui
        autorise un rôle du compte B à effectuer s3:GetObject.
      - |
        Créer une clé d'accès IAM dans le compte A et l'envoyer au compte B par email.
      - |
        Copier les objets vers un bucket du compte B via un script quotidien.
    answer: 1
    level: intermediaire
    tags: [securite, iam, s3]
    explanation: |
      Une politique de bucket (resource-based policy) autorise un principal d'un autre
      compte directement sur la ressource, sans créer d'identité IAM dans le compte
      propriétaire — c'est le modèle standard d'accès inter-comptes pour S3. Rendre le
      bucket public expose les données à tout Internet, disproportionné et dangereux.
      Partager une clé d'accès par email transmet un secret long terme par un canal non
      sécurisé. Dupliquer les données par script introduit latence, coût de stockage et
      risque d'incohérence, alors qu'un accès direct est possible.

  - prompt: |
      Une entreprise gère plusieurs comptes AWS via AWS Organizations et veut empêcher tous
      les comptes, y compris les administrateurs, de créer des ressources en dehors de deux
      régions autorisées (eu-west-1 et eu-west-3). Quelle solution répond au besoin ?
    options:
      - |
        Ajouter une politique IAM à chaque utilisateur administrateur interdisant les
        autres régions.
      - |
        Attacher une Service Control Policy (SCP) au niveau de l'OU refusant les actions en
        dehors de ces deux régions.
      - |
        Configurer une règle AWS Config qui envoie une alerte quand une ressource est créée
        dans une autre région.
      - |
        Demander au support AWS de désactiver les autres régions pour le compte de
        facturation.
    answer: 1
    level: avance
    tags: [securite, organizations]
    explanation: |
      Une SCP s'applique à tous les principaux du compte, y compris les comptes root et
      administrateurs, et permet de refuser explicitement des actions par région — c'est le
      garde-fou préventif au niveau Organisation. Une politique IAM par utilisateur ne
      protège pas contre les administrateurs eux-mêmes, qui peuvent modifier leur propre
      politique. AWS Config est détectif (a posteriori) : la ressource est déjà créée avant
      l'alerte. Il n'existe pas de mécanisme support permettant de désactiver des régions de
      cette façon pour ce cas d'usage.

  - prompt: |
      Une équipe ne doit pouvoir lire que les objets sous le préfixe logs/team-a/ d'un
      bucket S3 partagé par toute l'entreprise. Quelle politique IAM respecte le principe du
      moindre privilège ?
    options:
      - |
        Une politique autorisant s3:* sur l'ensemble du bucket.
      - |
        Une politique autorisant s3:GetObject uniquement sur
        arn:aws:s3:::bucket/logs/team-a/*.
      - |
        Une politique autorisant s3:GetObject sur tous les buckets du compte.
      - |
        Ajouter l'équipe au groupe des administrateurs pour simplifier la gestion.
    answer: 1
    level: intermediaire
    tags: [securite, iam, s3]
    explanation: |
      Restreindre l'action à GetObject et la ressource au préfixe exact respecte le moindre
      privilège : l'équipe ne peut lire que ce dont elle a besoin, rien de plus. Autoriser
      s3:* sur tout le bucket donne un accès total (lecture/écriture/suppression) bien trop
      large. Ouvrir l'accès à tous les buckets du compte dépasse largement le besoin exprimé.
      Ajouter l'équipe aux administrateurs donne des droits globaux disproportionnés et
      risqués.

  - prompt: |
      Un utilisateur IAM a une politique lui donnant kms:Decrypt en pleine autorisation,
      mais il ne parvient toujours pas à déchiffrer des données protégées par une clé KMS
      gérée par le client (CMK). Quelle est l'explication la plus probable ?
    options:
      - |
        KMS ne supporte pas les politiques IAM, seule la politique de clé compte.
      - |
        La politique de clé KMS (key policy) elle-même n'accorde pas explicitement l'accès à
        cet utilisateur ou à son rôle.
      - |
        Le service KMS est temporairement indisponible dans la région.
      - |
        Il faut nécessairement recréer la clé pour que la politique IAM prenne effet.
    answer: 1
    level: avance
    tags: [securite, kms]
    explanation: |
      Pour une CMK, l'accès effectif résulte de la combinaison de la politique IAM et de la
      politique de clé (key policy) : les deux doivent autoriser l'action, la key policy
      faisant office de garde-fou supplémentaire au niveau de la ressource. Les politiques
      IAM sont bien prises en compte par KMS, mais en complément de la key policy, pas à sa
      place. Rien n'indique une panne de service. Aucune recréation de clé n'est nécessaire,
      il suffit de modifier la key policy existante.

  - prompt: |
      Une base RDS doit avoir ses identifiants automatiquement renouvelés (rotation) tous
      les 30 jours, sans script personnalisé à maintenir. Quel service choisir ?
    options:
      - |
        AWS Systems Manager Parameter Store (paramètre SecureString).
      - |
        AWS Secrets Manager, avec la rotation automatique intégrée pour RDS.
      - |
        Des variables d'environnement chiffrées dans le déploiement de l'application.
      - |
        Un objet S3 chiffré contenant les identifiants, renouvelé par un script cron sur une
        instance EC2.
    answer: 1
    level: intermediaire
    tags: [securite, secrets-manager, rds]
    explanation: |
      Secrets Manager propose une rotation automatique native pour RDS/Aurora/Redshift (via
      une fonction Lambda gérée par AWS), sans script à écrire. Parameter Store stocke un
      secret chiffré mais n'a pas de rotation automatique intégrée pour les bases de
      données : il faudrait la construire soi-même. Les variables d'environnement et le
      fichier S3 exposent un secret statique nécessitant une rotation manuelle, avec une
      surface de risque plus élevée.

  - prompt: |
      Une application doit permettre à un utilisateur externe de télécharger un seul
      fichier privé sur S3 pendant 15 minutes, sans lui donner de compte AWS ni rendre le
      bucket public. Quelle solution est adaptée ?
    options:
      - |
        Rendre l'objet public temporairement puis le repasser en privé après 15 minutes.
      - |
        Générer une URL pré-signée (presigned URL) avec une expiration de 15 minutes.
      - |
        Créer un utilisateur IAM temporaire avec des clés d'accès valables 15 minutes.
      - |
        Copier l'objet dans un bucket public dédié aux téléchargements ponctuels.
    answer: 1
    level: intermediaire
    tags: [securite, s3]
    explanation: |
      Une URL pré-signée encode une autorisation temporaire signée cryptographiquement pour
      un objet précis et une durée définie, sans exposer le bucket ni créer d'identité —
      exactement le besoin. Rendre l'objet public introduit une fenêtre de risque où
      n'importe qui peut y accéder. Créer un utilisateur IAM temporaire est disproportionné
      en complexité de gestion pour un accès ponctuel. Copier l'objet dans un bucket public
      l'expose durablement si la suppression est oubliée.

  - prompt: |
      Une entreprise soumise à un audit de conformité doit chiffrer les objets d'un bucket
      S3 et pouvoir prouver qui a utilisé la clé de chiffrement et quand. Quelle option de
      chiffrement choisir ?
    options:
      - |
        SSE-S3 (clé gérée entièrement par S3).
      - |
        SSE-KMS (clé gérée par le client via AWS KMS), dont les usages sont journalisés dans
        CloudTrail.
      - |
        Un chiffrement côté client uniquement, sans chiffrement côté serveur.
      - |
        Aucun chiffrement, en s'appuyant uniquement sur les politiques IAM.
    answer: 1
    level: intermediaire
    tags: [securite, s3, kms]
    explanation: |
      SSE-KMS utilise une clé gérée dans KMS ; chaque appel Decrypt ou GenerateDataKey est
      journalisé dans CloudTrail avec l'identité appelante, ce qui fournit la piste d'audit
      exigée. SSE-S3 chiffre bien les données mais n'offre pas de journal d'utilisation par
      clé, la clé étant gérée en interne par S3 sans point de contrôle IAM/CloudTrail dédié.
      Le chiffrement côté client seul ajoute de la complexité applicative sans couvrir le
      chiffrement au repos géré par AWS. L'absence de chiffrement ne répond pas du tout à
      l'exigence.

  - prompt: |
      Dans un VPC, quelle affirmation décrit correctement la différence entre un Security
      Group et une Network ACL ?
    options:
      - |
        Le Security Group est sans état (stateless) : il faut une règle explicite pour le
        trafic retour.
      - |
        La Network ACL est sans état (stateless) et agit au niveau du sous-réseau ; le
        Security Group est avec état (stateful) et agit au niveau de l'instance.
      - |
        Les deux sont avec état (stateful) et s'appliquent au niveau de l'instance.
      - |
        La Network ACL ne peut contenir que des règles d'autorisation (allow), jamais de
        refus (deny).
    answer: 1
    level: intermediaire
    tags: [securite, vpc, security-groups]
    explanation: |
      Le Security Group est stateful (le trafic retour est automatiquement autorisé) et
      filtre au niveau instance ; la NACL est stateless (il faut des règles explicites pour
      l'aller et le retour) et filtre au niveau sous-réseau. La première option inverse les
      rôles. La troisième est fausse car la NACL est stateless, pas stateful. La quatrième
      est fausse : une NACL supporte des règles allow et deny, contrairement au Security
      Group qui n'autorise que des règles allow.

  - prompt: |
      Des instances EC2 dans un sous-réseau privé (sans NAT Gateway ni route vers Internet)
      doivent pouvoir lire des objets dans S3, pour des raisons de sécurité et sans passer
      par Internet. Quelle solution répond au besoin ?
    options:
      - |
        Créer une route par défaut vers une Internet Gateway pour ce sous-réseau.
      - |
        Ajouter un VPC Gateway Endpoint pour S3 dans la table de routage du sous-réseau.
      - |
        Configurer un appairage VPC (VPC Peering) avec le service S3.
      - |
        Créer un Transit Gateway et l'attacher directement au bucket S3.
    answer: 1
    level: intermediaire
    tags: [securite, vpc, vpc-endpoints, s3]
    explanation: |
      Un Gateway Endpoint pour S3 ajoute une route privée vers S3 via le réseau AWS, sans
      passer par Internet ni nécessiter de NAT — solution gratuite et recommandée. Créer une
      route vers une Internet Gateway exposerait le sous-réseau à Internet, contraire à
      l'exigence de rester privé. Le VPC Peering est inapplicable : S3 n'est pas un VPC, on
      ne peut pas l'apparier. Un Transit Gateway relie des VPC/réseaux entre eux, pas un
      service comme S3, qui utilise un endpoint dédié.

  - prompt: |
      Un volume EBS existant, créé sans chiffrement, doit devenir chiffré pour respecter une
      nouvelle politique de sécurité, sans recréer l'instance de zéro. Quelle méthode
      permet d'obtenir un volume chiffré équivalent ?
    options:
      - |
        Activer le chiffrement directement sur le volume existant via une modification
        d'attribut.
      - |
        Créer un snapshot du volume, le copier en activant le chiffrement, puis créer un
        nouveau volume chiffré à partir de ce snapshot copié et le rattacher.
      - |
        Attendre le prochain redémarrage de l'instance : EBS chiffre automatiquement les
        volumes existants.
      - |
        Activer KMS au niveau du compte : tous les volumes existants deviennent
        rétroactivement chiffrés.
    answer: 1
    level: avance
    tags: [securite, ebs, kms]
    explanation: |
      EBS ne permet pas de chiffrer un volume existant en place : il faut passer par un
      snapshot, le copier avec chiffrement activé, puis créer un nouveau volume chiffré à
      partir de ce snapshot copié, à attacher à la place de l'ancien. Le chiffrement se
      définit à la création du volume, pas après coup, donc la première option est
      impossible. Rien ne se passe automatiquement au redémarrage. Activer KMS au niveau
      compte ne modifie pas les volumes déjà existants.

  - prompt: |
      Une entreprise veut détecter automatiquement les activités suspectes sur son compte
      AWS (appel API depuis une IP malveillante connue, identifiants potentiellement
      compromis) en s'appuyant sur le machine learning et la threat intelligence d'AWS, avec
      le moins d'effort de configuration. Quel service choisir ?
    options:
      - |
        Créer des alarmes CloudWatch personnalisées sur chaque métrique d'API suspecte.
      - |
        Activer Amazon GuardDuty, qui analyse en continu CloudTrail, les VPC Flow Logs et
        les journaux DNS.
      - |
        Écrire une règle AWS Config vérifiant la configuration des groupes de sécurité.
      - |
        Analyser manuellement les journaux CloudTrail chaque semaine.
    answer: 1
    level: intermediaire
    tags: [securite, guardduty]
    explanation: |
      GuardDuty est un service managé de détection de menaces qui corrèle automatiquement
      CloudTrail, les VPC Flow Logs et les requêtes DNS avec des flux de threat intelligence
      et du machine learning, sans infrastructure à gérer. Des alarmes CloudWatch
      personnalisées demandent de définir manuellement chaque règle, effort élevé et
      couverture partielle. Une règle Config vérifie une configuration statique, pas un
      comportement suspect en temps réel. Une analyse manuelle hebdomadaire est lente et ne
      détecte rien en temps réel.

  - prompt: |
      Une application web derrière un Application Load Balancer subit des tentatives
      d'injection SQL et de scripts intersites (XSS) au niveau de la couche HTTP. Quel
      service filtre ce type de trafic malveillant ?
    options:
      - |
        AWS Shield Standard.
      - |
        AWS WAF, avec des règles gérées contre l'injection SQL et le XSS, attaché à l'ALB.
      - |
        Un Security Group plus restrictif sur l'ALB.
      - |
        Amazon Inspector.
    answer: 1
    level: intermediaire
    tags: [securite, waf]
    explanation: |
      AWS WAF opère au niveau applicatif (couche 7) et propose des règles gérées prêtes à
      l'emploi contre l'injection SQL et le XSS, attachables à un ALB, CloudFront ou API
      Gateway. Shield Standard protège contre le DDoS réseau/transport, pas contre des
      attaques applicatives ciblées. Un Security Group filtre par IP/port, incapable
      d'inspecter le contenu d'une requête HTTP. Inspector évalue des vulnérabilités sur des
      instances/images, ce n'est pas un pare-feu applicatif en temps réel.

  - prompt: |
      Une plateforme e-commerce publique, critique pour le chiffre d'affaires, veut une
      protection renforcée contre les attaques DDoS volumétriques, avec accès à une équipe
      de réponse dédiée et une protection financière contre les pics de facturation liés à
      une attaque. Que faut-il souscrire ?
    options:
      - |
        AWS Shield Standard (inclus gratuitement).
      - |
        AWS Shield Advanced.
      - |
        AWS WAF seul, sans Shield.
      - |
        Amazon GuardDuty avec les protections S3.
    answer: 1
    level: intermediaire
    tags: [securite, shield]
    explanation: |
      Shield Advanced ajoute, par rapport au Standard gratuit, l'accès au DDoS Response
      Team, une protection financière contre les surcoûts liés à une attaque, et une
      détection plus fine pour les attaques applicatives. Shield Standard protège déjà
      contre les attaques réseau/transport les plus courantes mais sans DRT ni garantie
      financière. WAF filtre les requêtes applicatives mais ne fournit aucune protection
      DDoS volumétrique dédiée ni support financier. GuardDuty est un service de détection
      de menaces générique, sans lien avec la protection DDoS.

  - prompt: |
      Une ressource critique a été supprimée par erreur dans un compte AWS. L'équipe veut
      savoir quel utilisateur ou rôle a effectué l'appel API de suppression, et à quel
      moment. Quel service consulter ?
    options:
      - |
        Amazon CloudWatch Metrics.
      - |
        AWS CloudTrail, en consultant l'historique des événements d'API.
      - |
        AWS Trusted Advisor.
      - |
        AWS Config, en consultant l'inventaire des ressources actuelles.
    answer: 1
    level: intermediaire
    tags: [securite, cloudtrail]
    explanation: |
      CloudTrail journalise chaque appel d'API (qui, quand, depuis quelle IP, quelle
      action) — c'est la source d'audit pour retracer une suppression. CloudWatch Metrics
      ne fournit que des métriques numériques agrégées, pas le détail d'un appel d'API
      individuel. Trusted Advisor donne des recommandations de bonnes pratiques, pas un
      journal d'audit. AWS Config montre l'état et l'historique de configuration des
      ressources mais ne journalise pas l'identité de l'appelant aussi précisément que
      CloudTrail.

  - prompt: |
      Une entreprise veut être alertée automatiquement dès qu'un bucket S3 devient
      accessible publiquement, afin de rester en conformité en continu. Quelle solution
      répond au besoin avec le moins de surcharge opérationnelle ?
    options:
      - |
        Auditer manuellement chaque bucket une fois par mois.
      - |
        Une règle managée AWS Config (s3-bucket-public-read-prohibited) avec remédiation
        automatique.
      - |
        Un tableau de bord CloudWatch personnalisé recalculé chaque nuit par une fonction
        Lambda planifiée.
      - |
        Désactiver S3 Block Public Access au niveau du compte pour simplifier les
        vérifications.
    answer: 1
    level: avance
    tags: [securite, config, s3]
    explanation: |
      AWS Config propose des règles managées prêtes à l'emploi qui évaluent en continu la
      conformité des ressources et peuvent déclencher une remédiation automatique — la
      solution la moins coûteuse en effort. L'audit manuel mensuel laisse une fenêtre
      d'exposition entre deux vérifications. Un tableau de bord Lambda maison nécessite
      d'écrire et de maintenir du code alors qu'une règle managée existe déjà. Désactiver
      Block Public Access va à l'encontre du besoin : cela retire une protection au lieu de
      renforcer la conformité.

  - prompt: |
      Une entreprise possède 15 comptes AWS gérés via AWS Organizations et veut que ses
      employés se connectent une seule fois avec leur identité d'entreprise pour accéder aux
      comptes et applications autorisés, sans gérer un utilisateur IAM par compte. Quel
      service utiliser ?
    options:
      - |
        Créer un utilisateur IAM identique dans chaque compte, avec le même mot de passe.
      - |
        AWS IAM Identity Center, fédéré avec l'annuaire d'entreprise.
      - |
        Des rôles IAM sans fédération, avec des clés d'accès partagées par email.
      - |
        Amazon Cognito User Pools.
    answer: 1
    level: intermediaire
    tags: [securite, iam-identity-center]
    explanation: |
      IAM Identity Center centralise l'authentification (fédération avec un annuaire
      d'entreprise) et l'attribution d'accès à travers tous les comptes d'une Organization,
      sans dupliquer d'utilisateurs IAM — exactement le besoin de SSO multi-comptes. Créer
      un utilisateur IAM identique par compte multiplie les identités et les mots de passe
      partagés, mauvaise pratique. Partager des clés d'accès par email expose un secret long
      terme de façon non sécurisée. Cognito sert à l'authentification des utilisateurs
      d'applications, pas à l'accès des employés à la console/API AWS multi-comptes.

  - prompt: |
      Une entreprise veut se protéger contre la suppression accidentelle ou malveillante
      d'objets critiques dans un bucket S3, même par un utilisateur disposant des droits de
      suppression. Quelle configuration renforce le plus cette protection ?
    options:
      - |
        Activer uniquement le versioning du bucket.
      - |
        Activer le versioning et MFA Delete, qui exige une authentification multifacteur
        pour supprimer une version ou désactiver le versioning.
      - |
        Restreindre l'accès au bucket uniquement à l'utilisateur root.
      - |
        Copier chaque nuit les objets vers un second bucket dans la même région.
    answer: 1
    level: avance
    tags: [securite, s3]
    explanation: |
      Le versioning seul conserve les anciennes versions mais n'empêche pas leur suppression
      définitive ; MFA Delete ajoute une exigence d'authentification à deux facteurs pour
      toute suppression de version ou désactivation du versioning, renforçant nettement la
      protection. Le versioning seul protège contre l'écrasement mais pas contre une
      suppression volontaire des versions. Restreindre l'accès au compte root est une
      mauvaise pratique (le root ne doit pas être utilisé au quotidien) et n'empêche pas la
      suppression par ce compte. Une copie nocturne protège contre une perte régionale mais
      pas contre une suppression malveillante si le processus réplique aussi les
      suppressions.

  - prompt: |
      Une entreprise utilise une connexion AWS Direct Connect dédiée entre son datacenter et
      son VPC. Elle apprend que Direct Connect ne chiffre pas le trafic par défaut. Quelle
      solution ajoute le chiffrement tout en conservant les bénéfices de Direct Connect ?
    options:
      - |
        Remplacer entièrement Direct Connect par une connexion Internet publique standard.
      - |
        Établir un tunnel VPN IPsec par-dessus la connexion Direct Connect.
      - |
        Activer une option de chiffrement automatique dans la console Direct Connect.
      - |
        Ne rien faire : Direct Connect chiffre nativement tout le trafic.
    answer: 1
    level: avance
    tags: [securite, direct-connect, vpn]
    explanation: |
      Direct Connect achemine le trafic sur un circuit privé mais non chiffré par défaut ;
      pour obtenir la confidentialité en transit tout en gardant la latence/débit stables de
      Direct Connect, on établit un VPN IPsec par-dessus la connexion (VPN over Direct
      Connect). Remplacer Direct Connect par Internet abandonnerait les bénéfices de
      latence/débit garantis. Il n'existe pas d'option de chiffrement automatique native
      dans Direct Connect. La dernière option est fausse : c'est l'affirmation contraire au
      fonctionnement réel de Direct Connect.

  - prompt: |
      Une application du compte A doit occasionnellement effectuer des opérations dans le
      compte B. Quelle est la méthode recommandée pour lui donner un accès temporaire et
      traçable, sans partager de clés d'accès long terme ?
    options:
      - |
        Créer un utilisateur IAM dans le compte B et partager ses clés d'accès avec
        l'application du compte A.
      - |
        Utiliser sts:AssumeRole pour obtenir des identifiants temporaires à partir d'un rôle
        IAM du compte B faisant confiance au compte A.
      - |
        Dupliquer les mêmes clés d'accès racine (root) dans les deux comptes.
      - |
        Désactiver IAM sur le compte B pour simplifier les échanges.
    answer: 1
    level: intermediaire
    tags: [securite, iam, sts]
    explanation: |
      AssumeRole permet à un principal du compte A d'obtenir des identifiants temporaires
      (expirant automatiquement) en assumant un rôle du compte B configuré pour lui faire
      confiance — traçable via CloudTrail et sans secret long terme. Créer un utilisateur
      IAM dans le compte B crée un identifiant long terme supplémentaire à protéger. Utiliser
      les clés du compte root est une pratique dangereuse à proscrire pour des accès
      applicatifs. Désactiver IAM supprimerait toute gouvernance d'accès, contraire aux
      bonnes pratiques.

  # ============================ RÉSILIENCE (17) ============================
  - prompt: |
      Une base de données RDS MySQL est configurée en Multi-AZ. Quel est l'objectif
      principal de cette configuration ?
    options:
      - |
        Réduire la latence des requêtes de lecture en répartissant la charge sur plusieurs
        instances.
      - |
        Assurer la haute disponibilité : bascule automatique vers une instance en veille
        synchronisée dans une autre zone de disponibilité en cas de panne.
      - |
        Réduire le coût de la base de données en mutualisant les ressources entre zones.
      - |
        Permettre l'écriture simultanée sur plusieurs instances dans des zones différentes.
    answer: 1
    level: intermediaire
    tags: [resilience, rds]
    explanation: |
      Multi-AZ maintient une copie synchrone de la base dans une autre AZ et bascule
      automatiquement dessus en cas de défaillance de l'instance primaire — son but est la
      disponibilité, pas la performance en lecture. La première option décrit plutôt le rôle
      d'une read replica. Multi-AZ double les ressources (et donc le coût), il ne le réduit
      pas. Multi-AZ n'autorise qu'un seul writer actif à la fois, ce n'est pas une
      architecture multi-maître.

  - prompt: |
      Une entreprise veut une stratégie de reprise après sinistre pour sa base RDS, avec une
      copie dans une autre région qu'elle pourra promouvoir en instance autonome en cas de
      sinistre régional. Que doit-elle mettre en place ?
    options:
      - |
        Une instance Multi-AZ classique dans la même région.
      - |
        Une read replica inter-région, promouvable en instance indépendante en cas de
        besoin.
      - |
        Un snapshot manuel quotidien conservé dans la même région.
      - |
        Un cache ElastiCache synchronisé avec la base primaire.
    answer: 1
    level: avance
    tags: [resilience, rds]
    explanation: |
      Une read replica inter-région réplique en continu les données vers une autre région et
      peut être promue en instance RDS autonome, avec un RPO faible — c'est le mécanisme
      adapté à la reprise après sinistre géographique. Multi-AZ protège contre une panne
      d'AZ, pas contre un sinistre régional complet. Un snapshot manuel quotidien laisse un
      écart de données important et un temps de restauration long. Un cache ElastiCache
      n'est pas une base de données persistante promouvable, il ne convient pas comme cible
      de reprise.

  - prompt: |
      Une entreprise mondiale veut une base de données relationnelle avec une réplication
      inter-région à faible latence (moins d'une seconde) et un temps de bascule rapide en
      cas de panne régionale. Quelle solution Aurora choisir ?
    options:
      - |
        Aurora avec une seule instance Multi-AZ dans une région.
      - |
        Aurora Global Database, qui réplique le stockage vers plusieurs régions secondaires
        en lecture avec un RPO typique inférieur à 1 seconde.
      - |
        Un cluster Aurora standard répliqué manuellement chaque nuit via un export/import.
      - |
        Aurora Serverless v2 dans une seule région.
    answer: 1
    level: avance
    tags: [resilience, aurora]
    explanation: |
      Aurora Global Database réplique au niveau du stockage vers plusieurs régions avec un
      RPO typiquement sous la seconde et permet une bascule rapide, répondant précisément au
      besoin. Une instance Multi-AZ ne couvre qu'une seule région. Un export/import manuel
      quotidien introduit un RPO de plusieurs heures et un processus fragile. Aurora
      Serverless v2 concerne l'élasticité de capacité, pas la réplication multi-région.

  - prompt: |
      Une application mondiale nécessite que les écritures effectuées dans n'importe quelle
      région soient automatiquement propagées vers toutes les autres régions actives, avec
      un modèle actif-actif, sur une base NoSQL entièrement gérée. Quelle fonctionnalité
      utiliser ?
    options:
      - |
        DynamoDB avec des sauvegardes à la demande répliquées manuellement.
      - |
        DynamoDB Global Tables, qui répliquent les tables en continu et de façon
        bidirectionnelle entre plusieurs régions.
      - |
        Une seule table DynamoDB avec des read replicas synchrones.
      - |
        Amazon RDS Multi-AZ répliqué manuellement entre régions.
    answer: 1
    level: intermediaire
    tags: [resilience, dynamodb]
    explanation: |
      Global Tables propose une réplication multi-région active-active gérée automatiquement
      pour DynamoDB, avec résolution des conflits intégrée. Les sauvegardes à la demande
      répliquées manuellement ne sont ni continues ni actives-actives. DynamoDB n'a pas de
      notion de read replica comme RDS, c'est un abus de terme. RDS est un service
      relationnel, pas NoSQL, et Multi-AZ ne couvre qu'une seule région.

  - prompt: |
      Une entreprise veut que les objets d'un bucket S3 dans eu-west-1 soient automatiquement
      copiés vers un bucket dans eu-west-3, afin de pouvoir continuer à servir les données en
      cas de sinistre régional. Quelle fonctionnalité S3 configurer ?
    options:
      - |
        S3 Lifecycle vers Glacier dans la même région.
      - |
        S3 Cross-Region Replication, avec le versioning activé sur les deux buckets.
      - |
        S3 Transfer Acceleration.
      - |
        Une synchronisation manuelle exécutée une fois par mois.
    answer: 1
    level: intermediaire
    tags: [resilience, s3]
    explanation: |
      Cross-Region Replication réplique automatiquement et en continu les nouveaux objets
      d'un bucket vers un bucket d'une autre région, ce qui nécessite le versioning activé —
      la solution native pour la reprise après sinistre régionale sur S3. Le lifecycle vers
      Glacier change la classe de stockage mais ne réplique rien vers une autre région.
      Transfer Acceleration accélère les transferts vers un bucket, elle ne réplique rien
      automatiquement entre régions. Une synchronisation mensuelle introduit un RPO
      largement insuffisant.

  - prompt: |
      Un groupe Auto Scaling déploie des instances EC2 réparties sur 3 zones de disponibilité
      derrière un Application Load Balancer. Une instance échoue au contrôle de santé de
      l'ALB, avec un type de contrôle de santé de l'ASG configuré sur ELB. Que se passe-t-il ?
    options:
      - |
        Rien : seul un contrôle de santé EC2 (statut système) peut déclencher un
        remplacement.
      - |
        L'Auto Scaling Group considère l'instance comme défaillante, la termine, et lance
        une nouvelle instance pour la remplacer, potentiellement dans une autre AZ.
      - |
        L'ALB retire l'instance mais l'ASG ne fait rien tant qu'un opérateur n'intervient
        pas manuellement.
      - |
        Toutes les instances du groupe sont redémarrées par précaution.
    answer: 1
    level: intermediaire
    tags: [resilience, ec2-auto-scaling, elb]
    explanation: |
      Avec le type de contrôle de santé ELB, l'ASG utilise le résultat des health checks de
      l'ALB : une instance qui échoue est marquée Unhealthy, terminée, puis remplacée
      automatiquement pour maintenir la capacité désirée. La première option décrit le
      comportement du contrôle de santé EC2 seul, pas ELB. L'ASG agit automatiquement, sans
      intervention manuelle nécessaire. Seule l'instance défaillante est remplacée, pas tout
      le groupe.

  - prompt: |
      Une entreprise a un site principal actif et un site de secours statique hébergé sur
      S3. Elle veut que le DNS bascule automatiquement vers le site de secours seulement si
      le site principal ne répond plus aux contrôles de santé. Quelle politique de routage
      Route 53 utiliser ?
    options:
      - |
        Routage simple (simple routing).
      - |
        Routage par basculement (failover routing), avec un enregistrement primaire et un
        enregistrement secondaire associés à des health checks.
      - |
        Routage géographique (geolocation routing).
      - |
        Routage pondéré (weighted routing) 50/50.
    answer: 1
    level: intermediaire
    tags: [resilience, route-53]
    explanation: |
      Le routage par basculement associe un enregistrement primaire et un secondaire à des
      contrôles de santé : Route 53 ne répond avec le secondaire que si le primaire est
      détecté en échec. Le routage simple ne fait aucun choix conditionnel. Le routage
      géographique route selon la localisation de l'utilisateur, pas selon un état de santé.
      Le routage pondéré répartirait le trafic en permanence entre les deux sites, même
      quand le primaire fonctionne, ce qui n'est pas le besoin exprimé.

  - prompt: |
      Une équipe veut migrer progressivement 10 % du trafic vers une nouvelle version de son
      infrastructure avant de généraliser, tout en retirant automatiquement de la rotation
      toute cible qui deviendrait défaillante. Quelle politique de routage Route 53
      correspond le mieux ?
    options:
      - |
        Routage par basculement (failover), tout ou rien.
      - |
        Routage pondéré (weighted routing) avec des poids 90/10, combiné à des health
        checks sur chaque enregistrement.
      - |
        Routage à latence la plus faible (latency-based routing).
      - |
        Routage multivaleur (multivalue answer routing) sans health check.
    answer: 1
    level: avance
    tags: [resilience, route-53]
    explanation: |
      Le routage pondéré permet de répartir le trafic selon des proportions précises et,
      combiné à des health checks, retire automatiquement de la rotation une cible
      défaillante — exactement le scénario de migration progressive décrit. Le routage par
      basculement est binaire (tout sur le primaire ou tout sur le secondaire), inadapté à
      une répartition en pourcentage. Le routage à latence route selon la latence réseau
      perçue, pas selon un pourcentage voulu. Le routage multivaleur répond avec plusieurs IP
      sans pondération, adapté à un DNS round-robin simple mais pas au contrôle précis d'une
      proportion de trafic.

  - prompt: |
      Une entreprise veut une stratégie de reprise après sinistre où seuls les composants
      critiques minimaux (comme la base de données, répliquée en continu) tournent en
      permanence dans la région de secours, le reste de l'infrastructure étant provisionné
      uniquement lors d'un sinistre déclaré. Quelle stratégie DR est-ce ?
    options:
      - |
        Backup and restore.
      - |
        Pilot light.
      - |
        Warm standby.
      - |
        Multi-site actif-actif.
    answer: 1
    level: avance
    tags: [resilience, disaster-recovery]
    explanation: |
      La stratégie pilot light ne maintient en permanence que le cœur minimal (typiquement
      la base de données répliquée) ; le reste de la pile applicative est démarré/scalé
      uniquement lors du sinistre — un compromis coût/RTO intermédiaire. Backup and restore
      ne maintient rien en permanence, juste des sauvegardes, avec un RTO/RPO plus élevés.
      Warm standby maintient une version réduite mais fonctionnelle de toute la pile, pas
      seulement la base, avec un RTO plus faible que pilot light. Multi-site actif-actif
      fait tourner l'ensemble de la pile à pleine capacité dans plusieurs sites, coût
      maximal.

  - prompt: |
      Une entreprise veut une reprise après sinistre plus rapide que pilot light, en
      maintenant en permanence une version réduite mais pleinement fonctionnelle de son
      application dans la région de secours, capable d'être montée en charge rapidement en
      cas de bascule. Quelle stratégie est-ce ?
    options:
      - |
        Backup and restore.
      - |
        Pilot light.
      - |
        Warm standby.
      - |
        Multi-site actif-actif.
    answer: 2
    level: avance
    tags: [resilience, disaster-recovery]
    explanation: |
      Warm standby fait tourner une version à échelle réduite mais fonctionnelle de
      l'ensemble de la pile en permanence dans le site de secours ; en cas de sinistre, il
      suffit de la monter en charge, ce qui offre un RTO plus court que pilot light. Backup
      and restore n'a aucune infrastructure active, RTO le plus élevé. Pilot light ne
      maintient que le composant de données critique, pas l'ensemble applicatif fonctionnel.
      Multi-site actif-actif fait tourner à pleine capacité sur tous les sites en permanence,
      au-delà du besoin exprimé ici.

  - prompt: |
      Une entreprise a des données de traitement par lot non critiques, pour lesquelles un
      délai de reprise de plusieurs heures est acceptable en cas de sinistre. Elle veut la
      stratégie DR la moins coûteuse. Que recommander ?
    options:
      - |
        Multi-site actif-actif.
      - |
        Warm standby.
      - |
        Backup and restore, avec AWS Backup et un stockage des sauvegardes dans une autre
        région.
      - |
        Pilot light avec une base de données répliquée en continu.
    answer: 2
    level: intermediaire
    tags: [resilience, disaster-recovery, aws-backup]
    explanation: |
      Pour des données non critiques tolérant un RTO/RPO de plusieurs heures, backup and
      restore est la stratégie la moins chère : aucune infrastructure active en permanence,
      uniquement des sauvegardes stockées, restaurées en cas de besoin. Multi-site
      actif-actif et warm standby maintiennent une infrastructure active en permanence,
      coût bien plus élevé, disproportionné pour ce besoin. Pilot light maintient une
      réplication continue de la base, un coût que le besoin exprimé ne justifie pas.

  - prompt: |
      Une entreprise dont l'indisponibilité coûte des centaines de milliers d'euros par
      minute veut un RTO quasi nul et un RPO proche de zéro, quel qu'en soit le coût. Quelle
      stratégie de reprise après sinistre choisir ?
    options:
      - |
        Backup and restore.
      - |
        Pilot light.
      - |
        Warm standby.
      - |
        Multi-site actif-actif, avec du trafic servi simultanément par plusieurs régions.
    answer: 3
    level: avance
    tags: [resilience, disaster-recovery]
    explanation: |
      Le multi-site actif-actif fait tourner l'application à pleine capacité dans plusieurs
      régions simultanément, servant du trafic réel en continu ; en cas de sinistre sur une
      région, le trafic bascule immédiatement vers les autres, offrant le RTO/RPO les plus
      faibles possibles, au prix du coût le plus élevé. Backup and restore, pilot light et
      warm standby offrent des RTO/RPO croissants mais tous supérieurs, car ils nécessitent
      un délai de démarrage ou de montée en charge après le sinistre.

  - prompt: |
      Un consommateur récupère un message d'une file SQS et met plus de temps que prévu à le
      traiter. Avant qu'il ait pu le supprimer explicitement, le message redevient visible
      pour d'autres consommateurs et est traité une seconde fois. Quel paramètre faut-il
      ajuster pour éviter ce traitement en double ?
    options:
      - |
        Réduire la taille maximale des messages.
      - |
        Augmenter le visibility timeout de la file pour qu'il couvre la durée réelle de
        traitement.
      - |
        Passer la file en mode FIFO uniquement, sans autre changement.
      - |
        Réduire le nombre de consommateurs à un seul.
    answer: 1
    level: intermediaire
    tags: [resilience, sqs]
    explanation: |
      Le visibility timeout définit la durée pendant laquelle un message reste invisible aux
      autres consommateurs après avoir été récupéré ; s'il est trop court par rapport au
      temps de traitement réel, le message réapparaît et peut être traité en double avant sa
      suppression — il faut l'ajuster à la durée de traitement réelle. Réduire la taille des
      messages ne change rien au délai de traitement. Passer en FIFO réduit les doublons de
      livraison dans une certaine mesure mais ne résout pas un traitement en double causé par
      un timeout trop court. Réduire le nombre de consommateurs limiterait le débit sans
      garantir la résolution du problème de fond.

  - prompt: |
      Plusieurs instances EC2 réparties sur 3 zones de disponibilité doivent partager le même
      système de fichiers, avec une haute disponibilité native entre zones, sans gérer
      soi-même une réplication. Quel service choisir ?
    options:
      - |
        Un volume EBS partagé, monté sur les 3 instances.
      - |
        Amazon EFS, dont les données sont automatiquement répliquées entre plusieurs zones
        de disponibilité au sein d'une région.
      - |
        AWS Storage Gateway (File Gateway), pensé pour relier un site on-premise à S3.
      - |
        Un volume d'instance store sur chaque instance, synchronisé manuellement.
    answer: 1
    level: intermediaire
    tags: [resilience, efs]
    explanation: |
      EFS est un système de fichiers partagé et managé, monté simultanément par de nombreuses
      instances, avec des données répliquées automatiquement sur plusieurs AZ. Un volume EBS
      classique ne peut être monté en écriture que sur une seule instance à la fois dans le
      cas général. Storage Gateway est conçu pour connecter une infrastructure on-premise à
      S3, pas pour du partage de fichiers entre instances EC2 déjà dans le cloud. Un instance
      store est local et éphémère à chaque instance, nécessitant une synchronisation
      manuelle fragile.

  - prompt: |
      Une architecture VPC multi-AZ utilise un unique NAT Gateway placé dans une seule zone
      de disponibilité pour l'accès sortant à Internet des sous-réseaux privés de toutes les
      AZ. Quel est le risque principal, et quelle correction apporter ?
    options:
      - |
        Aucun risque : un seul NAT Gateway suffit toujours, quelle que soit l'architecture.
      - |
        Le NAT Gateway devient un point de défaillance unique pour les AZ qui en dépendent ;
        il faut déployer un NAT Gateway par AZ, utilisé par les sous-réseaux de cette même
        AZ.
      - |
        Il faut remplacer le NAT Gateway par une Internet Gateway dans chaque AZ.
      - |
        Il faut désactiver le NAT Gateway et autoriser l'accès direct depuis Internet vers
        les sous-réseaux privés.
    answer: 1
    level: avance
    tags: [resilience, vpc, nat-gateway]
    explanation: |
      Un NAT Gateway est rattaché à une AZ ; si une seule instance sert tout le VPC, la panne
      de cette AZ coupe l'accès sortant pour les autres AZ qui en dépendent. La bonne
      pratique est un NAT Gateway par AZ, utilisé uniquement par les sous-réseaux de cette
      même AZ. Il y a bien un risque réel de panne de zone, contrairement à la première
      option. Une Internet Gateway ne fournit pas de traduction d'adresse pour un sous-réseau
      privé. Désactiver le NAT casserait tout accès sortant nécessaire et exposerait
      directement les ressources à Internet, contraire à la sécurité recherchée.

  - prompt: |
      Une entreprise migre une base MySQL on-premise vers Amazon RDS et veut minimiser le
      temps d'indisponibilité lors de la bascule finale, en gardant la base source et la base
      cible synchronisées jusqu'au dernier moment. Quelle approche choisir ?
    options:
      - |
        Exporter un dump SQL complet, le transférer, puis l'importer dans RDS pendant une
        fenêtre de maintenance de plusieurs heures.
      - |
        AWS Database Migration Service (DMS) avec réplication continue (Change Data
        Capture) jusqu'à la bascule finale.
      - |
        Copier manuellement les fichiers de données binaires MySQL vers RDS via SCP.
      - |
        Recréer les données à la main dans RDS à partir d'exports CSV mensuels.
    answer: 1
    level: avance
    tags: [resilience, dms, rds]
    explanation: |
      AWS DMS avec Change Data Capture effectue une migration initiale complète puis
      réplique en continu les changements de la source vers la cible, permettant une
      bascule finale en quelques minutes plutôt qu'une longue fenêtre d'indisponibilité. Le
      dump/import complet impose une coupure prolongée pendant tout le transfert. La copie
      manuelle des fichiers binaires n'est pas une méthode supportée ni fiable vers un
      service RDS managé. Des exports CSV mensuels introduisent une perte de données massive
      et un décalage incompatible avec le besoin.

  - prompt: |
      Une équipe veut exécuter des conteneurs applicatifs répartis sur plusieurs zones de
      disponibilité derrière un Application Load Balancer, avec le moins d'effort
      opérationnel possible (pas de gestion de serveurs, pas de patchs OS). Quelle option
      choisir ?
    options:
      - |
        Amazon ECS sur EC2, avec des instances gérées et patchées manuellement par l'équipe.
      - |
        Amazon ECS sur AWS Fargate, qui exécute les tâches réparties sur plusieurs AZ sans
        gérer de serveurs sous-jacents.
      - |
        Amazon EKS avec des nœuds worker EC2 autogérés.
      - |
        Des instances EC2 individuelles, une par conteneur, gérées manuellement dans chaque
        AZ.
    answer: 1
    level: intermediaire
    tags: [resilience, ecs, fargate]
    explanation: |
      Fargate est un mode d'exécution serverless pour ECS (et EKS) : AWS gère
      l'infrastructure sous-jacente, place les tâches sur plusieurs AZ selon la configuration
      du service, sans aucun serveur à patcher ou à dimensionner. ECS sur EC2 et EKS avec des
      nœuds autogérés impliquent de gérer, patcher et dimensionner des instances EC2
      soi-même, surcharge opérationnelle nettement supérieure. Des instances individuelles
      par conteneur sont le moins adapté : gestion manuelle instance par instance, sans
      orchestration ni haute disponibilité automatisée.

  # =========================== PERFORMANCE (16) ===========================
  - prompt: |
      Une application lit très fréquemment les mêmes éléments dans une table DynamoDB et a
      besoin de temps de réponse en microsecondes, bien inférieurs à la latence habituelle
      de DynamoDB en millisecondes. Quelle solution répond au besoin avec le moins d'effort
      d'intégration ?
    options:
      - |
        Augmenter la capacité provisionnée en lecture de la table.
      - |
        Ajouter Amazon DynamoDB Accelerator (DAX) en cache devant la table, compatible avec
        l'API DynamoDB existante.
      - |
        Migrer vers Amazon Aurora pour bénéficier de son cache de requêtes intégré.
      - |
        Ajouter des read replicas à la table DynamoDB.
    answer: 1
    level: intermediaire
    tags: [performance, dynamodb, dax]
    explanation: |
      DAX est un cache en mémoire, entièrement compatible avec l'API DynamoDB, conçu pour
      ramener la latence de lecture à l'échelle de la microseconde sans changer le code
      applicatif. Augmenter la capacité provisionnée réduit le risque de throttling mais ne
      change pas l'ordre de grandeur de la latence. Migrer vers Aurora impose une migration
      complète vers un moteur relationnel, disproportionné. DynamoDB n'a pas de mécanisme de
      read replica comme RDS, cette option n'existe pas.

  - prompt: |
      Une base RDS reçoit un volume élevé de requêtes de lecture répétitives sur les mêmes
      données, ce qui sature le CPU de l'instance. Quelle solution réduit la charge de
      lecture avec le moins de changement d'architecture ?
    options:
      - |
        Ajouter Amazon ElastiCache (Redis ou Memcached) en cache devant la base pour les
        lectures fréquentes.
      - |
        Passer à une instance RDS avec encore plus de CPU, indéfiniment.
      - |
        Désactiver les sauvegardes automatiques pour libérer des ressources.
      - |
        Passer la base en Multi-AZ pour répartir la charge de lecture entre les deux
        instances.
    answer: 0
    level: avance
    tags: [performance, elasticache, rds]
    explanation: |
      ElastiCache placé devant la base absorbe les lectures répétitives sans toucher la base
      à chaque requête, réduisant fortement la charge CPU pour un coût maîtrisé. Augmenter
      indéfiniment le CPU ne fait que repousser le problème, avec un coût croissant et un
      plafond atteint. Désactiver les sauvegardes n'a aucun impact sur la charge de lecture.
      Passer en Multi-AZ est un piège classique : l'instance standby n'est pas accessible en
      lecture, elle ne sert qu'au failover.

  - prompt: |
      Un site web sert des images et des fichiers CSS/JS statiques à des utilisateurs
      répartis dans le monde entier. Le serveur d'origine est de plus en plus sollicité et la
      latence perçue à l'étranger est élevée. Quelle solution améliore la performance avec le
      moins de changement applicatif ?
    options:
      - |
        Ajouter davantage d'instances EC2 identiques dans la même région d'origine.
      - |
        Mettre Amazon CloudFront devant l'origine pour mettre en cache le contenu statique
        dans des points de présence proches des utilisateurs.
      - |
        Migrer l'intégralité de l'application vers une autre région plus centrale.
      - |
        Réduire la taille des images de moitié sur le serveur d'origine.
    answer: 1
    level: intermediaire
    tags: [performance, cloudfront]
    explanation: |
      CloudFront met le contenu statique en cache dans des edge locations proches des
      utilisateurs finaux, réduisant à la fois la latence perçue et la charge sur l'origine,
      sans changer l'architecture applicative. Ajouter des instances n'améliore que la
      capacité régionale, pas la latence géographique mondiale. Migrer vers une seule autre
      région ne peut pas rapprocher le contenu de tous les utilisateurs à la fois. Réduire la
      taille des images peut aider marginalement mais ne résout pas le problème de distance
      géographique ni de charge d'origine.

  - prompt: |
      Une application de jeu en ligne utilise un protocole UDP personnalisé (non HTTP) et
      veut améliorer la latence et la disponibilité pour des joueurs répartis mondialement,
      en s'appuyant sur le réseau backbone d'AWS plutôt que sur Internet public. Quel
      service est adapté, plutôt que CloudFront ?
    options:
      - |
        Amazon CloudFront, qui met en cache tout type de trafic réseau.
      - |
        AWS Global Accelerator, qui route le trafic TCP/UDP via des points d'entrée anycast
        sur le réseau backbone AWS.
      - |
        Amazon Route 53 seul, sans autre service.
      - |
        AWS Direct Connect, en supposant que tous les joueurs disposent d'une connexion
        dédiée.
    answer: 1
    level: avance
    tags: [performance, global-accelerator]
    explanation: |
      Global Accelerator est conçu pour améliorer les performances de trafic TCP/UDP
      générique (pas seulement HTTP) en dirigeant les utilisateurs vers l'entrée AWS la plus
      proche via des IP anycast, puis en acheminant sur le réseau privé AWS. CloudFront est
      un CDN spécialisé dans la mise en cache de contenu HTTP/HTTPS, inadapté à un protocole
      UDP personnalisé. Route 53 seul ne fait qu'une résolution DNS, sans optimisation du
      chemin réseau une fois la connexion établie. Direct Connect suppose une infrastructure
      dédiée par joueur, irréaliste pour des millions de joueurs grand public.

  - prompt: |
      Des utilisateurs situés à l'autre bout du monde par rapport à la région du bucket S3 se
      plaignent de la lenteur de leurs envois (uploads) de fichiers volumineux. Quelle
      fonctionnalité S3 accélère ces transferts, avec un minimum de changement côté client ?
    options:
      - |
        S3 Cross-Region Replication.
      - |
        S3 Transfer Acceleration, qui achemine l'upload via l'edge location la plus proche
        puis le réseau backbone AWS jusqu'au bucket.
      - |
        S3 Intelligent-Tiering.
      - |
        Le multipart upload, sans autre changement.
    answer: 1
    level: intermediaire
    tags: [performance, s3]
    explanation: |
      Transfer Acceleration utilise le réseau des edge locations comme point d'entrée le
      plus proche du client, puis achemine les données sur le réseau optimisé AWS jusqu'au
      bucket, réduisant nettement le temps d'upload pour des clients distants. Cross-Region
      Replication réplique des objets déjà stockés vers une autre région, sans effet sur la
      vitesse d'un upload initial. Intelligent-Tiering gère le coût de stockage selon le
      pattern d'accès, sans effet sur la vitesse réseau d'upload. Le multipart upload
      découpe un fichier en parties envoyées en parallèle mais, seul, ne résout pas le
      problème de distance géographique du point d'entrée.

  - prompt: |
      Une base de données transactionnelle critique nécessite des performances d'IOPS très
      élevées et une latence sub-milliseconde constante, au-delà de ce que couvre le volume
      gp3 standard. Quel type de volume EBS choisir ?
    options:
      - |
        gp2, avec la taille maximale possible pour maximiser les IOPS de référence.
      - |
        io2 Block Express, conçu pour les charges les plus exigeantes en IOPS et en latence
        sub-milliseconde.
      - |
        st1 (HDD optimisé pour le débit).
      - |
        sc1 (HDD à faible coût).
    answer: 1
    level: intermediaire
    tags: [performance, ebs]
    explanation: |
      io2 Block Express cible spécifiquement les charges transactionnelles les plus
      critiques nécessitant des IOPS très élevés et une latence sub-milliseconde constante,
      avec un ratio IOPS/Go bien supérieur à gp3/gp2. gp2 plafonne à des performances bien
      inférieures et dépend de la taille du volume. st1 et sc1 sont des volumes HDD, orientés
      débit séquentiel (big data, logs) à faible coût, inadaptés à une charge transactionnelle
      aléatoire à IOPS élevé.

  - prompt: |
      Une charge de travail hautement parallélisée (des centaines de clients EC2/Lambda
      accédant simultanément) utilise Amazon EFS et privilégie un débit agrégé élevé plutôt
      qu'une latence minimale par opération individuelle. Quel mode de performance EFS
      choisir ?
    options:
      - |
        General Purpose (mode par défaut), optimisé pour la latence par opération.
      - |
        Max I/O, optimisé pour un débit et un parallélisme plus élevés, au prix d'une
        latence par opération légèrement supérieure.
      - |
        Provisioned Throughput seul, sans changer le mode de performance.
      - |
        One Zone, pour réduire le coût.
    answer: 1
    level: avance
    tags: [performance, efs]
    explanation: |
      Max I/O est conçu pour les charges massivement parallèles nécessitant un débit agrégé
      élevé, en acceptant une latence par opération légèrement supérieure à General Purpose.
      General Purpose privilégie la latence minimale par opération mais plafonne le
      parallélisme global. Provisioned Throughput règle le débit facturé indépendamment de la
      charge mais ne change pas la capacité de parallélisme du mode de performance lui-même.
      One Zone est une classe de stockage à disponibilité réduite, sans rapport avec le
      besoin de débit décrit.

  - prompt: |
      Une application de reporting exécute de lourdes requêtes analytiques en lecture sur la
      même base RDS que l'application transactionnelle principale, dégradant les performances
      de cette dernière. Quelle solution isole la charge de lecture analytique avec le moins
      de changement d'architecture ?
    options:
      - |
        Ajouter une ou plusieurs read replicas RDS, et rediriger les requêtes de reporting
        vers elles.
      - |
        Passer la base en Multi-AZ pour répartir la charge de lecture sur l'instance
        standby.
      - |
        Réduire la fréquence des sauvegardes automatiques.
      - |
        Migrer les requêtes de reporting vers un second compte AWS.
    answer: 0
    level: intermediaire
    tags: [performance, rds]
    explanation: |
      Les read replicas RDS sont conçues pour décharger les requêtes de lecture (reporting,
      analytique) de l'instance primaire transactionnelle, avec une réplication asynchrone.
      Passer en Multi-AZ est un piège : l'instance standby n'est pas accessible en lecture,
      elle ne sert qu'au failover. Réduire la fréquence des sauvegardes n'a aucun effet sur
      la charge de lecture générée par les requêtes analytiques. Migrer vers un second compte
      ajoute de la complexité de gouvernance sans résoudre le problème technique de
      répartition de charge.

  - prompt: |
      Un flux de données IoT ingère un volume de données croissant en temps réel via Amazon
      Kinesis Data Streams, et commence à subir des erreurs de limitation de débit
      (ProvisionedThroughputExceededException). Quelle action résout le problème ?
    options:
      - |
        Réduire la taille des enregistrements envoyés au flux.
      - |
        Augmenter le nombre de shards du flux (resharding), qui détermine la capacité totale
        d'ingestion et de lecture.
      - |
        Passer d'un stockage S3 à un stockage EFS pour les consommateurs.
      - |
        Ajouter un cache ElastiCache devant le flux Kinesis.
    answer: 1
    level: intermediaire
    tags: [performance, kinesis]
    explanation: |
      Dans Kinesis Data Streams, la capacité d'ingestion/lecture est directement
      proportionnelle au nombre de shards ; une erreur de dépassement de débit provisionné se
      résout en augmentant ce nombre (resharding). Réduire la taille des enregistrements peut
      aider marginalement mais ne change pas la capacité fondamentale du flux si le volume
      global reste élevé. Le stockage des consommateurs en aval n'a aucun effet sur la
      capacité d'ingestion du flux lui-même. Kinesis n'est pas une base de données interrogée
      en lecture répétée nécessitant ce type de cache applicatif.

  - prompt: |
      Une fonction Lambda exposée via API Gateway subit une latence perceptible sur les
      premières requêtes après une période d'inactivité (cold start), ce qui nuit à
      l'expérience utilisateur d'une application critique en latence. Quelle solution
      élimine ce délai ?
    options:
      - |
        Augmenter uniquement la mémoire allouée à la fonction Lambda.
      - |
        Activer la Provisioned Concurrency, qui maintient un nombre défini d'environnements
        d'exécution pré-initialisés et prêts à répondre immédiatement.
      - |
        Réduire le timeout de la fonction Lambda.
      - |
        Passer d'API Gateway REST à API Gateway HTTP.
    answer: 1
    level: intermediaire
    tags: [performance, lambda, api-gateway]
    explanation: |
      La Provisioned Concurrency maintient des environnements d'exécution Lambda déjà
      initialisés, éliminant le délai de cold start pour les invocations qui les utilisent.
      Augmenter la mémoire peut réduire légèrement la durée d'initialisation mais ne
      l'élimine pas. Réduire le timeout n'a aucun effet sur la latence de démarrage, il ne
      fait que limiter la durée maximale d'exécution. Changer de type d'API Gateway peut
      réduire une latence de couche API mais ne traite pas le cold start Lambda lui-même.

  - prompt: |
      Une application doit garantir que les commandes d'un même client sont traitées
      strictement dans l'ordre d'émission, avec déduplication automatique, quitte à accepter
      un débit maximal plus faible. Quel type de file SQS choisir ?
    options:
      - |
        File Standard, avec un débit quasi illimité mais un ordre et une livraison au mieux
        (best-effort).
      - |
        File FIFO (First-In-First-Out), qui garantit l'ordre strict et la déduplication,
        avec un débit plus limité que Standard.
      - |
        Amazon SNS en remplacement de SQS.
      - |
        Une file Standard avec un seul consommateur pour forcer l'ordre.
    answer: 1
    level: intermediaire
    tags: [performance, sqs]
    explanation: |
      Une file FIFO garantit l'ordre exact des messages par groupe et propose la
      déduplication automatique du contenu, au prix d'un débit plafonné plus bas que
      Standard. Une file Standard ne garantit ni l'ordre strict ni l'absence de doublons.
      SNS est un service de publication/abonnement, sans garantie d'ordre ni de
      déduplication de ce type. Une file Standard avec un seul consommateur limiterait le
      parallélisme sans garantir formellement ni l'ordre ni l'absence de doublons comme le
      fait nativement FIFO.

  - prompt: |
      Une entreprise possède 12 VPC qui doivent tous pouvoir communiquer entre eux, et prévoit
      d'en ajouter régulièrement de nouveaux. Quelle architecture réseau minimise la
      surcharge opérationnelle à mesure que le nombre de VPC augmente ?
    options:
      - |
        Un maillage complet (full mesh) de connexions VPC Peering entre chaque paire de VPC.
      - |
        AWS Transit Gateway, comme hub central auquel chaque VPC s'attache une seule fois.
      - |
        Un unique VPC contenant toutes les ressources, sans séparation.
      - |
        Des connexions VPN site-to-site entre chaque paire de VPC.
    answer: 1
    level: avance
    tags: [performance, vpc, transit-gateway, vpc-peering]
    explanation: |
      Transit Gateway agit comme un hub central : chaque VPC ne s'attache qu'une seule fois,
      quel que soit le nombre total de VPC, ce qui simplifie fortement la gestion à mesure
      que l'infrastructure grandit. Le peering en full mesh nécessite un nombre de connexions
      qui croît quadratiquement, devenant vite ingérable. Un unique VPC supprime la
      séparation logique des environnements, contraire aux bonnes pratiques d'isolation. Des
      VPN site-to-site entre chaque paire sont plus coûteux, plus complexes à opérer et moins
      performants qu'un Transit Gateway pour relier des VPC entre eux au sein d'AWS.

  - prompt: |
      Une équipe veut déclencher un traitement (par exemple mettre à jour un index de
      recherche) immédiatement après chaque modification d'une table DynamoDB, sans
      interroger la table en boucle. Quelle solution utiliser ?
    options:
      - |
        Un job planifié (cron) qui relit toute la table chaque minute pour détecter les
        changements.
      - |
        Activer DynamoDB Streams sur la table et y attacher une fonction Lambda en tant que
        déclencheur.
      - |
        Interroger la table via Athena toutes les quelques secondes.
      - |
        Répliquer la table vers S3 via une exportation manuelle quotidienne.
    answer: 1
    level: intermediaire
    tags: [performance, dynamodb-streams, lambda]
    explanation: |
      DynamoDB Streams capture en quasi temps réel chaque modification et peut déclencher
      directement une fonction Lambda, évitant tout polling et permettant une réaction
      immédiate. Un job cron qui relit toute la table est coûteux et introduit un délai de
      détection non négligeable. Interroger via Athena ajoute une dépendance à un service
      d'analyse mal adapté à la détection d'événements unitaires en quasi temps réel. Une
      exportation quotidienne introduit un délai d'un jour, incompatible avec un besoin de
      réaction immédiate.

  - prompt: |
      Une application est déployée dans trois régions AWS. L'entreprise veut que chaque
      utilisateur soit dirigé vers la région qui lui offre la latence réseau la plus faible,
      sans logique applicative côté client. Quelle politique de routage Route 53 utiliser ?
    options:
      - |
        Routage géolocalisé (geolocation), basé sur la position géographique déclarée de
        l'utilisateur.
      - |
        Routage à latence la plus faible (latency-based routing), basé sur les mesures de
        latence réseau réelles.
      - |
        Routage pondéré (weighted), avec des poids égaux entre les trois régions.
      - |
        Routage simple, pointant toujours vers la région historique.
    answer: 1
    level: intermediaire
    tags: [performance, route-53]
    explanation: |
      Le routage à latence la plus faible s'appuie sur des mesures réelles de latence réseau
      entre les régions AWS et l'origine de la requête DNS, pour diriger l'utilisateur vers
      la région la plus rapide pour lui. Le routage géolocalisé se base sur la localisation
      géographique déclarée, qui ne correspond pas toujours à la latence réseau réelle la
      plus faible. Le routage pondéré répartit le trafic selon des proportions fixes, sans
      tenir compte de la latence individuelle. Le routage simple ignore totalement la
      position de l'utilisateur et les autres régions disponibles.

  - prompt: |
      Une API exposée via Amazon API Gateway reçoit un grand nombre de requêtes identiques
      (mêmes paramètres) qui déclenchent à chaque fois un traitement Lambda coûteux, alors
      que la réponse ne change que rarement. Quelle fonctionnalité réduit la charge sur le
      backend avec le moins d'effort ?
    options:
      - |
        Augmenter la mémoire de la fonction Lambda sous-jacente.
      - |
        Activer le cache d'API Gateway pour les endpoints concernés, avec une durée de vie
        (TTL) adaptée à la fraîcheur requise.
      - |
        Dupliquer la fonction Lambda en plusieurs versions.
      - |
        Passer la fonction Lambda en Provisioned Concurrency.
    answer: 1
    level: intermediaire
    tags: [performance, api-gateway]
    explanation: |
      Le cache intégré d'API Gateway stocke les réponses par clé de requête pendant un TTL
      configurable, évitant de ré-invoquer le backend pour des requêtes identiques répétées.
      Augmenter la mémoire améliore l'exécution de chaque invocation mais n'évite pas les
      invocations redondantes. Dupliquer la fonction ne réduit pas le nombre d'invocations
      globales, seulement leur répartition entre versions. La Provisioned Concurrency
      élimine le cold start mais n'évite pas de ré-exécuter le traitement pour chaque requête
      identique.

  - prompt: |
      Un événement métier (commande créée) doit déclencher plusieurs traitements
      indépendants et parallèles (facturation, notification, mise à jour d'un entrepôt),
      chacun devant pouvoir traiter le message à son propre rythme sans bloquer les autres.
      Quel modèle d'architecture utiliser ?
    options:
      - |
        Un seul traitement séquentiel qui appelle successivement chaque service en
        synchrone.
      - |
        Le motif fan-out : publier l'événement sur un topic Amazon SNS abonné par plusieurs
        files Amazon SQS, une par traitement.
      - |
        Écrire l'événement dans une seule table DynamoDB que chaque service interroge en
        boucle.
      - |
        Appeler directement les trois fonctions Lambda en parallèle depuis le producteur,
        sans file d'attente intermédiaire.
    answer: 1
    level: avance
    tags: [performance, sns, sqs]
    explanation: |
      Le motif fan-out SNS vers plusieurs files SQS publie un message une seule fois vers un
      topic, chaque file abonnée recevant sa propre copie, ce qui découple les traitements et
      permet à chacun de consommer à son propre rythme, avec conservation des messages en cas
      d'indisponibilité temporaire d'un consommateur. Un traitement séquentiel synchrone crée
      des dépendances fragiles et lentes. Interroger une table en boucle impose un polling
      coûteux et sans garantie de livraison ordonnée entre consommateurs. Appeler directement
      les fonctions Lambda sans file d'attente supprime l'amortisseur que constitue la file :
      en cas de pic ou de panne d'un consommateur, les messages peuvent être perdus.

  # =============================== COÛT (12) ===============================
  - prompt: |
      Une entreprise doit conserver des archives réglementaires pendant 10 ans, consultées en
      moyenne une fois par an, avec un délai de récupération de plusieurs heures acceptable.
      Quelle configuration S3 minimise le coût de stockage ?
    options:
      - |
        Conserver les objets en S3 Standard pendant toute la durée.
      - |
        Une règle de cycle de vie (lifecycle) transitionnant les objets vers S3 Glacier Deep
        Archive après une courte période initiale.
      - |
        Copier les objets vers un volume EBS st1 dédié à l'archivage.
      - |
        Utiliser S3 Standard-IA pendant toute la durée.
    answer: 1
    level: intermediaire
    tags: [cout, s3, glacier]
    explanation: |
      Glacier Deep Archive est la classe de stockage S3 la moins chère, conçue pour des
      données rarement consultées et tolérant un délai de récupération de plusieurs heures —
      exactement le profil décrit sur 10 ans. S3 Standard est la classe la plus chère,
      disproportionnée pour un accès annuel. Un volume EBS n'est pas un usage adapté pour de
      l'archivage à long terme indépendant et resterait plus coûteux. Standard-IA coûte plus
      cher que Glacier Deep Archive pour un accès aussi rare, sans bénéfice utile ici.

  - prompt: |
      Une entreprise stocke des données dont le pattern d'accès est imprévisible (certains
      objets sont consultés souvent, d'autres jamais, sans logique connue à l'avance), et veut
      optimiser automatiquement les coûts de stockage sans définir de règles manuelles ni
      risquer de frais de récupération surprise. Quelle classe de stockage choisir ?
    options:
      - |
        S3 Standard-IA, avec des frais de récupération à chaque accès.
      - |
        S3 Intelligent-Tiering, qui déplace automatiquement les objets entre niveaux d'accès
        selon leur usage réel, sans frais de récupération.
      - |
        S3 One Zone-IA.
      - |
        Une règle de lifecycle manuelle basée uniquement sur l'âge des objets.
    answer: 1
    level: intermediaire
    tags: [cout, s3]
    explanation: |
      Intelligent-Tiering surveille automatiquement les patterns d'accès de chaque objet et
      le déplace vers le niveau de coût le plus adapté, sans frais de récupération ni
      intervention manuelle. Standard-IA facture des frais de récupération à chaque accès,
      pénalisant pour des objets consultés de façon imprévisible. One Zone-IA réduit la
      résilience (une seule AZ) sans répondre au vrai problème d'optimisation selon l'usage.
      Une règle basée sur l'âge ne tient pas compte de la fréquence d'accès réelle, inadaptée
      à un pattern imprévisible.

  - prompt: |
      Une entreprise exécute des traitements de calcul par lot tolérants à l'interruption (le
      job peut reprendre où il s'est arrêté), et veut réduire fortement le coût de calcul EC2
      associé. Quelle option choisir ?
    options:
      - |
        Des Reserved Instances sur 1 an.
      - |
        Des instances Spot, jusqu'à 90 % moins chères que le tarif On-Demand, avec un risque
        d'interruption sur préavis court.
      - |
        Des instances On-Demand classiques, pour garantir qu'aucune interruption ne
        survienne.
      - |
        Des instances dédiées (Dedicated Instances).
    answer: 1
    level: intermediaire
    tags: [cout, ec2, spot]
    explanation: |
      Les instances Spot exploitent la capacité EC2 inutilisée à un tarif très réduit,
      adaptées aux charges tolérantes à l'interruption comme un traitement par lot
      reprenable. Les Reserved Instances engagent sur la durée avec une remise plus faible
      que Spot et ne conviennent pas à une charge ponctuelle/variable. Les instances
      On-Demand coûtent le plein tarif sans remise, alors que la tolérance à l'interruption
      permet d'exploiter Spot. Les instances dédiées facturent un supplément pour du matériel
      physique dédié, sans rapport avec le besoin de réduction de coût.

  - prompt: |
      Une entreprise a une charge de calcul EC2 stable et prévisible sur les 3 prochaines
      années, avec une certaine flexibilité sur la famille et la taille d'instance utilisées.
      Quelle option d'achat réduit le coût le plus efficacement tout en gardant de la
      flexibilité ?
    options:
      - |
        Des instances On-Demand sans engagement.
      - |
        Un Compute Savings Plan sur 3 ans, qui s'applique automatiquement quels que soient
        la famille, la taille ou la région d'instance utilisées.
      - |
        Des instances Spot exclusivement.
      - |
        Des Reserved Instances standard, non convertibles, sur une famille et une taille
        d'instance figées.
    answer: 1
    level: avance
    tags: [cout, ec2, savings-plans]
    explanation: |
      Un Compute Savings Plan offre une remise substantielle en échange d'un engagement de
      dépense sur la durée, tout en s'appliquant automatiquement à n'importe quelle
      famille/taille d'instance, offrant la flexibilité recherchée. Les instances On-Demand
      ne bénéficient d'aucune remise pour un engagement à long terme. Les instances Spot ne
      sont pas adaptées à une charge stable et critique nécessitant une disponibilité
      garantie. Les Reserved Instances standard non convertibles figent le choix d'instance,
      perdant la flexibilité explicitement demandée.

  - prompt: |
      Une entreprise soupçonne que plusieurs de ses instances EC2 sont surdimensionnées par
      rapport à leur utilisation réelle, entraînant un surcoût. Quel service AWS recommande
      automatiquement une taille d'instance plus adaptée, basée sur les métriques
      d'utilisation historiques ?
    options:
      - |
        AWS Trusted Advisor uniquement, sans autre outil.
      - |
        AWS Compute Optimizer, qui analyse les métriques CloudWatch historiques et
        recommande des types/tailles d'instance mieux adaptés.
      - |
        Amazon Inspector.
      - |
        AWS Config.
    answer: 1
    level: intermediaire
    tags: [cout, ec2, compute-optimizer]
    explanation: |
      Compute Optimizer analyse en continu les métriques d'utilisation (CPU, mémoire si
      l'agent CloudWatch est installé, réseau) et formule des recommandations chiffrées de
      redimensionnement pour EC2, Auto Scaling, EBS et Lambda. Trusted Advisor donne des
      alertes générales de sous-utilisation mais avec moins de granularité sur ce point
      précis. Inspector évalue des vulnérabilités logicielles/réseau, sans lien avec le
      dimensionnement de capacité. Config vérifie la conformité de configuration des
      ressources, pas leur adéquation de taille à l'usage réel.

  - prompt: |
      Une entreprise doit transférer 200 To de données archivées vers S3 en une seule fois,
      avec une bande passante Internet limitée qui rendrait le transfert réseau trop long
      (plusieurs semaines). Quelle solution est la plus rapide et la plus économique ?
    options:
      - |
        AWS DataSync, en synchronisation continue via la connexion Internet existante.
      - |
        AWS Snowball Edge : un ou plusieurs appareils physiques, remplis sur site puis
        expédiés à AWS pour import dans S3.
      - |
        Augmenter la bande passante Internet du site pendant un mois pour accélérer le
        transfert.
      - |
        Utiliser S3 Transfer Acceleration pour ce transfert unique.
    answer: 1
    level: intermediaire
    tags: [cout, snow-family]
    explanation: |
      Snowball Edge est conçu pour des transferts massifs ponctuels : les appareils sont
      remplis localement puis expédiés physiquement à AWS, bien plus rapide qu'un transfert
      réseau limité par la bande passante disponible. DataSync est excellent pour des
      synchronisations continues ou récurrentes via le réseau, mais reste contraint par la
      même bande passante limitée pour un volume aussi massif. Augmenter la bande passante
      engage un coût récurrent significatif pour un besoin ponctuel, sans garantie de
      rentrer dans un délai raisonnable. Transfer Acceleration accélère un transfert réseau
      mais ne résout pas la contrainte fondamentale de bande passante limitée pour 200 To.

  - prompt: |
      Un environnement de développement/test utilise une base de données relationnelle de
      façon intermittente (quelques heures par jour, avec des pics imprévisibles), et
      l'entreprise ne veut pas payer pour une capacité inutilisée le reste du temps. Quelle
      option Aurora minimise le coût ?
    options:
      - |
        Une instance Aurora provisionnée en permanence à la taille maximale prévue pour les
        pics.
      - |
        Aurora Serverless v2, qui ajuste automatiquement la capacité à la demande et facture
        selon l'usage réel.
      - |
        Un cluster Aurora Multi-AZ classique, dimensionné pour le pic, actif 24h/24.
      - |
        Une instance RDS Reserved Instance sur 3 ans.
    answer: 1
    level: intermediaire
    tags: [cout, aurora]
    explanation: |
      Aurora Serverless v2 ajuste automatiquement et finement sa capacité de calcul à la
      demande réelle, facturant selon l'usage effectif — idéal pour une charge intermittente
      et imprévisible. Une instance provisionnée en permanence à la taille maximale ou un
      cluster Multi-AZ actif 24h/24 maintiennent une capacité maximale payée même quand elle
      n'est pas utilisée. Une Reserved Instance sur 3 ans engage une capacité fixe sur la
      durée, inadaptée à un usage intermittent d'un environnement non critique.

  - prompt: |
      Une nouvelle application DynamoDB a un trafic très imprévisible, avec des pics
      ponctuels difficiles à anticiper, et l'équipe veut éviter à la fois le
      sur-provisionnement coûteux et le risque de throttling. Quel mode de capacité choisir
      au démarrage ?
    options:
      - |
        Capacité provisionnée fixe, dimensionnée sur le pic historique le plus élevé
        observé.
      - |
        Capacité à la demande (on-demand), qui s'adapte automatiquement au trafic réel sans
        capacité à définir à l'avance.
      - |
        Capacité provisionnée avec Auto Scaling configuré sur une cible de 90 %
        d'utilisation.
      - |
        Capacité provisionnée minimale, sans Auto Scaling, pour réduire le coût de base.
    answer: 1
    level: avance
    tags: [cout, dynamodb]
    explanation: |
      Le mode on-demand facture à la requête, sans capacité à provisionner ni à deviner, et
      absorbe nativement les pics imprévisibles. Une capacité fixe risque un sur-coût si le
      pic n'est pas systématique, ou un sous-dimensionnement s'il le dépasse. Une capacité
      provisionnée avec Auto Scaling reste plus adaptée à un trafic dont la variation est
      relativement progressive et connue ; elle peut ne pas réagir assez vite à un pic très
      soudain. Une capacité minimale sans Auto Scaling expose directement à du throttling dès
      que le trafic dépasse cette capacité.

  - prompt: |
      Des instances EC2 dans des sous-réseaux privés accèdent fréquemment à S3 via un NAT
      Gateway, ce qui génère des frais de traitement de données NAT non négligeables. Quelle
      solution réduit ce coût sans dégrader la sécurité ?
    options:
      - |
        Remplacer le NAT Gateway par une instance NAT auto-gérée, moins chère à l'usage.
      - |
        Ajouter un VPC Gateway Endpoint pour S3 : le trafic vers S3 passe par cette route
        privée gratuite, sans traverser le NAT Gateway.
      - |
        Rendre le bucket S3 public pour éviter de passer par le VPC.
      - |
        Supprimer purement et simplement le NAT Gateway, sans alternative.
    answer: 1
    level: avance
    tags: [cout, vpc-endpoints, s3]
    explanation: |
      Un Gateway Endpoint pour S3, gratuit à l'usage et sans frais de traitement de données,
      permet au trafic vers S3 d'emprunter une route privée dédiée plutôt que le NAT Gateway.
      Une instance NAT auto-gérée réduit le coût d'instance mais introduit une gestion
      opérationnelle manuelle et ne supprime pas le concept de frais pour le trafic transitant
      par NAT. Rendre le bucket public expose les données, contraire à la sécurité et
      disproportionné pour économiser des frais réseau. Supprimer le NAT Gateway casserait
      tout autre accès sortant nécessaire, sans solution de repli.

  - prompt: |
      Une équipe doit exécuter des requêtes SQL ad hoc et occasionnelles directement sur des
      fichiers stockés dans S3 (format Parquet), sans processus régulier ni volumétrie
      justifiant une infrastructure permanente. Quelle solution est la plus économique ?
    options:
      - |
        Provisionner un cluster Amazon Redshift permanent et y charger les données via des
        jobs COPY réguliers.
      - |
        Amazon Athena, qui exécute des requêtes SQL serverless directement sur S3, facturées
        à la quantité de données scannée par requête.
      - |
        Construire un job AWS Glue ETL complet pour transformer et charger les données dans
        un entrepôt avant chaque requête.
      - |
        Exporter systématiquement les données vers une base RDS avant chaque analyse
        ponctuelle.
    answer: 1
    level: intermediaire
    tags: [cout, athena, redshift, glue]
    explanation: |
      Athena est un service serverless facturé par requête (au volume de données scanné),
      sans aucune infrastructure à provisionner ni à maintenir — idéal pour des requêtes
      occasionnelles et imprévisibles. Un cluster Redshift permanent engage un coût fixe
      24h/24, disproportionné pour un usage occasionnel. Un job Glue ETL complet ajoute un
      coût et une complexité récurrents non justifiés pour de simples requêtes ponctuelles.
      Exporter vers RDS avant chaque analyse impose un cycle d'export/chargement coûteux et
      lent, alors qu'Athena interroge directement les fichiers en place.

  - prompt: |
      Une entreprise avec un plan de support Business veut identifier rapidement, sans
      développement ni configuration complexe, des ressources sous-utilisées (instances EC2
      en faible charge, adresses IP élastiques non associées, etc.) pour réduire ses coûts.
      Quel outil consulter en premier ?
    options:
      - |
        AWS Trusted Advisor, dont les vérifications d'optimisation des coûts signalent ce
        type de ressources sous-utilisées ou inutilisées.
      - |
        Amazon Macie.
      - |
        AWS X-Ray.
      - |
        Amazon CloudWatch Synthetics.
    answer: 0
    level: intermediaire
    tags: [cout, trusted-advisor]
    explanation: |
      Trusted Advisor propose, dès le plan Business, des vérifications automatiques dans la
      catégorie optimisation des coûts (instances sous-utilisées, adresses IP élastiques
      inutilisées, volumes non attachés, etc.), sans configuration ni développement à
      prévoir. Macie détecte des données sensibles dans S3, sans rapport avec l'optimisation
      des coûts. X-Ray trace les performances applicatives distribuées, pas les coûts
      d'infrastructure. CloudWatch Synthetics simule des parcours utilisateur pour
      surveiller la disponibilité, sans lien avec l'identification de ressources
      sous-utilisées.

  - prompt: |
      Une entreprise fait tourner une flotte d'instances EC2 avec une charge stable, connue à
      l'avance, sur une durée de 3 ans, sans besoin de flexibilité sur la famille ou la
      taille d'instance. Quelle option d'achat maximise la remise par rapport au tarif
      On-Demand ?
    options:
      - |
        Des instances Spot, pour maximiser la remise immédiate.
      - |
        Un Compute Savings Plan à engagement le plus court possible.
      - |
        Une Reserved Instance Standard sur 3 ans, paiement tout upfront, pour la
        famille/taille d'instance connue à l'avance.
      - |
        Rester en On-Demand pour garder toute flexibilité contractuelle.
    answer: 2
    level: avance
    tags: [cout, ec2, reserved-instances]
    explanation: |
      Une Reserved Instance Standard sur 3 ans avec paiement upfront offre historiquement la
      remise la plus élevée par rapport au tarif On-Demand, adaptée à une charge stable et
      connue à l'avance sans besoin de flexibilité de type d'instance. Les instances Spot
      n'offrent aucune garantie de disponibilité continue, risqué pour une charge stable
      devant tourner en permanence. Un Savings Plan à engagement court offre de la
      flexibilité, non nécessaire ici, au prix d'une remise généralement inférieure à une RI
      Standard 3 ans tout upfront pour un besoin figé. Rester en On-Demand ne bénéficie
      d'aucune remise d'engagement, le choix le plus coûteux sur 3 ans pour une charge
      prévisible.
---
Test blanc de la certification **AWS Certified Solutions Architect – Associate (SAA-C03)** :
65 questions couvrant les 4 domaines de l'examen (Sécurité, Résilience, Performance, Coût).
Lis d'abord la leçon **« Consignes »** de ce module, puis passe ce test en une seule fois,
chronométré à 130 minutes. Vise **au moins 47 / 65**.
