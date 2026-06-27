<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesOwner;
use App\Models\Formation;
use App\Models\Lesson;
use App\Models\Progress;
use App\Models\QuizAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    use ResolvesOwner;

    /**
     * Corrige un quiz : calcule le score, persiste la tentative, renvoie le
     * feedback par question (bonne réponse + explication).
     */
    public function grade(Request $request, Formation $formation, string $moduleSlug, string $lessonSlug): JsonResponse
    {
        $validated = $request->validate([
            'answers' => ['required', 'array'],          // { "<question_id>": <index choisi> }
        ]);

        $lesson = Lesson::query()
            ->where('type', 'quiz')
            ->whereHas('module', fn ($q) => $q->where('formation_id', $formation->id)->where('slug', $moduleSlug))
            ->where('slug', $lessonSlug)
            ->with('quizQuestions')
            ->firstOrFail();

        $answers = $validated['answers'];
        $score = 0;
        $feedback = [];

        foreach ($lesson->quizQuestions as $q) {
            $chosen = $answers[$q->id] ?? $answers[(string) $q->id] ?? null;
            $chosen = is_null($chosen) ? null : (int) $chosen;
            $correct = $chosen === $q->correct_index;
            if ($correct) {
                $score++;
            }

            $feedback[] = [
                'id' => $q->id,
                'chosen' => $chosen,
                'correct_index' => $q->correct_index,
                'correct' => $correct,
                'explanation_html' => $q->explanation_html,
            ];
        }

        $total = $lesson->quizQuestions->count();
        $owner = $this->ownerKeys($request);

        QuizAttempt::create(array_merge($owner, [
            'lesson_id' => $lesson->id,
            'score' => $score,
            'total' => $total,
            'answers' => $answers,
        ]));

        // Un quiz tenté compte comme leçon « complétée » dans la progression.
        Progress::updateOrCreate(
            array_merge($owner, ['lesson_id' => $lesson->id]),
            ['completed' => true],
        );

        return response()->json([
            'score' => $score,
            'total' => $total,
            'feedback' => $feedback,
        ]);
    }
}
