<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesOwner;
use App\Models\Formation;
use App\Models\Lesson;
use App\Models\Progress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    use ResolvesOwner;

    /** Slugs of completed lessons for a training and the current owner. */
    public function index(Request $request, Formation $formation): JsonResponse
    {
        $lessonIds = Lesson::query()
            ->whereHas('module', fn ($q) => $q->where('formation_id', $formation->id))
            ->pluck('id');

        $completed = $this->scopeToOwner(Progress::query(), $request)
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

    /** Marks/unmarks a lesson as completed. */
    public function toggle(Request $request, Formation $formation, string $moduleSlug, string $lessonSlug): JsonResponse
    {
        $lesson = Lesson::query()
            ->whereHas('module', fn ($q) => $q->where('formation_id', $formation->id)->where('slug', $moduleSlug))
            ->where('slug', $lessonSlug)
            ->firstOrFail();

        $completed = (bool) $request->boolean('completed', true);

        Progress::updateOrCreate(
            array_merge($this->ownerKeys($request), ['lesson_id' => $lesson->id]),
            ['completed' => $completed],
        );

        return response()->json(['completed' => $completed]);
    }
}
