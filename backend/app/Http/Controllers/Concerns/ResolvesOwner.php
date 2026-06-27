<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/**
 * Identifie le « propriétaire » d'une progression : l'utilisateur connecté
 * (via token Sanctum) si présent, sinon un client anonyme (X-Client-Token).
 */
trait ResolvesOwner
{
    protected function currentUser(Request $request)
    {
        return auth('sanctum')->user();
    }

    /** Clés d'identité pour updateOrCreate / create. */
    protected function ownerKeys(Request $request): array
    {
        if ($user = $this->currentUser($request)) {
            return ['user_id' => $user->id];
        }

        return ['client_token' => $this->clientToken($request)];
    }

    /** Filtre une requête sur le propriétaire courant. */
    protected function scopeToOwner(Builder $query, Request $request): Builder
    {
        if ($user = $this->currentUser($request)) {
            return $query->where('user_id', $user->id);
        }

        return $query->where('client_token', $this->clientToken($request));
    }

    protected function clientToken(Request $request): string
    {
        return (string) ($request->header('X-Client-Token') ?: $request->input('client_token') ?: 'anonymous');
    }
}
