<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\Lesson;
use App\Models\Progress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    /** Slugs des leçons complétées pour une formation et un client donné. */
    public function index(Request $request, Formation $formation): JsonResponse
    {
        $token = $this->token($request);

        $lessonIds = Lesson::query()
            ->whereHas('module', fn ($q) => $q->where('formation_id', $formation->id))
            ->pluck('id');

        $completed = Progress::query()
            ->where('client_token', $token)
            ->whereIn('lesson_id', $lessonIds)
            ->where('completed', true)
            ->pluck('lesson_id');

        $done = Lesson::whereIn('id', $completed)
            ->with('module:id,slug')
            ->get()
            ->map(fn ($l) => $l->module->slug.'/'.$l->slug);

        return response()->json([
            'completed' => $done->values(),
            'total' => $lessonIds->count(),
        ]);
    }

    /** Marque/démarque une leçon comme complétée. */
    public function toggle(Request $request, Formation $formation, string $moduleSlug, string $lessonSlug): JsonResponse
    {
        $token = $this->token($request);

        $lesson = Lesson::query()
            ->whereHas('module', fn ($q) => $q->where('formation_id', $formation->id)->where('slug', $moduleSlug))
            ->where('slug', $lessonSlug)
            ->firstOrFail();

        $completed = (bool) $request->boolean('completed', true);

        Progress::updateOrCreate(
            ['client_token' => $token, 'lesson_id' => $lesson->id],
            ['completed' => $completed],
        );

        return response()->json(['completed' => $completed]);
    }

    private function token(Request $request): string
    {
        return (string) ($request->header('X-Client-Token') ?: $request->input('client_token') ?: 'anonymous');
    }
}
