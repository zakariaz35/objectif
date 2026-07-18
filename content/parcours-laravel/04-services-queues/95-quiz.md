---
title: "Quiz — Services, Events & Queues"
type: quiz
questions:
  - prompt: |
      Un développeur veut envoyer un email de confirmation après un paiement, sans
      bloquer la réponse HTTP. Il crée un `InvoicePaidListener` qui implémente
      `ShouldQueue`. Que se passe-t-il lorsque `InvoicePaid::dispatch($invoice)` est
      appelé dans le controller ?
    options:
      - "L'email est envoyé immédiatement dans le même processus, `ShouldQueue` n'a pas d'effet ici."
      - "Le job du listener est sérialisé et placé dans la queue ; un worker séparé l'exécutera de manière asynchrone."
      - "Une exception `QueueNotConfiguredException` est levée si aucun driver n'est défini."
      - "Laravel exécute le listener en arrière-plan via PHP-FPM, sans worker séparé."
    answer: 1
    tags: [laravel, events, queues]
    level: debutant
    explanation: >
      Quand un listener implémente `ShouldQueue`, Laravel sérialise le job (y compris
      le modèle grâce à `SerializesModels`) et le place dans la queue configurée. Un
      processus worker séparé (`php artisan queue:work`) le dépilera et exécutera la
      méthode `handle()`. Si `QUEUE_CONNECTION=sync`, le job s'exécute quand même
      synchroniquement (utile en test), donc l'option 3 est fausse.
  - prompt: |
      Vous utilisez le driver de queue `database`. Quelle commande génère la migration
      de la table `jobs` ?
    options:
      - "`php artisan migrate:jobs`"
      - "`php artisan queue:table && php artisan migrate`"
      - "`php artisan make:migration create_jobs_table`"
      - "La table est créée automatiquement au premier dispatch."
    answer: 1
    tags: [laravel, queues, migrations]
    level: debutant
    explanation: >
      `php artisan queue:table` génère le fichier de migration pour la table `jobs`
      (et `failed_jobs`). Il faut ensuite `php artisan migrate` pour créer les tables.
      La création automatique (option 4) n'existe pas dans Laravel.
  - prompt: |
      Dans une Policy, une méthode retourne `false`. Que retourne le controller qui
      appelle `$this->authorize('update', $invoice)` ?
    options:
      - "Une exception `AuthorizationException` est levée et doit être attrapée manuellement."
      - "Une réponse HTTP 403 Forbidden est automatiquement retournée par le handler d'exceptions."
      - "Une réponse HTTP 401 Unauthorized est retournée (non authentifié)."
      - "Le controller continue et `authorize()` retourne `false` comme valeur de retour."
    answer: 1
    tags: [laravel, policies, autorisation]
    level: debutant
    explanation: >
      `$this->authorize()` lance une `AuthorizationException` si la Policy retourne
      `false`. Le handler d'exceptions de Laravel transforme automatiquement cette
      exception en réponse 403. Le développeur n'a pas à attraper l'exception.
      401 (option 3) signifie non authentifié — c'est le middleware `auth` qui le gère.
  - prompt: |
      Quelle est la différence entre `Event::dispatch()` (Facade), `event()` (helper)
      et `InvoicePaid::dispatch()` (méthode statique) ?
    options:
      - "Les trois sont équivalents en runtime ; le choix est une question de style."
      - "`Event::dispatch()` est synchrone, `InvoicePaid::dispatch()` est toujours asynchrone."
      - "`event()` est déprécié en Laravel 13."
      - "`InvoicePaid::dispatch()` nécessite d'implémenter `ShouldBroadcast`."
    answer: 0
    tags: [laravel, events, facades]
    level: intermediaire
    explanation: >
      Les trois syntaxes font exactement la même chose. `InvoicePaid::dispatch()` est
      disponible grâce au trait `Dispatchable`. Le caractère synchrone ou asynchrone
      dépend des listeners enregistrés (s'ils implémentent `ShouldQueue` ou non), pas
      de la façon dont l'event est dispatché. Aucune des trois n'est dépréciée.
  - prompt: |
      Un Job Laravel définit `public int $tries = 3` et `public int $backoff = 60`.
      Que se passe-t-il si la méthode `handle()` lève une exception au 3ème essai ?
    options:
      - "Le job est automatiquement réessayé une 4ème fois après 60 secondes."
      - "Le job est déplacé dans la table `failed_jobs` et la méthode `failed()` est appelée si elle existe."
      - "Le job est supprimé silencieusement de la queue sans notification."
      - "Le worker s'arrête et attend une intervention manuelle."
    answer: 1
    tags: [laravel, queues, erreurs]
    level: intermediaire
    explanation: >
      Après l'épuisement des `$tries`, Laravel déplace le job dans la table `failed_jobs`
      (accessible via `php artisan queue:failed`). La méthode `failed(Throwable $e)` du
      Job est appelée si elle est définie — c'est là qu'on logue, notifie, etc. Le worker
      ne s'arrête pas ; il continue de consommer les autres jobs.
