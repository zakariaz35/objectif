---
title: "Cartes mémo — Modèle mental Traefik"
type: flashcards
cards:
  - q: |
      Quelle est la différence fondamentale entre la façon dont nginx et Traefik
      découvrent leurs backends ?
    a: |
      nginx lit un **fichier de configuration statique** que tu maintiens à la main
      (reload manuel à chaque changement). Traefik **observe l'API Docker en continu**
      et se reconfigure automatiquement dès qu'un conteneur avec les bons labels
      démarre ou s'arrête — sans reload.
  - q: |
      Cite les 4 étages du pipeline Traefik, dans l'ordre.
    a: |
      **EntryPoint** (port d'écoute de Traefik) → **Router** (règle de correspondance,
      ex. `Host(...)`) → **Middlewares** (chaîne de transformation optionnelle) →
      **Service** (le conteneur + port réel).
  - q: |
      Un EntryPoint peut-il être créé via un label Docker sur un conteneur ?
    a: |
      **Non.** Un EntryPoint est de la configuration **statique** : il doit être défini
      au démarrage du conteneur Traefik (`traefik.yml` ou flags `command:`). Les labels
      ne peuvent définir que des Routers, Services et Middlewares (configuration
      **dynamique**).
  - q: |
      Pourquoi `--api.insecure=true` est-il dangereux en production ?
    a: |
      Il expose le dashboard (et donc toute la configuration découverte : routes,
      services internes…) **sans authentification**. À réserver au développement local ;
      en production, le dashboard doit être protégé par un middleware (ex.
      `basicauth`) et une vraie règle `Host`.
  - q: |
      Que se passe-t-il concrètement quand tu modifies un label sur un conteneur déjà
      démarré (`docker compose up -d` après édition) ?
    a: |
      Docker recrée le conteneur avec les nouveaux labels ; Traefik, qui surveille en
      continu l'API Docker, détecte le changement et **reconstruit sa table de routage
      en quelques secondes** — aucun redémarrage de Traefik lui-même n'est nécessaire.
---

Lis, réfléchis, révèle, auto-évalue.
