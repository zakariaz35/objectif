---
title: Cartes mémo — Bearer
type: flashcards
cards:
  - q: |
      Quelle est la différence de niveau entre « JWT » et « Bearer » ?
    a: |
      **JWT** = le *format/contenu* du jeton (3 parties signées). **Bearer** = le
      *mécanisme de transport* HTTP via l'en-tête `Authorization: Bearer <token>`. On
      peut transporter un JWT *ou* un token opaque en Bearer ; Bearer est l'enveloppe,
      JWT est le contenu.
  - q: |
      Pourquoi appelle-t-on ça « au porteur », et quel risque de sécurité cela implique ?
    a: |
      Parce que le serveur fait confiance à **quiconque présente le token**, sans autre
      preuve d'identité. Risque : si le token est **volé** (XSS, log, proxy non-HTTPS),
      le voleur a tous les droits jusqu'à l'expiration. D'où : **toujours HTTPS**, durée
      de vie courte, et stockage prudent côté client.
---

Lis, réfléchis, révèle, auto-évalue.
