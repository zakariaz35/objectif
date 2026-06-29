---
title: "Quiz — Modèles Pydantic (request / response)"
type: quiz
questions:
  - prompt: |
      Comment FastAPI reçoit-il un corps de requête JSON structuré ?
    options:
      - |
        Via un paramètre typé avec un modèle Pydantic (`BaseModel`)
      - |
        Via `request.body()` qu'il faut parser à la main
      - |
        Via un dictionnaire `**kwargs` non typé
      - |
        Via une variable globale `body`
    answer: 0
    explanation: |
      FastAPI lit le corps, le valide contre le modèle et passe une instance typée à la fonction.
  - prompt: |
      À quoi sert `response_model=UtilisateurOut` ?
    options:
      - |
        À filtrer/valider la réponse et n'exposer que les champs du modèle de sortie
      - |
        À transformer la requête entrante
      - |
        À choisir le code HTTP de succès
      - |
        À désactiver la validation
    answer: 0
    explanation: |
      C'est ce qui permet de ne pas fuiter, par exemple, un mot de passe présent dans l'objet retourné.
  - prompt: |
      Pourquoi séparer modèle d'entrée et modèle de sortie ?
    options:
      - |
        Pour découpler le contrat public de la structure interne et éviter de fuiter des champs sensibles
      - |
        Parce que Pydantic interdit de réutiliser un modèle
      - |
        Pour accélérer le démarrage du serveur
      - |
        Parce que FastAPI ne sait pas valider deux fois
    answer: 0
    explanation: |
      Entrée ≠ sortie : on choisit explicitement ce qui entre et ce qui sort de l'API.
---
