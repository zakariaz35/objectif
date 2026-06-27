---
title: "OAuth2 : quand un tiers agit en ton nom"
type: lesson
---

OAuth2 n'est pas « du login ». C'est un protocole de **délégation d'autorisation** : il permet à une appli tierce d'accéder à tes ressources **sans connaître ton mot de passe**. C'est le « Se connecter avec Google » : tu autorises l'appli, Google émet un token, l'appli l'utilise.

> **Schéma —** Les 4 rôles d'OAuth2 : le **Resource Owner** (toi) utilise un **Client** (l'appli tierce). 1 · le client te redirige vers l'**Authorization Server** (Google / ton Passport) ; 2 · tu autorises sur ce serveur ; 3 · le serveur renvoie un code échangé contre un token au client ; 4 · le client utilise ce token (`Bearer`) auprès du **Resource Server** (l'API protégée). Le mot de passe ne quitte jamais l'Authorization Server.

## Les « grant types » utiles à connaître

- **Authorization Code (+ PKCE)** — le standard pour SPA/mobile et « login social ». L'utilisateur s'authentifie sur le serveur d'autorisation, qui renvoie un *code* échangé contre un token. PKCE sécurise les clients publics.
- **Client Credentials** — pas d'utilisateur : une **machine appelle une autre machine** (service ↔ service). Parfait pour tes microservices qui s'appellent entre eux.
- **Password grant** — déconseillé / déprécié : l'appli manipule directement le mot de passe. À éviter sauf client 100 % de confiance.

> **⬢ Repère Laravel —**
>
> - **Laravel Passport** = un serveur OAuth2 complet clé en main : il gère les grant types, émet des **JWT (access)** + **refresh tokens**, et expose `/oauth/token`. C'est l'outil quand tu es l'*Authorization Server*.
> - **Laravel Socialite** = le côté *client* : « se connecter avec Google/GitHub », gère le flux Authorization Code pour toi.
> - **Sanctum** n'a pas de refresh token natif : on lui donne des tokens à expiration et on régénère via login. Pour du vrai OAuth2 (tiers, délégation), c'est Passport.
>
> Renouveler avec Passport, c'est un simple POST :
>
> ```http
> POST /oauth/token
> {
>   "grant_type": "refresh_token",
>   "refresh_token": "def502...",
>   "client_id": "3", "client_secret": "..."
> }
> // → { access_token, refresh_token, expires_in }
> ```
