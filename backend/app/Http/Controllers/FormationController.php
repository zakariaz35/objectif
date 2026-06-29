<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use Illuminate\Http\JsonResponse;

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
}
