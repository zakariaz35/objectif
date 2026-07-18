---
title: "Quiz — ELB & ASG"
type: quiz
questions:
  - prompt: |
      Une équipe fait passer une base de données de `db.t3.medium` à `db.t3.2xlarge`
      pour absorber une charge croissante. Elle affirme avoir ainsi mis en place de la
      « haute disponibilité ». Cette affirmation est-elle correcte ?
    options:
      - "Oui, une instance plus grande est par définition plus disponible."
      - "Non, c'est de la scalabilité verticale : ça augmente la capacité d'une seule instance, mais ne protège pas contre la perte de cette instance ou de son AZ."
      - "Oui, tant que l'instance reste dans la même AZ."
      - "Non, car la scalabilité verticale est toujours interdite en production."
    answer: 1
    tags: [ec2, resilience]
    level: intermediaire
    explanation: >
      Augmenter la taille d'une instance (vertical) est une réponse à un besoin de
      capacité, pas de résilience : l'instance reste un point de défaillance unique.
      La haute disponibilité nécessite une répartition horizontale sur plusieurs AZ,
      indépendamment de la taille des instances utilisées.
  - prompt: |
      Une application web doit router `/api/*` vers un groupe de microservices et
      `/static/*` vers un autre groupe d'instances, sur un même nom de domaine HTTPS.
      Quel Load Balancer choisir ?
    options:
      - "Network Load Balancer (NLB)"
      - "Application Load Balancer (ALB)"
      - "Gateway Load Balancer (GWLB)"
      - "Classic Load Balancer (CLB)"
    answer: 1
    tags: [elb]
    level: intermediaire
    explanation: >
      Le routage selon le chemin de l'URL est une fonctionnalité de couche 7,
      exclusivement disponible sur l'ALB via ses target groups. Le NLB (couche 4) ne
      voit pas le contenu HTTP, le GWLB sert à insérer des appliances réseau tierces, et
      le CLB (génération précédente, obsolète) ne propose pas ce routage avancé.
  - prompt: |
      Une entreprise doit insérer, de façon transparente pour tout le trafic entrant, un
      firewall applicatif tiers capable de scaler automatiquement avec la charge. Quel
      Load Balancer est conçu pour ce cas d'usage ?
    options:
      - "Application Load Balancer (ALB)"
      - "Network Load Balancer (NLB)"
      - "Gateway Load Balancer (GWLB)"
      - "Classic Load Balancer (CLB)"
    answer: 2
    tags: [elb, securite]
    level: avance
    explanation: >
      Le Gateway Load Balancer opère en couche 3 (réseau) et est spécifiquement conçu
      pour déployer, scaler et gérer des appliances réseau tierces (firewalls, IDS/IPS)
      de façon transparente pour le trafic. ALB et NLB ne sont pas prévus pour ce rôle
      d'insertion d'appliance ; le CLB est une génération obsolète sans ce cas d'usage.
  - prompt: |
      Après avoir activé des sticky sessions sur un ALB pour corriger un problème de
      session utilisateur, l'équipe observe que certaines instances reçoivent
      nettement plus de trafic que d'autres. Quelle est la cause, et la meilleure
      solution de long terme ?
    options:
      - "C'est un bug de l'ALB, il faut le redémarrer."
      - "Les sticky sessions fixent chaque client sur une instance donnée, créant un déséquilibre ; la solution durable est d'externaliser l'état de session hors de l'instance."
      - "Il faut désactiver le cross-zone load balancing pour corriger ce déséquilibre."
      - "Il faut passer au Classic Load Balancer, qui ne connaît pas ce problème."
    answer: 1
    tags: [elb]
    level: avance
    explanation: >
      C'est un comportement attendu des sticky sessions : les clients restent attachés à
      la même instance, ce qui peut déséquilibrer la charge s'ils ne sont pas répartis
      uniformément. La solution architecturale de fond est de sortir l'état de session
      de l'instance, plutôt que de compter durablement sur la stickiness. Le cross-zone
      LB et le CLB ne traitent pas ce problème précis.
  - prompt: |
      Une opération commerciale majeure est planifiée un vendredi à 17h précises, avec un
      pic de trafic massif et connu à l'avance. Quelle politique d'Auto Scaling Group
      est la plus fiable pour être prêt à temps ?
    options:
      - "Target tracking sur le CPU moyen, qui réagira automatiquement au pic."
      - "Step scaling déclenché uniquement par une alarme CloudWatch sur la charge."
      - "Scheduled scaling, augmentant la capacité minimale avant l'heure connue du pic."
      - "Predictive scaling, sans configuration additionnelle nécessaire."
    answer: 2
    tags: [asg]
    level: intermediaire
    explanation: >
      Quand un pic est connu à l'avance avec une date/heure précise, le scheduled
      scaling est la réponse la plus fiable : la capacité minimale est augmentée avant
      même que la charge ne monte, évitant le délai de réaction d'une politique basée
      sur une alarme (target tracking, step scaling), qui ne réagit qu'une fois le pic
      déjà amorcé.
  - prompt: |
      Un Auto Scaling Group vient de scaler out suite à une alarme CPU. Quelques
      secondes plus tard, une nouvelle alarme se déclenche mais l'ASG ne lance aucune
      action supplémentaire. Pourquoi ?
    options:
      - "L'ASG a atteint sa capacité maximale."
      - "L'ASG est en période de cooldown, le temps que les métriques se stabilisent avec la nouvelle capacité."
      - "Le Launch Template est mal configuré."
      - "Les nouvelles instances n'ont pas de Security Group valide."
    answer: 1
    tags: [asg]
    level: intermediaire
    explanation: >
      Le cooldown (par défaut de l'ordre de 300 secondes) empêche l'ASG de déclencher de
      nouvelles actions de scaling juste après la précédente, le temps que les métriques
      redeviennent représentatives de la nouvelle capacité — cela évite un effet
      « yo-yo » de scale out/in en boucle rapprochée.
---

Vérifie tes réflexes sur ELB (les 4 types), sticky sessions, cross-zone LB et ASG.
