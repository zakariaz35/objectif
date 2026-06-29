---
title: "Quiz — Hello FastAPI & ASGI"
type: quiz
questions:
  - prompt: |
      Sur quelles bibliothèques FastAPI s'appuie-t-il principalement ?
    options:
      - |
        Starlette (web/ASGI) et Pydantic (validation)
      - |
        Flask et SQLAlchemy
      - |
        Django et marshmallow
      - |
        aiohttp et attrs
    answer: 0
    explanation: |
      FastAPI compose Starlette pour la couche web et Pydantic pour la validation/sérialisation.
  - prompt: |
      Comment lance-t-on une application FastAPI ?
    options:
      - |
        Via un serveur ASGI comme uvicorn (ex. `uvicorn main:app`)
      - |
        En appelant `app.run()` directement
      - |
        Dans le navigateur via Pyodide
      - |
        En exécutant `python main.py` qui démarre WSGI
    answer: 0
    explanation: |
      FastAPI fournit un objet `app` ASGI ; c'est uvicorn (ou un autre serveur ASGI) qui écoute le réseau.
  - prompt: |
      Quel est l'avantage majeur d'ASGI par rapport à WSGI ?
    options:
      - |
        Le support natif de `async/await`, des WebSockets et du streaming
      - |
        Il chiffre automatiquement le trafic HTTP
      - |
        Il rend Python compilé
      - |
        Il supprime le besoin de type hints
    answer: 0
    explanation: |
      ASGI est la variante asynchrone : concurrence par coroutines, WebSockets et réponses en flux.
---
