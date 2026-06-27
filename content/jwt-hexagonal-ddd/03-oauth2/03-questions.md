---
title: Questions de compréhension — OAuth2 & refresh
type: lesson
---

**Question :** Pourquoi utiliser un access token court + un refresh token long plutôt qu'un seul JWT à longue durée ?

**Réponse :** Pour combiner **performance** et **sécurité**. L'access token JWT court reste *stateless* (pas de lookup DB à chaque requête) et, comme il expire vite, un vol a un impact limité. Le refresh token, lui, est stocké en base et **révocable** : on peut couper l'accès (déconnexion, ban) sans renoncer au stateless au quotidien. Un seul JWT long serait soit non-révocable, soit dangereux en cas de vol.

**Question :** OAuth2 sert-il à « se connecter » (authentification) ?

**Réponse :** Pas directement : OAuth2 est un protocole d'**autorisation déléguée** (« cette appli peut-elle accéder à mes ressources ? »), pas d'authentification (« qui es-tu ? »). Le login social fonctionne *par-dessus* OAuth2 grâce à **OpenID Connect**, une couche d'identité ajoutée. Le mot de passe ne quitte jamais l'Authorization Server.

**Question :** Deux microservices doivent s'appeler sans utilisateur connecté. Quel grant type ?

**Réponse :** **Client Credentials** : pas de *resource owner* humain, juste une machine qui s'authentifie auprès d'une autre via son `client_id`/`client_secret` pour obtenir un token. C'est le grant type des communications service-à-service.
