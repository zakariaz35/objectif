<?php

namespace App\Services;

use App\Models\Candidature;
use App\Models\CardReview;
use App\Models\Formation;
use App\Models\Lesson;
use App\Models\Progress;
use App\Models\QuizAttempt;
use Illuminate\Database\Eloquent\Builder;

/**
 * Agrégation du suivi (études + activité + SRS + plan de carrière).
 * Indépendant de la requête HTTP : l'owner est fixé à la construction,
 * ce qui permet la réutilisation par /me/suivi, le cockpit et /suivi/etat.
 */
class SuiviAggregator
{
    /**
     * Seuils par test blanc : `seuil` = seuil de réussite de l'examen réel,
     * `cible` = score recommandé avant de réserver (marge de sécurité).
     * Clé : "<slug formation>/<slug module>".
     */
    private const CERTIFS = [
        'parcours-aws/test-blanc' => ['exam' => 'AWS SAA-C03', 'seuil' => 0.72, 'cible' => 0.80],
        'prep-certifs-claude/test-blanc-ccdv' => ['exam' => 'CCDV-F (Developer)', 'seuil' => 0.72, 'cible' => 0.80],
        'prep-certifs-claude/test-blanc-cca' => ['exam' => 'CCA-F (Architect)', 'seuil' => 0.72, 'cible' => 0.80],
        'parcours-scrum/test-blanc' => ['exam' => 'PSM I', 'seuil' => 0.85, 'cible' => 0.88],
    ];

    public function __construct(
        private readonly ?int $userId,
        private readonly ?string $clientToken,
    ) {}

    /** Filtre une requête par l'owner courant (même sémantique que ResolvesOwner). */
    public function scope(Builder $query): Builder
    {
        return $this->userId !== null
            ? $query->where('user_id', $this->userId)
            : $query->where('client_token', $this->clientToken);
    }

    /** Un bloc par test blanc : tentatives, dernier/meilleur score, statut de préparation. */
    public function certifs(): array
    {
        $lessons = Lesson::query()
            ->where('type', 'quiz')
            ->whereHas('module', fn ($q) => $q->where('slug', 'like', '%test-blanc%'))
            ->with('module.formation:id,slug,title')
            ->withCount('quizQuestions')
            ->get();

        $out = [];
        foreach ($lessons as $lesson) {
            $formation = $lesson->module->formation;
            $key = "{$formation->slug}/{$lesson->module->slug}";
            $meta = self::CERTIFS[$key] ?? ['exam' => $formation->title, 'seuil' => 0.72, 'cible' => 0.80];

            $attempts = $this->scope(QuizAttempt::query())
                ->where('lesson_id', $lesson->id)
                ->orderBy('created_at')
                ->get(['score', 'total', 'created_at']);

            $pct = fn ($a) => $a->total ? round($a->score * 100 / $a->total) : 0;
            $last = $attempts->last();
            $best = $attempts->sortByDesc(fn ($a) => $a->total ? $a->score / $a->total : 0)->first();

            // Prêt = les DEUX dernières tentatives ≥ cible (règle « réserve quand tu
            // passes la cible deux fois de suite ») ; sinon en bonne voie si le seuil
            // réel est déjà atteint au moins une fois.
            $lastTwo = $attempts->slice(-2);
            $status = 'non-commence';
            if ($attempts->isNotEmpty()) {
                $status = 'en-cours';
                if ($best && $pct($best) >= $meta['seuil'] * 100) {
                    $status = 'en-bonne-voie';
                }
                if ($lastTwo->count() === 2 && $lastTwo->every(fn ($a) => $pct($a) >= $meta['cible'] * 100)) {
                    $status = 'pret';
                }
            }

            $out[] = [
                'exam' => $meta['exam'],
                'formation' => $formation->slug,
                'module' => $lesson->module->slug,
                'lesson' => $lesson->slug,
                'questions' => $lesson->quiz_questions_count,
                'seuil_pct' => (int) round($meta['seuil'] * 100),
                'cible_pct' => (int) round($meta['cible'] * 100),
                'attempts' => $attempts->count(),
                'last' => $last ? ['score' => $last->score, 'total' => $last->total, 'pct' => $pct($last), 'date' => $last->created_at?->toDateString()] : null,
                'best' => $best ? ['score' => $best->score, 'total' => $best->total, 'pct' => $pct($best)] : null,
                'status' => $status,
            ];
        }

        // Ordre stable : AWS, CCDV, CCA, PSM (ordre de la constante), inconnus à la fin.
        $rank = array_flip(array_keys(self::CERTIFS));
        usort($out, fn ($a, $b) => ($rank["{$a['formation']}/{$a['module']}"] ?? 99) <=> ($rank["{$b['formation']}/{$b['module']}"] ?? 99));

        return $out;
    }

