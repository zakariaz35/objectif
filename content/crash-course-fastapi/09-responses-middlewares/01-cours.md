---
title: "Réponses, status codes & middlewares"
type: lesson
---

## Choisir le bon status code

Par défaut, une route renvoie **200**. On personnalise le **succès** via `status_code` :

```python
from fastapi import FastAPI, status

app = FastAPI()

@app.post("/produits", status_code=status.HTTP_201_CREATED)
def creer() -> dict[str, str]:
    return {"etat": "créé"}     # -> 201
```

Repères utiles :

- **200** OK · **201** Created · **204** No Content ;
- **400** Bad Request · **401** Unauthorized · **403** Forbidden · **404** Not Found ;
- **422** Unprocessable Entity (validation) · **500** Internal Server Error.

Pour une réponse **204**, on ne renvoie **aucun corps**.

## Réponses sur mesure

- `JSONResponse` : contrôle fin du corps et des en-têtes ;
- `StreamingResponse` : flux (gros fichiers, SSE) ;
- `RedirectResponse` : redirection ;
- en-têtes/cookies personnalisés : on déclare un paramètre `response: Response` et on écrit `response.headers["X-..."] = ...`.

```python
from fastapi import Response

@app.get("/ping")
def ping(response: Response) -> dict[str, str]:
    response.headers["X-App"] = "demo"
    return {"pong": "ok"}
```

## Middlewares : autour de chaque requête

Un **middleware** enveloppe **toutes** les requêtes : il s'exécute **avant** la route, puis **après** la réponse. Idéal pour le logging, le temps de traitement, CORS, etc.

```python
import time
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def chrono(request: Request, call_next):
    debut = time.perf_counter()
    response = await call_next(request)        # exécute la route
    response.headers["X-Process-Time"] = f"{time.perf_counter() - debut:.4f}"
    return response
```

Pour le partage cross-origine (front séparé), on ajoute le middleware **CORS** :

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mon-front.example"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

> Routes, réponses et middlewares = **côté serveur** → ce module n'a **pas de sandbox**. On valide tout cela en local avec `uvicorn` et la doc `/docs`.
