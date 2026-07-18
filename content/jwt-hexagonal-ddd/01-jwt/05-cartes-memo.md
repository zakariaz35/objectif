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
  - q: |
      Pourquoi donne-t-on à un JWT une durée de vie **courte** (`exp` à 5–15 min) plutôt
      que plusieurs jours ?
    a: |
      Parce qu'un JWT **stateless** ne peut pas être révoqué avant son `exp` : le
      serveur ne garde aucune trace pour l'invalider à la demande. Une durée de vie
      courte **limite les dégâts** en cas de vol (token intercepté, XSS…) : passé
      quelques minutes, il ne vaut plus rien, même si personne ne l'a explicitement
      bloqué. C'est ce compromis qui rend nécessaire le **refresh token** (voir la
      section Bearer/OAuth2) pour renouveler l'accès sans redemander le mot de passe.
---

Lis chaque question, réponds mentalement, puis révèle la réponse et auto-évalue-toi.
