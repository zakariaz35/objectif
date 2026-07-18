---
title: "FormRequest, Blade et réponses HTTP"
type: lesson
---

# FormRequest, Blade et réponses HTTP

## FormRequest : Form + Validator en un seul objet

En Symfony, la validation passe par un objet `Form` (ou par les contraintes de
validation sur les DTO/Entities) + le composant Validator. Laravel fusionne tout dans
un `FormRequest`.

```bash
php artisan make:request StoreInvoiceRequest
```

```php
// app/Http/Requests/StoreInvoiceRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    /**
     * Who can make this request? (equivalent of Voter/IsGranted)
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Invoice::class);
    }

    /**
     * Validation rules (equivalent of Assert\* on a Symfony Entity/DTO)
     */
    public function rules(): array
    {
        return [
            'client_id'   => ['required', 'integer', 'exists:clients,id'],
            'amount'      => ['required', 'numeric', 'min:0.01'],
            'due_date'    => ['required', 'date', 'after:today'],
            'description' => ['nullable', 'string', 'max:1000'],
            'items'       => ['required', 'array', 'min:1'],
            'items.*.label'  => ['required', 'string'],
            'items.*.price'  => ['required', 'numeric', 'min:0'],
        ];
    }

    /**
     * Custom messages (equivalent of message: in Assert attributes)
     */
    public function messages(): array
    {
        return [
            'due_date.after' => 'The due date must be in the future.',
            'items.required' => 'At least one line item is required.',
        ];
    }
}
```

```php
// Controller — utilisation du FormRequest
public function store(StoreInvoiceRequest $request): RedirectResponse
{
    // If we reach here, validation passed and authorize() returned true
    $validated = $request->validated(); // only the fields declared in rules()
    $invoice = Invoice::create($validated);
    return redirect()->route('invoices.show', $invoice);
}
```

Tableau de correspondance validation :

| Symfony Constraint | Laravel Rule |
|---|---|
| `Assert\NotBlank` | `required` |
| `Assert\Length(max: 255)` | `max:255` |
| `Assert\Email` | `email` |
| `Assert\Url` | `url` |
| `Assert\Range(min: 0)` | `min:0` |
| `Assert\Choice(['a','b'])` | `in:a,b` |
| `Assert\Unique(entity: ...)` | `unique:table,column` |
| `Assert\Exists(entity: ...)` | `exists:table,column` |
| `Assert\Regex(pattern: '...')` | `regex:/pattern/` |

## Blade : Twig avec une syntaxe différente

Blade est le moteur de templates de Laravel. Si vous connaissez Twig, vous retrouverez
vos marques en 30 minutes.

```twig
{# Twig (Symfony) #}
{% extends 'base.html.twig' %}
{% block title %}Factures{% endblock %}
{% block body %}
    {% for invoice in invoices %}
        <tr>
            <td>{{ invoice.number }}</td>
            <td>{{ invoice.amount | number_format(2) }} €</td>
        </tr>
    {% else %}
        <p>Aucune facture.</p>
    {% endfor %}
{% endblock %}
```

```blade
{{-- Blade (Laravel) --}}
@extends('layouts.app')

@section('title', 'Factures')

@section('content')
    @forelse($invoices as $invoice)
        <tr>
            <td>{{ $invoice->number }}</td>
            <td>{{ number_format($invoice->amount, 2) }} €</td>
        </tr>
    @empty
        <p>Aucune facture.</p>
    @endforelse
@endsection
```

Tableau de correspondance Blade / Twig :

| Twig | Blade |
|---|---|
| `{{ variable }}` | `{{ $variable }}` |
| `{# commentaire #}` | `{{-- commentaire --}}` |
| `{% if cond %}` | `@if($cond)` … `@endif` |
| `{% for x in items %}` | `@foreach($items as $x)` … `@endforeach` |
| `{% for x in items %}` + `{% else %}` | `@forelse($items as $x)` … `@empty` … `@endforelse` |
| `{% extends 'base.html.twig' %}` | `@extends('layouts.base')` |
| `{% block content %}` | `@section('content')` … `@endsection` |
| `{% block content %}...{% endblock %}` (inline) | `@section('title', 'Ma page')` |
| `{{ include('partial.html.twig') }}` | `@include('partials.nav')` |
| `{% component Alert %}` | `<x-alert>` (composants Blade) |
| `{{ variable \| escape }}` | `{{ $variable }}` (auto-escape) |
| `{{ variable \| raw }}` | `{!! $variable !!}` (non-echappé, **danger**) |

## Réponses HTTP

```php
// HTML (Blade view)
return view('invoices.index', ['invoices' => $invoices]);
return view('invoices.index', compact('invoices')); // shorthand

// JSON (API)
return response()->json(['data' => $invoices], 200);
// Or with a Resource (see Eloquent module)
return InvoiceResource::collection($invoices);

// Redirect
return redirect()->route('invoices.index');
return redirect()->back()->withErrors(['amount' => 'Invalid amount']);
return redirect()->away('https://external.example.com');

// File
return response()->download(storage_path('app/invoices/invoice-42.pdf'));
return response()->file(storage_path('app/invoices/invoice-42.pdf'));

// Abort (equivalent of throw new HttpException)
abort(404, 'Invoice not found');
abort_if($invoice->user_id !== auth()->id(), 403);
abort_unless($request->user()->can('view', $invoice), 403);
```

> **À retenir —** `$request->validated()` est la clé : il ne retourne **que** les
> champs déclarés dans `rules()`, ce qui évite la sur-attribution (mass assignment)
> même si le client envoie des champs supplémentaires.
