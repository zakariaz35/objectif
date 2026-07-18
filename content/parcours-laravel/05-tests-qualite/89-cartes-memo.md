---
title: "Cartes mémo — Tests & Qualité"
type: flashcards
cards:
  - q: |
      Quelle est la relation entre Pest et PHPUnit en Laravel ?
    a: |
      Pest est une **couche DSL** construite au-dessus de PHPUnit. Il utilise PHPUnit
      en interne mais propose une syntaxe fonctionnelle plus expressive (`it(...)`,
      `expect(...)->toBe(...)`). Les deux syntaxes sont compatibles et peuvent coexister
      dans le même projet.
  - q: |
      Quelle est la différence entre `RefreshDatabase` et `DatabaseTransactions` ?
    a: |
      **`RefreshDatabase`** : recrée toutes les tables (migrations) avant chaque test.
      Plus lent, état garanti propre, compatible avec tout type de test.

      **`DatabaseTransactions`** : enroule chaque test dans une transaction SQL rollbackée.
      Beaucoup plus rapide, mais ne fonctionne pas avec les jobs de queue (qui s'exécutent
      dans un autre processus et ne voient pas la transaction).
  - q: |
      Comment simuler un utilisateur Sanctum authentifié dans un test Feature ?
    a: |
      ```php
      $this->actingAs($user, 'sanctum')
           ->getJson(route('api.invoices.index'))
           ->assertOk();
      ```
      Le second argument `'sanctum'` précise le guard. Sans lui, Laravel utilise
      le guard par défaut (souvent `'web'`). Aucun token réel n'est créé.
  - q: |
      À quoi sert `php artisan about` ?
    a: |
      Affiche un résumé de l'état du projet : version PHP, version Laravel, drivers
      configurés (cache, queue, mail, session, DB), cache compilé ou non. Équivalent
      de `bin/console debug:container --show-arguments` pour une vue rapide du runtime.
  - q: |
      Quelle est la différence entre Larastan et PHPStan nu pour un projet Laravel ?
    a: |
      PHPStan nu génère de nombreux **faux positifs** sur du code Laravel : appels
      magiques (`Auth::user()` peut retourner null), méthodes dynamiques d'Eloquent
      (`Invoice::where()`), helpers globaux. Larastan est PHPStan + un **plugin officiel**
      qui connaît ces patterns et supprime les faux positifs, rendant l'analyse utile
      dès le niveau 5.
