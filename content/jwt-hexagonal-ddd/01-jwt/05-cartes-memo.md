---
title: Cartes mémo — JWT
type: flashcards
cards:
  - q: |
      Pourquoi ne faut-il jamais mettre de donnée sensible dans le payload d'un JWT ?
    a: |
      Parce que le payload est seulement **encodé en Base64URL, pas chiffré**. Toute
      personne qui intercepte le token peut le décoder et lire son contenu en clair.
      La signature protège l'**intégrité** (on ne peut pas le modifier), pas la
      **confidentialité**.
  - q: |
      Sanctum émet-il des JWT ? Quelle est la conséquence ?
    a: |
      **Non.** Sanctum (mode token) émet des chaînes aléatoires *opaques* stockées dans
      `personal_access_tokens` et vérifiées en base. C'est **stateful**. Conséquence :
      on peut révoquer instantanément un token (suppression en DB), mais chaque requête
      fait un **lookup base de données** — l'inverse du compromis JWT.
---

Lis chaque question, réponds mentalement, puis révèle la réponse et auto-évalue-toi.
