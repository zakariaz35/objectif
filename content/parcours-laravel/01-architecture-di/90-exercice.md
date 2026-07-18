---
title: "Exercice — Binder une interface dans un Provider"
type: exercise
---

## Énoncé

Vous travaillez sur une application de facturation. L'équipe a défini une interface
`NotificationChannel` avec une méthode `send(string $to, string $message): void`.

Deux implémentations existent : `EmailChannel` et `SmsChannel`.

**Tâche** : créez un `AppServiceProvider` minimal qui :

1. Lie `NotificationChannel` à `EmailChannel` par défaut.
2. Sur une route `/admin/*`, lie `NotificationChannel` à `SmsChannel` (utilisez un
   binding contextuel).
3. Dans `boot()`, enregistrez un macro `Collection::toCSV()` qui transforme une
   collection de tableaux associatifs en chaîne CSV.

Expliquez pourquoi ces bindings vont dans `register()` et non dans `boot()`.

<!--correction-->

## Correction

### 1. Binding par défaut + contextuel

```php
// app/Providers/AppServiceProvider.php
namespace App\Providers;

use App\Contracts\NotificationChannel;
use App\Services\EmailChannel;
use App\Services\SmsChannel;
use App\Http\Controllers\Admin;
use Illuminate\Support\Collection;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Default binding: the whole codebase receives EmailChannel
        $this->app->bind(NotificationChannel::class, EmailChannel::class);

        // Contextual binding: Admin controllers receive SmsChannel
        $this->app->when([
            Admin\UserController::class,
            Admin\InvoiceController::class,
        ])
        ->needs(NotificationChannel::class)
        ->give(SmsChannel::class);
    }

    public function boot(): void
    {
        // Collection macro — here because Collection is already a resolved service
        Collection::macro('toCSV', function (): string {
            if ($this->isEmpty()) {
                return '';
            }

            $headers = implode(',', array_keys($this->first()));
            $rows = $this->map(function (array $row): string {
                return implode(',', array_map(
                    fn ($value) => '"' . str_replace('"', '""', (string) $value) . '"',
                    $row
                ));
            })->implode("\n");

            return $headers . "\n" . $rows;
        });
    }
}
```

### 2. Pourquoi `register()` et non `boot()`

**`register()`** est exécuté **avant** `boot()` sur tous les providers. À ce moment,
le container n'a que les bindings des providers déjà traités — mais tous les `register()`
de tous les providers s'exécutent avant le premier `boot()`.

Les **bindings** doivent aller dans `register()` car :
- Ils définissent comment résoudre des abstractions.
- Ils ne dépendent pas d'autres services déjà résolus.
- Les placer dans `boot()` est risqué : si un service tente de résoudre
  `NotificationChannel` dans son propre `register()`, le binding n'est pas encore posé.

La **macro Collection** va dans `boot()` car `Collection::macro()` modifie le
comportement d'une classe déjà chargée — c'est une configuration post-registration,
pas un binding DI.

### 3. Utilisation dans les controllers

```php
// Dans un controller non-admin : reçoit EmailChannel
class InvoiceController extends Controller
{
    public function __construct(
        private readonly NotificationChannel $notifier,
    ) {}
    // $this->notifier est une EmailChannel
}

// Dans Admin\InvoiceController : reçoit SmsChannel
namespace App\Http\Controllers\Admin;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly NotificationChannel $notifier,
    ) {}
    // $this->notifier est une SmsChannel
}
```
