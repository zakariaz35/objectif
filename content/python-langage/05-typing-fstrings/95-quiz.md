---
title: "Quiz — Typing & f-strings"
type: quiz
questions:
  - prompt: |
      Comment écrire « un int ou None » en typage moderne ?
    options:
      - |
        int + None
      - |
        int | None
      - |
        int & None
    answer: 1
    explanation: |
      La barre verticale | exprime une union de types. int | None signifie « un entier OU None ». La forme historique équivalente est Optional[int] (du module typing).
  - prompt: |
      Que produit f"{1234.5678:.2f}" ?
    options:
      - |
        1234.5678
      - |
        1234.57
      - |
        1,234.57
    answer: 1
    explanation: |
      Le spécificateur .2f formate un float avec exactement 2 chiffres après la virgule, en arrondissant : 1234.5678 -> 1234.57.
  - prompt: |
      Les annotations de type sont-elles imposées à l'exécution par Python ?
    options:
      - |
        Oui, passer un mauvais type lève toujours une TypeError
      - |
        Non : elles sont indicatives ; ce sont des outils comme mypy qui les vérifient en amont
      - |
        Non, elles sont purement décoratives et ignorées de tous les outils
    answer: 1
    explanation: |
      Python n'effectue PAS de contrôle de type à l'exécution sur les annotations : on peut passer un str là où un int est annoté sans erreur immédiate. Leur intérêt est la documentation et la vérification statique (mypy, pyright) avant exécution.
---
