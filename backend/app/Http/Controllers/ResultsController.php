<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesOwner;
use App\Models\Formation;
use App\Models\Lesson;
use App\Models\QuizAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Reads back quiz attempts for the current owner (logged-in user or anonymous
 * client_token) — history per quiz, and a placement-level summary.
 */
class ResultsController extends Controller
{
    use ResolvesOwner;

    /**
     * History of attempts for one quiz (oldest first). Each attempt carries the
     * list of `missed` question ids (answered wrong) — used by the `review`
     * strategy to re-present only what the learner got wrong.
     */
    public function attempts(Request $request, Formation $formation, string $moduleSlug, string $lessonSlug): JsonResponse
    {
        $lesson = Lesson::query()
            ->whereHas('module', fn ($q) => $q->where('formation_id', $formation->id)->where('slug', $moduleSlug))
            ->where('slug', $lessonSlug)
            ->with('quizQuestions:id,lesson_id,correct_index')
            ->firstOrFail();

        $correctById = $lesson->quizQuestions->pluck('correct_index', 'id');

        $attempts = $this->scopeToOwner(QuizAttempt::query(), $request)
            ->where('lesson_id', $lesson->id)
            ->orderBy('created_at')
            ->get(['id', 'score', 'total', 'level', 'answers', 'created_at']);

        $data = $attempts->map(function ($a) use ($correctById) {
            $missed = [];
            foreach (($a->answers ?? []) as $qid => $chosen) {
                $ci = $correctById[(int) $qid] ?? null;
                if ($ci !== null && (int) $chosen !== (int) $ci) {
                    $missed[] = (int) $qid;
                }
            }

            return [
                'id' => $a->id,
                'score' => $a->score,
                'total' => $a->total,
                'level' => $a->level,
                'created_at' => $a->created_at,
                'missed' => $missed,
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Placement summary: every attempt carrying a CEFR level, grouped by quiz.
     * `WHERE level IS NOT NULL` selects exactly the placement attempts — no join
     * on lessons nor JSON filtering on meta->kind needed.
     */
    public function results(Request $request): JsonResponse
    {
        $attempts = $this->scopeToOwner(QuizAttempt::query(), $request)
            ->whereNotNull('level')
            ->with('lesson.module.formation')
            ->orderBy('created_at')
            ->get();

        $byLesson = $attempts->groupBy('lesson_id')->map(function ($group) {
            $last = $group->last();
            $lesson = $last->lesson;
            $module = $lesson?->module;
            $formation = $module?->formation;

            return [
                'lesson_id' => $last->lesson_id,
                'title' => $lesson?->title,
                'formation' => $formation?->slug,
                'module' => $module?->slug,
                'lesson' => $lesson?->slug,
                'latest_level' => $last->level,
                'attempts' => $group->map(fn ($a) => [
                    'id' => $a->id,
                    'score' => $a->score,
                    'total' => $a->total,
                    'level' => $a->level,
                    'created_at' => $a->created_at,
                ])->values(),
            ];
        })->values();

        return response()->json(['data' => $byLesson]);
    }
}
