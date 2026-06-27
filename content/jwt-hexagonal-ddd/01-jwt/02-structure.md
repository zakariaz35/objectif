---
title: "Structure d'un token : 3 morceaux séparés par des points"
type: lesson
---

Un JWT, c'est littéralement `xxxxx.yyyyy.zzzzz` :

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsIm5hbWUiOiJIYXNzYW5lIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzE3NX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

- **HEADER** — algo de signature
- **PAYLOAD** — les données (claims)
- **SIGNATURE** — le sceau

Les 2 premières parties sont juste du JSON encodé en Base64URL — **lisible par tous**.

## 1 · Header (décodé)

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

## 2 · Payload (décodé)

```json
{
  "sub": "42",
  "name": "Hassane",
  "role": "admin",
  "exp": 1717500000
}
```

> **⚠ Piège n°1 — le plus important —** Le payload n'est **PAS chiffré**, juste encodé en Base64. **N'importe qui peut le lire** (teste sur `jwt.io`). Donc : **jamais de mot de passe, de numéro de carte ou de secret dans un JWT.** La signature empêche de le *modifier*, pas de le *lire*.
