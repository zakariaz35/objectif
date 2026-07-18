---
title: "Quiz — Routing & HTTP"
type: quiz
questions:
  - prompt: |
      Un controller reçoit une `StoreProductRequest` en paramètre. Le client envoie
      le champ `is_admin = true` en plus des champs normaux. Que retourne
      `$request->validated()` ?
    options:
      - "Tous les champs envoyés par le client, y compris `is_admin`."
      - "Uniquement les champs déclarés dans `rules()`, sans `is_admin`."
      - "Une exception `MassAssignmentException` est levée."
      - "`$request->validated()` retourne les données brutes non filtrées."
    answer: 1
    tags: [laravel, form-request, securite]
    level: debutant
    explanation: >
      `$request->validated()` retourne exclusivement les champs qui ont une règle dans
      `rules()`. Un champ `is_admin` non déclaré dans `rules()` est silencieusement
      ignoré. C'est la protection contre la sur-attribution (mass assignment) au niveau
      de la validation — avant même d'atteindre Eloquent.
  - prompt: |
      Un développeur déclare `Route::resource('articles', ArticleController::class)`.
      Combien de routes sont enregistrées, et quelle action est absente de
      `Route::apiResource()` ?
    options:
      - "5 routes avec `resource`, 7 avec `apiResource` ; `apiResource` ajoute `create` et `edit`."
      - "7 routes avec `resource` ; `apiResource` en génère 5, sans `create` ni `edit` (formulaires HTML inutiles pour une API)."
      - "Les deux génèrent 7 routes identiques."
      - "7 routes avec `resource`, mais `apiResource` n'existe pas en Laravel."
    answer: 1
    tags: [laravel, routing, api]
    level: debutant
    explanation: >
      `Route::resource()` génère 7 routes : index, create (formulaire), store, show,
      edit (formulaire), update, destroy. `Route::apiResource()` en génère 5 en
      supprimant `create` et `edit` — ces deux actions servent uniquement à afficher des
      formulaires HTML, inutiles pour une API JSON qui n'a pas de concept de "formulaire".
  - prompt: |
      Vous voulez que la route `GET /articles/{article:slug}` résolve le modèle
      `Article` par sa colonne `slug` plutôt que par `id`. Quelle est la syntaxe correcte ?
    options:
      - "`Route::get('/articles/{article}', ...)->where('article', 'slug');`"
      - "`Route::get('/articles/{article:slug}', [ArticleController::class, 'show']);`"
      - "Il faut surcharger `resolveRouteBinding()` dans le modèle, la syntaxe de route ne suffit pas."
      - "`Route::get('/articles/{article}', ...)->bind('slug');`"
    answer: 1
    tags: [laravel, routing, model-binding]
    level: intermediaire
    explanation: >
      La syntaxe `{article:slug}` est le raccourci pour le binding par colonne
      personnalisée. Laravel effectue `Article::where('slug', $value)->firstOrFail()`
      automatiquement. La surcharge de `resolveRouteBinding()` (option 3) est possible
      mais réservée aux cas plus complexes ; la syntaxe inline est préférable ici.
  - prompt: |
      Dans `authorize()` d'un `FormRequest`, que se passe-t-il si la méthode retourne
      `false` ?
    options:
      - "La validation `rules()` n'est pas exécutée et une réponse 422 est retournée."
      - "Une réponse 403 Forbidden est retournée automatiquement, avant même d'exécuter `rules()`."
      - "Une exception `AuthorizationException` est levée que le développeur doit attraper."
      - "Le comportement dépend du middleware `auth` : si absent, `false` est ignoré."
    answer: 1
    tags: [laravel, form-request, autorisation]
    level: intermediaire
    explanation: >
      Laravel vérifie `authorize()` avant `rules()`. Si `false`, une
      `AuthorizationException` est automatiquement transformée en réponse HTTP 403.
      Le développeur n'a pas à l'attraper manuellement — le handler d'exceptions de
      Laravel s'en charge. Les règles de validation ne sont jamais évaluées.
  - prompt: |
      Vous souhaitez appliquer le middleware `auth` à toutes les routes d'un groupe
      et préfixer leurs noms par `admin.`. Quelle est la syntaxe Laravel correcte ?
    options:
      - |
        ```php
        Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
            Route::resource('users', Admin\UserController::class);
        });
        ```
      - |
        ```php
        Route::group(['middleware' => 'auth', 'prefix' => 'admin'], function () {
            Route::resource('users', Admin\UserController::class);
        });
        ```
      - "Les deux syntaxes sont valides et équivalentes."
      - "Il faut déclarer le préfixe dans `config/routes.php`, pas dans `web.php`."
    answer: 2
    tags: [laravel, routing, groupes]
    level: debutant
    explanation: >
      Les deux syntaxes sont valides. La syntaxe fluente (option A) est plus lisible et
      préférable dans le code moderne. La syntaxe tableau (option B) est l'ancienne façon,
      toujours supportée. Dans les deux cas, `name('admin.')` préfixe les noms de routes
      générés par `resource()`, ce qui donne `admin.users.index`, `admin.users.store`, etc.
