<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesOwner;
use App\Models\Revue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Revue hebdomadaire (rituel du dimanche) — une par semaine ISO, upsert. */
class RevueController extends Controller
{
    use ResolvesOwner;

    public function index(Request $request): JsonResponse
    {
        $revues = $this->scopeToOwner(Revue::query(), $request)
            ->orderByDesc('semaine')
            ->limit((int) $request->query('limit', 12))
            ->get()
            ->map(fn ($r) => $this->present($r));

        return response()->json(['data' => $revues]);
    }

    /** Crée ou met à jour la revue de la semaine visée (défaut : semaine courante). */
    public function upsert(Request $request): JsonResponse
    {
        $data = $request->validate([
            'semaine' => ['sometimes', 'date'],
            'demontrable' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'heures_etudes_estimees' => ['sometimes', 'integer', 'min:0', 'max:120'],
            'blocages' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'humeur' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:5'],
        ]);

        // Normalise au lundi ISO de la semaine.
        $semaine = \Carbon\Carbon::parse($data['semaine'] ?? now())->startOfWeek()->toDateString();
        unset($data['semaine']);

        $revue = Revue::updateOrCreate(
            $this->ownerKeys($request) + ['semaine' => $semaine],
            $data,
        );

        return response()->json($this->present($revue->fresh()), $revue->wasRecentlyCreated ? 201 : 200);
    }

    private function present(Revue $r): array
    {
        return [
            'id' => $r->id,
            'semaine' => $r->semaine->toDateString(),
            'demontrable' => $r->demontrable,
            'heures_etudes_estimees' => $r->heures_etudes_estimees,
            'blocages' => $r->blocages,
            'humeur' => $r->humeur,
        ];
    }
}
