<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesOwner;
use App\Models\CardReview;
use App\Models\Formation;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Spaced repetition (SM-2) for flashcards. Each review updates the scheduler
 * state of one card for the current owner (user or anonymous client_token);
 * `due` lists the cards to study today, all formations combined.
 */
class ReviewController extends Controller
{
    use ResolvesOwner;

    /** Cards due today (due_at in the past), with their content, across all lessons. */
    public function due(Request $request): JsonResponse
    {
        $reviews = $this->scopeToOwner(CardReview::query(), $request)
            ->where('due_at', '<=', now())
            ->with('lesson.module.formation')
            ->orderBy('due_at')
            ->get();

        $cards = $reviews->map(function ($r) {
            $lesson = $r->lesson;
            $card = ($lesson?->cards ?? [])[$r->card_index] ?? null;
            if (! $lesson || ! $card) {
                return null; // lesson re-imported or card removed
            }
            $module = $lesson->module;

            return [
                'formation' => $module?->formation?->slug,
                'module' => $module?->slug,
                'lesson' => $lesson->slug,
                'lesson_title' => $lesson->title,
                'card_index' => $r->card_index,
                'q_html' => $card['q_html'] ?? null,
                'a_html' => $card['a_html'] ?? null,
                'due_at' => $r->due_at,
            ];
        })->filter()->values();

        return response()->json(['data' => $cards]);
    }

    /** Records a review of one flashcard and reschedules it via SM-2. */
    public function review(Request $request, Formation $formation, string $moduleSlug, string $lessonSlug, int $index): JsonResponse
    {
        $validated = $request->validate([
            'grade' => ['required', 'integer', 'min:0', 'max:5'], // 0-2 = raté, 3-5 = su
        ]);

        $lesson = Lesson::query()
            ->where('type', 'flashcards')
            ->whereHas('module', fn ($q) => $q->where('formation_id', $formation->id)->where('slug', $moduleSlug))
            ->where('slug', $lessonSlug)
            ->firstOrFail();

        $cards = is_array($lesson->cards) ? $lesson->cards : [];
        abort_unless(array_key_exists($index, $cards), 422, 'Carte inconnue.');

        $review = CardReview::firstOrNew(array_merge($this->ownerKeys($request), [
            'lesson_id' => $lesson->id,
            'card_index' => $index,
        ]));

        $this->applySm2($review, $validated['grade']);
        $review->save();

        return response()->json([
            'ease' => $review->ease,
            'interval_days' => $review->interval_days,
            'reps' => $review->reps,
            'due_at' => $review->due_at,
        ]);
    }

    /**
     * SM-2 scheduler. `$q` is the recall quality (0..5). The ease factor is always
     * adjusted (floored at 1.3); a fail (q < 3) resets the repetition streak.
     */
    private function applySm2(CardReview $review, int $q): void
    {
        $ease = $review->ease ?: 2.5;
        $ease = max(1.3, $ease + (0.1 - (5 - $q) * (0.08 + (5 - $q) * 0.02)));

        if ($q < 3) {
            $reps = 0;
            $interval = 0; // lapsed → due again the same day (like Anki's learning step)
        } else {
            $reps = ($review->reps ?? 0) + 1;
            $interval = match (true) {
                $reps === 1 => 1,
                $reps === 2 => 6,
                default => (int) round(($review->interval_days ?: 1) * $ease),
            };
        }

        $review->ease = round($ease, 2);
        $review->reps = $reps;
        $review->interval_days = $interval;
        $review->due_at = now()->addDays($interval);
    }
}
