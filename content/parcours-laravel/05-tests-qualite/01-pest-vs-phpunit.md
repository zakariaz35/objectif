---
title: "Pest vs PHPUnit : choisir et configurer"
type: lesson
---

# Pest vs PHPUnit : choisir et configurer

## Mapping Symfony Testing → Laravel Testing

| | Symfony | Laravel (PHPUnit) | Laravel (Pest) |
|---|---|---|---|
| Classe de base | `WebTestCase` / `KernelTestCase` | `Tests\TestCase` (étend `TestCase` Laravel) | `uses(TestCase::class)` |
| Requêtes HTTP | `$client->request('GET', '/invoices')` | `$this->get('/invoices')` | `get('/invoices')` |
| Assertion HTTP | `$this->assertResponseIsSuccessful()` | `$response->assertOk()` | `$response->assertOk()` |
| Assertion JSON | `$this->assertJsonContains([...])` | `$response->assertJson([...])` | idem |
| Fixtures DB | `DoctrineFixturesBundle` | Factories + Seeders | idem |
| DB propre | `DAMA\DoctrineTestBundle` (rollback) | `RefreshDatabase` / `DatabaseTransactions` | `uses(RefreshDatabase::class)` |
| Auth simulée | `$client->loginUser($user)` | `$this->actingAs($user)` | `actingAs($user)` |
| Mock/Spy | `$this->createMock(X::class)` (PHPUnit) | `$this->mock(X::class)` (container mock) | idem |
| Event fake | Pas natif | `Event::fake()` | idem |
| Mail fake | Pas natif | `Mail::fake()` | idem |
| Queue fake | Pas natif | `Queue::fake()` | idem |

## Pourquoi Pest ?

PHPUnit est le socle de test de PHP, que vous connaissez bien depuis Symfony. Pest est
une **couche DSL** construite au-dessus de PHPUnit : il n'est pas un remplacement mais
un sucre syntaxique qui rend les tests plus expressifs.

```php
// PHPUnit classique (fonctionne en Laravel aussi)
class InvoiceTest extends TestCase
{
    public function test_invoice_total_with_tax(): void
    {
        $invoice = Invoice::factory()->create(['amount' => 100.00]);
        $this->assertEquals(120.00, $invoice->totalWithTax(0.20));
    }
}

// Pest — même test, syntaxe fonctionnelle
it('calculates total with tax', function () {
    $invoice = Invoice::factory()->create(['amount' => 100.00]);
    expect($invoice->totalWithTax(0.20))->toBe(120.00);
});
```

Laravel 13 inclut Pest par défaut. Les deux syntaxes sont compatibles et peuvent
coexister dans le même projet.

## Configuration Pest dans Laravel

```php
// tests/Pest.php — configuration globale (auto-chargé)
<?php

uses(Tests\TestCase::class)->in('Feature');       // Feature tests héritent de TestCase
uses(Tests\TestCase::class)->in('Unit');           // Unit tests aussi

// Trait RefreshDatabase pour tous les tests Feature
uses(Illuminate\Foundation\Testing\RefreshDatabase::class)->in('Feature');
```

```bash
# Run tests via Artisan (recommended — bootstraps the app correctly)
php artisan test

# Run with Pest directly
./vendor/bin/pest

# Filter by test name or file
./vendor/bin/pest --filter "invoice"
./vendor/bin/pest tests/Feature/InvoiceTest.php

# Parallel execution (requires --parallel flag and brianium/paratest)
./vendor/bin/pest --parallel

# Coverage (requires Xdebug or PCOV)
./vendor/bin/pest --coverage --min=80

# Only run tests that failed on the last run
./vendor/bin/pest --dirty    # only files changed since last git commit
```

## Les matchers Pest les plus utiles

```php
// Simple values — strict vs loose
expect($value)->toBe(42);              // === strict (like assertSame in PHPUnit)
expect($value)->toEqual(42);           // == loose (like assertEquals)
expect($value)->toBeNull();
expect($value)->toBeTrue();
expect($value)->toBeFalse();
expect($value)->toBeEmpty();

// Strings
expect($str)->toContain('laravel');
expect($str)->toStartWith('Hello');
expect($str)->toMatchPattern('/^\d{4}$/');

// Arrays and Collections
expect($array)->toHaveCount(3);
expect($array)->toContain('value');
expect($array)->toHaveKey('name');
expect($array)->toMatchArray(['name' => 'Alice', 'role' => 'admin']);

// Exceptions
expect(fn () => riskyOperation())->toThrow(RuntimeException::class);
expect(fn () => riskyOperation())->toThrow(RuntimeException::class, 'message attendu');

// Higher-order testing: chain on model properties (very handy for Eloquent)
expect($invoice)
    ->amount->toBe(100.00)
    ->status->toBe('draft')
    ->client_id->not->toBeNull();

// Snapshot testing (useful for JSON API responses)
expect($response->json())->toMatchSnapshot();
```

