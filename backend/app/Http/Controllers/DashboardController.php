<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesOwner;
use App\Models\Progress;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Learner dashboard for the current owner: latest CEFR level, activity streak,
 * and mastery broken down by question tag and by level (weakest first) — all
 * computed from the recorded quiz attempts.
 */
class DashboardController extends Controller
{
    use ResolvesOwner;

    public function show(Request $request): JsonResponse
    {
        $attempts = $this->scopeToOwner(QuizAttempt::query(), $request)
            ->orderBy('created_at')
            ->get(['answers', 'level', 'created_at']);

        // Latest CEFR level (most recent placement attempt).
        $latestLevel = $attempts->whereNotNull('level')->last()?->level;

        // Daily streak (consecutive days with activity, ending today or yesterday).
        $days = $attempts->map(fn ($a) => $a->created_at?->format('Y-m-d'))->filter()->unique()->all();
        $streak = $this->currentStreak($days);

        // Mastery by tag / by level: replay every answered question.
        $qids = $attempts->flatMap(fn ($a) => array_keys($a->answers ?? []))->map(fn ($id) => (int) $id)->unique();
        $questions = QuizQuestion::whereIn('id', $qids)->get(['id', 'correct_index', 'tags', 'level'])->keyBy('id');

        $byTag = [];
        $byLevel = [];
        foreach ($attempts as $a) {
            foreach (($a->answers ?? []) as $qid => $chosen) {
                $q = $questions->get((int) $qid);
                if (! $q) {
                    continue;
                }
                $ok = (int) $chosen === (int) $q->correct_index;
                foreach ((array) ($q->tags ?? []) as $tag) {
                    $this->tally($byTag, (string) $tag, $ok);
                }
                if ($q->level) {
                    $this->tally($byLevel, (string) $q->level, $ok);
                }
            }
        }

        return response()->json([
            'latest_level' => $latestLevel,
            'streak' => $streak,
            'lessons_completed' => $this->scopeToOwner(Progress::query(), $request)->where('completed', true)->count(),
            'mastery' => $this->format($byTag),
            'by_level' => $this->format($byLevel),
        ]);
    }

    /** @param  array<string,array{total:int,correct:int}>  $agg */
    private function tally(array &$agg, string $label, bool $ok): void
    {
        $agg[$label] ??= ['total' => 0, 'correct' => 0];
        $agg[$label]['total']++;
        if ($ok) {
            $agg[$label]['correct']++;
        }
    }

    /**
     * Turns the aggregate into a list sorted weakest-first (lowest mastery %).
     *
     * @param  array<string,array{total:int,correct:int}>  $agg
     */
    private function format(array $agg): array
    {
        $out = [];
        foreach ($agg as $label => $v) {
            $out[] = [
                'label' => $label,
                'total' => $v['total'],
                'correct' => $v['correct'],
                'pct' => $v['total'] ? (int) round($v['correct'] / $v['total'] * 100) : 0,
            ];
        }
        usort($out, fn ($a, $b) => $a['pct'] <=> $b['pct']);

        return $out;
    }

    /** @param  list<string>  $days  Y-m-d strings (any order). */
    private function currentStreak(array $days): int
    {
        if (empty($days)) {
            return 0;
        }
        $set = array_flip($days);

        // Streak only counts if the most recent activity is today or yesterday.
        $today = now();
        $yesterday = now()->subDay();
        $cursor = isset($set[$today->format('Y-m-d')])
            ? $today
            : (isset($set[$yesterday->format('Y-m-d')]) ? $yesterday : null);
        if (! $cursor) {
            return 0; // last activity is older than yesterday → streak broken
        }

        $streak = 0;
        while (isset($set[$cursor->format('Y-m-d')])) {
            $streak++;
            $cursor = $cursor->copy()->subDay();
        }

        return $streak;
    }
}
