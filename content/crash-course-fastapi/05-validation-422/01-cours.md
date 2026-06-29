---
title: "Validation & erreurs 422"
type: lesson
---

## La 422, c'est la validation qui parle

Quand un corps/paramètre **ne respecte pas le contrat**, FastAPI renvoie **`422 Unprocessable Entity`** avec un JSON listant **chaque** erreur : emplacement (`loc`), message (`msg`) et type (`type`). Tu n'écris **aucun** code pour ça.

```json
{
  "detail": [
    { "loc": ["body", "prix"], "msg": "Input should be a valid number", "type": "float_parsing" }
  ]
}
```

## Contraintes au niveau du champ

`Field(...)` ajoute des contraintes directement sur le modèle :

```python
from pydantic import BaseModel, Field

class Inscription(BaseModel):
    pseudo: str = Field(min_length=3, max_length=20)
    age: int = Field(ge=0, le=130)
    code_postal: str = Field(pattern=r"^\d{5}$")
```

## Validateurs personnalisés

Pour une logique métier, on utilise `@field_validator` (un champ) ou `@model_validator` (le modèle entier, ex. règles inter-champs).

```python
# Côté FastAPI : on peut aussi lever une erreur HTTP "métier" explicite.
from fastapi import FastAPI, HTTPException

app = FastAPI()
_BASE = {1: "Ada", 2: "Linus"}


@app.get("/devs/{dev_id}")
def get_dev(dev_id: int) -> dict[str, str]:
    nom = _BASE.get(dev_id)
    if nom is None:
        # 404 explicite et propre : différent d'une 422 de validation.
        raise HTTPException(status_code=404, detail="Développeur introuvable")
    return {"id": str(dev_id), "nom": nom}
```

## Sandbox : validateurs Pydantic en action

Ci-dessous, **exactement** la validation que FastAPI exécuterait avant d'appeler ta route. On y combine `Field`, `field_validator` et `model_validator`.

## Bac à sable

> Le second appel cumule plusieurs erreurs : pseudo trop court + espace, âge hors bornes, mot de passe trop court, confirmation différente.

```python
from __future__ import annotations

from typing import Self

from pydantic import BaseModel, Field, ValidationError, field_validator, model_validator


class Inscription(BaseModel):
    pseudo: str = Field(min_length=3, max_length=20)
    age: int = Field(ge=0, le=130)
    mot_de_passe: str = Field(min_length=8)
    confirmation: str

    @field_validator("pseudo")
    @classmethod
    def _pas_d_espaces(cls, v: str) -> str:
        if " " in v:
            raise ValueError("Le pseudo ne doit pas contenir d'espace.")
        return v

    @model_validator(mode="after")
    def _mots_de_passe_identiques(self) -> Self:
        if self.mot_de_passe != self.confirmation:
            raise ValueError("Le mot de passe et sa confirmation diffèrent.")
        return self


def tester(payload: dict) -> None:
    try:
        ok = Inscription(**payload)
        print("OK :", ok.pseudo, "/", ok.age, "ans")
    except ValidationError as exc:
        print("422 — erreurs :")
        for err in exc.errors():
            print("  -", list(err["loc"]) or ["<modèle>"], ":", err["msg"])


tester({"pseudo": "ada", "age": 36, "mot_de_passe": "secret-123", "confirmation": "secret-123"})
print("---")
tester({"pseudo": "a b", "age": 200, "mot_de_passe": "court", "confirmation": "autre"})
```
