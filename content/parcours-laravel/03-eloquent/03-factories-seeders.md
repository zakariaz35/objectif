---
title: "Factories, Seeders et données de test"
type: lesson
---

# Factories, Seeders et données de test

## Factories : l'équivalent de Foundry (Symfony)

Si vous avez utilisé `zenstruck/foundry` dans vos projets Symfony, vous retrouverez
exactement la même idée dans les Factories Eloquent.

```bash
php artisan make:factory InvoiceFactory --model=Invoice
```

```php
// database/factories/InvoiceFactory.php
namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_id' => Client::factory(), // creates an associated Client if needed
            'amount'    => $this->faker->randomFloat(2, 10, 5000),
            'status'    => $this->faker->randomElement(['draft', 'sent', 'paid']),
            'due_date'  => $this->faker->dateTimeBetween('+7 days', '+90 days'),
            'notes'     => $this->faker->optional()->sentence(),
        ];
    }

    // Custom state (equivalent of ->with() in Foundry)
    public function paid(): static
    {
        return $this->state(['status' => 'paid', 'paid_at' => now()]);
    }

    public function overdue(): static
    {
        return $this->state([
            'status'   => 'sent',
            'due_date' => now()->subDays(rand(1, 30)),
        ]);
    }
}
```

```php
// Model — declare the HasFactory trait
class Invoice extends Model
{
    use HasFactory;
    // ...
}
```

## Utilisation des Factories dans les tests

```php
// Create 1 instance and persist to database
$invoice = Invoice::factory()->create();

// Create without persisting (for unit tests)
$invoice = Invoice::factory()->make();

// Custom states
$paidInvoice  = Invoice::factory()->paid()->create();
$overdueOnes  = Invoice::factory()->overdue()->count(5)->create();

// With specific attributes
$invoice = Invoice::factory()->create([
    'amount' => 999.99,
    'client_id' => $specificClient->id,
]);

// Créer un client avec ses factures (relation)
$client = Client::factory()
    ->has(Invoice::factory()->count(3)->paid())
    ->create();
```

## Seeders : peupler la base de développement

```bash
php artisan make:seeder InvoiceSeeder
```

```php
// database/seeders/InvoiceSeeder.php
class InvoiceSeeder extends Seeder
{
    public function run(): void
    {
        // Create 10 clients, each with 3 to 5 invoices
        Client::factory()
            ->count(10)
            ->has(
                Invoice::factory()
                    ->count(rand(3, 5))
                    ->state(fn (array $attrs, Client $client) => [
                        'client_id' => $client->id,
                    ])
            )
            ->create();

        // A few overdue invoices to test reminders
        Invoice::factory()->overdue()->count(5)->create();
    }
}
```

```php
// database/seeders/DatabaseSeeder.php
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ClientSeeder::class,
            InvoiceSeeder::class,
        ]);
    }
}
```

```bash
# Run all seeders
php artisan db:seed

# Reset the database + migrations + seeders (dev environment)
php artisan migrate:fresh --seed
```

## Comparaison avec Foundry (Symfony)

| Symfony Foundry | Laravel Factory |
|---|---|
| `InvoiceFactory::createOne()` | `Invoice::factory()->create()` |
| `InvoiceFactory::createMany(5)` | `Invoice::factory()->count(5)->create()` |
| `InvoiceFactory::new()->withoutPersisting()->create()` | `Invoice::factory()->make()` |
| État `->paid()` | Factory state `->paid()` |
| `InvoiceFactory::new()->with(['amount' => 100])` | `Invoice::factory(['amount' => 100])` |
| Fixtures YAML (DoctrineFixturesBundle) | Seeder PHP |

> **Repère —** dans les tests Feature Laravel, il est courant de créer des données avec
> les factories directement dans le test (sans passer par le seeder). C'est plus rapide
> et chaque test est autonome grâce à `RefreshDatabase` ou `DatabaseTransactions`.
