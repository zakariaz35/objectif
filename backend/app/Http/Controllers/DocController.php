<?php

namespace App\Http\Controllers;

use App\Services\MarkdownService;
use Illuminate\Http\JsonResponse;

class DocController extends Controller
{
    public function __construct(private readonly MarkdownService $markdown) {}

    /**
     * Sert un document Markdown du dépôt, rendu en HTML.
     * Allowlist stricte (pas de chemin arbitraire).
     */
    public function show(string $doc): JsonResponse
    {
        $paths = [
            'format' => '/content/FORMAT.md',          // monté dans le conteneur
            'readme' => base_path('README.md'),         // monté sur /app/README.md
        ];

        $file = $paths[$doc] ?? null;
        if ($file === null || ! is_file($file)) {
            return response()->json(['message' => 'Document introuvable.'], 404);
        }

        return response()->json([
            'doc' => $doc,
            'html' => $this->markdown->toHtml(file_get_contents($file)),
        ]);
    }
}
