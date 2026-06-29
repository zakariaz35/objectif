---
title: "Quiz — Validation & erreurs 422"
type: quiz
questions:
  - prompt: |
      Que renvoie FastAPI quand un corps de requête ne respecte pas le modèle ?
    options:
      - |
        Une réponse 422 avec le détail de chaque erreur (loc, msg, type)
      - |
        Une 500 sans détail
      - |
        Une 200 avec les champs ignorés
      - |
        Une 301 de redirection
    answer: 0
    explanation: |
      La 422 « Unprocessable Entity » est générée automatiquement avec un détail structuré.
  - prompt: |
      Quel décorateur valide une règle portant sur **plusieurs champs** d'un modèle ?
    options:
      - |
        `@model_validator(mode="after")`
      - |
        `@field_validator("champ")`
      - |
        `@app.validator`
      - |
        `@staticmethod`
    answer: 0
    explanation: |
      Le model_validator voit le modèle entier — idéal pour des règles inter-champs (ex. deux mots de passe identiques).
  - prompt: |
      Quelle est la différence entre une 422 et un `raise HTTPException(404)` ?
    options:
      - |
        La 422 vient de la validation automatique ; la 404 est une erreur métier que tu lèves explicitement
      - |
        Aucune, ce sont deux noms du même code
      - |
        La 404 est générée par Pydantic automatiquement
      - |
        La 422 doit toujours être levée à la main
    answer: 0
    explanation: |
      422 = contrat de données non respecté ; HTTPException te laisse signaler une condition métier (ressource absente, droit refusé…).
---
