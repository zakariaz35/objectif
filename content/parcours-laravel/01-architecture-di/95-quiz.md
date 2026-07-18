---
title: "Quiz — Architecture & DI"
type: quiz
questions:
  - prompt: |
      Vous créez un Service Provider et devez appeler `app()->make(MailerInterface::class)`
      pour configurer un observer Eloquent. Dans quelle méthode du Provider placez-vous
      ce code ?
    options:
      - "`register()` : c'est là que tout le wiring DI se fait."
      - "`boot()` : tous les providers sont enregistrés à ce stade, le container est complet."
      - "Les deux sont équivalents, l'ordre n'a pas d'importance en Laravel."
      - "Dans le constructeur du Provider, avant `register()`."
    answer: 1
    tags: [laravel, di, service-provider]
    level: intermediaire
    explanation: >
      `register()` est exécuté avant tous les `boot()`. Si vous appelez `make()` dans
      `register()`, vous risquez de résoudre un service dont le binding n'a pas encore
      été enregistré par un autre Provider. `boot()` est la bonne méthode dès qu'on a
      besoin d'un service déjà résolu.
  - prompt: |
      Dans un projet d'agence, un collègue écrit toute la logique métier avec des appels
      à `Cache::put()`, `DB::table()`, `Mail::send()` dans des classes de service.
      Quel problème cela pose-t-il principalement ?
    options:
      - "Les Facades sont dépréciées en Laravel 13, il faut les remplacer."
      - "Les dépendances sont invisibles dans le constructeur, ce qui complique les tests unitaires et l'analyse statique."
      - "Aucun problème : les Facades sont testables via `::fake()`, c'est la bonne pratique Laravel."
      - "Les Facades ne fonctionnent pas dans les classes hors Controllers."
    answer: 1
    tags: [laravel, facades, testabilite]
    level: intermediaire
    explanation: >
      Les Facades ne sont pas dépréciées (option 1 fausse). Elles fonctionnent partout
      (option 4 fausse). `::fake()` les rend testables (option 3 partiellement vraie).
      Le vrai problème est que les dépendances sont cachées : un lecteur ne sait pas de
      quoi la classe a besoin sans lire tout le code. L'injection explicite dans le
      constructeur documente les dépendances et facilite les mocks classiques.
  - prompt: |
      Vous souhaitez que `PaymentGateway` (interface) soit résolu par `StripeGateway`
      (implémentation). Où écrivez-vous le binding en Laravel ?
    options:
      - "Dans `config/app.php`, clé `bindings`."
      - "Dans un attribut PHP `#[Bind(PaymentGateway::class)]` sur la classe."
      - "Dans `AppServiceProvider::register()` via `$this->app->bind(PaymentGateway::class, StripeGateway::class)`."
      - "Laravel résout automatiquement les interfaces, aucune configuration n'est nécessaire."
    answer: 2
    tags: [laravel, di, interfaces]
    level: debutant
    explanation: >
      Laravel ne peut pas deviner quelle implémentation utiliser pour une interface (il
      peut y en avoir plusieurs). Le binding doit être déclaré manuellement dans
      `AppServiceProvider::register()` (ou tout autre Service Provider). Les attributs
      PHP de binding n'existent pas nativement dans Laravel (option 2 fausse).
  - prompt: |
      En Symfony, `bin/console` liste toutes les commandes. Quel est l'équivalent exact
      en Laravel ?
    options:
      - "`php artisan list`"
      - "`php artisan`"
      - "`./artisan help`"
      - "`php artisan commands`"
    answer: 1
    tags: [laravel, artisan, symfony]
    level: debutant
    explanation: >
      `php artisan` seul affiche la liste des commandes disponibles (équivalent de
      `bin/console` sans argument). `php artisan list` est également valide et plus
      explicite. `php artisan help <command>` donne le détail d'une commande spécifique.
  - prompt: |
      Quelle déclaration dans `bootstrap/app.php` (Laravel 13) permet d'associer des
      middleware globaux, équivalent au `src/Kernel.php` de Symfony ?
    options:
      - "`Application::configure()->withMiddleware(function (Middleware $m) { ... })`"
      - "`Application::registerMiddleware([...])` dans `AppServiceProvider::boot()`"
      - "Les middlewares globaux sont déclarés dans `config/middleware.php`."
      - "Un fichier `app/Http/Kernel.php` héritant de `HttpKernel`, comme Symfony."
    answer: 0
    tags: [laravel, middleware, architecture]
    level: intermediaire
    explanation: >
      Laravel 13 utilise le fluent builder `Application::configure()` dans
      `bootstrap/app.php`. Le callback `withMiddleware()` reçoit un objet `Middleware`
      pour enregistrer les middlewares globaux, de groupe et d'alias. L'ancien fichier
      `app/Http/Kernel.php` existait dans Laravel <= 10 mais a été supprimé.
