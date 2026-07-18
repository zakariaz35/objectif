---
title: Quiz éclair — Bearer
type: quiz
questions:
  - prompt: |
      Une requête arrive **sans** en-tête `Authorization` sur une route protégée par
      `auth:sanctum`. Que renvoie Laravel ?
    options:
      - "200 OK : la route reste accessible"
      - "403 Forbidden : accès interdit"
      - "401 Unauthorized : non authentifié"
    answer: 2
    tags: [bearer]
    level: debutant
    explanation: >
      401 = « pas authentifié du tout » : le middleware bloque avant d'atteindre le
      contrôleur. 403 signifierait « authentifié mais sans le droit » — ce n'est pas le
      cas ici puisqu'aucune identité n'est fournie.
  - prompt: |
      Un attaquant intercepte un token Bearer valide (log non filtré, proxy sans HTTPS…)
      mais n'a ni le mot de passe ni aucune autre preuve d'identité. Que peut-il faire
      jusqu'à l'expiration du token ?
    options:
      - "Rien : Laravel redemande toujours le mot de passe à chaque requête sensible"
      - "Tout ce que le token autorise — Bearer ne demande aucune preuve supplémentaire"
      - "Seulement lire des données, jamais en modifier"
    answer: 1
    tags: [bearer, tokens]
    level: intermediaire
    explanation: >
      « Bearer » = « au porteur » : le serveur fait confiance à **quiconque présente le
      token**, sans autre vérification. Un vol donne donc tous les droits du token
      jusqu'à son `exp`. C'est pour ça qu'on impose HTTPS partout (jamais de Bearer en
      clair), une durée de vie courte, et qu'on évite de logguer l'en-tête
      `Authorization` en clair côté serveur/proxy.
---

Deux questions sur le comportement du middleware d'authentification et le risque propre
au schéma Bearer.
