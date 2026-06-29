---
title: "Quiz — async & I/O"
type: quiz
questions:
  - prompt: |
      Quand privilégier `async def` pour une route FastAPI ?
    options:
      - |
        Quand on fait de l'I/O asynchrone avec des libs `await`-ables (httpx, asyncpg…)
      - |
        Toujours, async est strictement plus rapide
      - |
        Uniquement pour les calculs CPU intensifs
      - |
        Jamais, FastAPI ne supporte pas async
    answer: 0
    explanation: |
      La coroutine tourne dans la boucle d'événements ; pendant une attente I/O, la boucle traite d'autres requêtes.
  - prompt: |
      Que fait FastAPI avec une route déclarée en `def` (synchrone) ?
    options:
      - |
        Il l'exécute dans un threadpool pour ne pas bloquer la boucle d'événements
      - |
        Il refuse de démarrer
      - |
        Il la transforme automatiquement en coroutine
      - |
        Il la lance dans un autre processus
    answer: 0
    explanation: |
      Le code synchrone bloquant est déporté dans un thread, préservant la concurrence du serveur.
  - prompt: |
      Pourquoi appeler `requests.get(...)` (bloquant) dans une route `async def` est-il un piège ?
    options:
      - |
        Cela bloque la boucle d'événements et tue la concurrence ; il faut une lib `await`-able
      - |
        Parce que `requests` n'existe pas en Python
      - |
        Parce que FastAPI interdit les appels réseau
      - |
        Il n'y a aucun problème, c'est équivalent
    answer: 0
    explanation: |
      Dans une coroutine, n'appelle que de l'I/O `await`-able (httpx async), sinon tu figes tout le serveur.
---
