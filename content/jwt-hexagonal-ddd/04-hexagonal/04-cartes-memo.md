---
title: Cartes mémo — Hexagonal
type: flashcards
cards:
  - q: |
      Dans quel sens pointent les dépendances en architecture hexagonale, et pourquoi
      est-ce contre-intuitif ?
    a: |
      Toujours **vers le centre (le métier)**. C'est contre-intuitif parce que
      naturellement on dirait « mon service utilise MySQL, donc il dépend de MySQL ».
      L'hexagonal **inverse** : le métier définit une *interface* (port), et c'est
      l'adapter base de données qui dépend de cette interface. Le métier ne connaît
      jamais l'infrastructure.
---

Lis, réfléchis, révèle, auto-évalue.