## Tests HTTP agence : example complet

Un test d'intégration typique pour une API de facturation, écrit en style Pest :

```php
// tests/Feature/InvoiceTest.php
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\InvoiceReadyMailable;

// Pest 'dataset' replaces PHPUnit's @dataProvider
dataset('invalid invoice payloads', [
    'missing amount'     => [['client_id' => 1]],
    'negative amount'    => [['client_id' => 1, 'amount' => -50]],
    'invalid due date'   => [['client_id' => 1, 'amount' => 100, 'due_date' => 'not-a-date']],
]);

it('creates an invoice and returns 201', function () {
    // Given: an authenticated user
    $user = User::factory()->create();

    // When: they POST a valid invoice
    $response = $this->actingAs($user)->postJson('/api/invoices', [
        'client_id' => \App\Models\Client::factory()->create()->id,
        'amount'    => 1500.00,
        'due_date'  => now()->addDays(30)->toDateString(),
        'status'    => 'draft',
    ]);

    // Then: the response is 201 and the invoice is in the database
    $response->assertCreated()
             ->assertJsonPath('data.status', 'draft')
             ->assertJsonPath('data.amount', '1500.00');

    $this->assertDatabaseHas('invoices', ['amount' => 1500.00]);
});

it('validates invoice payload', function (array $payload) {
    $user = User::factory()->create();

    $this->actingAs($user)
         ->postJson('/api/invoices', $payload)
         ->assertUnprocessable(); // 422 Unprocessable Entity
})->with('invalid invoice payloads');

it('sends a PDF email when invoice is marked as sent', function () {
    Mail::fake(); // no real email sent — equivalent of Symfony's assertEmailCount()

    $invoice = Invoice::factory()->create(['status' => 'draft']);
    $user    = User::factory()->create();

    $this->actingAs($user)
         ->patchJson("/api/invoices/{$invoice->id}", ['status' => 'sent'])
         ->assertOk();

    Mail::assertSent(InvoiceReadyMailable::class, function ($mail) use ($invoice) {
        return $mail->invoice->id === $invoice->id;
    });
});
```

## Structure recommandée

```
tests/
├── Feature/          ← Tests d'intégration HTTP (appels aux routes)
│   ├── InvoiceTest.php
│   └── AuthTest.php
├── Unit/             ← Tests unitaires (pas de DB, pas de HTTP)
│   ├── InvoiceCalculatorTest.php
│   └── PdfGeneratorTest.php
└── Pest.php          ← configuration globale
```

## RefreshDatabase vs DatabaseTransactions

```php
// RefreshDatabase: migrates the database fresh before each test suite run,
// then wraps each individual test in a transaction (rolled back after).
// → Slightly slower first run, but guaranteed clean state.
// → Use this for Feature tests that need a real schema.

// DatabaseTransactions: wraps each test in a transaction and rolls back.
// → Much faster, but does NOT work with jobs (queue driver must be 'sync')
// → Does NOT work if your code spawns a separate DB connection
use Illuminate\Foundation\Testing\DatabaseTransactions;

uses(DatabaseTransactions::class)->in('Feature');
```

> **⚠️ Piège agence — `RefreshDatabase` et les migrations lentes.** Si votre base a
> beaucoup de migrations, `RefreshDatabase` peut être lent en CI. Deux solutions :
> utiliser une base SQLite in-memory pour les tests (`DB_CONNECTION=sqlite`, `:memory:`
> dans `phpunit.xml`), ou activer `RefreshDatabase::$seed = true` uniquement là où vous
> en avez besoin.

> **À retenir —** `RefreshDatabase` dans `Pest.php` pour les Feature tests est la
> convention Laravel. C'est l'équivalent de la `KernelTestCase` Symfony avec
> `DatabasePurger` et `DatabaseBackup` de DoctrineFixturesBundle.

## Fakes Laravel : tester sans effets de bord

L'un des atouts majeurs de Laravel par rapport à Symfony pour les tests : les **Fakes**
intégrés. Plus besoin de configurer un mailer de test dans `config/packages/test/`:

```php
// In your test, before the action:
Mail::fake();          // no real emails sent
Queue::fake();         // jobs are not dispatched to the worker
Event::fake();         // events are not fired
Storage::fake('s3');   // no real S3 calls
Http::fake();          // no real HTTP calls (mock external APIs)
Notification::fake();  // no real notifications

// Then assert what was fired/dispatched:
Mail::assertSent(InvoiceReadyMailable::class);
Queue::assertPushed(SendPdfInvoice::class, fn ($job) => $job->invoice->id === $invoiceId);
Event::assertDispatched(InvoicePaid::class);
Storage::disk('s3')->assertExists("invoices/invoice-{$invoiceId}.pdf");
Http::assertSent(fn ($request) => str_contains($request->url(), 'stripe.com'));
```
