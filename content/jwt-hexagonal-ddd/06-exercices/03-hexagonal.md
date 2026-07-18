---
title: "Exercice 3 — Hexagonal"
type: exercise
---

## Énoncé

On veut tester `CreateInvoice` **sans base de données**. Implémente l'adapter de test `InMemoryInvoiceRepository` qui respecte le port, et indique comment le brancher. Complète les trous `/* (n) */`.

```php
interface InvoiceRepository {
    public function save(Invoice $f): void;
}

// To complete: an adapter that stores in memory
class InMemoryInvoiceRepository /* (1) ? */ {
    /* (2) an internal store */

    public function save(Invoice $f): void {
        /* (3) store $f */
    }
}
```

Indices : (1) il doit honorer le contrat. (2)(3) un simple tableau PHP suffit, pas besoin d'Eloquent.

<!--correction-->

## Correction

```php
class InMemoryInvoiceRepository implements InvoiceRepository {
    public array $invoices = [];          // (2)

    public function save(Invoice $f): void {
        $this->invoices[] = $f;             // (3)
    }
}

// Wiring in a test — the domain service does not change:
$repo = new InMemoryInvoiceRepository();
$useCase = new CreateInvoice($repo);
$useCase->execute(clientId: 1, amount: 99.0);

assertCount(1, $repo->invoices);     // verified without any DB
```

C'est tout le bénéfice de l'hexagonal : le cœur dépend de l'**interface**, donc on substitue librement Eloquent par un tableau en mémoire. Aucun changement dans `CreateInvoice`.
