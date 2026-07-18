<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesOwner;
use App\Models\Formation;
use App\Models\Progress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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
            'heures_par_semaine' => isset($meta['heures_par_semaine']) ? (int) $meta['heures_par_semaine'] : null,
            'total_duree_h' => array_sum(array_map(static fn ($s) => $s['duree_h'], $etapes)),
            'etapes' => $etapes,
        ]);
    }

    /** Crée un parcours (fichier YAML dans /content/_parcours). */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);
        $slug = Str::slug($data['slug'] ?? $data['title']);
        abort_if($slug === '', 422, 'Titre invalide.');
        abort_if(is_file(self::DIR."/{$slug}.yaml") || is_file(self::DIR."/{$slug}.yml"), 409, 'Un parcours porte déjà ce nom.');

        $this->writeYaml($slug, $data);

        return response()->json(['slug' => $slug], 201);
    }

    /** Met à jour un parcours existant (réécrit son YAML). */
    public function update(Request $request, string $slug): JsonResponse
    {
        abort_unless(preg_match('/^[a-z0-9-]+$/', $slug), 422, 'Identifiant invalide.');
        abort_unless(is_file(self::DIR."/{$slug}.yaml") || is_file(self::DIR."/{$slug}.yml"), 404, 'Parcours introuvable.');

        $data = $this->validatePayload($request);
        $this->writeYaml($slug, $data);

        return response()->json(['slug' => $slug]);
    }

    /** Supprime un parcours (son fichier YAML). */
    public function destroy(string $slug): JsonResponse
    {
        abort_unless(preg_match('/^[a-z0-9-]+$/', $slug), 422, 'Identifiant invalide.');
        $path = collect(["{$slug}.yaml", "{$slug}.yml"])
            ->map(fn ($n) => self::DIR.'/'.$n)
            ->first(fn ($p) => is_file($p));
        abort_unless($path, 404, 'Parcours introuvable.');

        unlink($path);

        return response()->json(['deleted' => $slug]);
    }

    /** Valide le corps commun de store/update. */
    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:100'],
            'objectif' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'heures_par_semaine' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:80'],
            'etapes' => ['required', 'array', 'min:1'],
            'etapes.*.titre' => ['required', 'string', 'max:200'],
            'etapes.*.type' => ['required', 'in:formation,jalon'],
            'etapes.*.duree_h' => ['required', 'integer', 'min:0', 'max:2000'],
            'etapes.*.ref' => ['required_if:etapes.*.type,formation', 'nullable', 'string', 'max:100'],
            'etapes.*.url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'etapes.*.note' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);
    }

    /** Écrit le YAML du parcours (mêmes clés que les fichiers rédigés à la main). */
    private function writeYaml(string $slug, array $data): void
    {
        $doc = array_filter([
            'title' => $data['title'],
            'objectif' => $data['objectif'] ?? null,
            'heures_par_semaine' => $data['heures_par_semaine'] ?? null,
        ], static fn ($v) => $v !== null && $v !== '');

        $doc['etapes'] = array_map(static fn ($e) => array_filter([
            'titre' => $e['titre'],
            'type' => $e['type'],
            'ref' => $e['type'] === 'formation' ? ($e['ref'] ?? null) : null,
            'duree_h' => (int) $e['duree_h'],
            'url' => $e['url'] ?? null,
            'note' => $e['note'] ?? null,
        ], static fn ($v) => $v !== null && $v !== ''), $data['etapes']);

        if (! is_dir(self::DIR)) {
            mkdir(self::DIR, 0775, true);
        }
        file_put_contents(self::DIR."/{$slug}.yaml", Yaml::dump($doc, 4, 2));
    }
}
