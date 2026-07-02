<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesOwner;
use App\Models\Formation;
use App\Models\Progress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\Yaml\Yaml;

/**
 * Parcours = roadmap ordonnée d'étapes. Défini en YAML dans /content/_parcours/<slug>.yaml.
 * Une étape est soit une `formation` interne (progression calculée depuis la BDD),
 * soit un `jalon` externe (cert AWS/Claude… — statut manuel côté client).
 */
class ParcoursController extends Controller
{
    use ResolvesOwner;

    private const DIR = '/content/_parcours';

    public function index(): JsonResponse
    {
        $items = [];
        foreach (glob(self::DIR.'/*.{yaml,yml}', GLOB_BRACE) ?: [] as $path) {
            $meta = Yaml::parseFile($path) ?: [];
            $etapes = is_array($meta['etapes'] ?? null) ? $meta['etapes'] : [];
            $items[] = [
                'slug' => pathinfo($path, PATHINFO_FILENAME),
                'title' => $meta['title'] ?? pathinfo($path, PATHINFO_FILENAME),
                'objectif' => $meta['objectif'] ?? null,
                'etapes_count' => count($etapes),
                'total_duree_h' => array_sum(array_map(static fn ($e) => (int) ($e['duree_h'] ?? 0), $etapes)),
            ];
        }

        return response()->json(['data' => $items]);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $path = collect(["{$slug}.yaml", "{$slug}.yml"])
            ->map(fn ($n) => self::DIR.'/'.$n)
            ->first(fn ($p) => is_file($p));
        abort_unless($path, 404, 'Parcours introuvable.');

        $meta = Yaml::parseFile($path) ?: [];
        $owner = $this->ownerKeys($request);

        $etapes = [];
        foreach (($meta['etapes'] ?? []) as $i => $e) {
            $step = [
                'index' => $i + 1,
                'titre' => $e['titre'] ?? '—',
                'type' => $e['type'] ?? 'jalon',
                'duree_h' => (int) ($e['duree_h'] ?? 0),
                'url' => $e['url'] ?? null,
                'note' => $e['note'] ?? null,
                'ref' => $e['ref'] ?? null,
            ];

            if ($step['type'] === 'formation' && $step['ref']) {
                $formation = Formation::query()
                    ->where('slug', $step['ref'])
                    ->with('modules.lessons:id,module_id')
                    ->first();

                if ($formation) {
                    $lessonIds = $formation->modules->flatMap->lessons->pluck('id');
                    $total = $lessonIds->count();
                    $done = $total
                        ? Progress::query()->where($owner)->whereIn('lesson_id', $lessonIds)->where('completed', true)->count()
                        : 0;
                    $step['formation_exists'] = true;
                    $step['progress'] = $total ? (int) round($done * 100 / $total) : 0;
                } else {
                    $step['formation_exists'] = false;
                    $step['progress'] = 0;
                }
            }

            $etapes[] = $step;
        }

        return response()->json([
            'slug' => $slug,
            'title' => $meta['title'] ?? $slug,
            'objectif' => $meta['objectif'] ?? null,
            'total_duree_h' => array_sum(array_map(static fn ($s) => $s['duree_h'], $etapes)),
            'etapes' => $etapes,
        ]);
    }
}
