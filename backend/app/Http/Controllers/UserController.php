<?php

namespace App\Http\Controllers;

use App\Models\Progress;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Http\JsonResponse;

/*
|--------------------------------------------------------------------------
| ⚠️ DEBUG / PERSONAL USE ONLY — TO BE REMOVED
|--------------------------------------------------------------------------
| This endpoint exposes the list of ALL accounts (without authentication or
| authorization). This is intentional because the project is PERSONAL and single-user.
|
| TO BE REMOVED if the project becomes multi-user / public / shared:
| remove this class, its route (/api/users) and the associated view + frontend
| link. Leaving this in place would expose the emails of all accounts.
*/
class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $progress = Progress::where('completed', true)
            ->whereNotNull('user_id')
            ->selectRaw('user_id, count(*) as c')
            ->groupBy('user_id')
            ->pluck('c', 'user_id');

        $attempts = QuizAttempt::whereNotNull('user_id')
            ->selectRaw('user_id, count(*) as c')
            ->groupBy('user_id')
            ->pluck('c', 'user_id');

        $users = User::orderBy('id')->get()->map(fn (User $u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'created_at' => $u->created_at?->toDateTimeString(),
            'completed_lessons' => (int) ($progress[$u->id] ?? 0),
            'quiz_attempts' => (int) ($attempts[$u->id] ?? 0),
        ]);

        return response()->json(['data' => $users]);
    }
}
