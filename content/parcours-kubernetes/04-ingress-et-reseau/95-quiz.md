---
title: "Quiz — Ingress et réseau"
type: quiz
questions:
  - prompt: |
      Une équipe qui connaît bien Traefik en Docker (labels, entrypoints, routers)
      découvre l'Ingress Kubernetes. Quelle affirmation décrit le mieux la relation entre
      les deux ?
    options:
      - "L'Ingress Kubernetes remplace entièrement le modèle EntryPoint/Router/Middleware/Service de Traefik, qui ne s'applique plus."
      - "Traefik peut être l'ingress controller qui lit les objets Ingress ; le modèle EntryPoint/Router/Middleware/Service reste le même, seule la source de configuration change (labels Docker -> objets Kubernetes)."
      - "L'Ingress ne fonctionne qu'avec nginx-ingress ; Traefik ne peut jamais jouer ce rôle sur Kubernetes."
      - "Un Ingress remplace uniquement les EntryPoints ; les Routers et Middlewares Traefik ne sont plus utilisables du tout sur Kubernetes."
    answer: 1
    tags: [ingress, traefik]
    level: debutant
    explanation: >
      Traefik peut parfaitement jouer le rôle d'ingress controller (option 2 fausse),
      auquel cas son modèle interne reste identique (option 0 fausse) ; les Middlewares
      Traefik restent disponibles via une CRD dédiée (option 3 fausse). Seule la source
      de configuration change réellement.
  - prompt: |
      Un objet `Ingress` valide est créé dans un cluster qui n'a **aucun** ingress
      controller installé. Que se passe-t-il ?
    options:
      - "Kubernetes refuse la création avec une erreur explicite de validation."
      - "L'objet est créé sans erreur, mais reste sans effet : aucune route HTTP n'est réellement mise en place."
      - "kube-apiserver joue automatiquement le rôle d'ingress controller minimal par défaut."
      - "Le trafic est automatiquement redirigé vers le premier Service ClusterIP du namespace."
    answer: 1
    tags: [ingress, ingress-controller]
    level: debutant
    explanation: >
      Un `Ingress` est une simple déclaration d'intention (comme tout objet Kubernetes) ;
      sans contrôleur qui la lit et l'applique, elle reste stockée sans effet (option 1).
      kube-apiserver ne fait jamais office d'ingress controller (option 2 fausse), et
      aucun routage automatique par défaut n'existe (option 3 fausse).
  - prompt: |
      Un cluster fait tourner deux ingress controllers (Traefik et nginx-ingress). Un
      Ingress est créé sans champ `ingressClassName` ni classe par défaut configurée.
      Que se passe-t-il ?
    options:
      - "Les deux ingress controllers traitent l'Ingress en parallèle, dupliquant la route."
      - "Aucun des deux contrôleurs ne prend en charge cet Ingress : aucune route n'est créée."
      - "Le premier contrôleur démarré dans le cluster récupère automatiquement l'Ingress orphelin."
      - "Kubernetes choisit celui déclaré alphabétiquement en premier parmi les IngressClass existantes."
    answer: 1
    tags: [ingress-class]
    level: intermediaire
    explanation: >
      Sans `ingressClassName` explicite ni IngressClass marquée par défaut, aucun
      contrôleur ne se reconnaît responsable de l'Ingress (option 1) — il n'y a ni
      duplication (option 0), ni prise en charge arbitraire par ordre de démarrage
      (option 2) ou alphabétique (option 3).
  - prompt: |
      Sans aucune NetworkPolicy créée dans un cluster, un Pod du namespace `team-a`
      peut-il joindre un Pod du namespace `team-b` ?
    options:
      - "Non, jamais : les namespaces isolent le réseau nativement, sans configuration supplémentaire."
      - "Oui : par défaut, le réseau Kubernetes est plat, tout Pod peut joindre tout autre Pod du cluster quel que soit son namespace."
      - "Seulement si les deux namespaces partagent explicitement le même label kubernetes.io/metadata.name."
      - "Seulement en passant obligatoirement par un Ingress, jamais en accès direct Pod à Pod."
    answer: 1
    tags: [network-policy, namespace]
    level: intermediaire
    explanation: >
      Un namespace isole logiquement (nommage, RBAC, quotas), pas le réseau par défaut
      (option 0 fausse). Deux namespaces ont chacun leur propre label unique
      `kubernetes.io/metadata.name` — ils ne peuvent pas le "partager" (option 2 fausse).
      L'accès Pod à Pod direct reste possible sans passer par un Ingress (option 3
      fausse) tant qu'aucune NetworkPolicy ne le restreint.
  - prompt: |
      Une équipe pose une NetworkPolicy `deny-all-ingress` (podSelector vide, aucune
      règle `from`) dans le namespace de son application, en pensant "sécuriser l'accès
      interne uniquement". Quel effet de bord risque de casser la production ?
    options:
      - "Aucun : deny-all-ingress ne bloque que le trafic entre Pods du même namespace, jamais l'ingress controller externe."
      - "Le trafic public légitime passant par l'ingress controller (dans un autre namespace, ex. kube-system) est bloqué en même temps, sans autorisation explicite pour le laisser passer."
      - "La NetworkPolicy s'applique uniquement en environnement de test, jamais en cluster de production, par sécurité intégrée à Kubernetes."
      - "Le trafic sortant (egress) des Pods vers Internet est coupé, mais tout le trafic entrant reste inchangé."
    answer: 1
    tags: [network-policy, ingress-controller]
    level: avance
    explanation: >
      `podSelector: {}` s'applique à **tous** les Pods du namespace, pour **tout**
      trafic entrant, y compris celui qui vient de l'ingress controller (souvent dans
      un autre namespace) — sans règle `from` explicite pour l'autoriser, il est bloqué
      comme n'importe quel autre client (option 1). Rien ne distingue "interne" et
      "externe" automatiquement (option 0 fausse), aucune limite à un environnement de
      test n'existe (option 2 fausse), et `policyTypes: Ingress` ne touche jamais
      l'egress (option 3 fausse, et de toute façon hors sujet ici puisqu'aucune règle
      egress n'a été déclarée).
---

Vérifie ta compréhension de l'Ingress, du DNS interne et des NetworkPolicy.
