---
title: "Quiz 3 — Sanctum (mode token) émet par défaut…"
type: quiz
---

## Question 3

Sanctum (mode token) émet par défaut…

- A. des tokens opaques stockés en base (stateful)
- B. de vrais JWT signés en RS256
- C. des cookies de session uniquement

<!--correction-->

**Bonne réponse : A — des tokens opaques stockés en base (stateful).**

Sanctum émet des chaînes aléatoires opaques stockées dans `personal_access_tokens` et vérifiées en base : c'est stateful (révocable, mais lookup DB à chaque requête). Ce ne sont pas des JWT.
