<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use Illuminate\Http\JsonResponse;

class FormationController extends Controller
{
    /** Liste des formations (sans le contenu lourd). */
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
                'modules_count' => $f->modules_count,
            ]);

        return response()->json(['data' => $formations]);
    }

    /** Arbre complet d'une formation : modules + leçons (titres seulement). */
    public function show(Formation $formation): JsonResponse
    {
        $formation->load(['modules.lessons' => function ($q) {
            $q->select('id', 'module_id', 'slug', 'title', 'type', 'position');
        }]);

        return response()->json([
            'slug' => $formation->slug,
            'title' => $formation->title,
            'description' => $formation->description,
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
}
