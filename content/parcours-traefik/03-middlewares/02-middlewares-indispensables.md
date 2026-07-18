---
title: "Les middlewares indispensables"
type: lesson
---

# Les middlewares indispensables

Un petit nombre de middlewares couvrent l'immense majorité des besoins réels. Chacun se
**déclare** puis s'**attache** (voir leçon précédente) — les deux labels ne sont jamais
répétés ci-dessous par souci de concision, mais n'oublie jamais le second dans tes
propres stacks.

## `redirectscheme` — forcer HTTPS

Redirige toute requête HTTP vers son équivalent HTTPS. **Vérifié** : produit bien un
`301 Moved Permanently` avec l'en-tête `Location: https://...`.

```yaml
labels:
  - "traefik.http.middlewares.to-https.redirectscheme.scheme=https"
  - "traefik.http.middlewares.to-https.redirectscheme.permanent=true"
  - "traefik.http.routers.my-app-web.middlewares=to-https"
```

## `basicauth` — protéger une route derrière un mot de passe

Demande un couple identifiant/mot de passe via l'authentification HTTP Basic (utile
pour protéger un dashboard ou un environnement de staging). Le mot de passe est un hash
au format **htpasswd** (Apache MD5/`apr1`, générable avec `openssl passwd -apr1` ou
`htpasswd`).

```bash
# Generate a htpasswd-compatible hash (no htpasswd binary needed)
openssl passwd -apr1 "my-secret-password"
# $apr1$<salt>$<hash>
```

```yaml
labels:
  - "traefik.http.middlewares.dashboard-auth.basicauth.users=admin:$$apr1$$<salt>$$<hash>"
  - "traefik.http.routers.dashboard.middlewares=dashboard-auth"
```

> **Piège classique — vérifié en conditions réelles.** Dans un `docker-compose.yml`,
> `$` est un caractère d'**interpolation de variable** (comme `${MY_VAR}`) : Docker
> Compose essaie de le résoudre **avant même que Traefik ne voie le label**. Un hash
> `$apr1$...` écrit tel quel finit tronqué ou vide. Il faut **doubler chaque `$`** en
> `$$` pour que Compose le transmette littéralement. Testé : sans doublement,
> l'authentification échoue silencieusement (mot de passe jamais reconnu, y compris le
> bon) ; avec `$$`, un mauvais mot de passe renvoie bien `401`, le bon renvoie `200`.

## `headers` — en-têtes de sécurité

Ajoute des en-têtes HTTP de sécurité standard sans y toucher côté application.

```yaml
labels:
  - "traefik.http.middlewares.security-headers.headers.stsSeconds=31536000"
  - "traefik.http.middlewares.security-headers.headers.frameDeny=true"
  - "traefik.http.middlewares.security-headers.headers.contentTypeNosniff=true"
  - "traefik.http.routers.my-app.middlewares=security-headers"
```

| Option | Effet |
|---|---|
| `stsSeconds` | active `Strict-Transport-Security` (force HTTPS côté navigateur) |
| `frameDeny` | interdit l'affichage du site dans une `<iframe>` (anti-clickjacking) |
| `contentTypeNosniff` | empêche le navigateur de « deviner » un type MIME différent |

## `ratelimit` — limiter le débit

Protège une route contre un excès de requêtes (brute-force, abus d'API).

```yaml
labels:
  - "traefik.http.middlewares.api-limit.ratelimit.average=100"   # sustained requests/second
  - "traefik.http.middlewares.api-limit.ratelimit.burst=50"      # short burst allowance
  - "traefik.http.routers.api.middlewares=api-limit"
```

## `stripprefix` — servir une app sous un sous-chemin

Retire un préfixe d'URL avant de transmettre la requête au conteneur — utile pour
exposer une API sous `/api` alors que l'application, elle, ne connaît que des routes à
la racine (`/users`, `/orders`…).

```yaml
labels:
  - "traefik.http.routers.api.rule=Host(`app.example.com`) && PathPrefix(`/api`)"
  - "traefik.http.middlewares.api-stripprefix.stripprefix.prefixes=/api"
  - "traefik.http.routers.api.middlewares=api-stripprefix"
```

**Vérifié** : une requête sur `/api/users` est transmise au conteneur comme `/users`
(le préfixe `/api` disparaît avant d'atteindre l'application) ; une requête sans le
préfixe (`/users` directement) ne matche même pas la règle du router (`404`, la
`PathPrefix` l'exige).

> **Piège du path —** deux erreurs symétriques et fréquentes :
> - **Oublier `stripprefix`** : l'application reçoit `/api/users` alors qu'elle
>   n'attend que `/users` — la route applicative ne matche jamais (404 côté app, alors
>   que Traefik, lui, a bien matché).
> - **Stripper alors que l'app doit connaître son préfixe de montage** (génération de
>   liens, assets relatifs) : `stripprefix` ajoute automatiquement un en-tête
>   `X-Forwarded-Prefix` avec la valeur du préfixe retiré — à lire côté application si
>   elle a besoin de reconstruire des URLs absolues cohérentes.

## `compress` — compression des réponses

Compresse les réponses (gzip/brotli selon le `Accept-Encoding` du client) — un
booléen suffit, sans sous-option obligatoire.

```yaml
labels:
  - "traefik.http.middlewares.gzip.compress=true"
  - "traefik.http.routers.my-app.middlewares=gzip"
```

## À retenir

- `redirectscheme` (HTTP→HTTPS), `basicauth` (protection simple), `headers` (sécurité),
  `ratelimit` (anti-abus), `stripprefix` (sous-chemins), `compress` (bande passante) :
  six middlewares couvrent la grande majorité des besoins.
- `$` doit **toujours** être doublé (`$$`) dans un label lu depuis un
  `docker-compose.yml` — sinon Compose l'interprète comme une interpolation de
  variable, avant même que Traefik ne le voie.
- `stripprefix` ajoute automatiquement `X-Forwarded-Prefix` : utile si l'app a besoin de
  connaître son préfixe de montage malgré le retrait.
