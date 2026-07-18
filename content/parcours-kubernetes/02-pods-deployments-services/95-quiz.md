---
title: "Quiz — Pods, Deployments, Services"
type: quiz
questions:
  - prompt: |
      Un développeur veut lancer un conteneur applicatif et un conteneur "sidecar" qui
      exporte ses métriques, avec la garantie qu'ils tournent toujours sur le même node
      et partagent le même réseau. Quel objet Kubernetes le garantit nativement ?
    options:
      - "Deux Deployments distincts, reliés par une NetworkPolicy d'autorisation."
      - "Un seul Pod, avec les deux conteneurs déclarés dans le même spec.containers."
      - "Un ReplicaSet avec replicas: 2, un pour chaque conteneur."
      - "Kubernetes ne garantit jamais la co-localisation de deux conteneurs, quel que soit l'objet utilisé."
    answer: 1
    tags: [pod, sidecar]
    level: debutant
    explanation: >
      Le Pod est la seule brique qui garantit la co-localisation stricte (même IP, même
      node) de plusieurs conteneurs. Deux Deployments distincts (option 0) ne garantissent
      ni le même réseau ni le même node ; un ReplicaSet dimensionne des répliques d'un
      même Pod, pas deux conteneurs différents (option 2 fausse).
  - prompt: |
      Un Pod créé directement (`kind: Pod`, sans Deployment) plante. Que se passe-t-il ?
    options:
      - "Kubernetes le redémarre automatiquement sur un autre node en quelques secondes."
      - "Rien ne le recrée : un Pod nu n'a aucun contrôleur qui surveille son existence."
      - "Le control plane alerte l'administrateur par un événement critique bloquant."
      - "Le Pod redémarre sur le même node uniquement si restartPolicy: Always est explicitement défini — jamais sinon."
    answer: 1
    tags: [pod, self-healing]
    level: debutant
    explanation: >
      Sans contrôleur de supervision (ReplicaSet/Deployment), rien ne recrée un Pod
      disparu. `restartPolicy` (option 3) ne concerne que le redémarrage du **conteneur à
      l'intérieur du même Pod**, pas la recréation du Pod lui-même sur un node différent.
  - prompt: |
      Après `kubectl set image deployment/whoami whoami=traefik/whoami:v1.10`, que
      devient l'ancien ReplicaSet (`whoami-7c7f4944c6`, avec l'image précédente) ?
    options:
      - "Il est immédiatement supprimé du cluster, aucune trace ne subsiste."
      - "Il reste présent, scalé à 0 réplique — prêt à être réactivé instantanément par un rollback."
      - "Il continue de tourner en parallèle du nouveau, à parts égales, indéfiniment."
      - "Il est automatiquement renommé pour devenir le nouveau ReplicaSet actif."
    answer: 1
    tags: [deployment, rollout, rollback]
    level: intermediaire
    explanation: >
      Un Deployment conserve l'historique des ReplicaSets (par défaut les 10 dernières
      révisions) en les scalant à 0 plutôt qu'en les supprimant — c'est ce qui rend
      `kubectl rollout undo` quasi instantané (option 1). Les options 0, 2 et 3 décrivent
      des comportements qui rendraient le rollback impossible ou incohérent.
  - prompt: |
      Un Service `api` a pour `selector: { app: api }`. Un développeur modifie par erreur
      le label du Deployment cible en `app: apy` (faute de frappe) et redéploie. Quel est
      le symptôme observable côté cluster ?
    options:
      - "kubectl apply refuse le déploiement avec une erreur explicite de label mismatch."
      - "Le Service reste actif et répond, mais kubectl get endpoints api affiche <none> : plus aucun trafic n'est routé, sans erreur explicite."
      - "Le Service se met automatiquement à jour son propre selector pour matcher les nouveaux labels."
      - "Les anciens Pods (avant la faute de frappe) restent accessibles indéfiniment via le Service, en plus des nouveaux."
    answer: 1
    tags: [service, selector, endpoints]
    level: intermediaire
    explanation: >
      Kubernetes ne valide jamais la cohérence entre un `selector` de Service et les
      labels effectivement portés par des Pods (option 0 fausse) ; un Service ne modifie
      jamais son propre `selector` tout seul (option 2 fausse) ; les anciens Pods, une
      fois remplacés par le rollout, disparaissent bel et bien (option 3 fausse). Le
      symptôme réel est silencieux : endpoints vides, sans message d'erreur.
  - prompt: |
      Un label Docker lu par Traefik (`traefik.http.routers.blog.rule=Host(...)`) et un
      label Kubernetes (`app: blog`) jouent-ils un rôle comparable ?
    options:
      - "Oui : les deux sont interprétés nativement par le même mécanisme de découverte automatique de service."
      - "Non : le label Docker est un langage de configuration à la syntaxe imposée (lu par Traefik) ; le label Kubernetes est une métadonnée arbitraire, utilisée uniquement comme critère de sélection par d'autres objets (selector)."
      - "Non : le label Kubernetes est chiffré par défaut, contrairement au label Docker qui reste en clair."
      - "Oui, à ceci près que le label Kubernetes doit obligatoirement commencer par le préfixe traefik.*."
    answer: 1
    tags: [labels, kubernetes, traefik]
    level: intermediaire
    explanation: >
      Ce sont deux mécanismes distincts (option 0 fausse) : Traefik interprète une
      syntaxe de clés précise sur les labels Docker, alors que Kubernetes ne donne aucun
      sens intrinsèque à un label — il sert uniquement de critère de `selector`. Aucun
      chiffrement n'est impliqué (option 2 fausse), et rien n'impose de préfixe
      `traefik.*` sur un label Kubernetes générique (option 3 fausse).
---

Vérifie ta compréhension des Pods, Deployments et Services — et du piège labels
Kubernetes vs labels Docker.
