---
title: Cartes mémo — DDD
type: flashcards
cards:
  - q: |
      Quelle est la différence fondamentale entre une *Entity* et un *Value Object* ?
    a: |
      L'**Entity** a une **identité** : deux factures aux mêmes montants restent deux
      factures différentes (id distincts), et son état peut évoluer. Le **Value Object**
      n'a **pas d'identité** : il est défini uniquement par ses valeurs, est **immuable**,
      et deux VO de mêmes valeurs sont interchangeables (deux `Montant(100,'EUR')` sont
      « égaux »).
  - q: |
      Hexagonal et DDD : lequel dit « où mettre le code » et lequel dit « comment
      modéliser le métier » ?
    a: |
      **Hexagonal** dit **où** (couches, ports/adapters, sens des dépendances). **DDD**
      dit **comment modéliser** (entities, value objects, aggregates, langage
      ubiquitaire). On combine souvent les deux : DDD remplit le cœur que l'hexagonal
      isole.
  - q: |
      Pourquoi le DDD serait-il une mauvaise idée pour un simple CRUD ?
    a: |
      Parce que le DDD a un **coût élevé** (multiplication des classes, mapping
      domaine↔persistance, apprentissage) qui ne se rentabilise que face à une **vraie
      complexité métier**. Sur un CRUD sans règles riches, il n'y a rien à protéger ni à
      modéliser : Eloquent + contrôleurs suffisent. Appliquer DDD ici = sur-ingénierie.
---

Lis, réfléchis, révèle, auto-évalue.
