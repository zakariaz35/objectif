---
title: Quiz éclair — JWT
type: quiz
questions:
  - prompt: |
      Un attaquant change `"role":"user"` en `"role":"admin"` dans le payload d'un JWT.
      Pourquoi le serveur rejette-t-il le token ?
    options:
      - "Parce que le payload est chiffré et donc illisible"
      - "Parce que la signature ne correspond plus au payload modifié (la recréer exigerait le secret du serveur)"
      - "Parce que la date d'expiration devient automatiquement invalide"
    answer: 1
    explanation: >
      La signature couvre le header + le payload. En modifiant le payload, la signature
      d'origine ne colle plus ; pour en forger une valide, il faudrait le SECRET du
      serveur. Le serveur recalcule, voit la différence et rejette le token.
---

Une question pour vérifier que tu as compris le rôle de la signature.
