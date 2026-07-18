<?php

namespace App\Http\Controllers;

use App\Services\MarkdownService;
use Illuminate\Http\JsonResponse;

class DocController extends Controller
{
    public function __construct(private readonly MarkdownService $markdown) {}

    /**
     * Serves a Markdown document from the repo, rendered as HTML.
     * Strict allowlist (no arbitrary path).
     */
    public function show(string $doc): JsonResponse
    {
        $paths = [
            'format' => '/content/FORMAT.md',          // mounted in the container
            'readme' => base_path('README.md'),         // mounted at /app/README.md
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
