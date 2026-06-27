---
title: "Quiz 4 — En architecture hexagonale, les dépendances pointent…"
type: quiz
---

## Question 4

En architecture hexagonale, les dépendances pointent…

- A. du métier vers la base de données
- B. dans tous les sens, peu importe
- C. vers le centre (le métier), via des interfaces/ports

<!--correction-->

**Bonne réponse : C — vers le centre (le métier), via des interfaces/ports.**

L'inversion de dépendance : le métier définit les interfaces (ports), et ce sont les adapters (DB, etc.) qui dépendent du centre. Le cœur ignore l'infrastructure.
