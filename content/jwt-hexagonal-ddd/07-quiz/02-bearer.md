---
title: "Quiz 2 — « Bearer » désigne…"
type: quiz
---

## Question 2

« Bearer » désigne…

- A. le format du token (3 parties signées)
- B. l'algorithme de signature
- C. le schéma de transport HTTP dans l'en-tête Authorization

<!--correction-->

**Bonne réponse : C — le schéma de transport HTTP dans l'en-tête Authorization.**

Bearer est l'enveloppe (le mécanisme de transport HTTP), pas le format du token. On transporte un JWT ou un token opaque via `Authorization: Bearer <token>`.
