---
title: "Quiz — Itérateurs & générateurs"
type: quiz
questions:
  - prompt: |
      Que fait le mot-clé yield ?
    options:
      - |
        Il termine définitivement la fonction comme return
      - |
        Il renvoie une valeur ET met la fonction en pause, qui reprendra au même endroit
      - |
        Il crée une nouvelle liste en mémoire
    answer: 1
    explanation: |
      yield transforme la fonction en générateur : à chaque valeur produite, la fonction est suspendue (variables locales conservées) et reprend exactement là au next suivant. return, lui, met fin à la fonction.
  - prompt: |
      Quel est le principal avantage mémoire d'un générateur ?
    options:
      - |
        Il est toujours plus rapide à écrire
      - |
        Il produit les valeurs une à une à la demande, sans tout stocker en mémoire
      - |
        Il met automatiquement les résultats en cache
    answer: 1
    explanation: |
      La consommation paresseuse permet de traiter des flux gigantesques, voire infinis (fibonacci), en ne gardant qu'une valeur à la fois. Une liste, elle, matérialise toute la séquence d'un coup.
  - prompt: |
      Quelle exception signale la fin d'un itérateur ?
    options:
      - |
        EndOfIteration
      - |
        StopIteration
      - |
        IndexError
    answer: 1
    explanation: |
      Quand __next__ n'a plus de valeur, il lève StopIteration. La boucle for capte cette exception et s'arrête proprement (tu n'as pas à la gérer toi-même dans un for).
---
