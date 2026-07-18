<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesOwner;
use App\Services\SuiviAggregator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Suivi centralisé : préparation aux certifications (tests blancs vs seuils réels),
 * activité quotidienne (quiz + révisions + leçons + candidatures), santé du SRS,
 * et progression du parcours AWS. Toute la logique vit dans SuiviAggregator
 * (partagée avec /suivi/etat, l'endpoint consommé par l'assistant IA).
 */
class SuiviController extends Controller
{
    use ResolvesOwner;

    public function show(Request $request): JsonResponse
    {
        $suivi = new SuiviAggregator(
            $this->currentUser($request)?->id,
            $this->clientToken($request),
        );

        return response()->json([
            'certifs' => $suivi->certifs(),
            'activite' => $suivi->activite(),
            'srs' => $suivi->srs(),
            'parcours_aws' => $suivi->progressionFormation('parcours-aws'),
        ]);
    }
}
