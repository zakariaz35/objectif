---
title: "Modèles Pydantic (request / response)"
type: lesson
---

## Le corps de requête = un modèle Pydantic

Pour recevoir un **JSON structuré** (POST/PUT…), on déclare un paramètre dont le type est un `BaseModel`. FastAPI :

1. lit le corps de la requête,
2. le **valide** contre le modèle,
3. passe une **instance typée** à la fonction.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ProduitIn(BaseModel):
    nom: str
    prix: float
    en_stock: bool = True

@app.post("/produits")
def creer(produit: ProduitIn) -> dict[str, object]:
    return {"recu": produit.model_dump(), "prix_ttc": round(produit.prix * 1.2, 2)}
```

## `response_model` : contrôler la sortie

On peut **filtrer** ce qui sort de l'API (ex. ne jamais renvoyer un mot de passe) avec `response_model`. FastAPI valide **aussi** la réponse et **n'expose que les champs du modèle de sortie**.

```python
class UtilisateurIn(BaseModel):
    email: str
    mot_de_passe: str        # entrée seulement

class UtilisateurOut(BaseModel):
    email: str               # le mot de passe n'apparaît PAS

@app.post("/users", response_model=UtilisateurOut)
def creer_user(u: UtilisateurIn) -> UtilisateurIn:
    # On retourne l'objet d'entrée ; FastAPI le coule dans UtilisateurOut.
    return u
```

> Bonne pratique : **modèle d'entrée ≠ modèle de sortie**. On évite ainsi de fuiter des champs sensibles et on découple le contrat public de la structure interne.

## Sandbox : un modèle Pydantic réel

Le routage est serveur, mais **la validation est du pur Pydantic** : exactement ce que FastAPI exécute sur le corps de requête. Essaie de modifier le payload.

## Bac à sable

> Retire le champ `nom` du payload valide : observe l'erreur « Field required ».

```python
from pydantic import BaseModel, ValidationError


class ProduitIn(BaseModel):
    nom: str
    prix: float
    en_stock: bool = True


# Séparer entrée et sortie (ne jamais fuiter un champ sensible).
class ProduitOut(BaseModel):
    nom: str
    prix_ttc: float


# 1) Payload valide — FastAPI ferait exactement ceci sur le corps JSON.
payload = {"nom": "Clavier", "prix": "49.90"}  # "49.90" est coercé en float
produit = ProduitIn(**payload)
print("Valide :", produit.model_dump())

sortie = ProduitOut(nom=produit.nom, prix_ttc=round(produit.prix * 1.2, 2))
print("Réponse (response_model) :", sortie.model_dump())

# 2) Payload invalide -> ValidationError (FastAPI renverrait une 422).
print("---")
try:
    ProduitIn(nom="Souris", prix="pas un nombre")
except ValidationError as exc:
    print("Erreurs :")
    for err in exc.errors():
        print(" -", err["loc"], err["msg"])
```
