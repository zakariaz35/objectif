---
title: "Quiz — Modèle mental Kubernetes"
type: quiz
questions:
  - prompt: |
      Une équipe fait tourner sa stack avec `docker compose` sur un seul serveur, et
      envisage Kubernetes pour "plus de fiabilité". Quelle affirmation décrit le mieux ce
      que Kubernetes ajoute réellement ?
    options:
      - "Kubernetes rend chaque conteneur individuellement plus rapide à démarrer."
      - "Kubernetes déplace la décision de placement et de maintien de l'état désiré du niveau d'une seule machine au niveau d'un cluster de nodes, avec reconciliation continue."
      - "Kubernetes remplace containerd par un runtime de conteneurs propriétaire, plus performant."
      - "Kubernetes est surtout une interface graphique au-dessus de Docker Compose."
    answer: 1
    tags: [architecture, control-plane]
    level: debutant
    explanation: >
      Kubernetes ne change rien à la vitesse d'un conteneur individuel (option 0 fausse)
      et utilise le même standard OCI/containerd que Docker (option 2 fausse) ; ce n'est
      pas non plus une UI (option 3 fausse). Le vrai changement est architectural :
      raisonner sur un cluster de machines avec un contrôle actif et permanent de l'état
      désiré, ce qu'une seule machine `docker compose` ne peut pas offrir.
  - prompt: |
      Sur un cluster Kubernetes, où est stocké l'état désiré (`spec`) de tes objets
      (Deployments, Services…), et quel composant y accède directement ?
    options:
      - "Dans un fichier YAML sur chaque node, lu par kubelet au démarrage."
      - "Dans etcd, accessible uniquement via kube-apiserver — jamais en direct par les autres composants."
      - "Dans la mémoire du conteneur kubectl lui-même, tant que le terminal reste ouvert."
      - "Dans le registre d'images Docker, à côté des images elles-mêmes."
    answer: 1
    tags: ["etcd", "api-server"]
    level: debutant
    explanation: >
      etcd est la base de données du cluster ; kube-apiserver est le seul point d'accès
      à etcd (aucun contrôleur, aucun kubelet, aucun kubectl n'y accède en direct). Les
      autres options n'ont aucun sens dans l'architecture Kubernetes.
  - prompt: |
      Un Deployment déclare `replicas: 3`. Un Pod qu'il gère est supprimé manuellement
      (`kubectl delete pod`). Que se passe-t-il, et pourquoi ?
    options:
      - "Rien : il ne reste plus que 2 Pods jusqu'à la prochaine intervention manuelle."
      - "Un nouveau Pod est recréé en quelques secondes, car la boucle de reconciliation du contrôleur Deployment détecte l'écart entre spec.replicas (3) et l'état observé (2)."
      - "Le cluster refuse la suppression, car un Deployment protège toujours ses Pods contre kubectl delete."
      - "Le Pod redémarre à l'identique (même nom, même IP), comme un simple redémarrage de conteneur Docker."
    answer: 1
    tags: [reconciliation, deployment]
    level: debutant
    explanation: >
      C'est la reconciliation en action : la suppression crée un écart, la boucle de
      contrôle le corrige en créant un **nouveau** Pod (nouveau nom, nouvelle IP — option
      3 fausse). Rien n'empêche `kubectl delete` d'agir (option 2 fausse), et le
      contrôleur ne laisse jamais l'écart en place durablement (option 0 fausse).
  - prompt: |
      Après `kubectl apply -f deployment.yaml`, un développeur s'attend à ce que
      `kubectl` ait directement créé les conteneurs, comme le ferait `docker compose up`.
      Que se passe-t-il réellement ?
    options:
      - "kubectl exécute directement docker run sur le node le plus disponible."
      - "kubectl envoie le spec désiré à kube-apiserver (stocké dans etcd) ; ce sont ensuite les contrôleurs qui créent réellement les Pods, en continu, pour combler l'écart avec l'état observé."
      - "kubectl attend la fin de la création de tous les Pods avant de rendre la main, de façon synchrone et bloquante par défaut."
      - "kubectl ne fait qu'une validation de syntaxe YAML ; rien n'est appliqué tant qu'on ne lance pas kubectl rollout apply."
    answer: 1
    tags: [reconciliation, kubectl]
    level: intermediaire
    explanation: >
      `kubectl` ne parle jamais directement à un moteur de conteneurs (option 0 fausse) ;
      `kubectl apply` retourne dès que l'écriture dans etcd est confirmée, sans attendre
      que les Pods soient réellement Running (option 2 fausse, d'où l'utilité de `kubectl
      rollout status` pour attendre explicitement) ; il n'existe pas de commande `kubectl
      rollout apply` (option 3 fausse). Le vrai mécanisme est déclaratif et asynchrone.
  - prompt: |
      Deux équipes déploient chacune un Service nommé `api` dans deux namespaces
      différents (`team-a` et `team-b`) du même cluster. Que peut-on affirmer sur
      l'isolation réseau entre ces deux Pods par défaut, sans NetworkPolicy ?
    options:
      - "Les Pods des deux namespaces ne peuvent pas du tout se joindre : c'est le comportement par défaut de Kubernetes."
      - "Les Pods peuvent se joindre entre eux malgré des namespaces différents : par défaut, le réseau n'est pas cloisonné par namespace, seule une NetworkPolicy explicite l'imposerait."
      - "Cela dépend uniquement du nom du Service : deux Services de même nom entrent automatiquement en conflit réseau."
      - "Les namespaces créent des VLAN distincts au niveau du CNI, isolant le trafic nativement."
    answer: 1
    tags: [namespace, networking]
    level: intermediaire
    explanation: >
      Un namespace est une isolation **logique** (nommage, RBAC, quotas), pas une
      frontière réseau par défaut (option 0 et 3 fausses). Deux Services de même nom
      dans des namespaces différents coexistent sans conflit, avec des noms DNS
      pleinement qualifiés distincts (`api.team-a.svc.cluster.local` vs
      `api.team-b.svc.cluster.local`) — option 2 fausse. Sans NetworkPolicy, tout Pod
      peut par défaut joindre tout autre Pod du cluster (approfondi au module 4).
---

Vérifie ta compréhension du modèle mental Kubernetes avant d'attaquer les objets
concrets (Pods, Deployments, Services).
