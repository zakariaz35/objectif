<?php

namespace App\Http\Controllers;

use App\Models\Progress;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $this->claimAnonymousProgress($request, $user);

        return $this->tokenResponse($user, 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants invalides.'],
            ]);
        }

        $this->claimAnonymousProgress($request, $user);

        return $this->tokenResponse($user);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->userPayload($request->user())]);
    }

    /**
     * Attaches anonymous progress/attempts (same device/browser) to the
     * account via the X-Client-Token.
     */
    private function claimAnonymousProgress(Request $request, User $user): void
    {
        $token = $request->header('X-Client-Token');
        if (! $token) {
            return;
        }

        // Duplicates: if a lesson is already tracked by the account, drop the
        // anonymous row (otherwise the attachment would violate the user/lesson uniqueness).
        $ownedLessonIds = Progress::where('user_id', $user->id)->pluck('lesson_id');
        Progress::where('client_token', $token)->whereNull('user_id')
            ->whereIn('lesson_id', $ownedLessonIds)
            ->delete();

        // The rest of the anonymous progress is attached to the account.
        Progress::where('client_token', $token)->whereNull('user_id')
            ->update(['user_id' => $user->id]);

        // Quiz attempts have no unique constraint: attach them directly.
        QuizAttempt::where('client_token', $token)->whereNull('user_id')
            ->update(['user_id' => $user->id]);
    }

    private function tokenResponse(User $user, int $status = 200): JsonResponse
    {
        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user),
        ], $status);
    }

    private function userPayload(User $user): array
    {
        return ['id' => $user->id, 'name' => $user->name, 'email' => $user->email];
    }
}
