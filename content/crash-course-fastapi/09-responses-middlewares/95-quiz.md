---
title: "Quiz — Réponses, status codes & middlewares"
type: quiz
questions:
  - prompt: |
      Comment renvoyer un **201 Created** depuis une route FastAPI ?
    options:
      - |
        En passant `status_code=status.HTTP_201_CREATED` au décorateur
      - |
        En faisant `return 201`
      - |
        En levant `HTTPException(201)`
      - |
        C'est impossible, FastAPI impose 200
    answer: 0
    explanation: |
      Le décorateur accepte `status_code` ; la route renvoie alors ce code en cas de succès.
  - prompt: |
      Quand un middleware s'exécute-t-il ?
    options:
      - |
        Autour de chaque requête : avant la route, puis après la réponse
      - |
        Une seule fois au démarrage du serveur
      - |
        Uniquement en cas d'erreur 500
      - |
        Seulement pour les requêtes WebSocket
    answer: 0
    explanation: |
      Le middleware appelle `await call_next(request)` (la route) et peut agir avant et après.
  - prompt: |
      À quoi sert le middleware CORS ?
    options:
      - |
        À autoriser un front hébergé sur une autre origine à appeler l'API
      - |
        À chiffrer les réponses
      - |
        À compresser le JSON
      - |
        À valider les modèles Pydantic
    answer: 0
    explanation: |
      CORS ajoute les en-têtes permettant à un navigateur d'accepter les réponses d'une origine différente.
---
