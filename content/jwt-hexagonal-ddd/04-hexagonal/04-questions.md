---
title: Questions de compréhension — Hexagonal
type: lesson
---

**Question :** Dans quel sens pointent les dépendances, et pourquoi est-ce contre-intuitif ?

**Réponse :** Toujours **vers le centre (le métier)**. C'est contre-intuitif parce que naturellement on dirait « mon service utilise MySQL, donc il dépend de MySQL ». L'hexagonal **inverse** : le métier définit une *interface* (port), et c'est l'adapter base de données qui dépend de cette interface. Le métier ne connaît jamais l'infra.

**Question :** Quelle est la différence entre un *port* et un *adapter* ?

**Réponse :** Un **port** est un **contrat (interface)** défini par le cœur — « j'ai besoin de pouvoir sauvegarder une facture ». Un **adapter** est une **implémentation concrète** de ce contrat — `EloquentFactureRepository`, `InMemoryFactureRepository`, etc. Un port peut avoir plusieurs adapters.

**Question :** Quel outil de Laravel joue le rôle de « machine à brancher » les adapters sur les ports ?

**Réponse :** Le **Service Container** (IoC container), configuré dans les **Service Providers** via `$this->app->bind(Interface::class, Implementation::class)`. C'est lui qui injecte le bon adapter quand le cœur demande l'interface.
