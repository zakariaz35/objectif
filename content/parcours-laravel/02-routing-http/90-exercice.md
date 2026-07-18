---
title: "Exercice — Routes, FormRequest et Middleware"
type: exercise
---

## Énoncé

Vous développez une API REST pour une plateforme de facturation. Implémentez les
éléments suivants :

**1. Routes** (`routes/api.php`)

Définissez un groupe de routes pour `/api/v1/invoices` :
- `GET /api/v1/invoices` — liste paginée (auth requise)
- `POST /api/v1/invoices` — création (auth requise)
- `GET /api/v1/invoices/{invoice}` — détail (auth requise)
- `PUT /api/v1/invoices/{invoice}` — mise à jour (auth + Policy `update`)
- `DELETE /api/v1/invoices/{invoice}` — suppression (auth + Policy `delete`)

Nommez les routes avec le préfixe `api.v1.`.

**2. Middleware personnalisé**

Créez un middleware `EnsureJsonAccept` qui retourne une erreur 406 si le header
`Accept: application/json` est absent sur les routes API.

**3. FormRequest**

Créez `StoreInvoiceRequest` avec les règles :
- `client_id` : obligatoire, entier, doit exister dans la table `clients`
- `amount` : obligatoire, numérique, minimum 0.01
- `due_date` : obligatoire, date, doit être dans le futur
- `notes` : facultatif, chaîne, max 500 caractères
- `items` : tableau, au moins 1 élément
- `items.*.label` : obligatoire si `items` est présent
- `items.*.quantity` : entier, minimum 1

<!--correction-->

## Correction

### 1. Routes

```php
// routes/api.php
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Middleware\EnsureJsonAccept;

Route::prefix('v1')
    ->middleware(['auth:sanctum', EnsureJsonAccept::class])
    ->name('api.v1.')
    ->group(function () {
        Route::get('invoices', [InvoiceController::class, 'index'])
             ->name('invoices.index');

        Route::post('invoices', [InvoiceController::class, 'store'])
             ->name('invoices.store');

        Route::get('invoices/{invoice}', [InvoiceController::class, 'show'])
             ->name('invoices.show');

        Route::put('invoices/{invoice}', [InvoiceController::class, 'update'])
             ->middleware('can:update,invoice')
             ->name('invoices.update');

        Route::delete('invoices/{invoice}', [InvoiceController::class, 'destroy'])
             ->middleware('can:delete,invoice')
             ->name('invoices.destroy');
    });
```

### 2. Middleware EnsureJsonAccept

```php
// app/Http/Middleware/EnsureJsonAccept.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureJsonAccept
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->acceptsJson()) {
            return response()->json([
                'message' => 'This endpoint only serves JSON responses. '
                           . 'Set Accept: application/json header.',
            ], Response::HTTP_NOT_ACCEPTABLE);
        }

        return $next($request);
    }
}
```

### 3. FormRequest StoreInvoiceRequest

```php
// app/Http/Requests/StoreInvoiceRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Tout utilisateur authentifié peut créer une facture
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'client_id'          => ['required', 'integer', 'exists:clients,id'],
            'amount'             => ['required', 'numeric', 'min:0.01'],
            'due_date'           => ['required', 'date', 'after:today'],
            'notes'              => ['nullable', 'string', 'max:500'],
            'items'              => ['sometimes', 'array', 'min:1'],
            'items.*.label'      => ['required_with:items', 'string', 'max:255'],
            'items.*.quantity'   => ['required_with:items', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'due_date.after'          => 'The due date must be a future date.',
            'items.min'               => 'At least one line item is required.',
            'items.*.label.required_with' => 'Each item must have a label.',
            'items.*.quantity.min'    => 'Item quantity must be at least 1.',
        ];
    }
}
```

**Points importants :**

- `'exists:clients,id'` : vérifie que le `client_id` existe bien en base avant même
  d'atteindre le controller — évite une Exception Eloquent de clé étrangère.
- `'after:today'` : la date doit être strictement dans le futur (pas aujourd'hui).
- `'required_with:items'` : les champs d'items ne sont validés que si `items` est
  présent dans la requête.
- `$request->validated()` dans le controller ne retourne que ces champs — même si
  le client envoie `is_admin`, `user_id`, etc., ils sont ignorés.
