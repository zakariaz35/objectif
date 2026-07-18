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
     * Grades an auto-scored lesson. Polymorphic on the lesson type: a quiz is
     * graded from `answers`, a matching lesson from `mapping`. Any other type is
     * rejected (422). In all cases an attempt is persisted and progress marked.
     */
    public function grade(Request $request, Formation $formation, string $moduleSlug, string $lessonSlug): JsonResponse
    {
        $lesson = Lesson::query()
            ->whereHas('module', fn ($q) => $q->where('formation_id', $formation->id)->where('slug', $moduleSlug))
            ->where('slug', $lessonSlug)
            ->firstOrFail();

        return match ($lesson->type) {
            'quiz' => $this->gradeQuiz($request, $lesson),
            'matching' => $this->gradeMatching($request, $lesson),
            'cloze' => $this->gradeCloze($request, $lesson),
            default => abort(422, 'Cette leçon ne peut pas être notée.'),
        };
    }

    /**
     * Quiz: computes the score, persists the attempt, returns per-question
     * feedback (correct answer + explanation) and, for placement quizzes, the
     * CEFR level.
     */
    private function gradeQuiz(Request $request, Lesson $lesson): JsonResponse
    {
        $validated = $request->validate([
            'answers' => ['required', 'array'],          // { "<question_id>": <chosen index> }
        ]);

        $lesson->load('quizQuestions');
        $answers = $validated['answers'];
        $score = 0;
        $feedback = [];

        // Grade only the questions actually presented (i.e. answered). For linear
        // quizzes the front-end requires every question to be answered, so this
        // equals the full pool; for `random`/`review` subsets, the total reflects
        // exactly what was shown. Iterate by position to keep feedback ordered.
        foreach ($lesson->quizQuestions as $q) {
            if (! array_key_exists($q->id, $answers) && ! array_key_exists((string) $q->id, $answers)) {
                continue;
            }
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

        $total = count($feedback);

        // Placement quiz (kind: placement) → derive a CEFR level from the score ratio.
        $level = null;
        if (data_get($lesson->meta, 'kind') === 'placement') {
            $ratio = $total > 0 ? $score / $total : 0.0;
            $level = $this->cefrLevel($ratio, data_get($lesson->meta, 'scoring', []));
        }

        $this->persistAttempt($request, $lesson, $score, $total, $answers, $level);

        return response()->json([
            'score' => $score,
            'total' => $total,
            'level' => $level,
            'feedback' => $feedback,
        ]);
    }

    /**
     * Matching (relier EN↔FR): the submitted `mapping` links a left id to a right
     * id, both being indices into the lesson `pairs`. A link is correct when the
     * two ids match. Returns the correct pairing so the front can show answers.
     */
    private function gradeMatching(Request $request, Lesson $lesson): JsonResponse
    {
        $validated = $request->validate([
            'mapping' => ['required', 'array'],          // { "<leftId>": <rightId> }
        ]);

        $pairs = is_array($lesson->pairs) ? $lesson->pairs : [];
        $mapping = $validated['mapping'];
        $total = count($pairs);
        $score = 0;
        $feedback = [];

        // Anti-cheat is out of scope (self-study): the correct right id equals the
        // left id, so a link is correct when leftId === chosenRightId.
        foreach (array_keys($pairs) as $i) {
            $chosen = $mapping[$i] ?? $mapping[(string) $i] ?? null;
            $chosen = is_null($chosen) ? null : (int) $chosen;
            $correct = $chosen === $i;
            if ($correct) {
                $score++;
            }

            $feedback[] = [
                'left_id' => $i,
                'chosen_right' => $chosen,
                'correct_right' => $i,
                'correct' => $correct,
            ];
        }

        $this->persistAttempt($request, $lesson, $score, $total, $mapping, null);

        return response()->json([
            'score' => $score,
            'total' => $total,
            'level' => null,
            'feedback' => $feedback,
        ]);
    }

    /**
     * Cloze (texte à trous): `answers` maps a global gap index to the learner's
     * text. A gap is correct if the (lowercased, trimmed) input matches one of the
     * `|`-separated accepted answers. Returns the expected answer per gap.
     */
    private function gradeCloze(Request $request, Lesson $lesson): JsonResponse
    {
        $validated = $request->validate([
            'answers' => ['required', 'array'], // { "<gapIndex>": "<texte saisi>" }
        ]);

        $submitted = $validated['answers'];
        $items = is_array($lesson->cloze) ? $lesson->cloze : [];
        $gap = 0;
        $score = 0;
        $feedback = [];

        foreach ($items as $item) {
            foreach (($item['answers'] ?? []) as $answer) {
                $user = trim((string) ($submitted[$gap] ?? $submitted[(string) $gap] ?? ''));
                $accepted = array_map(fn ($a) => mb_strtolower(trim($a)), explode('|', (string) $answer));
                $correct = in_array(mb_strtolower($user), $accepted, true);
                if ($correct) {
                    $score++;
                }

                $feedback[] = [
                    'gap' => $gap,
                    'user' => $user,
                    'answer' => $answer,
                    'correct' => $correct,
                ];
                $gap++;
            }
        }

        $this->persistAttempt($request, $lesson, $score, $gap, $submitted, null);

        return response()->json([
            'score' => $score,
            'total' => $gap,
            'level' => null,
            'feedback' => $feedback,
        ]);
    }

    /** Persists the attempt (reusing the `answers` column for any payload) and marks progress. */
    private function persistAttempt(Request $request, Lesson $lesson, int $score, int $total, array $answers, ?string $level): void
    {
        $owner = $this->ownerKeys($request);

        QuizAttempt::create(array_merge($owner, [
            'lesson_id' => $lesson->id,
            'score' => $score,
            'total' => $total,
            'level' => $level,
            'answers' => $answers,
        ]));

        // An attempted quiz/matching counts as a "completed" lesson in the progress.
        Progress::updateOrCreate(
            array_merge($owner, ['lesson_id' => $lesson->id]),
            ['completed' => true],
        );
    }

    /**
     * Maps a score ratio (0..1) to a CEFR band. `$scoring` is a list of
     * { min: float, label: string }; we pick the band with the highest `min`
     * the ratio reaches — order-independent, so a mis-ordered barème still works.
     *
     * @param  array<int,array{min?:mixed,label?:mixed}>  $scoring
     */
    private function cefrLevel(float $ratio, mixed $scoring): ?string
    {
        if (! is_array($scoring)) {
            return null;
        }

        $best = null;
        foreach ($scoring as $band) {
            if (! is_array($band) || ! isset($band['label'])) {
                continue;
            }
            $min = (float) ($band['min'] ?? 0);
            if ($ratio >= $min && ($best === null || $min > $best['min'])) {
                $best = ['min' => $min, 'label' => (string) $band['label']];
            }
        }

        return $best['label'] ?? null;
    }
}
