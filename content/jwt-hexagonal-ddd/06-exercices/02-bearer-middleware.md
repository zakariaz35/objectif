---
title: "Exercice 2 — Bearer & middleware"
type: exercise
---

## Énoncé

Écris un middleware Laravel minimal qui lit le token Bearer, le vérifie, et bloque sinon. Complète les trous marqués `/* (n) */`.

```php
class JwtMiddleware {
    public function handle(Request $request, Closure $next) {
        $token = $request->/* (1) get the Bearer */;
        if (! $token) {
            return response()->json(['error' => 'no token'], /* (2) */);
        }
        try {
            $claims = JWT::decode($token, new Key($secret, 'HS256'));
            $request->attributes->set('userId', $claims->sub);
        } catch (\Exception $e) {
            return response()->json(['error' => 'invalid'], 401);
        }
        return /* (3) let the request through */;
    }
}
```

Indices : (1) Laravel a un helper dédié sur la Request. (2) même code que « non authentifié ». (3) que fait un middleware quand tout va bien ?

<!--correction-->

## Correction

```php
// (1) $token = $request->bearerToken();
// (2) 401
// (3) return $next($request);
```

`bearerToken()` extrait automatiquement la valeur après `Bearer ` dans l'en-tête `Authorization`. `$next($request)` passe la main au reste de la pile (contrôleur). C'est exactement ce que fait `auth:sanctum` en interne.
