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
    explanation: >
      Client Credentials : pas de *resource owner* humain, juste une machine qui
      s'authentifie auprès d'une autre via son `client_id`/`client_secret`. C'est le
      grant type des communications service-à-service.
---

Une question sur le choix du grant type.
