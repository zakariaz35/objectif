<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Services\FormationImporter;
use Illuminate\Http\JsonResponse;
use Symfony\Component\Yaml\Yaml;

class FormationController extends Controller
{
    /** List of trainings (without the heavy content). */
    public function index(): JsonResponse
    {
        $formations = Formation::query()
            ->withCount('modules')
            ->orderBy('position')
            ->orderBy('title')
            ->get()
            ->map(fn (Formation $f) => [
                'slug' => $f->slug,
                'title' => $f->title,
                'description' => $f->description,
                'stack' => $f->stack,
                'track' => $f->track,
                'tags' => $f->tags ?? [],
                'modules_count' => $f->modules_count,
            ]);

        return response()->json(['data' => $formations]);
    }

    /** Full tree of a training: modules + lessons (titles only). */
    public function show(Formation $formation): JsonResponse
    {
        $formation->load(['modules.lessons' => function ($q) {
            $q->select('id', 'module_id', 'slug', 'title', 'type', 'position');
        }]);

        return response()->json([
            'slug' => $formation->slug,
            'title' => $formation->title,
            'description' => $formation->description,
            'stack' => $formation->stack,
            'track' => $formation->track,
            'tags' => $formation->tags ?? [],
            'modules' => $formation->modules->map(fn ($m) => [
                'slug' => $m->slug,
                'title' => $m->title,
                'lessons' => $m->lessons->map(fn ($l) => [
                    'slug' => $l->slug,
                    'title' => $l->title,
                    'type' => $l->type,
                ]),
            ]),
        ]);
    }

    /** Importe une formation du dossier content/ par son slug (côté serveur, en un clic). */
    public function import(string $slug): JsonResponse
    {
        abort_unless(preg_match('/^[a-z0-9-]+$/', $slug), 422, 'Identifiant invalide.');
        $dir = '/content/'.$slug;
        abort_unless(is_dir($dir), 404, "Aucun contenu « {$slug} » à importer.");

        $formation = app(FormationImporter::class)->importDirectory($dir);

        return response()->json([
            'slug' => $formation->slug,
            'title' => $formation->title,
            'modules_count' => $formation->modules()->count(),
        ]);
    }

    /** Liste les formations disponibles dans content/ (importables) avec leur statut. */
    public function availableContent(): JsonResponse
    {
        $imported = Formation::query()->pluck('slug')->all();
        $items = [];
        foreach (glob('/content/*', GLOB_ONLYDIR) ?: [] as $dir) {
            $name = basename($dir);
            if (str_starts_with($name, '_') || ! is_file($dir.'/formation.yaml')) {
                continue;
            }
            $meta = Yaml::parseFile($dir.'/formation.yaml') ?: [];
            $slug = $meta['slug'] ?? $name;
            $items[] = [
                'slug' => $name, // identifiant d'import (dossier)
                'title' => $meta['title'] ?? $name,
                'stack' => $meta['stack'] ?? null,
                'imported' => in_array($slug, $imported, true) || in_array($name, $imported, true),
            ];
        }
        usort($items, static fn ($a, $b) => strcmp($a['title'], $b['title']));

        return response()->json(['data' => $items]);
    }
}
