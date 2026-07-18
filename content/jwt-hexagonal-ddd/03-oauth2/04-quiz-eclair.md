---
title: Quiz éclair — OAuth2
type: quiz
questions:
  - prompt: |
      Deux microservices doivent s'appeler sans utilisateur connecté. Quel grant type
      OAuth2 utiliser ?
    options:
      - "Authorization Code + PKCE"
      - "Client Credentials"
      - "Password grant"
    answer: 1
    tags: [oauth2, tokens]
    level: intermediaire
    explanation: >
      Client Credentials : pas de *resource owner* humain, juste une machine qui
      s'authentifie auprès d'une autre via son `client_id`/`client_secret`. C'est le
      grant type des communications service-à-service.
  - prompt: |
      Une SPA (client **public** : impossible de garder un `client_secret` côté
      navigateur) utilise le flux Authorization Code. Pourquoi doit-elle en plus
      utiliser PKCE ?
    options:
      - "PKCE remplace le besoin d'un refresh token"
      - "PKCE lie l'échange du code à un secret éphémère généré par le client, empêchant un attaquant d'échanger un code intercepté contre un token"
      - "PKCE chiffre le mot de passe transmis à l'Authorization Server"
    answer: 1
    tags: [oauth2, tokens]
    level: avance
    explanation: >
      Un client public ne peut pas prouver son identité avec un `client_secret` (il
      serait visible dans le code JS). PKCE (*Proof Key for Code Exchange*) génère à la
      volée un `code_verifier` (gardé côté client) et son empreinte `code_challenge`
      (envoyée à l'Authorization Server). Même si le *authorization code* est
      intercepté (URL de redirection loguée, etc.), l'attaquant ne peut pas l'échanger
      contre un token sans le `code_verifier` d'origine.
---

Deux questions sur le choix du grant type et la sécurisation des clients publics.
