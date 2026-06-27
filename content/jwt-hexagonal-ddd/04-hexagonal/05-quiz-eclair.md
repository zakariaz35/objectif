---
title: Quiz éclair — Hexagonal
type: quiz
questions:
  - prompt: |
      Qu'est-ce qu'un *port* en architecture hexagonale ?
    options:
      - "Une implémentation concrète (ex. EloquentFactureRepository)"
      - "Un contrat (interface) défini par le cœur métier"
      - "Un numéro de port réseau exposé par l'application"
    answer: 1
    explanation: >
      Un port est une **interface** définie par le métier (« j'ai besoin de pouvoir
      sauvegarder une facture »). L'**adapter** en est l'implémentation concrète ; un
      port peut avoir plusieurs adapters.
  - prompt: |
      Quel mécanisme de Laravel « branche » un adapter concret sur un port (interface) ?
    options:
      - "Le Service Container, configuré dans les Service Providers (bind)"
      - "Le système de middlewares HTTP"
      - "Les migrations de base de données"
    answer: 0
    explanation: >
      Le Service Container (IoC) : `$this->app->bind(Interface::class, Implementation::class)`
      dans un Service Provider. Il injecte le bon adapter quand le cœur demande l'interface.
---

Deux questions sur les ports, adapters et l'injection de dépendances.
