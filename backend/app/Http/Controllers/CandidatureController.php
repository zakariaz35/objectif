<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesOwner;
use App\Models\Candidature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Tracker de candidatures ET de contacts réseau (même table, champ `type`).
 * Objectifs hebdo du plan : 5 candidatures + 2 contacts réseau par semaine.
 */
class CandidatureController extends Controller
{
    use ResolvesOwner;

    public const OBJECTIF_CANDIDATURES_SEMAINE = 5;
    public const OBJECTIF_CONTACTS_SEMAINE = 2;

    private const STATUTS = ['a_envoyer', 'envoyee', 'relancee', 'entretien', 'test_technique', 'offre', 'refus', 'sans_reponse'];

    public function index(Request $request): JsonResponse
    {
        $query = $this->scopeToOwner(Candidature::query(), $request);
        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->query('statut'));
        }

        $items = $query->orderByDesc('updated_at')->get();

        return response()->json([
            'data' => $items->map(fn ($c) => $this->present($c)),
            'compteurs' => $this->compteurs($request),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);
        $candidature = Candidature::create(
            $this->ownerKeys($request) + $this->withRelance($data),
        );

        return response()->json($this->present($candidature), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $candidature = $this->scopeToOwner(Candidature::query(), $request)->findOrFail($id);
        $data = $this->validatePayload($request, partial: true);
        $candidature->update($this->withRelance($data, $candidature));

        return response()->json($this->present($candidature->fresh()));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->scopeToOwner(Candidature::query(), $request)->findOrFail($id)->delete();

        return response()->json(['deleted' => $id]);
    }

    /**
     * Relance auto : passage en `envoyee` → relance due à envoi + 7 j ;
     * passage en `relancee` → nouvelle relance dans 7 j ; les statuts
     * terminaux (entretien/offre/refus…) annulent la relance.
     */
    private function withRelance(array $data, ?Candidature $existing = null): array
    {
        $statut = $data['statut'] ?? $existing?->statut;
        $envoi = $data['date_envoi'] ?? $existing?->date_envoi?->toDateString();

        if ($statut === 'envoyee') {
            $data['date_envoi'] = $envoi ?? now()->toDateString();
            $data['relance_due_le'] ??= \Carbon\Carbon::parse($data['date_envoi'])->addDays(7)->toDateString();
        } elseif ($statut === 'relancee') {
            $data['relance_due_le'] = now()->addDays(7)->toDateString();
        } elseif (in_array($statut, ['entretien', 'test_technique', 'offre', 'refus', 'sans_reponse'], true)) {
            $data['relance_due_le'] = null;
        }

        return $data;
    }

    /** Compteurs de la semaine courante (lundi → maintenant) vs objectifs, + relances dues. */
    public function compteurs(Request $request): array
    {
        $base = fn () => $this->scopeToOwner(Candidature::query(), $request);
        $debutSemaine = now()->startOfWeek();

        return [
            'semaine' => [
                'candidatures' => $base()->where('type', 'candidature')->where('created_at', '>=', $debutSemaine)->count(),
                'objectif_candidatures' => self::OBJECTIF_CANDIDATURES_SEMAINE,
                'contacts' => $base()->where('type', 'contact')->where('created_at', '>=', $debutSemaine)->count(),
                'objectif_contacts' => self::OBJECTIF_CONTACTS_SEMAINE,
            ],
            'relances_dues' => $base()->whereNotNull('relance_due_le')->where('relance_due_le', '<=', now())->count(),
            'par_statut' => $base()->where('type', 'candidature')
                ->selectRaw('statut, count(*) as n')->groupBy('statut')->pluck('n', 'statut'),
        ];
    }

    private function validatePayload(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'type' => ['sometimes', 'in:candidature,contact'],
            'poste' => [$required, 'string', 'max:200'],
            'entreprise' => ['sometimes', 'nullable', 'string', 'max:200'],
            'canal' => ['sometimes', 'nullable', 'string', 'max:100'],
            'url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'date_envoi' => ['sometimes', 'nullable', 'date'],
            'statut' => ['sometimes', 'in:'.implode(',', self::STATUTS)],
            'relance_due_le' => ['sometimes', 'nullable', 'date'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);
    }

    private function present(Candidature $c): array
    {
        return [
            'id' => $c->id,
            'type' => $c->type,
            'poste' => $c->poste,
            'entreprise' => $c->entreprise,
            'canal' => $c->canal,
            'url' => $c->url,
            'date_envoi' => $c->date_envoi?->toDateString(),
            'statut' => $c->statut,
            'relance_due_le' => $c->relance_due_le?->toDateString(),
            'relance_due' => (bool) ($c->relance_due_le && $c->relance_due_le->lte(now())),
            'notes' => $c->notes,
        ];
    }
}
