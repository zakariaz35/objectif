<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesOwner;
use App\Models\Formation;
use App\Models\Progress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The learner's own courses: formations they have started, with progress and a
 * "resume" pointer to the next unfinished lesson. Powers the home hub.
 */
class CoursesController extends Controller
{
    use ResolvesOwner;

    public function mine(Request $request): JsonResponse
    {
        // Completed lessons for this owner, grouped by formation (+ last activity).
        $progress = $this->scopeToOwner(Progress::query(), $request)
            ->where('completed', true)
            ->with('lesson.module.formation')
            ->get();

        $byFormation = [];
        foreach ($progress as $p) {
            $formation = $p->lesson?->module?->formation;
            if (! $formation) {
                continue;
            }
            $agg = &$byFormation[$formation->id];
            $agg ??= ['done' => [], 'updated' => $p->updated_at];
            $agg['done'][$p->lesson->id] = true;
            if ($p->updated_at > $agg['updated']) {
                $agg['updated'] = $p->updated_at;
            }
            unset($agg);
        }

        if (! $byFormation) {
            return response()->json(['data' => []]);
        }

        // Load the involved formations with ordered lessons (totals + resume pointer).
        $formations = Formation::whereIn('id', array_keys($byFormation))
            ->with([
                'modules' => fn ($q) => $q->orderBy('position'),
                'modules.lessons' => fn ($q) => $q->orderBy('position'),
            ])
            ->get()
            ->keyBy('id');

        $out = [];
        foreach ($byFormation as $fid => $agg) {
            $f = $formations->get($fid);
            if (! $f) {
                continue;
            }
            $total = 0;
            $resume = null;
            foreach ($f->modules as $m) {
                foreach ($m->lessons as $l) {
                    $total++;
                    if ($resume === null && ! isset($agg['done'][$l->id])) {
                        $resume = ['module' => $m->slug, 'lesson' => $l->slug];
                    }
                }
            }
            $done = count($agg['done']);
            $out[] = [
                'slug' => $f->slug,
                'title' => $f->title,
                'stack' => $f->stack,
                'total' => $total,
                'done' => $done,
                'pct' => $total ? (int) round($done / $total * 100) : 0,
                'resume' => $resume, // null once everything is done
                'updated_at' => $agg['updated'],
            ];
        }

        // Most recently active first.
        usort($out, fn ($a, $b) => $b['updated_at']->timestamp <=> $a['updated_at']->timestamp);

        return response()->json(['data' => $out]);
    }
}
