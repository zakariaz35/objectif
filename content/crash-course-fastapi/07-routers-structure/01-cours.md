---
title: "Routers & structure d'un projet"
type: lesson
---

## `APIRouter` : découper l'application

Au-delà de quelques routes, on **éclate** l'API par domaine grâce à `APIRouter`. Chaque module définit son routeur ; `main.py` les **assemble**.

```python
# users/routes.py
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])

@router.get("")
def lister_users() -> list[dict[str, str]]:
    return [{"nom": "alice"}]

@router.get("/{user_id}")
def get_user(user_id: int) -> dict[str, int]:
    return {"id": user_id}
```

```python
# main.py
from fastapi import FastAPI
from users.routes import router as users_router

app = FastAPI()
app.include_router(users_router)
```

- `prefix` : préfixe commun de chemin (`/users`) ;
- `tags` : regroupe les opérations dans la doc `/docs`.

## Une structure de projet lisible

Privilégier une organisation **par domaine métier** (et non par couche technique) :

```text
app/
├── main.py            # crée FastAPI, include_router(...)
├── core/
│   ├── config.py      # réglages (Pydantic Settings)
│   └── deps.py        # dépendances transverses (get_session, auth…)
├── users/
│   ├── routes.py      # APIRouter
│   ├── schemas.py     # modèles Pydantic (In / Out)
│   └── service.py     # logique métier
└── products/
    ├── routes.py
    ├── schemas.py
    └── service.py
```

Règle d'or : **routes minces, logique dans `service.py`, contrats dans `schemas.py`.** Les routes orchestrent ; elles ne contiennent pas la logique métier.

## Dépendances et préfixes au niveau du routeur

On peut attacher des **dépendances à tout un routeur** (ex. exiger l'auth sur tout `/admin`) :

```python
admin = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(verifier_admin)],
)
```

Toutes les routes du routeur héritent alors de la garde. C'est la **composition** appliquée à l'organisation.

> Concepts purement serveur → **pas de sandbox** dans ce module : on raisonne sur la structure. Lance le projet en local (`uvicorn app.main:app --reload`) pour le voir vivre.
