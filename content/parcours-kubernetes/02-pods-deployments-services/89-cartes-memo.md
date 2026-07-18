---
title: "Cartes mémo — Pods, Deployments, Services"
type: flashcards
cards:
  - q: |
      Pourquoi Kubernetes planifie-t-il des Pods, et jamais des conteneurs directement ?
    a: |
      Un Pod garantit que ses conteneurs (souvent un seul, parfois un sidecar) partagent
      **toujours** le même réseau (même IP, `localhost` commun) et sont **toujours**
      placés sur le même node. C'est l'unité atomique de scheduling.
  - q: |
      Un Pod créé directement (sans Deployment) a-t-il un self-healing automatique ?
    a: |
      **Non.** Un Pod nu n'a aucune garantie de survie : s'il plante ou si son node est
      perdu, rien ne le recrée. Le self-healing vient du contrôleur qui le supervise
      (ReplicaSet, via un Deployment), jamais du Pod lui-même.
  - q: |
      Que représente le suffixe `pod-template-hash` sur le nom d'un ReplicaSet et de ses
      Pods, et à quoi sert-il ?
    a: |
      C'est un hachage du `template` du Pod. Il permet au Deployment de distinguer les
      ReplicaSets correspondant à la version **actuelle** de ceux issus d'une **version
      antérieure** — le mécanisme même qui rend le rollout et le rollback possibles.
  - q: |
      Après un rollback (`kubectl rollout undo`), pourquoi l'opération est-elle quasi
      instantanée, sans reconstruction d'image ?
    a: |
      Un Deployment ne supprime jamais l'ancien ReplicaSet lors d'une mise à jour — il le
      scale juste à 0. Un rollback ne fait que rebasculer les répliques entre
      ReplicaSets **déjà existants** : aucune image n'est reconstruite, aucun Pod n'est
      créé "à froid".
  - q: |
      Un Service a un `selector` qui ne correspond à aucun Pod existant (faute de
      frappe). Que se passe-t-il visiblement côté cluster ?
    a: |
      **Rien de visible en apparence** : le Service existe toujours et son IP répond,
      mais `kubectl get endpoints <service>` affiche `<none>`. Aucune erreur explicite —
      c'est le premier réflexe de débogage réseau sur Kubernetes.
  - q: |
      Un label Kubernetes (`app: whoami`) a-t-il le même rôle qu'un label Docker lu par
      Traefik (`traefik.http.routers.blog.rule=...`) ?
    a: |
      **Non.** Un label Kubernetes est une métadonnée arbitraire, sans convention
      imposée par la plateforme, utilisée uniquement pour la **sélection** (via
      `selector`). Un label Docker Traefik est un véritable **langage de
      configuration**, avec une syntaxe de clés précise que Traefik interprète.
  - q: |
      Entre `ClusterIP`, `NodePort` et `LoadBalancer`, lequel est le point d'entrée HTTP
      recommandé pour exposer une application au public en production ?
    a: |
      **Aucun directement** : ces trois types restent des briques bas niveau. En
      production, l'exposition HTTP publique passe presque toujours par un **Ingress**
      (module 4), qui s'appuie sur un Service `ClusterIP` en interne.
---

Lis, réfléchis, révèle, auto-évalue.
