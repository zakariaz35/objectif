---
title: "Quiz — Middlewares"
type: quiz
questions:
  - prompt: |
      Un développeur écrit
      `traefik.http.middlewares.staging-auth.basicauth.users=admin:$$apr1$$...`
      sur un conteneur, mais oublie d'ajouter
      `traefik.http.routers.staging.middlewares=staging-auth`. Quel est le
      comportement observé ?
    options:
      - "Traefik refuse de démarrer, un middleware déclaré sans attachement est une erreur bloquante."
      - "La route reste accessible sans authentification : le middleware est défini mais jamais appliqué à aucun router."
      - "Traefik attache automatiquement tout middleware déclaré au premier router du même conteneur."
      - "L'authentification s'applique, mais uniquement en HTTPS."
    answer: 1
    tags: [middlewares, labels]
    level: debutant
    explanation: >
      Déclaration et attachement sont deux labels indépendants. Sans le label
      "middlewares" sur le router, le middleware basicauth existe dans la config de
      Traefik mais n'est appliqué à aucune route : aucune erreur n'est levée (option 1
      fausse), et Traefik n'attache jamais rien automatiquement (option 3 fausse).
  - prompt: |
      Dans un fichier docker-compose.yml, un label contient un hash htpasswd tel quel :
      `traefik.http.middlewares.auth.basicauth.users=admin:$apr1$xyz$abc123`. Quel
      problème cela provoque-t-il ?
    options:
      - "Aucun problème, le label est transmis correctement à Traefik."
      - "Docker Compose interprète le $ comme le début d'une interpolation de variable et le hash finit corrompu ou vide avant même d'atteindre Traefik."
      - "Le mot de passe devient visible en clair dans les logs Docker."
      - "Traefik refuse de démarrer car basicauth exige un hash SHA-256, pas apr1."
    answer: 1
    tags: [middlewares, docker]
    level: intermediaire
    explanation: >
      $ est un caractère spécial pour Docker Compose (interpolation de variables
      d'environnement, ${VAR}). Sans le doubler en $$, Compose tente de le résoudre et
      transmet un hash tronqué ou vide à Traefik — l'authentification échoue alors
      silencieusement. Traefik accepte bien apr1 (option 4 fausse).
  - prompt: |
      Une API est exposée avec la règle
      ``Host(`app.example.com`) && PathPrefix(`/api`)`` et un middleware
      `stripprefix` avec `prefixes=/api`, attaché au router. Un client appelle
      `/api/orders/42`. Quel chemin l'application backend reçoit-elle ?
    options:
      - "/api/orders/42, inchangé"
      - "/orders/42, le préfixe /api est retiré avant transmission au conteneur"
      - "/42 uniquement, tout le chemin avant le dernier segment est retiré"
      - "Une erreur 400, stripprefix ne fonctionne pas avec des segments numériques"
    answer: 1
    tags: [middlewares, stripprefix]
    level: intermediaire
    explanation: >
      stripprefix retire exactement le préfixe déclaré (/api) du début du chemin, rien
      de plus : /api/orders/42 devient /orders/42, transmis tel quel au conteneur.
      Aucune erreur liée aux segments numériques (option 4) n'existe.
  - prompt: |
      Une équipe expose son backend sous /api mais oublie d'attacher un middleware
      stripprefix. L'application ne définit que des routes à la racine (/users,
      /orders). Que se passe-t-il concrètement ?
    options:
      - "Traefik ajoute automatiquement le stripprefix par défaut dès qu'une PathPrefix est utilisée dans la rule."
      - "L'application reçoit le chemin complet (/api/users) et ne trouve aucune route correspondante : 404 côté application, alors que Traefik a bien matché la requête."
      - "La requête est bloquée au niveau du router Traefik avec un 404 avant même d'atteindre le conteneur."
      - "Traefik répond directement en 200 avec un corps vide, sans contacter le conteneur."
    answer: 1
    tags: [middlewares, stripprefix]
    level: intermediaire
    explanation: >
      Traefik ne strippe jamais automatiquement un préfixe (option 1 fausse, il faut le
      middleware explicite). Le router matche bien la requête (rule PathPrefix(/api)
      satisfaite) et la transmet telle quelle au conteneur, qui reçoit /api/users — un
      chemin qu'il ne connaît pas, d'où un 404 émis par l'application elle-même, pas par
      Traefik (options 3 et 4 fausses).
  - prompt: |
      Le dashboard Traefik doit être protégé en production. Quelle combinaison de
      labels est correcte pour exiger un identifiant/mot de passe avant d'accéder au
      router du dashboard ?
    options:
      - "Un seul label suffit : traefik.http.routers.dashboard.auth=basic."
      - "Déclarer le middleware basicauth (users=...) ET l'attacher via traefik.http.routers.dashboard.middlewares=<nom-du-middleware>."
      - "Ajouter --api.insecure=false dans la commande de Traefik : cela suffit à demander un mot de passe."
      - "Changer le port du dashboard : la sécurité par obscurité suffit en interne."
    answer: 1
    tags: [middlewares, docker]
    level: avance
    explanation: >
      Il n'existe pas de raccourci "auth=basic" (option 1 inventée). Retirer
      --api.insecure (option 3) ferme l'accès non authentifié à l'API interne mais ne
      configure aucune authentification sur le router HTTP du dashboard exposé via
      labels — il faut bien déclarer ET attacher un middleware basicauth. Changer de
      port (option 4) n'est pas une protection réelle.
---

Vérifie tes réflexes sur les middlewares Traefik.
