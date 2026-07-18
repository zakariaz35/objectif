---
title: "Exercice — Job de queue avec retry et notification"
type: exercise
---

## Énoncé

Une agence vous demande d'implémenter la génération de rapports PDF en arrière-plan.

**Scénario** : quand une facture passe au statut `paid`, un événement `InvoicePaid`
est dispatché. Un listener asynchrone doit :

1. Générer un PDF via `PdfService->generateInvoice(Invoice $invoice): string`
   (retourne le contenu binaire).
2. Sauvegarder le PDF dans `storage/app/invoices/{id}.pdf`.
3. Envoyer un email à `$invoice->client->email` avec le PDF en pièce jointe.
4. En cas d'échec, réessayer 3 fois avec 2 minutes d'intervalle.
5. Après 3 échecs, envoyer une notification à l'admin (log suffisant).

**Questions** :

- Créez `InvoicePaid` (Event), `GenerateAndSendInvoicePdf` (Listener asynchrone).
- Où configurer `$tries` et `$backoff` ?
- Comment tester le dispatch du job sans l'exécuter réellement ?

<!--correction-->

## Correction

### Event InvoicePaid

```php
// app/Events/InvoicePaid.php
namespace App\Events;

use App\Models\Invoice;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InvoicePaid
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Invoice $invoice,
    ) {}
}
```

### Listener asynchrone

```php
// app/Listeners/GenerateAndSendInvoicePdf.php
namespace App\Listeners;

use App\Events\InvoicePaid;
use App\Mail\InvoiceReadyMailable;
use App\Services\PdfService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class GenerateAndSendInvoicePdf implements ShouldQueue
{
    public string $queue = 'pdf';
    public int $tries = 3;
    public int $backoff = 120; // 2 minutes between attempts

    public function __construct(private readonly PdfService $pdfService) {}

    public function handle(InvoicePaid $event): void
    {
        $invoice = $event->invoice;
        $invoice->loadMissing('client'); // ensure the relation is loaded

        // 1. Generate the PDF
        $pdfContent = $this->pdfService->generateInvoice($invoice);

        // 2. Save to storage
        $path = "invoices/{$invoice->id}.pdf";
        Storage::put($path, $pdfContent);

        // 3. Send the email with attachment
        Mail::to($invoice->client->email)
            ->send(new InvoiceReadyMailable($invoice, $path));

        Log::info('Invoice PDF sent', ['invoice_id' => $invoice->id]);
    }

    public function failed(InvoicePaid $event, \Throwable $exception): void
    {
        // Called after all $tries are exhausted
        Log::error('GenerateAndSendInvoicePdf failed permanently', [
            'invoice_id' => $event->invoice->id,
            'error'      => $exception->getMessage(),
        ]);

        // Notify the admin (Slack, admin email, etc.)
        // Notification::route('mail', config('mail.admin'))->notify(...)
    }
}
```

### Déclencher l'événement dans le service métier

```php
// app/Services/InvoiceService.php
use App\Events\InvoicePaid;

public function markAsPaid(Invoice $invoice, float $amount): Invoice
{
    $invoice->update([
        'status'  => 'paid',
        'paid_at' => now(),
        'amount'  => $amount,
    ]);

    InvoicePaid::dispatch($invoice);

    return $invoice->fresh();
}
```

### Test du dispatch (sans exécution réelle)

```php
// tests/Feature/InvoicePaymentTest.php
use App\Events\InvoicePaid;
use App\Listeners\GenerateAndSendInvoicePdf;
use Illuminate\Support\Facades\Queue;

it('queues the PDF generation job when invoice is paid', function () {
    Queue::fake(); // intercepts jobs without executing them

    $invoice = Invoice::factory()->create(['status' => 'sent']);

    $this->actingAs($invoice->client->user, 'sanctum')
         ->postJson(route('api.v1.invoices.pay', $invoice), ['amount' => $invoice->amount])
         ->assertOk();

    Queue::assertPushedOn('pdf', GenerateAndSendInvoicePdf::class);
});
```

**Pourquoi `SerializesModels` sur l'Event ?**

Le trait `SerializesModels` remplace les modèles Eloquent par leur classe + leur ID
avant la sérialisation en queue. À l'exécution, le modèle est rechargé depuis la DB.
Cela évite de sérialiser l'objet entier (avec toutes ses relations chargées) dans le
job, et garantit des données fraîches au moment de l'exécution.
