---
title: "Quiz — Fonctions (défauts, *args/**kwargs, lambda)"
type: quiz
questions:
  - prompt: |
      Dans def f(*args, **kwargs), que reçoit args ?
    options:
      - |
        Un tuple des arguments positionnels
      - |
        Un dict des arguments nommés
      - |
        Une liste vide
    answer: 0
    explanation: |
      *args collecte tous les arguments POSITIONNELS supplémentaires sous forme de tuple. **kwargs, lui, collecte les arguments NOMMÉS sous forme de dict.
  - prompt: |
      Pourquoi def f(x, panier=[]) est-il dangereux ?
    options:
      - |
        Parce que les listes ne peuvent pas être des paramètres
      - |
        Parce que la même liste est partagée et réutilisée entre tous les appels
      - |
        Parce que Python interdit les listes vides en paramètre
    answer: 1
    explanation: |
      La valeur par défaut est évaluée UNE seule fois, à la définition de la fonction. Tous les appels qui omettent panier partagent donc la même liste, qui se remplit au fil des appels. La parade : panier=None puis if panier is None: panier = [].
  - prompt: |
      Que renvoie (lambda x: x * 2)(21) ?
    options:
      - |
        21
      - |
        42
      - |
        Une erreur de syntaxe
    answer: 1
    explanation: |
      (lambda x: x * 2) crée une fonction anonyme qui double son argument ; on l'appelle aussitôt avec 21, ce qui donne 42.
---
