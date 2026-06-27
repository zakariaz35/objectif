---
title: Questions de compréhension — JWT
type: lesson
---

**Question :** Pourquoi ne faut-il jamais mettre de donnée sensible dans le payload d'un JWT ?

**Réponse :** Parce que le payload est seulement **encodé en Base64URL, pas chiffré**. Toute personne qui intercepte le token peut le décoder et lire son contenu en clair. La signature protège l'**intégrité** (on ne peut pas le modifier), pas la **confidentialité**.

**Question :** Un attaquant change `"role":"user"` en `"role":"admin"` dans le payload. Pourquoi ça échoue ?

**Réponse :** Parce qu'en modifiant le payload, la signature d'origine ne correspond plus. Pour produire une signature valide, il lui faudrait le **SECRET du serveur**, qu'il ne possède pas. Le serveur recalcule la signature, voit qu'elle diffère, et **rejette le token**.

**Question :** Sanctum émet-il des JWT ? Quelle est la conséquence ?

**Réponse :** **Non.** Sanctum (mode token) émet des chaînes aléatoires *opaques* stockées dans `personal_access_tokens` et vérifiées en base. C'est **stateful**. Conséquence : on peut révoquer instantanément un token (suppression en DB), mais chaque requête fait un **lookup base de données** — l'inverse du compromis JWT.
