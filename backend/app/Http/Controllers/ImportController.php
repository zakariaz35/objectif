<?php

namespace App\Http\Controllers;

use App\Services\FormationImporter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImportController extends Controller
{
    public function __construct(private readonly FormationImporter $importer) {}

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'archive' => ['required', 'file', 'mimetypes:application/zip,application/x-zip-compressed,multipart/x-zip', 'max:51200'],
        ]);

        $file = $request->file('archive');
        $fallbackName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

        try {
            $formation = $this->importer->importZip($file->getRealPath(), $fallbackName);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => "Échec de l'import : ".$e->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Formation importée.',
            'formation' => [
                'slug' => $formation->slug,
                'title' => $formation->title,
                'modules' => $formation->modules->count(),
                'lessons' => $formation->modules->sum(fn ($m) => $m->lessons->count()),
            ],
        ], 201);
    }
}
