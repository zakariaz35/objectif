---
title: "Exercice 3 — Hexagonal"
type: exercise
---

## Énoncé

On veut tester `CreerFacture` **sans base de données**. Implémente l'adapter de test `InMemoryFactureRepository` qui respecte le port, et indique comment le brancher. Complète les trous `/* (n) */`.

```php
interface FactureRepository {
    public function save(Facture $f): void;
}

// À compléter : un adapter qui stocke en mémoire
class InMemoryFactureRepository /* (1) ? */ {
    /* (2) un stockage interne */

    public function save(Facture $f): void {
        /* (3) stocker $f */
    }
}
```

Indices : (1) il doit honorer le contrat. (2)(3) un simple tableau PHP suffit, pas besoin d'Eloquent.

<!--correction-->

## Correction

```php
class InMemoryFactureRepository implements FactureRepository {
    public array $factures = [];          // (2)

    public function save(Facture $f): void {
        $this->factures[] = $f;             // (3)
    }
}

// Branchement dans un test — le service métier ne change pas :
$repo = new InMemoryFactureRepository();
$useCase = new CreerFacture($repo);
$useCase->execute(clientId: 1, montant: 99.0);

assertCount(1, $repo->factures);     // vérifié sans aucune DB
```

C'est tout le bénéfice de l'hexagonal : le cœur dépend de l'**interface**, donc on substitue librement Eloquent par un tableau en mémoire. Aucun changement dans `CreerFacture`.
