---
title: "Path & query params typés"
type: lesson
---

## Les paramètres viennent des annotations

Dans FastAPI, **l'emplacement d'un paramètre se déduit de la signature** :

- si le nom apparaît dans le **chemin** (`{...}`) → **path param** ;
- sinon, s'il a un type « simple » (int, str, bool…) → **query param** ;
- (les corps de requête se déclarent avec des modèles Pydantic, cf. module 3).

Le **type hint** déclenche la **conversion** et la **validation** : `item_id: int` refusera `/items/abc` avec une **422**.

```python
from fastapi import FastAPI

app = FastAPI()


# Path param typé : /items/42  -> item_id == 42 (int)
@app.get("/items/{item_id}")
def get_item(item_id: int) -> dict[str, int]:
    return {"item_id": item_id}


# Query params : /search?q=fastapi&limit=10&actif=true
@app.get("/search")
def search(q: str, limit: int = 20, actif: bool = False) -> dict[str, object]:
    return {"q": q, "limit": limit, "actif": actif}
```

## Obligatoire vs optionnel

- **sans valeur par défaut** → paramètre **obligatoire** (`q: str`) ;
- **avec valeur par défaut** → **optionnel** (`limit: int = 20`) ;
- `param: str | None = None` → optionnel, peut être absent.

## Contraintes fines avec `Query` / `Path`

On affine les bornes et formats via `Annotated[...]` :

```python
from typing import Annotated
from fastapi import Query, Path

@app.get("/users/{user_id}")
def get_user(
    user_id: Annotated[int, Path(ge=1)],
    page: Annotated[int, Query(ge=1, le=100)] = 1,
    tri: Annotated[str, Query(pattern="^(asc|desc)$")] = "asc",
) -> dict[str, object]:
    return {"user_id": user_id, "page": page, "tri": tri}
```

`ge` = *greater or equal*, `le` = *less or equal*, `pattern` = regex. Toute violation renvoie une **422** détaillée.

## Tester la conversion en pur Python (sandbox)

Le routage est côté serveur, mais on peut **reproduire la conversion de type** que FastAPI fait pour un path/query param avec un `TypeAdapter` Pydantic — c'est exactement le mécanisme sous-jacent. Joue avec la sandbox ci-dessous.

## Bac à sable

> Remplace `int` par `float` et observe que `"3.5"` devient alors valide.

```python
# Reproduction de la conversion d'un "query/path param" typé par FastAPI.
# FastAPI valide chaque paramètre via Pydantic. On simule "item_id: int".
from pydantic import TypeAdapter, ValidationError

# item_id: int  ->  un TypeAdapter sur int
item_id = TypeAdapter(int)

for valeur in ["42", "007", "abc", "3.5"]:
    try:
        converti = item_id.validate_python(valeur)
        print(f"{valeur!r:>8}  ->  {converti!r} (type {type(converti).__name__})")
    except ValidationError:
        print(f"{valeur!r:>8}  ->  422 Unprocessable Entity (pas un entier)")

# Bool de query : FastAPI accepte true/false/1/0/yes/no...
print("---")
flag = TypeAdapter(bool)
for valeur in ["true", "false", "1", "0", "yes", "no"]:
    print(f"{valeur!r:>8}  ->  {flag.validate_python(valeur)}")
```
