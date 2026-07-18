---
title: "Cartes mémo — Projet fil rouge"
type: flashcards
cards:
  - q: |
      Dans la stack fil rouge, à quoi sert précisément le label
      `traefik.http.routers.dashboard.service=api@internal` ?
    a: |
      Il connecte un router **personnalisé** (avec sa propre règle `Host` et son
      middleware `basicauth`) au service **interne** de Traefik qui sert le
      dashboard/API — sans ce label, un router avec juste une règle `Host` ne saurait
      pas vers quel service router la requête.
  - q: |
      `web-app` et `api` partagent le même `Host` (`app.example.com`). Comment garantir
      que `api` (sous `/api`) gagne toujours face au router catch-all de `web-app` ?
    a: |
      En fixant des **priorités explicites** : `priority=10` sur `api`,
      `priority=1` sur `web-app`. Sans ça, rien ne garantit le résultat de façon fiable
      (Traefik calcule une priorité implicite, mais elle ne doit pas être la seule
      garantie pour un comportement critique).
  - q: |
      Pourquoi la redirection HTTP→HTTPS de la stack fil rouge est-elle définie sur
      l'entrypoint `web` plutôt que via un middleware sur chacun des services ?
    a: |
      Parce qu'elle s'applique alors **une seule fois, pour tout le trafic entrant sur
      le port 80**, quel que soit le service visé — évite de dupliquer le même
      middleware `redirectscheme` sur chacun des services de la stack.
  - q: |
      Que contient exactement le fichier `acme.json` monté en volume sur le conteneur
      Traefik, et quelle permission lui donner ?
    a: |
      Les certificats obtenus **et leurs clés privées**. Permission requise : `600`
      (lecture/écriture pour le seul propriétaire) — à vérifier explicitement avant le
      premier démarrage en production.
  - q: |
      Le hash du mot de passe du dashboard est écrit `admin:$$apr1$$saltvalue$$hashvalue`
      dans le label `basicauth.users`. Pourquoi les `$` sont-ils doublés ici ?
    a: |
      Parce que ce label vit dans un `docker-compose.yml`, où `$` déclenche une
      interpolation de variable. Doubler chaque `$` en `$$` force Compose à transmettre
      le hash tel quel à Traefik, sans le corrompre.
---

Lis, réfléchis, révèle, auto-évalue.
