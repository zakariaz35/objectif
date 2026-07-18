---
title: "Quiz — Tests & Qualité"
type: quiz
questions:
  - prompt: |
      Vous écrivez un test Feature qui crée des données avec une Factory, teste un
      endpoint API, puis vérifie la base. Au test suivant, la base doit être vierge.
      Quel trait utilisez-vous dans `Pest.php` ?
    options:
      - "`uses(DatabaseTransactions::class)->in('Feature')` — plus rapide car rollback SQL."
      - "`uses(RefreshDatabase::class)->in('Feature')` — garantit un état propre par recréation des tables."
      - "Aucun des deux : il suffit d'appeler `$this->artisan('migrate:fresh')` dans `beforeEach`."
      - "`uses(DatabaseMigrations::class)->in('Feature')` — relance toutes les migrations."
    answer: 1
    tags: [laravel, pest, tests]
    level: debutant
    explanation: >
      `RefreshDatabase` est le trait recommandé pour les Feature tests. Il recrée les
      tables à chaque test (ou utilise des transactions quand c'est possible). L'option
      A (`DatabaseTransactions`) est plus rapide mais peut causer des problèmes avec les
      jobs qui s'exécutent hors transaction. Appeler `migrate:fresh` dans `beforeEach`
      (option 3) est extrêmement lent. `DatabaseMigrations` relance les migrations et est
      identique à `RefreshDatabase` en pratique, les deux sont valides ; Laravel recommande
      `RefreshDatabase`.
  - prompt: |
      Dans un test Pest, quelle assertion vérifie qu'un objet retourné par l'API
      ne contient PAS la clé `password` ?
    options:
      - "`->assertJsonMissing(['password'])`"
      - "`->assertJsonDontHave('password')`"
      - "`->assertJsonPath('password', null)`"
      - "`->assertJson(['password' => null])`"
    answer: 0
    tags: [laravel, tests, securite]
    level: debutant
    explanation: >
      `assertJsonMissing(['password'])` vérifie que la clé `password` n'est pas présente
      dans la réponse JSON — important pour les audits de sécurité. `assertJsonPath('password', null)`
      (option 3) échouerait si la clé est absente, ce qui inverse le test. `assertJson(['password' => null])`
      (option 4) vérifierait que la clé EST présente avec `null` comme valeur — exactement l'opposé.
  - prompt: |
      Quelle commande Pint est adaptée à une CI pour vérifier la conformité sans
      modifier les fichiers ?
    options:
      - "`./vendor/bin/pint --dry-run`"
      - "`./vendor/bin/pint --test`"
      - "`./vendor/bin/pint --check`"
      - "`./vendor/bin/pint --ci`"
    answer: 1
    tags: [laravel, qualite, pint]
    level: debutant
    explanation: >
      `./vendor/bin/pint --test` vérifie les fichiers sans les modifier et retourne un
      code de sortie non-zéro si des fichiers ne sont pas conformes — parfait pour
      faire échouer une CI. `--dry-run` n'existe pas dans Pint. `--check` non plus.
  - prompt: |
      `./vendor/bin/phpstan analyse` remonte de nombreuses erreurs sur `Auth::user()`
      dans vos controllers, indiquant qu'il peut retourner `null`. Comment gérer cela
      proprement sans simplement ignorer toutes ces erreurs ?
    options:
      - "Utiliser `Auth::user()!` (non-null assertion) partout pour forcer le type."
      - "Vérifier via le middleware `auth` que l'utilisateur est connecté avant d'atteindre le controller, puis faire confiance à `@var User $user = auth()->user()`."
      - "Désactiver la vérification nullable dans `phpstan.neon` pour le type `User|null`."
      - "Passer à PHPUnit pur qui ne vérifie pas les types nullables."
    answer: 1
    tags: [laravel, qualite, larastan]
    level: intermediaire
    explanation: >
      La bonne approche : le middleware `auth` garantit qu'un utilisateur est connecté.
      Dans le controller, `$request->user()` est garanti non-null. On peut annoter
      `/** @var User $user */` ou utiliser `$request->user()` typé si Larastan le reconnaît.
      `Auth::user()!` (option 1) est une suppression d'erreur, pas une correction.
      Désactiver les vérifications nullable (option 3) affaiblit l'analyse statique.
  - prompt: |
      Vous voulez tester qu'un job `SendPdfInvoice` est bien mis en queue après la
      création d'une facture, sans l'exécuter réellement. Que faites-vous en début de test ?
    options:
      - "`Queue::fake()` puis `Queue::assertPushed(SendPdfInvoice::class)` après l'action."
      - "`Queue::disable()` puis vérifier que le job n'a pas été exécuté."
      - "Configurer `QUEUE_CONNECTION=null` dans `.env.testing`."
      - "Mocker `SendPdfInvoice` avec `$this->mock(SendPdfInvoice::class)`."
    answer: 0
    tags: [laravel, queues, tests]
    level: intermediaire
    explanation: >
      `Queue::fake()` remplace le driver de queue par un faux qui intercepte les dispatches
      sans les exécuter. `Queue::assertPushed(SendPdfInvoice::class)` vérifie ensuite que
      le job a bien été envoyé en queue. C'est l'équivalent de `EventDispatcherMock` en
      Symfony pour Messenger. `QUEUE_CONNECTION=null` (option 3) est possible mais moins
      expressif : il ne permet pas d'asserter sur les jobs spécifiques qui ont été envoyés.
