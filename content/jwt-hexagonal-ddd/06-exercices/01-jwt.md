---
title: "Exercice 1 — JWT"
type: exercise
---

## Énoncé

Complète l'émission d'un JWT qui expire dans 1 heure et contient l'id + le rôle de l'utilisateur, puis sa vérification. Les parties à compléter sont marquées par `/* (n) */`.

```php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Émission
$payload = [
    'sub'  => $user->id,
    'role' => $user->role,
    'exp'  => /* (1) expire dans 1h */,
];
$token = JWT::encode($payload, $secret, /* (2) algo */);

// Vérification
try {
    $claims = JWT::decode($token, /* (3) ? */);
} catch (\Exception $e) {
    return response()->json(['error' => 'invalid'], /* (4) code HTTP */);
}
```

Indices : (1) une fonction de temps Unix + 3600. (2) la formation utilise du HMAC. (3) il faut envelopper le secret + l'algo. (4) « pas authentifié ».

<!--correction-->

## Correction

```php
// (1) 'exp' => time() + 3600,
// (2) $token = JWT::encode($payload, $secret, 'HS256');
// (3) $claims = JWT::decode($token, new Key($secret, 'HS256'));
// (4) 401  // Unauthorized — pas authentifié
```

`JWT::decode()` vérifie la signature **et** l'`exp` : un token expiré lève une `ExpiredException`, attrapée par le `catch`.
