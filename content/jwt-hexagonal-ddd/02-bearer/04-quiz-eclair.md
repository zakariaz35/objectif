---
title: Quiz éclair — Bearer
type: quiz
questions:
  - prompt: |
      Une requête arrive **sans** en-tête `Authorization` sur une route protégée par
      `auth:sanctum`. Que renvoie Laravel ?
    options:
      - "200 OK : la route reste accessible"
      - "403 Forbidden : accès interdit"
      - "401 Unauthorized : non authentifié"
    answer: 2
    explanation: >
      401 = « pas authentifié du tout » : le middleware bloque avant d'atteindre le
      contrôleur. 403 signifierait « authentifié mais sans le droit » — ce n'est pas le
      cas ici puisqu'aucune identité n'est fournie.
---

Une question sur le comportement du middleware d'authentification.
