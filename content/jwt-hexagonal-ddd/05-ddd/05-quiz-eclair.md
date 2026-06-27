---
title: Quiz éclair — DDD
type: quiz
questions:
  - prompt: |
      Pourquoi force-t-on à passer par la racine d'un agrégat (Aggregate Root) ?
    options:
      - "Pour améliorer les performances des requêtes SQL"
      - "Pour garantir les invariants métier : c'est la seule porte d'entrée qui valide les règles"
      - "Parce que Laravel impose ce pattern par défaut"
    answer: 1
    explanation: >
      La racine est la seule porte d'entrée : elle vérifie les conditions avant toute
      modification (ex. interdire d'ajouter une ligne à une commande validée). Sans elle,
      n'importe qui pourrait violer un invariant en modifiant un objet interne.
---

Une question sur le rôle de la racine d'agrégat.
