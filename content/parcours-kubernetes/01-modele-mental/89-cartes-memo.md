---
title: "Cartes mémo — Modèle mental Kubernetes"
type: flashcards
cards:
  - q: |
      Quelle est la différence fondamentale entre `docker compose` et Kubernetes en
      termes de "portée" de la décision ?
    a: |
      `docker compose` raisonne **par machine** : le moteur Docker local applique ta
      stack sur cette seule machine. Kubernetes raisonne **par cluster** : un ensemble
      de nodes piloté par un control plane décide où et comment exécuter tes conteneurs.
  - q: |
      Que fait concrètement `kube-scheduler`, et pourquoi n'a-t-il pas d'équivalent avec
      `docker compose` ?
    a: |
      Il décide, pour chaque nouveau Pod, **quel node** va l'exécuter (en fonction des
      ressources disponibles et des contraintes). Avec `docker compose`, il n'y a
      qu'une seule machine : il n'y a donc aucun choix à faire.
  - q: |
      Où est stocké l'état désiré (`spec`) du cluster, et quel composant y accède en
      premier ?
    a: |
      Dans **etcd**, une base clé-valeur. Seul `kube-apiserver` y accède directement —
      tous les autres composants (kubectl, contrôleurs, kubelet) passent par l'API
      server, jamais par etcd en direct.
  - q: |
      Que se passe-t-il **concrètement** quand tu tapes `kubectl apply -f deployment.yaml` ?
    a: |
      Rien n'est exécuté directement. `kubectl` envoie le `spec` désiré à
      `kube-apiserver`, qui l'écrit dans `etcd`. Ce sont ensuite les **contrôleurs**,
      via leur boucle de reconciliation continue, qui créent réellement les Pods pour
      combler l'écart entre l'état désiré et l'état observé.
  - q: |
      Un Pod géré par un Deployment est supprimé manuellement (`kubectl delete pod`). Que
      se passe-t-il quelques secondes plus tard, et pourquoi ?
    a: |
      Un nouveau Pod est recréé automatiquement. La suppression crée un écart entre
      `spec.replicas` (ex. 3) et le nombre de Pods réellement observés (2) ; la boucle
      de reconciliation du contrôleur Deployment détecte cet écart et le corrige — sans
      aucune action humaine.
  - q: |
      Face à un Pod qui ne démarre pas, quelle commande `kubectl` faut-il consulter en
      **premier**, avant `kubectl logs` ?
    a: |
      `kubectl describe pod <name>` — sa section **Events** en bas de sortie journalise
      les décisions des contrôleurs (échec de scheduling, pull d'image raté, probe qui
      échoue…), souvent la cause racine **avant même** que le conteneur ait produit un
      log applicatif.
  - q: |
      Un namespace Kubernetes est-il, par défaut, une frontière réseau étanche entre les
      Pods qu'il contient et ceux d'un autre namespace ?
    a: |
      **Non.** Par défaut, tous les Pods du cluster peuvent se joindre entre eux, quel
      que soit leur namespace — un namespace n'isole que **logiquement** les objets
      (nommage, RBAC, quotas). L'isolation réseau réelle nécessite une NetworkPolicy
      explicite (module 4).
---

Lis, réfléchis, révèle, auto-évalue.
