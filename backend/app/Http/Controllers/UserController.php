<?php

namespace App\Http\Controllers;

use App\Models\Progress;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Http\JsonResponse;

/*
|--------------------------------------------------------------------------
| ⚠️ DEBUG / USAGE PERSONNEL UNIQUEMENT — À SUPPRIMER
|--------------------------------------------------------------------------
| Cet endpoint expose la liste de TOUS les comptes (sans authentification ni
| autorisation). C'est volontaire car le projet est PERSONNEL et mono-utilisateur.
|
| À SUPPRIMER si le projet devient multi-utilisateurs / public / partagé :
| retirer cette classe, sa route (/api/users) et la vue + le lien frontend
| associés. Laisser ceci en place exposerait les emails de tous les comptes.
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
