---
title: "Quiz — Routers & structure d'un projet"
type: quiz
questions:
  - prompt: |
      À quoi sert `APIRouter` ?
    options:
      - |
        À regrouper des routes par domaine, puis les monter dans l'app via `include_router`
      - |
        À router le trafic réseau entre serveurs
      - |
        À remplacer uvicorn
      - |
        À générer la base de données
    answer: 0
    explanation: |
      `APIRouter` permet de découper l'API ; `app.include_router(router)` l'assemble dans l'application.
  - prompt: |
      Que fait l'argument `prefix="/users"` d'un `APIRouter` ?
    options:
      - |
        Il préfixe le chemin de toutes les routes du routeur
      - |
        Il définit le nom du fichier source
      - |
        Il fixe le port d'écoute
      - |
        Il impose un préfixe à tous les query params
    answer: 0
    explanation: |
      Une route `@router.get("/{id}")` devient `/users/{id}` une fois montée.
  - prompt: |
      Quelle organisation de projet est recommandée pour grandir sereinement ?
    options:
      - |
        Par domaine métier (users/, products/…) avec routes minces et logique dans service.py
      - |
        Tout dans un seul `main.py` de plusieurs milliers de lignes
      - |
        Un fichier par fonction Python
      - |
        Strictement par type technique, en mélangeant tous les domaines
    answer: 0
    explanation: |
      Découpage par domaine + séparation routes / schemas / service : lisible et testable.
---
