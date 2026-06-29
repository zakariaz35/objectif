---
title: "Injection de dépendances (Depends)"
type: lesson
---

## `Depends` : factoriser et injecter

Une **dépendance** est une fonction (ou un callable) dont FastAPI **appelle le résultat** et l'**injecte** dans ta route. Cela sert à :

- partager de la logique transverse (pagination, auth, accès base) ;
- déclarer des **prérequis** (la dépendance peut lever une `HTTPException`) ;
- garder les routes minces et testables.

```python
from typing import Annotated
from fastapi import Depends, FastAPI

app = FastAPI()

# Dépendance : paramètres de pagination communs.
def pagination(page: int = 1, taille: int = 20) -> dict[str, int]:
    return {"offset": (page - 1) * taille, "limit": taille}

Pagination = Annotated[dict[str, int], Depends(pagination)]

@app.get("/articles")
def lister(p: Pagination) -> dict[str, int]:
    return p   # {"offset": ..., "limit": ...}
```

## Dépendances avec `yield` (ressources)

Pour une ressource à **ouvrir puis fermer** (session BDD, client HTTP), on utilise `yield` : le code **avant** `yield` s'exécute à l'entrée, le code **après** au nettoyage — même en cas d'erreur.

```python
def get_session():
    session = Session()
    try:
        yield session          # injecté dans la route
    finally:
        session.close()        # toujours exécuté
```

## Sécurité / authentification

Une dépendance peut **garder** une route : si elle lève une `HTTPException(401)`, la route n'est jamais appelée.

```python
def utilisateur_courant(token: str = "") -> str:
    if token != "secret":
        raise HTTPException(status_code=401, detail="Non authentifié")
    return "alice"

@app.get("/me")
def me(user: Annotated[str, Depends(utilisateur_courant)]) -> dict[str, str]:
    return {"user": user}
```

> Les dépendances sont **composables** (une dépendance peut elle-même dépendre d'une autre) et **mises en cache** par requête.

## Sandbox : la *mécanique* d'injection en pur Python

`Depends` est lié au serveur, mais l'idée — **résoudre des dépendances, les mettre en cache, les injecter** — se reproduit en pur Python. La sandbox simule un mini-résolveur pour bien sentir le concept.

## Bac à sable

> Ajoute une 2e route qui réutilise `utilisateur_courant` dans le même `resoudre(...)` : le compteur reste à 1 (mise en cache).

```python
# Mini-simulation pédagogique du fonctionnement de Depends :
# - une dépendance est une fonction;
# - elle est résolue une fois par "requête" (cache);
# - son résultat est injecté dans la route.
from __future__ import annotations

from typing import Callable


def resoudre(deps: dict[str, Callable[[], object]]) -> dict[str, object]:
    cache: dict[str, object] = {}
    for nom, fabrique in deps.items():
        # FastAPI met en cache : on n'appelle chaque dépendance qu'une fois.
        if nom not in cache:
            cache[nom] = fabrique()
    return cache


appels = {"compteur": 0}


def pagination() -> dict[str, int]:
    return {"offset": 0, "limit": 20}


def utilisateur_courant() -> str:
    appels["compteur"] += 1
    return "alice"


# "Route" qui dépend de pagination + utilisateur_courant.
injecte = resoudre({"p": pagination, "user": utilisateur_courant})
print("Injecté dans la route :", injecte)
print("La dépendance user a été appelée", appels["compteur"], "fois (cache par requête).")

# Une dépendance "garde" peut refuser l'accès.
def garde(token: str) -> str:
    if token != "secret":
        raise PermissionError("401 Non authentifié")
    return "ok"


for token in ["secret", "mauvais"]:
    try:
        print("token", repr(token), "->", garde(token))
    except PermissionError as exc:
        print("token", repr(token), "->", exc)
```
