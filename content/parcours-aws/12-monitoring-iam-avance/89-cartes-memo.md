---
title: "Cartes mémo — Monitoring, audit & IAM avancé"
type: flashcards
cards:
  - q: |
      Pourquoi la RAM utilisée et l'espace disque restant d'une instance EC2
      n'apparaissent-ils jamais dans CloudWatch **par défaut** ?
    a: |
      Parce qu'AWS ne voit pas **à l'intérieur** de l'OS invité — seules les métriques
      **hyperviseur** (CPU, réseau, I/O disque) sont envoyées par défaut. Il faut
      installer et configurer le **CloudWatch Agent unifié** sur l'instance pour obtenir
      RAM/disque et des logs applicatifs.
  - q: |
      Un scénario demande : « qui a modifié ce security group hier, et comment être
      alerté automatiquement s'il redevient non conforme demain ? ». Quels services
      combiner ?
    a: |
      **CloudTrail** (qui a fait le changement — audit des appels API) **+ AWS Config**
      (une rule qui détecte la non-conformité en continu, avec remediation possible).
      CloudWatch ne répond à aucune des deux questions ici (il mesure des métriques/perf,
      pas des changements de configuration ni des auteurs d'API).
  - q: |
      Une SCP attachée à une OU contient un `Allow` explicite sur `ec2:*`. Un user IAM
      de ce compte n'a **aucune policy IAM** lui donnant de permission EC2. Peut-il
      lancer des instances ?
    a: |
      **Non.** Une SCP ne donne jamais de permission à elle seule : elle ne fait que
      **plafonner** ce que l'IAM du compte peut accorder. Sans policy IAM identity-based
      accordant l'action, l'accès reste refusé (intersection SCP ∩ IAM policy = vide ici).
  - q: |
      Quelle est la différence entre une **permission boundary** et une **SCP** ?
    a: |
      La permission boundary plafonne les permissions d'**un user ou role précis**
      (déléguer sans perdre le contrôle, ex. un lead qui crée des roles pour son équipe).
      La SCP plafonne les permissions de **tout un compte ou toute une OU**. Les deux
      fonctionnent par intersection, mais à des granularités différentes.
  - q: |
      Pourquoi un scénario qui exige une continuité de service même en cas de coupure
      du lien réseau vers l'on-premises doit-il écarter **AD Connector** au profit
      d'**AWS Managed Microsoft AD** ?
    a: |
      AD Connector ne stocke **rien** côté AWS : c'est un simple proxy qui redirige
      chaque authentification vers l'Active Directory on-premises — si le lien tombe,
      l'authentification tombe. Managed AD est une réplique **complète et autonome**
      dans le cloud, qui continue de fonctionner même sans lien vers l'on-premises.
  - q: |
      EventBridge et CloudWatch Alarms réagissent-ils au même type de déclencheur ?
    a: |
      Non. **EventBridge** réagit à des **événements** discrets (quelque chose qui se
      produit, ex. changement d'état d'une instance). **CloudWatch Alarms** réagit au
      **franchissement d'un seuil** sur une métrique continue (ex. CPU > 80 %).
---

Lis, réfléchis, révèle, auto-évalue.
