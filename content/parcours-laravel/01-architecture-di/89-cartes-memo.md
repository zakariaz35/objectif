---
title: "Cartes mémo — Architecture & DI"
type: flashcards
cards:
  - q: |
      Quelle est la différence entre `register()` et `boot()` dans un Service Provider ?
    a: |
      **`register()`** : uniquement des bindings dans le container. À ce stade, les
      autres providers n'ont peut-être pas encore tourné — ne pas appeler `app()->make()`
      vers d'autres services.

      **`boot()`** : tous les providers ont été enregistrés, le container est complet.
      C'est ici qu'on configure des observers Eloquent, des macros Blade, des listeners
      d'events, etc.
  - q: |
      En Symfony je déclare mes services dans `services.yaml`. Où le fais-je en Laravel ?
    a: |
      Nulle part pour les cas simples : **toute classe dans `app/` est auto-résolue** par
      autowiring. Le binding explicite n'est nécessaire que pour lier une **interface à
      une implémentation** (dans `AppServiceProvider::register()`).
  - q: |
      Qu'est-ce qu'une Facade Laravel ? Est-ce un vrai singleton statique ?
    a: |
      Non. C'est un **proxy statique** vers un service du container. `Cache::get('k')`
      résout `CacheRepository` via `app()` puis lui délègue l'appel. Testable via
      `Cache::fake()` qui substitue l'implémentation dans le container.
  - q: |
      Quelle est l'équivalence entre Service Provider Laravel et les composants Symfony ?
    a: |
      Un Service Provider ≈ un **Bundle** (découverte, registration) + une **Extension**
      (`register()`) + un **CompilerPass** (`boot()`). C'est le seul endroit où on
      configure le container et où on branche les comportements transverses.
  - q: |
      Pourquoi préférer l'injection explicite aux Facades dans les classes métier ?
    a: |
      Avec l'injection explicite, les dépendances sont **visibles dans le constructeur**,
      donc documentées, traçables par les outils d'analyse statique et mockables sans
      magie. Les Facades cachent les dépendances et rendent le code plus difficile à
      tester unitairement sans `::fake()`.
