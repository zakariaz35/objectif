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
    tags: [ddd, agregats]
    level: intermediaire
    explanation: >
      La racine est la seule porte d'entrée : elle vérifie les conditions avant toute
      modification (ex. interdire d'ajouter une ligne à une commande validée). Sans elle,
      n'importe qui pourrait violer un invariant en modifiant un objet interne.
  - prompt: |
      Le mot « Client » désigne des informations très différentes en Facturation
      (encours, adresse de facturation) et en Support (tickets, satisfaction). Comment le
      DDD nomme-t-il ce découpage en modèles distincts ?
    options:
      - "Un Domain Event"
      - "Un Bounded Context : chaque contexte a son propre modèle du même mot"
      - "Un Value Object partagé entre les deux modules"
    answer: 1
    tags: [ddd]
    level: debutant
    explanation: >
      Un **Bounded Context** est une frontière explicite à l'intérieur de laquelle un
      modèle (et son vocabulaire) est valide. Le mot « Client » change de sens selon le
      contexte : plutôt qu'un modèle unique qui tenterait (mal) de tout représenter, le
      DDD assume **deux** `Client` distincts, chacun dans son contexte.
---

Deux questions sur les invariants d'un agrégat et le découpage en bounded contexts.
