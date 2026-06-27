---
title: "En pratique avec Laravel (sans DDD)"
type: lesson
---

Note : **hexagonal n'impose pas DDD**. Ici, pas de Value Objects ni d'Aggregates — juste des classes simples, des interfaces, et de l'injection de dépendances. Laravel a déjà tout (le *Service Container* = la machine à brancher adapters sur ports).

```php
// 1 · PORT DE SORTIE — défini par le métier, dans le cœur
interface FactureRepository {
    public function save(Facture $f): void;
}

// 2 · SERVICE APPLICATIF — la logique pure, ne connaît QUE l'interface
class CreerFacture {
    public function __construct(private FactureRepository $repo) {}

    public function execute(int $clientId, float $montant): Facture {
        if ($montant <= 0) throw new MontantInvalide();
        $facture = new Facture($clientId, $montant); // règle métier ici
        $this->repo->save($facture);
        return $facture;
    }
}

// 3 · ADAPTER DE SORTIE — l'implémentation Eloquent, hors du cœur
class EloquentFactureRepository implements FactureRepository {
    public function save(Facture $f): void {
        FactureModel::create(['client_id' => $f->clientId, 'montant' => $f->montant]);
    }
}

// 4 · ADAPTER D'ENTRÉE — le contrôleur, mince, ne fait que traduire HTTP
class FactureController {
    public function store(Request $r, CreerFacture $useCase) {
        $f = $useCase->execute($r->client_id, $r->montant);
        return response()->json($f);
    }
}
```

> **⬢ Repère Laravel — le branchement —** On relie le port à l'adapter dans un **Service Provider** :
>
> ```php
> // AppServiceProvider::register()
> $this->app->bind(FactureRepository::class, EloquentFactureRepository::class);
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
