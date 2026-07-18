---
title: "Facades : magie utile ou piège ?"
type: lesson
---

# Facades : magie utile ou piège ?

Les Facades sont le sujet le plus clivant de l'écosystème Laravel pour un développeur
venant de Symfony. Démystification.

## Ce qu'est une Facade

Une **Facade** est un **proxy statique** vers un service résolu dans le container. Elle
ne fait pas appel à un singleton global de manière traditionnelle : elle demande au
container de résoudre le service réel, puis lui délègue l'appel.

```php
// Syntaxe Facade (ce que vous verrez dans la doc officielle)
use Illuminate\Support\Facades\Cache;

Cache::put('key', 'value', 3600);
$value = Cache::get('key');
```

```php
// Équivalent injection explicite (recommandé en contexte agence)
use Illuminate\Contracts\Cache\Repository as CacheRepository;

class ProductService
{
    public function __construct(private readonly CacheRepository $cache) {}

    public function getProduct(int $id): Product
    {
        return $this->cache->remember("product.$id", 3600, fn () =>
            Product::findOrFail($id)
        );
    }
}
```

Les deux sont équivalents en runtime. La difference est **testabilité** et
**lisibilité des dépendances**.

## Les Facades les plus fréquentes

| Facade | Contrat (injection) | Usage |
|---|---|---|
| `Cache` | `Illuminate\Contracts\Cache\Repository` | Cache clé/valeur |
| `DB` | `Illuminate\Database\ConnectionInterface` | Requêtes raw SQL |
| `Queue` | `Illuminate\Contracts\Queue\Queue` | Dispatching jobs |
| `Mail` | `Illuminate\Contracts\Mail\Mailer` | Envoi emails |
| `Log` | `Psr\Log\LoggerInterface` | Logs (PSR-3) |
| `Route` | `Illuminate\Routing\Router` | Définition de routes |
| `Validator` | `Illuminate\Contracts\Validation\Factory` | Validation |
| `Storage` | `Illuminate\Contracts\Filesystem\Factory` | Fichiers / S3 |
| `Event` | `Illuminate\Contracts\Events\Dispatcher` | Events |
| `Auth` | `Illuminate\Contracts\Auth\Guard` | Authentification |

## Avantages et inconvénients

| | Facades | Injection explicite |
|---|---|---|
| Verbosité | Moins de code | Plus explicite |
| Tests unitaires | `Cache::fake()`, `Mail::fake()` | Mock injecté dans le constructeur |
| IDE support | Bon (stubs IDE Helper) | Excellent |
| Couplage visible | Non (dépendances cachées) | Oui (signature du constructeur) |
| Refactoring | Plus difficile à tracer | Facile |

> **Conseil agence —** dans du code de Controller ou de test rapide, les Facades sont
> acceptables. Dans les **services métier** (classes dans `app/Services/`), préférez
> l'**injection explicite** : les dépendances sont visibles dans le constructeur, le
> test unitaire peut injecter un mock sans la magie de `::fake()`. Votre Symfony
> intérieur sera plus à l'aise.

## Tester avec les Facades

Laravel fournit des helpers de test pour chaque Facade critique :

```php
// tests/Feature/InvoiceTest.php
use Illuminate\Support\Facades\Mail;
use App\Mail\InvoiceMailable;

public function test_invoice_email_is_sent(): void
{
    Mail::fake(); // intercepte tous les envois réels

    $this->post('/invoices', ['client_id' => 1, 'amount' => 150]);

    Mail::assertSent(InvoiceMailable::class, function ($mail) {
        return $mail->hasTo('client@example.com');
    });
}
```

```php
// Équivalent Symfony : vous mockiez Mailer dans le container de test
// Laravel : Mail::fake() enregistre un faux dans le container — même idée,
// syntaxe plus courte.
```

## Le piège : les « Helper functions »

En plus des Facades, Laravel expose des **fonctions globales** (helpers) :

```php
// Ces 4 lignes font la même chose
Cache::put('k', 'v');             // Facade
app('cache')->put('k', 'v');      // Container direct
resolve('cache')->put('k', 'v'); // Alias container
cache()->put('k', 'v');           // Helper function
```

Dans un projet d'agence, il est recommandé de **choisir un style et de s'y tenir**.
Les helpers globaux (`cache()`, `auth()`, `request()`) sont pratiques dans les vues
Blade et les petits scripts ; évitez-les dans les classes métier.
