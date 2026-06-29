---
title: "Quiz — Injection de dépendances (Depends)"
type: quiz
questions:
  - prompt: |
      À quoi sert principalement `Depends` dans FastAPI ?
    options:
      - |
        À déclarer et injecter des dépendances réutilisables (auth, pagination, session…)
      - |
        À importer des modules Python
      - |
        À installer des paquets pip
      - |
        À définir le code HTTP de réponse
    answer: 0
    explanation: |
      FastAPI résout la dépendance, met son résultat en cache pour la requête et l'injecte dans la route.
  - prompt: |
      Pourquoi écrire une dépendance avec `yield` ?
    options:
      - |
        Pour gérer une ressource : code avant `yield` à l'entrée, code après pour le nettoyage (même en cas d'erreur)
      - |
        Pour rendre la dépendance asynchrone obligatoirement
      - |
        Pour renvoyer plusieurs réponses HTTP
      - |
        Parce que `return` est interdit dans une dépendance
    answer: 0
    explanation: |
      Le bloc `finally` après `yield` ferme proprement la session/connexion, succès ou exception.
  - prompt: |
      Que se passe-t-il si une dépendance lève `HTTPException(401)` ?
    options:
      - |
        La route protégée n'est jamais exécutée ; le client reçoit la 401
      - |
        La route s'exécute quand même avec `user=None`
      - |
        FastAPI réessaie automatiquement
      - |
        Le serveur plante en 500
    answer: 0
    explanation: |
      Une dépendance peut « garder » une route : son échec court-circuite l'opération de chemin.
---
