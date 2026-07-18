---
title: "Quiz — Projet fil rouge"
type: quiz
questions:
  - prompt: |
      Dans la stack de prod, le router du dashboard porte le label
      `traefik.http.routers.dashboard.service=api@internal`. Que représente
      `api@internal` ?
    options:
      - "Un service applicatif que l'on doit définir soi-même ailleurs dans le compose."
      - "Le nom réservé du service interne de Traefik (API/dashboard), déjà fourni par Traefik lui-même."
      - "Une erreur de syntaxe : il faudrait utiliser 'dashboard@internal'."
      - "Un alias facultatif, purement cosmétique, sans effet sur le routage."
    answer: 1
    tags: [routers, docker]
    level: intermediaire
    explanation: >
      api@internal est un service intégré fourni par Traefik lui-même (son API et son
      dashboard) : il n'y a rien à définir soi-même (option 0 fausse), ce n'est pas une
      faute de frappe (option 2), et il est indispensable pour connecter un router
      personnalisé (avec sa propre règle Host) au dashboard (option 3 fausse : sans lui,
      le router ne saurait pas quoi servir).
  - prompt: |
      Dans la stack fil rouge, `web-app` et `api` partagent le même Host
      (`app.example.com`), mais `api` n'a une règle valide que sous `/api`. Sans les
      labels de priorité explicites vus dans la leçon, quel risque existe-t-il ?
    options:
      - "Aucun risque : Traefik refuse de démarrer si deux routers partagent le même Host."
      - "Rien ne garantit que le router le plus spécifique (api) gagne systématiquement face au catch-all (web-app) pour les requêtes sous /api."
      - "Les deux routers répondent simultanément à chaque requête sous /api."
      - "Le dernier router déclaré dans le fichier gagne toujours, donc l'ordre suffit à garantir le bon comportement."
    answer: 1
    tags: [routers, labels]
    level: avance
    explanation: >
      Traefik démarre très bien avec des routers qui se chevauchent sur le même Host
      (option 0 fausse) et ne répond jamais en double à une requête HTTP (option 2,
      impossible). Sans priorité explicite, le calcul se fait sur une heuristique de
      Traefik (longueur de règle), pas sur l'ordre de déclaration dans le fichier
      (option 3 fausse) : fixer priority=10 sur api (contre priority=1 sur web-app)
      garantit le comportement au lieu de dépendre d'un calcul implicite.
  - prompt: |
      La configuration de la stack fil rouge redirige HTTP vers HTTPS au niveau de
      l'entrypoint `web` (configuration statique), plutôt que via un middleware
      redirectscheme sur chaque service. Pourquoi ce choix pour une stack de plusieurs
      services ?
    options:
      - "Un middleware redirectscheme par service serait plus rapide en performance pure."
      - "La redirection au niveau de l'entrypoint s'applique une seule fois à tout le trafic HTTP entrant, sans dupliquer un middleware identique sur chaque service."
      - "redirectscheme ne peut être déclaré que sur l'entrypoint, jamais en label sur un service."
      - "C'est obligatoire dès qu'un certresolver Let's Encrypt est configuré."
    answer: 1
    tags: [https, entrypoints]
    level: intermediaire
    explanation: >
      redirectscheme fonctionne très bien comme middleware sur un service (module 3,
      option 2 fausse), et rien ne l'impose avec un certresolver (option 3 fausse) : le
      vrai argument est la simplicité de maintenance sur une stack à plusieurs services,
      pas la performance (option 0, non mesurée ni pertinente ici).
  - prompt: |
      Un développeur copie le label
      `traefik.http.middlewares.dashboard-auth.basicauth.users=admin:$apr1$xyz$abc` (un
      seul $ par occurrence) directement dans le docker-compose.yml de la stack fil
      rouge. Quel est le risque ?
    options:
      - "Aucun, Docker Compose ne touche jamais au contenu des labels."
      - "Docker Compose interprète les $ comme des interpolations de variables et corrompt le hash avant qu'il n'atteigne Traefik : l'authentification échoue silencieusement."
      - "Traefik refuse de démarrer avec une erreur explicite mentionnant le hash invalide."
      - "Le mot de passe est stocké en clair dans les logs Traefik."
    answer: 1
    tags: [middlewares, docker]
    level: intermediaire
    explanation: >
      C'est exactement le piège vu au module 3 : sans doubler chaque $ en $$, Compose
      tente une interpolation de variable et transmet un hash corrompu à Traefik, qui
      ne lève pourtant aucune erreur explicite (option 2 fausse) — juste une
      authentification qui ne fonctionne jamais, y compris avec le bon mot de passe.
  - prompt: |
      Dans la stack fil rouge, le volume `./letsencrypt:/letsencrypt` est monté sur le
      conteneur Traefik pour stocker acme.json. Quelle vérification manuelle reste
      indispensable avant le tout premier démarrage en production ?
    options:
      - "Vérifier que le dossier ./letsencrypt est vide, sinon Traefik refuse de démarrer."
      - "S'assurer que acme.json a bien les permissions 600 (chmod 600), car ce fichier contient des clés privées."
      - "Copier manuellement un certificat existant dans ce dossier avant le premier lancement."
      - "Déclarer ce volume en lecture seule (:ro) pour empêcher toute modification."
    answer: 1
    tags: [https, lets-encrypt]
    level: avance
    explanation: >
      acme.json est écrit et mis à jour par Traefik lui-même à chaque obtention/
      renouvellement de certificat : il doit rester accessible en écriture (donc pas en
      :ro, option 3 fausse) et un dossier vide ne pose aucun problème au démarrage
      (option 0 fausse, Traefik crée le fichier). Le point réellement critique, vu au
      module 4, est de garantir des permissions 600 sur ce fichier contenant des clés
      privées.
---

Vérifie ta compréhension de la stack complète Traefik.
