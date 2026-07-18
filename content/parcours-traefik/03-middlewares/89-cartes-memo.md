---
title: "Cartes mémo — Middlewares"
type: flashcards
cards:
  - q: |
      Un middleware `basicauth` est déclaré (label
      `traefik.http.middlewares.my-auth.basicauth.users=...`) mais la route reste
      accessible sans mot de passe. Quelle est la cause la plus probable ?
    a: |
      Le middleware n'a jamais été **attaché** à un router : le label
      `traefik.http.routers.<router>.middlewares=my-auth` manque. Déclaration et
      attachement sont deux labels distincts — sans le second, le premier n'a aucun
      effet, en silence.
  - q: |
      Pourquoi un hash `$apr1$...` écrit dans un label `basicauth.users` d'un
      `docker-compose.yml` doit-il avoir chaque `$` doublé en `$$` ?
    a: |
      Parce que Docker Compose interprète `$` comme un début d'interpolation de
      variable (`${VAR}`) et essaie de le résoudre **avant** que le label n'atteigne
      Traefik. Doubler chaque `$` (`$$`) force Compose à le transmettre littéralement.
  - q: |
      Une API est exposée sous `/api` avec un `stripprefix`. Le client appelle
      `/api/users`. Quel chemin l'application reçoit-elle réellement ?
    a: |
      `/users` — le préfixe `/api` est retiré par le middleware avant de transmettre la
      requête au conteneur. Vérifié en conditions réelles.
  - q: |
      Que se passe-t-il si on oublie `stripprefix` en exposant une API sous `/api` alors
      que l'application ne connaît que des routes à la racine (`/users`) ?
    a: |
      L'application reçoit `/api/users` tel quel et ne trouve aucune route
      correspondante : 404 côté application, alors même que Traefik, lui, a bien
      matché la requête au niveau du router.
  - q: |
      Quel en-tête HTTP `stripprefix` ajoute-t-il automatiquement, et à quoi sert-il ?
    a: |
      `X-Forwarded-Prefix`, contenant le préfixe retiré — utile si l'application a
      besoin de connaître son préfixe de montage (pour générer des liens ou des assets
      absolus cohérents malgré le retrait du préfixe dans le chemin reçu).
  - q: |
      Le middleware `compress` a-t-il besoin d'une sous-option obligatoire pour
      fonctionner ?
    a: |
      **Non** : `traefik.http.middlewares.<nom>.compress=true` suffit (un booléen sur
      le type lui-même) — toutes ses autres options (types de contenu exclus, etc.)
      sont optionnelles.
---

Lis, réfléchis, révèle, auto-évalue.