    /**
     * Activité des 8 dernières semaines, jour par jour. Inclut les candidatures
     * créées : chercher compte comme travailler (règle des 2 jours du plan).
     */
    public function activite(): array
    {
        $from = now()->subDays(55)->startOfDay();

        $perDay = function (Builder $query, string $column) use ($from) {
            return $this->scope($query)
                ->where($column, '>=', $from)
                ->get([$column])
                ->countBy(fn ($r) => $r->{$column}->format('Y-m-d'));
        };

        $quiz = $perDay(QuizAttempt::query(), 'created_at');
        $reviews = $perDay(CardReview::query(), 'updated_at');
        $lessons = $perDay(Progress::query()->where('completed', true), 'updated_at');
        $candidatures = $perDay(Candidature::query(), 'created_at');

        $days = [];
        for ($d = $from->copy(); $d <= now()->endOfDay(); $d->addDay()) {
            $k = $d->format('Y-m-d');
            $days[] = [
                'date' => $k,
                'quiz' => $quiz[$k] ?? 0,
                'reviews' => $reviews[$k] ?? 0,
                'lessons' => $lessons[$k] ?? 0,
                'candidatures' => $candidatures[$k] ?? 0,
            ];
        }

        $week = array_slice($days, -7);

        return [
            'days' => $days,
            'semaine' => [
                'quiz' => array_sum(array_column($week, 'quiz')),
                'reviews' => array_sum(array_column($week, 'reviews')),
                'lessons' => array_sum(array_column($week, 'lessons')),
                'jours_actifs' => count(array_filter($week, fn ($d) => $d['quiz'] + $d['reviews'] + $d['lessons'] + $d['candidatures'] > 0)),
            ],
            'regle_2_jours' => $this->regleDeuxJours($days),
        ];
    }

    /** « Jamais 2 jours consécutifs à zéro » — évaluée sur les 14 derniers jours. */
    private function regleDeuxJours(array $days): array
    {
        $recent = array_slice($days, -14);
        $zeros = 0;
        $casseeLe = null;
        foreach ($recent as $d) {
            $total = $d['quiz'] + $d['reviews'] + $d['lessons'] + $d['candidatures'];
            $zeros = $total === 0 ? $zeros + 1 : 0;
            if ($zeros >= 2) {
                $casseeLe = $d['date'];
            }
        }

        return [
            'respectee' => $casseeLe === null,
            'cassee_le' => $casseeLe,
            'jours_zero_consecutifs_actuels' => $zeros,
        ];
    }

    /** Santé de la répétition espacée. */
    public function srs(): array
    {
        $cards = $this->scope(CardReview::query())->get(['due_at', 'interval_days']);

        return [
            'suivies' => $cards->count(),
            'en_retard' => $cards->filter(fn ($c) => $c->due_at && $c->due_at->isPast() && ! $c->due_at->isToday())->count(),
            'dues_aujourdhui' => $cards->filter(fn ($c) => $c->due_at && $c->due_at->isToday())->count(),
            'matures' => $cards->where('interval_days', '>=', 21)->count(),
        ];
    }

    /** Progression d'une formation : % de leçons complétées + derniers scores de quiz. */
    public function progressionFormation(string $slug): ?array
    {
        $formation = Formation::query()->where('slug', $slug)->first();
        if (! $formation) {
            return null;
        }

        $lessonIds = Lesson::query()
            ->whereHas('module', fn ($q) => $q->where('formation_id', $formation->id))
            ->pluck('id');

        $done = $this->scope(Progress::query())
            ->whereIn('lesson_id', $lessonIds)->where('completed', true)->count();

        $derniersQuiz = $this->scope(QuizAttempt::query())
            ->whereIn('lesson_id', $lessonIds)
            ->orderByDesc('created_at')->limit(5)
            ->get(['score', 'total', 'created_at'])
            ->map(fn ($a) => [
                'score' => $a->score,
                'total' => $a->total,
                'pct' => $a->total ? round($a->score * 100 / $a->total) : 0,
                'date' => $a->created_at->toDateString(),
            ]);

        return [
            'formation' => $slug,
            'titre' => $formation->title,
            'lecons_total' => $lessonIds->count(),
            'lecons_completees' => $done,
            'pct' => $lessonIds->count() ? (int) round($done * 100 / $lessonIds->count()) : 0,
            'derniers_quiz' => $derniersQuiz,
        ];
    }
}
