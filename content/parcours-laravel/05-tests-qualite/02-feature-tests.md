---
title: "Feature Tests : tester les routes et l'API"
type: lesson
---

# Feature Tests : tester les routes et l'API

## Le test HTTP en Laravel vs Symfony

En Symfony, les tests fonctionnels utilisent `KernelTestCase` + un client HTTP interne.
Laravel fait pareil avec `TestCase` + un client intégré qui déclenche le cycle complet.

```php
// Symfony WebTestCase
$client = static::createClient();
$client->request('GET', '/invoices');
$this->assertResponseIsSuccessful();
$this->assertSelectorTextContains('h1', 'Factures');

// Laravel Feature Test (Pest)
it('shows the invoices list', function () {
    $user = User::factory()->create();
    $invoices = Invoice::factory()->count(3)->for($user)->create();

    $this->actingAs($user)
         ->get(route('invoices.index'))
         ->assertOk()
         ->assertViewIs('invoices.index')
         ->assertViewHas('invoices');
});
```

## Tester une API JSON avec Sanctum

```php
// tests/Feature/Api/InvoiceApiTest.php

use App\Models\Invoice;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('returns paginated invoices for authenticated user', function () {
    Invoice::factory()->count(5)->for($this->user)->create();

    $this->actingAs($this->user, 'sanctum')
         ->getJson(route('api.invoices.index'))
         ->assertOk()
         ->assertJsonStructure([
             'data' => [
                 '*' => ['id', 'amount', 'status', 'created_at'],
             ],
             'meta' => ['current_page', 'total'],
         ])
         ->assertJsonCount(5, 'data');
});

it('returns 401 for unauthenticated requests', function () {
    $this->getJson(route('api.invoices.index'))
         ->assertUnauthorized();
});

it('creates an invoice with valid data', function () {
    $client = \App\Models\Client::factory()->for($this->user)->create();

    $this->actingAs($this->user, 'sanctum')
         ->postJson(route('api.invoices.store'), [
             'client_id' => $client->id,
             'amount'    => 250.00,
             'due_date'  => now()->addDays(30)->toDateString(),
         ])
         ->assertCreated()
         ->assertJsonPath('data.amount', 250.00)
         ->assertJsonPath('data.status', 'draft');

    $this->assertDatabaseHas('invoices', [
        'client_id' => $client->id,
        'amount'    => 250.00,
    ]);
});

it('rejects invalid invoice data', function () {
    $this->actingAs($this->user, 'sanctum')
         ->postJson(route('api.invoices.store'), [
             'amount' => -50, // invalide
         ])
         ->assertUnprocessable()  // 422
         ->assertJsonValidationErrors(['client_id', 'amount', 'due_date']);
});
```

## Assertions HTTP les plus utiles

```php
// Statuts
->assertOk()              // 200
->assertCreated()         // 201
->assertNoContent()       // 204
->assertNotFound()        // 404
->assertForbidden()       // 403
->assertUnauthorized()    // 401
->assertUnprocessable()   // 422

// JSON
->assertJson(['key' => 'value'])          // sous-ensemble du JSON
->assertExactJson(['key' => 'value'])     // JSON exact
->assertJsonPath('data.0.id', 42)         // dot notation
->assertJsonStructure(['data' => ['*' => ['id', 'name']]])
->assertJsonCount(5, 'data')
->assertJsonMissing(['password'])         // sécurité : clé absente

// Base de données
->assertDatabaseHas('invoices', ['id' => 42, 'status' => 'paid'])
->assertDatabaseMissing('invoices', ['id' => 42])
->assertSoftDeleted('invoices', ['id' => 42])

// Mails, notifications, events
// (dans le test, après Mail::fake() / Event::fake())
Mail::assertSent(InvoicePaidMailable::class);
Event::assertDispatched(InvoicePaid::class);
Queue::assertPushed(SendPdfInvoice::class);
Notification::assertSentTo($user, InvoicePaidNotification::class);
```

## Tester les Policies (autorisation)

```php
it('forbids updating an invoice from another user', function () {
    $owner   = User::factory()->create();
    $other   = User::factory()->create();
    $invoice = Invoice::factory()->for($owner)->create(['status' => 'draft']);

    $this->actingAs($other, 'sanctum')
         ->putJson(route('api.invoices.update', $invoice), ['amount' => 999])
         ->assertForbidden();
});

it('allows the owner to update a draft invoice', function () {
    $owner   = User::factory()->create();
    $invoice = Invoice::factory()->for($owner)->create(['status' => 'draft']);

    $this->actingAs($owner, 'sanctum')
         ->putJson(route('api.invoices.update', $invoice), ['amount' => 200.00])
         ->assertOk()
         ->assertJsonPath('data.amount', 200.00);
});
```

> **Repère —** `actingAs($user, 'sanctum')` simule un utilisateur authentifié via
> Sanctum sans créer de token réel. `'sanctum'` désigne le guard ; en omettant le
> second argument (routes web), Laravel utilise le guard par défaut.
