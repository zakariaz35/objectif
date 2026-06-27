---
title: Questions de compréhension — DDD
type: lesson
---

**Question :** Quelle est la différence fondamentale entre une *Entity* et un *Value Object* ?

**Réponse :** L'**Entity** a une **identité** : deux factures avec les mêmes montants restent deux factures différentes (id distincts), et son état peut évoluer dans le temps. Le **Value Object** n'a **pas d'identité** : il est défini uniquement par ses valeurs, est **immuable**, et deux VO de mêmes valeurs sont interchangeables (deux `Montant(100,'EUR')` sont « égaux »).

**Question :** Pourquoi force-t-on à passer par la racine d'un agrégat (Aggregate Root) ?

**Réponse :** Pour **garantir les invariants** (les règles qui doivent toujours rester vraies). La racine est la seule porte d'entrée : elle peut vérifier les conditions avant toute modification (ex. interdire d'ajouter une ligne à une commande validée). Si on pouvait modifier les objets internes directement, n'importe qui pourrait violer une règle métier sans contrôle.

**Question :** Hexagonal et DDD : lequel dit « où mettre le code » et lequel dit « comment modéliser le métier » ?

**Réponse :** **Hexagonal** dit **où** (couches, ports/adapters, sens des dépendances). **DDD** dit **comment modéliser** (entities, value objects, aggregates, langage ubiquitaire). On combine souvent les deux : DDD remplit le cœur que l'hexagonal isole.

**Question :** Pourquoi le DDD serait-il une mauvaise idée pour un simple CRUD ?

**Réponse :** Parce que le DDD a un **coût élevé** (multiplication des classes, mapping domaine↔persistance, apprentissage) qui ne se rentabilise que face à une **vraie complexité métier**. Sur un CRUD sans règles riches, il n'y a rien à protéger ni à modéliser : Eloquent + contrôleurs font le travail. Appliquer DDD ici = sur-ingénierie pure.
