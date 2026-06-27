---
title: Questions de compréhension — Bearer
type: lesson
---

**Question :** Quelle est la différence de niveau entre « JWT » et « Bearer » ?

**Réponse :** **JWT** = le *format/contenu* du jeton (3 parties signées). **Bearer** = le *mécanisme de transport* HTTP via l'en-tête `Authorization: Bearer <token>`. On peut transporter un JWT *ou* un token opaque en Bearer ; Bearer est l'enveloppe, JWT est le contenu.

**Question :** Pourquoi appelle-t-on ça « au porteur » et quel risque de sécurité ça implique ?

**Réponse :** Parce que le serveur fait confiance à **quiconque présente le token**, sans autre preuve d'identité. Risque : si le token est **volé** (XSS, log, proxy non-HTTPS), le voleur a tous les droits jusqu'à l'expiration. D'où : **toujours HTTPS**, durée de vie courte, et stockage prudent côté client.

**Question :** Une requête arrive sans en-tête `Authorization` sur une route `auth:sanctum`. Que renvoie Laravel ?

**Réponse :** Une réponse **401 Unauthorized** (le middleware bloque avant d'atteindre le contrôleur). Pas 403 — 403 voudrait dire « authentifié mais pas le droit » ; 401 = « pas authentifié du tout ».
