---
title: "Quiz 1 — Le payload d'un JWT"
type: quiz
---

## Question 1

Le payload d'un JWT est…

- A. chiffré, donc illisible sans le secret
- B. seulement encodé en Base64, donc lisible par tous
- C. compressé puis hashé

<!--correction-->

**Bonne réponse : B — seulement encodé en Base64, donc lisible par tous.**

Le payload n'est pas chiffré, juste encodé en Base64URL : n'importe qui peut le décoder et le lire. La signature protège l'intégrité (modification), pas la confidentialité (lecture).
