---
title: "Quiz — Classes & dataclasses"
type: quiz
questions:
  - prompt: |
      À quoi sert @dataclass ?
    options:
      - |
        À rendre une classe abstraite
      - |
        À générer automatiquement __init__, __repr__ et __eq__ à partir des annotations
      - |
        À convertir la classe en dictionnaire
    answer: 1
    explanation: |
      Une dataclass épargne le code répétitif des classes « porteuses de données ». Avec frozen=True elle devient immuable, et l'égalité se fait par valeur.
  - prompt: |
      Que représente self dans une méthode ?
    options:
      - |
        La classe elle-même
      - |
        L'instance courante sur laquelle la méthode est appelée
      - |
        Une variable globale partagée
    answer: 1
    explanation: |
      self est le premier paramètre (implicite à l'appel) qui référence l'objet concret : c.deposer(50) passe c comme self. C'est par self qu'on lit et modifie les attributs d'instance.
  - prompt: |
      Dans une dataclass, comment déclarer correctement un attribut list par défaut ?
    options:
      - |
        articles: list = []
      - |
        articles: list = field(default_factory=list)
      - |
        articles = list()
    answer: 1
    explanation: |
      Comme pour les fonctions, un défaut muable partagé est piégeux. field(default_factory=list) appelle list() pour CHAQUE nouvelle instance, garantissant une liste indépendante.
---
