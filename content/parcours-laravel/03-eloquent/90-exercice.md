---
title: "Exercice — Modèle Eloquent, relations et scopes"
type: exercise
---

## Énoncé

Vous reprenez un projet de facturation. Le schéma de base de données est :

```
clients (id, name, email, country_code, is_vip, created_at, updated_at)
invoices (id, client_id, amount, status [draft|sent|paid|cancelled], due_date, paid_at, created_at, updated_at)
invoice_lines (id, invoice_id, label, quantity, unit_price)
tags (id, name, color)
invoice_tag (invoice_id, tag_id)
```

**Tâche** : créez les modèles Eloquent avec :

1. **`Invoice`** : `$fillable`, relation `client()`, `lines()`, `tags()`, scopes
   `pending()` (statuts `sent`), `overdue()` (due_date passée + non payée), et une
   méthode `totalAmount()` qui calcule le montant total depuis les lignes.

2. **`Client`** : `$fillable`, relation `invoices()`, scope `vip()`, scope
   `fromCountry(string $code)`.

3. **`InvoiceLine`** : `$fillable`, relation `invoice()`, attribut calculé
   `subtotal()` (quantity × unit_price).

4. La **migration** de la table `invoices` avec les bonnes contraintes.

<!--correction-->

## Correction

### Modèle Invoice

```php
// app/Models/Invoice.php
namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'amount',
        'status',
        'due_date',
        'paid_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'paid_at'  => 'datetime',
        'amount'   => 'decimal:2',
    ];

    // Relations
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(InvoiceLine::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    // Scopes
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'sent');
    }

    public function scopeOverdue(Builder $query): Builder
    {
        return $query
            ->where('status', '!=', 'paid')
            ->where('status', '!=', 'cancelled')
            ->where('due_date', '<', now());
    }

    // Méthode métier
    public function totalAmount(): float
    {
        return $this->lines->sum(
            fn (InvoiceLine $line) => $line->subtotal()
        );
    }
}
```

### Modèle Client

```php
// app/Models/Client.php
namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'email', 'country_code', 'is_vip'];

    protected $casts = ['is_vip' => 'boolean'];

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function scopeVip(Builder $query): Builder
    {
        return $query->where('is_vip', true);
    }

    public function scopeFromCountry(Builder $query, string $code): Builder
    {
        return $query->where('country_code', strtoupper($code));
    }
}
```

### Modèle InvoiceLine

```php
// app/Models/InvoiceLine.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceLine extends Model
{
    protected $fillable = ['invoice_id', 'label', 'quantity', 'unit_price'];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'quantity'   => 'integer',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function subtotal(): float
    {
        return $this->quantity * (float) $this->unit_price;
    }
}
```

### Migration

```php
// database/migrations/xxxx_create_invoices_table.php
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('status', 20)->default('draft');
            $table->date('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'due_date']); // index composite pour les scopes
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
```

### Utilisation des scopes

```php
// Factures en attente avec leurs clients
$pending = Invoice::pending()
    ->with('client')
    ->orderBy('due_date')
    ->get();

// Factures en retard de clients VIP français
$overdueVipFr = Invoice::overdue()
    ->whereHas('client', fn ($q) => $q->vip()->fromCountry('FR'))
    ->with(['client', 'lines'])
    ->get();
```
