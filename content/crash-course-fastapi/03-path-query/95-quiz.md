---
title: "Quiz — Path & query params typés"
type: quiz
questions:
  - prompt: |
      Dans `@app.get("/items/{item_id}")` avec `def f(item_id: int)`, que se passe-t-il pour `/items/abc` ?
    options:
      - |
        FastAPI renvoie une erreur 422 car `abc` n'est pas convertible en int
      - |
        La fonction reçoit la chaîne `"abc"` telle quelle
      - |
        Le serveur renvoie une 500
      - |
        `item_id` vaut `None`
    answer: 0
    explanation: |
      Le type hint `int` impose la conversion ; un échec produit une réponse 422 détaillée.
  - prompt: |
      Comment rend-on un query param **optionnel** avec une valeur par défaut ?
    options:
      - |
        En lui donnant une valeur par défaut dans la signature, ex. `limit: int = 20`
      - |
        En le préfixant par `optional_`
      - |
        En l'enveloppant dans `Path(...)`
      - |
        En le déclarant `global`
    answer: 0
    explanation: |
      Un paramètre avec valeur par défaut est optionnel ; sans défaut, il est obligatoire.
  - prompt: |
      À quoi sert `Annotated[int, Query(ge=1, le=100)]` ?
    options:
      - |
        À contraindre un query param entier entre 1 et 100 (validation automatique)
      - |
        À transformer le paramètre en chaîne de caractères
      - |
        À en faire un path param obligatoire
      - |
        À masquer le paramètre dans la doc
    answer: 0
    explanation: |
      `ge`/`le` posent des bornes ; une valeur hors bornes déclenche une 422.
---
