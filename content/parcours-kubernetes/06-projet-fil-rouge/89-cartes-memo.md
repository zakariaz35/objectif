---
title: "Cartes mémo — Projet fil rouge"
type: flashcards
cards:
  - q: |
      Dans la stack migrée, pourquoi `db` est-elle un StatefulSet alors que `api` et
      `web` sont des Deployments ?
    a: |
      `db` a besoin d'un stockage individuel stable et d'une identité réseau stable
      (`db-0.db.shop.svc.cluster.local`) à travers les redémarrages — exactement le
      besoin qu'un StatefulSet garantit. `api` et `web` sont sans état individuel : des
      Pods interchangeables suffisent (Deployment).
  - q: |
      Pourquoi le Service `db` est-il déclaré `clusterIP: None` (headless) plutôt qu'un
      Service classique ?
    a: |
      Un StatefulSet a besoin d'un nom DNS stable **par Pod**
      (`db-0.db.shop.svc.cluster.local`), pas d'un équilibrage de charge entre
      répliques — c'est exactement ce que fournit un Service headless.
  - q: |
      Le Secret `db-credentials` est-il dupliqué entre le manifest de `db` et celui de
      `api` ?
    a: |
      **Non.** Un seul Secret est créé ; `db` et `api` le référencent tous les deux via
      `envFrom.secretRef` — aucune duplication de la valeur elle-même.
  - q: |
      Pourquoi poser un `default-deny-ingress` seul, sans les 3 NetworkPolicy
      d'autorisation qui l'accompagnent, casserait la stack déployée ?
    a: |
      Il bloquerait **tout** trafic entrant vers `web`, `api` et `db` — y compris celui
      de l'ingress controller (Traefik, dans `kube-system`) et celui entre les services
      internes (`web`→`api`, `api`→`db`), qui doivent chacun être explicitement
      autorisés par une NetworkPolicy dédiée.
  - q: |
      Dans l'Ingress du projet, à quoi sert le Middleware `api-stripprefix` référencé
      via l'annotation `router.middlewares` ?
    a: |
      Il retire le préfixe `/api` de l'URL **avant** que la requête n'atteigne le Pod
      `api` — exactement le même middleware `stripPrefix` que celui utilisé en labels
      Docker avec Traefik, ici défini comme une CRD `Middleware` native Kubernetes.
---

Lis, réfléchis, révèle, auto-évalue.
