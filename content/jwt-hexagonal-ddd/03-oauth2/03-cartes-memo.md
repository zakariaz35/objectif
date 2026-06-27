---
title: Cartes mémo — OAuth2 & refresh
type: flashcards
cards:
  - q: |
      Pourquoi un access token court + un refresh token long plutôt qu'un seul JWT à
      longue durée ?
    a: |
      Pour combiner **performance** et **sécurité**. L'access token JWT court reste
      *stateless* (pas de lookup DB à chaque requête) et, comme il expire vite, un vol a
      un impact limité. Le refresh token, lui, est stocké en base et **révocable** : on
      peut couper l'accès (déconnexion, ban) sans renoncer au stateless au quotidien. Un
      seul JWT long serait soit non-révocable, soit dangereux en cas de vol.
  - q: |
      OAuth2 sert-il à « se connecter » (authentification) ?
    a: |
      Pas directement : OAuth2 est un protocole d'**autorisation déléguée** (« cette
      appli peut-elle accéder à mes ressources ? »), pas d'authentification (« qui
      es-tu ? »). Le login social fonctionne *par-dessus* OAuth2 grâce à **OpenID
      Connect**, une couche d'identité ajoutée. Le mot de passe ne quitte jamais
      l'Authorization Server.
---

Lis, réfléchis, révèle, auto-évalue.
