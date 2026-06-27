---
title: "Quiz 7 — Le refresh token sert à…"
type: quiz
---

## Question 7

Le refresh token sert à…

- A. être envoyé à chaque requête à la place de l'access token
- B. obtenir un nouvel access token sans redemander le mot de passe
- C. chiffrer le payload du JWT

<!--correction-->

**Bonne réponse : B — obtenir un nouvel access token sans redemander le mot de passe.**

Le refresh token (long, stocké en base, révocable) sert uniquement à renouveler l'access token court. Il n'est pas envoyé à chaque requête et ne chiffre rien.
