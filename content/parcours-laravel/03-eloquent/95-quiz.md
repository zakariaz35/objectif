---
title: "Quiz — Eloquent ORM"
type: quiz
questions:
  - prompt: |
      Un développeur écrit ce code dans un controller :

      ```php
      $clients = Client::all();
      foreach ($clients as $client) {
          echo $client->country->name;
      }
      ```

      Quel problème cela provoque-t-il, et comment le corriger ?
    options:
      - "Aucun problème : Eloquent met en cache les relations automatiquement."
      - "Problème N+1 : 1 requête pour les clients + 1 par client pour le pays. Corriger avec `Client::with('country')->get()`."
      - "Une exception `LazyLoadingException` est levée en production."
      - "Le code est correct mais lent car Eloquent n'utilise pas de JOIN."
    answer: 1
    tags: [eloquent, n+1, performance]
    level: debutant
    explanation: >
      Sans `with('country')`, chaque accès à `$client->country` déclenche une requête
      SQL séparée. Avec 100 clients, c'est 101 requêtes. `Client::with('country')->get()`
      utilise 2 requêtes : une pour les clients, une pour tous les pays associés, puis
      Eloquent assemble les résultats en mémoire. Laravel peut lever
      `LazyLoadingViolationException` si `Model::preventLazyLoading()` est activé
      (option 3 partiellement vraie, mais pas le comportement par défaut).
  - prompt: |
      Quelle est la différence entre `$invoice->save()` et `Invoice::create($data)` ?
    options:
      - "`save()` fait un INSERT, `create()` fait un UPDATE."
      - "`create()` utilise `$fillable` pour filtrer les champs ; `save()` directement sur un objet ne passe pas par `$fillable`."
      - "Les deux sont identiques, `create()` est juste un raccourci de `new Invoice(); $invoice->fill($data); $invoice->save()`."
      - "`create()` est déprécié en Laravel 13, il faut utiliser `save()`."
    answer: 2
    tags: [eloquent, active-record]
    level: debutant
    explanation: >
      `Invoice::create($data)` est un raccourci pour `new Invoice(); fill($data); save()`.
      La différence importante est que `create()` passe les données par `$fillable`
      (mass assignment protection). `$invoice->fill($data)` fait la même chose. En
      revanche, assigner directement `$invoice->admin = true; $invoice->save()` contourne
      `$fillable`. `create()` n'est pas déprécié.
  - prompt: |
      Vous avez une relation `Invoice` belongsTo `Client`. Quelle convention Eloquent
      nomme la clé étrangère si vous n'en spécifiez pas ?
    options:
      - "`invoice_id` sur la table `clients`"
      - "`client_id` sur la table `invoices` (nom_relation + _id)"
      - "`clientId` en camelCase sur la table `invoices`"
      - "Eloquent cherche `id_client` par défaut (préfixe `id_`)"
    answer: 1
    tags: [eloquent, relations, conventions]
    level: debutant
    explanation: >
      La convention Eloquent pour `belongsTo(Client::class)` est de chercher la colonne
      `client_id` (nom de la méthode de relation + `_id`) sur la table courante
      (`invoices`). Pour `hasMany(InvoiceLine::class)`, la convention inverse cherche
      `invoice_id` sur la table `invoice_lines`. Ces conventions peuvent toujours être
      surchargées en passant les clés explicitement.
  - prompt: |
      Vous voulez générer une Factory pour `Invoice` et pré-remplir la relation `client`.
      Quelle déclaration dans `InvoiceFactory::definition()` permet de créer
      automatiquement un `Client` associé si aucun n'est fourni ?
    options:
      - "`'client_id' => Client::factory()`"
      - "`'client_id' => Client::factory()->create()->id`"
      - "`'client' => Client::factory()`"
      - "`'client_id' => fn () => Client::first()->id`"
    answer: 0
    tags: [eloquent, factories, tests]
    level: intermediaire
    explanation: >
      `'client_id' => Client::factory()` est la syntaxe correcte. Laravel résout la
      factory imbriquée au moment du `create()` : si un `client_id` est passé
      explicitement, il l'utilise ; sinon il crée un `Client` avec sa propre factory.
      `->create()->id` (option 2) crée toujours un Client en base, même si un
      `client_id` est fourni — ce n'est pas le comportement souhaité.
  - prompt: |
      Dans un `InvoiceResource`, vous utilisez `$this->whenLoaded('client')`. Que
      retourne cette expression si la relation `client` n'a PAS été eager-loadée ?
    options:
      - "Une exception `RelationNotLoadedException`."
      - "La clé `client` est absente du JSON retourné (omise silencieusement)."
      - "`null` est retourné pour la clé `client`."
      - "Eloquent déclenche une requête lazy pour charger la relation."
    answer: 1
    tags: [eloquent, api-resources, n+1]
    level: intermediaire
    explanation: >
      `whenLoaded()` omet complètement la clé du JSON si la relation n'est pas chargée.
      C'est le comportement intentionnel : le client de l'API ne voit pas une valeur
      `null` (qui pourrait signifier « client inexistant ») mais l'absence de la clé
      (qui signifie « non demandé »). Cela évite aussi les requêtes N+1 par réflexe,
      car si la relation n'est pas dans le JSON, personne ne peut en dépendre.
