---
title: "Cartes mémo — Ingress et réseau"
type: flashcards
cards:
  - q: |
      Un objet `Ingress` créé dans un cluster sans aucun ingress controller installé
      a-t-il un effet quelconque ?
    a: |
      **Non.** Un `Ingress` est une simple déclaration ; sans un ingress controller
      (ex. Traefik) qui la lit et l'applique réellement, elle reste une donnée morte
      dans l'API — aucune route n'est créée.
  - q: |
      Le modèle mental Traefik (EntryPoint → Router → Middlewares → Service) change-t-il
      quand Traefik est utilisé comme ingress controller Kubernetes plutôt qu'avec
      Docker ?
    a: |
      **Non**, le modèle reste identique. Ce qui change, c'est la **source de
      configuration** : des labels Docker deviennent des objets `Ingress` (+ CRD
      `Middleware`), lus via l'API Kubernetes au lieu de l'API Docker.
  - q: |
      À quoi sert `ingressClassName` sur un objet `Ingress` ?
    a: |
      À désigner **quel** ingress controller doit traiter cet Ingress, quand plusieurs
      tournent dans le même cluster. Sans classe assignée (ni classe par défaut), aucune
      route n'est créée — silencieusement.
  - q: |
      Depuis un Pod du même namespace, quel nom suffit pour joindre un Service `api`
      via CoreDNS ? Et depuis un autre namespace ?
    a: |
      Le nom court `api` suffit dans le même namespace. Depuis un autre namespace, il
      faut `api.default` (namespace explicite) ou le nom pleinement qualifié
      `api.default.svc.cluster.local`.
  - q: |
      Sans aucune NetworkPolicy créée dans un cluster, un Pod peut-il joindre un Pod
      d'un autre namespace ?
    a: |
      **Oui.** Par défaut, le réseau Kubernetes est **plat** : tout Pod peut joindre
      tout autre Pod du cluster, quel que soit son namespace — la résolution DNS n'a
      jamais été une frontière de sécurité.
  - q: |
      Une NetworkPolicy `deny-all-ingress` (podSelector vide, aucune règle `from`) est
      posée seule, sans aucune autre règle d'autorisation. Quel est le risque immédiat ?
    a: |
      **Tout** le trafic entrant est bloqué, y compris celui de l'ingress controller
      lui-même (souvent dans un autre namespace, ex. `kube-system`) — l'accès public
      légitime est cassé en même temps que ce qu'on voulait réellement bloquer.
  - q: |
      Une NetworkPolicy sélectionne-t-elle le trafic autorisé par identité de Deployment,
      ou par label ?
    a: |
      Par **label**. N'importe quel Pod portant le label attendu (`app: web`, par
      exemple) matche la règle `from`, indépendamment du Deployment qui l'a créé — le
      même mécanisme de sélection que les Services.
---

Lis, réfléchis, révèle, auto-évalue.
