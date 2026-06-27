---
title: "Le flux complet : login → requêtes protégées"
type: lesson
---

> **Schéma (séquence) —** 1 · Authentification (une seule fois) : le client envoie `POST /login {email, password}` ; l'API Laravel vérifie en DB et génère le JWT signé, puis répond `200 { token: "eyJ..." }`. Le client stocke le token. 2 · Chaque requête protégée : le client envoie `GET /api/factures` avec `Authorization: Bearer eyJ...` ; l'API lit l'en-tête, vérifie la signature + `exp`. Si le token est valide → `200 [ ...données... ]`, sinon (invalide / expiré / absent) → `401 Unauthorized`. Le login se fait une fois ; ensuite chaque appel re-présente le token. C'est sans session.

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
