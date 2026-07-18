---
title: "Cartes mémo — Services, Events & Queues"
type: flashcards
cards:
  - q: |
      Comment rendre un Listener Laravel asynchrone (exécuté en arrière-plan) ?
    a: |
      Implémenter l'interface `ShouldQueue` sur la classe Listener. Aucune autre
      modification nécessaire : Laravel détecte l'interface et place le listener dans
      la queue au lieu de l'exécuter synchroniquement.

      Optionnel : déclarer `$queue`, `$tries`, `$backoff`, et une méthode `failed()`.
  - q: |
      Quelle est l'équivalence entre un Job Laravel et les composants Symfony Messenger ?
    a: |
      | Messenger | Laravel |
      |---|---|
      | Message class | Job class (implement ShouldQueue) |
      | MessageHandler | méthode `handle()` du Job |
      | `$bus->dispatch(msg)` | `Job::dispatch(...)` |
      | `messenger:consume` | `php artisan queue:work` |
      | Transport DSN | `QUEUE_CONNECTION` dans `.env` |
  - q: |
      Quelle est la différence entre Sanctum et Passport ?
    a: |
      **Sanctum** : authentification légère pour SPA et API internes. Supporte les
      cookies de session (SPA same-domain) et les tokens opaques en base. Simple,
      rapide, sans OAuth2.

      **Passport** : implémentation complète d'un serveur OAuth2 (Authorization Code,
      Client Credentials, Password Grant…). À utiliser si vous construisez une plateforme
      exposant une API à des tiers.
  - q: |
      Qu'est-ce qu'une Policy Laravel ? À quoi correspond-elle en Symfony ?
    a: |
      Une Policy est une classe dédiée à l'**autorisation** sur un modèle : chaque
      méthode (`view`, `update`, `delete`…) retourne un booléen pour une permission.

      Équivalent Symfony : un **Voter**. Mais sans `supportsClass()`, sans
      `voteOnAttribute()`, sans constantes `ACCESS_*`. Plus direct : une méthode = une
      permission.
  - q: |
      Comment créer un token Sanctum avec des capacités limitées (abilities) ?
    a: |
      ```php
      $token = $user->createToken(
          name: 'mobile-app',
          abilities: ['invoices:read'],
          expiresAt: now()->addDays(30),
      )->plainTextToken;
      ```
      Dans le controller/middleware, vérifier : `$request->user()->tokenCan('invoices:read')`.
      Cela équivaut aux `scopes` OAuth2 de Passport ou aux `roles` Symfony Security.
