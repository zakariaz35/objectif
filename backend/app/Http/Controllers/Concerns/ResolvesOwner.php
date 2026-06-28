<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/**
 * Identifies the "owner" of a progress record: the logged-in user
 * (via Sanctum token) if present, otherwise an anonymous client (X-Client-Token).
 */
trait ResolvesOwner
{
    protected function currentUser(Request $request)
    {
        return auth('sanctum')->user();
    }

    /** Identity keys for updateOrCreate / create. */
    protected function ownerKeys(Request $request): array
    {
        if ($user = $this->currentUser($request)) {
            return ['user_id' => $user->id];
        }

        return ['client_token' => $this->clientToken($request)];
    }

    /** Filters a query by the current owner. */
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
