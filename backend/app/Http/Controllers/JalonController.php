<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesOwner;
use App\Models\Jalon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Jalons datés du plan de carrière (CRUD simple, un seul utilisateur visé). */
class JalonController extends Controller
{
    use ResolvesOwner;

    /** Plan de démonstration : exemple de jalons pour la feature « plan de carrière ». */
    private const PLAN_6_MOIS = [
        ['2026-01-15', 'Objectif 1 — cadrage', 'les-deux', "Périmètre défini · outils en place · premières actions planifiées"],
        ['2026-02-01', 'Livrable v0 publiable', 'recherche', "Premier livrable public + documentation à jour"],
        ['2026-03-01', 'Mi-parcours certification', 'les-deux', "Formation ≥ 50 % · avancement mesuré"],
        ['2026-03-15', 'Checkpoint mois 1', 'recherche', "Au moins un process en cours, sinon élargir les canaux"],
        ['2026-04-10', 'Examen blanc', 'etudes', "Score cible atteint · livrable v1 déployé"],
        ['2026-04-30', 'Certification obtenue', 'etudes', "Certification validée"],
        ['2026-05-15', 'Point de bascule', 'recherche', "Activer le plan B si nécessaire"],
        ['2026-05-31', 'Objectif principal atteint', 'recherche', "Résultat signé / validé"],
        ['2026-06-30', 'Étape suivante', 'etudes', "Nouveaux objectifs techniques"],
        ['2026-07-15', 'Bilan global', 'les-deux', "Bilan → lancement de l'étape suivante"],
    ];

    public function index(Request $request): JsonResponse
    {
        $jalons = $this->scopeToOwner(Jalon::query(), $request)
            ->orderBy('date_cible')
            ->get()
            ->map(fn (Jalon $j) => $this->present($j));

        return response()->json(['data' => $jalons]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);
        $jalon = Jalon::create($this->ownerKeys($request) + $data);

        return response()->json($this->present($jalon), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $jalon = $this->scopeToOwner(Jalon::query(), $request)->findOrFail($id);
        $data = $this->validatePayload($request, partial: true);

        // Passer à « fait » horodate automatiquement (et l'inverse nettoie).
        if (($data['statut'] ?? null) === 'fait' && empty($data['fait_le'])) {
            $data['fait_le'] = now()->toDateString();
        }
        if (($data['statut'] ?? null) && $data['statut'] !== 'fait') {
            $data['fait_le'] = null;
        }

        $jalon->update($data);

        return response()->json($this->present($jalon->fresh()));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->scopeToOwner(Jalon::query(), $request)->findOrFail($id)->delete();

        return response()->json(['deleted' => $id]);
    }

    /** Importe le plan 6 mois pour l'owner courant — idempotent (refuse si des jalons existent). */
    public function seedPlan(Request $request): JsonResponse
    {
        abort_if(
            $this->scopeToOwner(Jalon::query(), $request)->exists(),
            409,
            'Des jalons existent déjà — import ignoré.',
        );

        foreach (self::PLAN_6_MOIS as [$date, $titre, $front, $critere]) {
            Jalon::create($this->ownerKeys($request) + [
                'titre' => $titre,
                'date_cible' => $date,
                'front' => $front,
                'critere_mesurable' => $critere,
            ]);
        }

        return response()->json(['imported' => count(self::PLAN_6_MOIS)], 201);
    }

    private function validatePayload(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'titre' => [$required, 'string', 'max:200'],
            'date_cible' => [$required, 'date'],
            'front' => ['sometimes', 'in:recherche,etudes,les-deux'],
            'critere_mesurable' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'statut' => ['sometimes', 'in:a_venir,fait,rate,reporte'],
            'fait_le' => ['sometimes', 'nullable', 'date'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);
    }

    /** Présentation avec l'écart en jours vs la date cible (négatif = en retard). */
    private function present(Jalon $j): array
    {
        return [
            'id' => $j->id,
            'titre' => $j->titre,
            'date_cible' => $j->date_cible->toDateString(),
            'front' => $j->front,
            'critere_mesurable' => $j->critere_mesurable,
            'statut' => $j->statut,
            'fait_le' => $j->fait_le?->toDateString(),
            'notes' => $j->notes,
            // Jours restants avant la cible (négatif = dépassée) — figé à fait_le si terminé.
            'ecart_jours' => (int) now()->startOfDay()->diffInDays($j->date_cible, false),
        ];
    }
}
