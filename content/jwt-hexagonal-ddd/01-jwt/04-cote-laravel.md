---
title: Côté Laravel concrètement
type: lesson
---

> **⬢ Repère Laravel —** Tu as 3 options selon le besoin :
>
> - **Sanctum** — le défaut moderne. Pour SPA/mobile. Émet des *tokens opaques* stockés en DB (table `personal_access_tokens`). ⚠️ **Ce ne sont PAS des JWT** : ce sont de simples chaînes aléatoires vérifiées en base — donc *stateful*.
> - **Passport** — serveur OAuth2 complet, émet de **vrais JWT (RS256)**. Plus lourd, pour de l'API publique / délégation.
> - **tymon/jwt-auth** ou **firebase/php-jwt** — pour du JWT « pur », stateless, fait main.

Décoder/vérifier à la main avec `firebase/php-jwt` :

```php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Issue (at login)
$token = JWT::encode(
    ['sub' => $user->id, 'role' => $user->role, 'exp' => time()+3600],
    config('app.jwt_secret'), 'HS256'
);

// Verify (on each request) — throws an exception if invalid/expired
$claims = JWT::decode($token, new Key(config('app.jwt_secret'), 'HS256'));
```

> **✗ La grande contrepartie du JWT —** Comme le serveur ne stocke rien, il ne peut pas « invalider » un token avant son `exp`. **Déconnexion immédiate, ban, changement de rôle = compliqués.** Solutions : tokens à durée courte (5–15 min) + *refresh token*, ou une *blocklist*… qui réintroduit un état serveur. C'est tout le paradoxe : le stateless coûte sur la révocation.
