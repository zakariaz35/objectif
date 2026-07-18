<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;

class LessonController extends Controller
{
    /** Lesson details, with previous/next navigation within the training. */
    public function show(Formation $formation, string $moduleSlug, string $lessonSlug): JsonResponse
    {
        $formation->load(['modules.lessons' => fn ($q) => $q->orderBy('position')]);

        // Ordered flat list for prev/next.
        $flat = $formation->modules->flatMap(fn ($m) => $m->lessons->map(fn ($l) => [
            'module' => $m->slug,
            'lesson' => $l->slug,
            'title' => $l->title,
            'id' => $l->id,
        ]))->values();

        $module = $formation->modules->firstWhere('slug', $moduleSlug);
        abort_unless($module, 404, 'Module introuvable.');

        /** @var Lesson|null $lesson */
        $lesson = $module->lessons->firstWhere('slug', $lessonSlug);
        abort_unless($lesson, 404, 'Leçon introuvable.');

        $idx = $flat->search(fn ($e) => $e['id'] === $lesson->id);
        $prev = $idx > 0 ? $flat[$idx - 1] : null;
        $next = $idx < $flat->count() - 1 ? $flat[$idx + 1] : null;

        // Quiz: we expose the questions WITHOUT the correct answer or the explanation.
        $quiz = null;
        if ($lesson->type === 'quiz') {
            $lesson->load('quizQuestions');
            $quiz = $lesson->quizQuestions->map(fn ($q) => [
                'id' => $q->id,
                'prompt_html' => $q->prompt_html,
                'options' => collect($q->options)->map(fn ($o) => $o['html'])->values(),
            ])->values();
        }

        // Matching: two columns with a stable id = index into `pairs`. The FR
        // column is shuffled independently so its order no longer mirrors EN.
        $matching = null;
        if ($lesson->type === 'matching' && is_array($lesson->pairs)) {
            $left = collect($lesson->pairs)->map(fn ($p, $i) => ['id' => $i, 'html' => $p['en_html']])->values();
            $right = collect($lesson->pairs)->map(fn ($p, $i) => ['id' => $i, 'html' => $p['fr_html']])->shuffle()->values();
            $matching = ['left' => $left, 'right' => $right];
        }

        // Cloze: expose the text parts and the number of gaps, never the answers.
        $cloze = null;
        if ($lesson->type === 'cloze' && is_array($lesson->cloze)) {
            $cloze = ['items' => collect($lesson->cloze)->map(fn ($it) => [
                'parts' => $it['parts'] ?? [],
                'gaps' => count($it['answers'] ?? []),
            ])->values()];
        }

        return response()->json([
            'formation' => ['slug' => $formation->slug, 'title' => $formation->title],
            'module' => ['slug' => $module->slug, 'title' => $module->title],
            'lesson' => [
                'slug' => $lesson->slug,
                'title' => $lesson->title,
                'type' => $lesson->type,
                'body_html' => $lesson->body_html,
                'correction_html' => $lesson->correction_html,
                'has_correction' => $lesson->correction_html !== null,
                'quiz' => $quiz,
                'matching' => $matching,
                'cloze' => $cloze,
                'strategy' => $lesson->type === 'quiz' ? (data_get($lesson->meta, 'strategy') ?? 'linear') : null,
                'draw' => $lesson->type === 'quiz' ? data_get($lesson->meta, 'draw') : null,
                'exercise' => $lesson->type === 'exercise' ? $lesson->exercise : null,
                'cards' => $lesson->type === 'flashcards' ? $lesson->cards : null,
            ],
            'prev' => $prev ? ['module' => $prev['module'], 'lesson' => $prev['lesson'], 'title' => $prev['title']] : null,
            'next' => $next ? ['module' => $next['module'], 'lesson' => $next['lesson'], 'title' => $next['title']] : null,
        ]);
    }
}
