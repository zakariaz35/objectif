---
title: "Exercice — Suite de tests Feature complète"
type: exercise
---

## Énoncé

Vous reprenez un projet existant. L'endpoint `POST /api/v1/invoices` est censé :
- Nécessiter l'authentification Sanctum.
- Valider les données (`client_id`, `amount`, `due_date`).
- Créer la facture en base avec le statut `draft`.
- Dispatcher un event `InvoiceCreated`.
- Retourner un `InvoiceResource` avec le statut HTTP 201.

**Écrivez une suite de tests Pest** couvrant :

1. Un utilisateur non authentifié reçoit 401.
2. Des données invalides retournent 422 avec les erreurs de validation.
3. Des données valides créent la facture en base et retournent 201.
4. L'event `InvoiceCreated` est bien dispatché après création.
5. La réponse JSON ne contient pas le champ `user_id`.

<!--correction-->

## Correction

```php
// tests/Feature/Api/CreateInvoiceTest.php
<?php

use App\Events\InvoiceCreated;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Support\Facades\Event;

// Données de setup réutilisées dans tous les tests du fichier
beforeEach(function () {
    $this->user   = User::factory()->create();
    $this->client = Client::factory()->for($this->user)->create();
    $this->validPayload = [
        'client_id' => $this->client->id,
        'amount'    => 250.00,
        'due_date'  => now()->addDays(30)->toDateString(),
    ];
});

// Test 1 : authentification requise
it('returns 401 for unauthenticated requests', function () {
    $this->postJson(route('api.v1.invoices.store'), $this->validPayload)
         ->assertUnauthorized();
});

// Test 2 : validation
it('returns 422 with validation errors for invalid data', function () {
    $this->actingAs($this->user, 'sanctum')
         ->postJson(route('api.v1.invoices.store'), [
             'client_id' => 99999,   // n'existe pas
             'amount'    => -10,     // négatif
             'due_date'  => 'invalid-date',
         ])
         ->assertUnprocessable()
         ->assertJsonValidationErrors(['client_id', 'amount', 'due_date']);
});

// Test 3 : création
it('creates an invoice and returns 201 with valid data', function () {
    Event::fake();

    $this->actingAs($this->user, 'sanctum')
         ->postJson(route('api.v1.invoices.store'), $this->validPayload)
         ->assertCreated()
         ->assertJsonPath('data.status', 'draft')
         ->assertJsonPath('data.amount', 250.00);

    $this->assertDatabaseHas('invoices', [
        'client_id' => $this->client->id,
        'amount'    => 250.00,
        'status'    => 'draft',
    ]);
});

// Test 4 : event dispatché
it('dispatches InvoiceCreated event after creation', function () {
    Event::fake();

    $this->actingAs($this->user, 'sanctum')
         ->postJson(route('api.v1.invoices.store'), $this->validPayload)
         ->assertCreated();

    Event::assertDispatched(InvoiceCreated::class, function ($event) {
        return $event->invoice->client_id === $this->client->id;
    });
});

// Test 5 : sécurité — champ sensible absent
it('does not expose user_id in the response', function () {
    Event::fake();

    $this->actingAs($this->user, 'sanctum')
         ->postJson(route('api.v1.invoices.store'), $this->validPayload)
         ->assertCreated()
         ->assertJsonMissing(['user_id']);
});

// Bonus : test des abilities Sanctum
it('returns 403 when token lacks invoices:write ability', function () {
    $token = $this->user->createToken('limited', ['invoices:read'])->plainTextToken;

    $this->withToken($token)
         ->postJson(route('api.v1.invoices.store'), $this->validPayload)
         ->assertForbidden();
});
```

**Points clés de cette suite :**

- `Event::fake()` dans les tests 3, 4, 5 empêche les side effects (emails, queue…).
- `beforeEach()` évite la duplication de setup — équivalent de `setUp()` PHPUnit.
- Chaque test est focalisé sur **une seule assertion métier** : plus facile à
  déboguer quand un test échoue.
- Le test 5 (sécurité) est souvent oublié mais critique : ne jamais exposer `user_id`,
  `password_hash` ou des champs internes dans les réponses API.
- `withToken($token)` simule un appel API avec un vrai Bearer token (vs `actingAs`
  qui bypass la création de token).
