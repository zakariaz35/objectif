---
title: "Le flux complet : login → requêtes protégées"
type: lesson
---

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Laravel
    Note over C,API: 1 · Authentification (une seule fois)
    C->>API: POST /login {email, password}
    API->>API: Vérifie en DB, génère le JWT signé
    API-->>C: 200 { token: "eyJ..." }
    Note over C,API: 2 · Chaque requête protégée
    C->>API: GET /api/factures + Authorization: Bearer eyJ...
    API->>API: Vérifie la signature + exp
    API-->>C: 200 [ ...données... ]  (sinon 401)
```

Le **login se fait une fois** ; ensuite chaque appel re-présente le token dans l'en-tête `Authorization`. C'est **sans session** : le serveur ne retient rien entre les requêtes.

> **⬢ Repère Laravel —** Tu n'extrais quasiment jamais le header à la main. Laravel le fait :
>
> - `$request->bearerToken()` récupère la valeur après `Bearer `.
> - Le **middleware** `auth:sanctum` ou `auth:api` sur une route fait toute la vérification et peuple `$request->user()`. Une route protégée, c'est juste :
>
> ```php
> Route::middleware('auth:sanctum')->get('/factures', [FactureController::class, 'index']);
> ```
>
> Le middleware = exactement la place où vit la logique « lire le Bearer, vérifier, autoriser ou renvoyer 401 ».
