---
title: "Cartes mémo — ELB & ASG"
type: flashcards
cards:
  - q: |
      Une application tourne sur 10 instances EC2, toutes dans la même Availability
      Zone, derrière un Load Balancer. Est-ce de la haute disponibilité ?
    a: |
      **Non.** Scaler horizontalement (multiplier les instances) n'est pas la même chose
      que la haute disponibilité, qui exige une répartition sur **au moins 2 AZ**. Si
      cette AZ unique tombe, les 10 instances tombent ensemble.
  - q: |
      Un scénario demande de router le trafic HTTP selon le chemin de l'URL
      (`/api` vers un service, `/app` vers un autre) sur un même nom de domaine. Quel
      Load Balancer choisir ?
    a: |
      **ALB** (Application Load Balancer, couche 7) : c'est le seul à comprendre le
      contenu HTTP et à router vers des target groups différents selon le chemin, le
      host, ou les en-têtes.
  - q: |
      Un scénario demande la latence la plus faible possible sur du trafic TCP brut,
      avec une IP statique par AZ pour du whitelisting côté client. Quel Load
      Balancer choisir ?
    a: |
      **NLB** (Network Load Balancer, couche 4) : latence minimale, gère TCP/UDP/TLS
      sans comprendre le contenu applicatif, et fournit une IP statique par AZ.
  - q: |
      Pourquoi les sticky sessions peuvent-elles créer un problème même si elles
      « fonctionnent » techniquement ?
    a: |
      Elles forcent un client donné à toujours revenir sur la même instance : certaines
      instances reçoivent alors plus de trafic que d'autres, créant un
      **déséquilibre de charge**. La meilleure pratique reste d'externaliser l'état de
      session plutôt que de dépendre durablement de la stickiness.
  - q: |
      Une opération commerciale est planifiée pour le vendredi 17h, avec un pic de
      trafic **connu à l'avance**. Quelle politique de scaling ASG est la plus adaptée,
      plutôt que d'attendre une alarme CloudWatch ?
    a: |
      Le **scheduled scaling** : puisque le pic est connu et daté à l'avance, il est
      plus fiable d'augmenter la capacité minimale à une heure précise que d'attendre
      qu'une alarme CPU se déclenche une fois le pic déjà en cours.
  - q: |
      Pourquoi l'Auto Scaling Group observe-t-il une période de **cooldown** après
      chaque action de scaling ?
    a: |
      Pour laisser le temps aux métriques (CPU, requêtes…) de se stabiliser avec la
      nouvelle capacité, et éviter un effet « yo-yo » où l'ASG scale out puis scale in
      en boucle rapprochée sur des métriques pas encore représentatives.
---

Lis, réfléchis, révèle, auto-évalue.
