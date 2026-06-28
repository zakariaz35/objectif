---
title: "En pratique avec Laravel (sans DDD)"
type: lesson
---

Note : **hexagonal n'impose pas DDD**. Ici, pas de Value Objects ni d'Aggregates — juste des classes simples, des interfaces, et de l'injection de dépendances. Laravel a déjà tout (le *Service Container* = la machine à brancher adapters sur ports).

```php
// 1 · OUTBOUND PORT — defined by the business, inside the core
interface InvoiceRepository {
    public function save(Invoice $f): void;
}

// 2 · APPLICATION SERVICE — pure logic, knows ONLY the interface
class CreateInvoice {
    public function __construct(private InvoiceRepository $repo) {}

    public function execute(int $clientId, float $amount): Invoice {
        if ($amount <= 0) throw new InvalidAmount();
        $invoice = new Invoice($clientId, $amount); // business rule here
        $this->repo->save($invoice);
        return $invoice;
    }
}

// 3 · OUTBOUND ADAPTER — the Eloquent implementation, outside the core
class EloquentInvoiceRepository implements InvoiceRepository {
    public function save(Invoice $f): void {
        InvoiceModel::create(['client_id' => $f->clientId, 'amount' => $f->amount]);
    }
}

// 4 · INBOUND ADAPTER — the controller, thin, only translates HTTP
class InvoiceController {
    public function store(Request $r, CreateInvoice $useCase) {
        $f = $useCase->execute($r->client_id, $r->amount);
        return response()->json($f);
    }
}
```

> **⬢ Repère Laravel — le branchement —** On relie le port à l'adapter dans un **Service Provider** :
>
> ```php
> // AppServiceProvider::register()
> $this->app->bind(InvoiceRepository::class, EloquentInvoiceRepository::class);
> ```
>
> Pour les tests, tu bind un `InMemoryFactureRepository` (un simple tableau PHP). Le **service métier ne change pas d'une ligne** et tu testes sans DB. C'est tout le bénéfice.

| Bénéfice | Pourquoi |
| --- | --- |
| Testable sans infra | On remplace les adapters par des faux (in-memory). |
| Framework remplaçable | Le cœur ne référence pas Laravel ; on pourrait changer de framework. |
| Plusieurs entrées | HTTP, CLI, queue appellent le même use case. |
| Métier lisible | Les règles sont au centre, pas noyées dans du HTTP/SQL. |

> **⚠ Quand NE pas en faire —** Pour un CRUD simple, c'est de la **sur-ingénierie** : plus de fichiers, plus d'indirection, pour zéro logique métier. Réserve l'hexagonal aux **parties à vraie complexité métier** ou à fort besoin de testabilité/durabilité. Un CRUD reste très bien en Eloquent direct.
