---
title: "La stack de prod, bloc par bloc"
type: lesson
---

# La stack de prod, bloc par bloc

Voici une stack Traefik réaliste : dashboard sécurisé, une app web, une API exposée
sous `/api`, HTTPS Let's Encrypt et logs d'accès. Chaque label utilisé a été introduit
et **vérifié en conditions réelles** dans les modules précédents ; ici on assemble
simplement les pièces. Seuls les ports changent par rapport aux tests en local : `80`
et `443` (au lieu des ports de développement utilisés pour les valider sans conflit sur
la machine de test).

## Bloc 1 — le service Traefik lui-même (configuration statique)

```yaml
services:
  traefik:
    image: traefik:v3
    command:
      # Docker provider: opt-in only (see module 2)
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"

      # Entrypoints: web (:80) redirects globally to websecure (:443) — see module 4
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      - "--entrypoints.websecure.address=:443"

      # Let's Encrypt certresolver named "le" — see module 4
      - "--certificatesresolvers.le.acme.email=admin@example.com"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.le.acme.httpchallenge.entrypoint=web"

      # Dashboard enabled (protected by a middleware below, not --api.insecure)
      - "--api.dashboard=true"

      # Access logs
      - "--accesslog=true"
      - "--accesslog.filepath=/var/log/traefik/access.log"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"   # read Docker labels (module 2)
      - "./letsencrypt:/letsencrypt"                       # acme.json — chmod 600 (module 4)
      - "./logs:/var/log/traefik"
    networks:
      - proxy                                              # shared network (module 2)
```

> **Repère —** tout ce bloc est de la configuration **statique** (module 1) : elle vit
> sur le conteneur Traefik, et change uniquement si on redémarre ce conteneur. Rien
> ici ne concerne le routage d'une app en particulier — c'est le rôle des blocs
> suivants, en labels dynamiques.

## Bloc 2 — sécuriser le dashboard (labels sur le conteneur Traefik)

Le dashboard se protège comme n'importe quelle route : un router avec sa propre règle,
son HTTPS, et un middleware d'authentification attaché.

```yaml
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(`traefik.example.com`)"
      - "traefik.http.routers.dashboard.entrypoints=websecure"
      - "traefik.http.routers.dashboard.tls.certresolver=le"
      - "traefik.http.routers.dashboard.service=api@internal"   # built-in dashboard service
      - "traefik.http.routers.dashboard.middlewares=dashboard-auth"
      - "traefik.http.middlewares.dashboard-auth.basicauth.users=admin:$$apr1$$<salt>$$<hash>"
```

> **Piège classique —** `api@internal` est le nom **réservé** du service interne du
> dashboard/API de Traefik — à ne pas confondre avec un service applicatif que tu
> définirais toi-même. Sans le label `.service=api@internal`, un router avec une règle
> `Host` ne saurait pas vers quoi router : c'est ce label qui le connecte au dashboard
> intégré. N'oublie pas non plus de doubler les `$` du hash (module 3).

## Bloc 3 — l'application web

```yaml
  web-app:
    image: my-registry/web-app:latest
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web-app.rule=Host(`app.example.com`)"
      - "traefik.http.routers.web-app.entrypoints=websecure"
      - "traefik.http.routers.web-app.tls.certresolver=le"
      - "traefik.http.services.web-app.loadbalancer.server.port=3000"
      - "traefik.http.routers.web-app.priority=1"   # catch-all for this Host — see block 4
```

## Bloc 4 — l'API sous `/api`, avec `stripprefix` et priorité explicite

L'API partage le **même** `Host` que l'app web (`app.example.com`), mais uniquement sous
`/api`. Sans priorité explicite, rien ne garantit que le router le plus spécifique
gagne (module 2) — on la fixe donc volontairement plus haute que celle de `web-app`.

```yaml
  api:
    image: my-registry/api:latest
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`app.example.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=le"
      - "traefik.http.services.api.loadbalancer.server.port=8080"
      - "traefik.http.middlewares.api-stripprefix.stripprefix.prefixes=/api"
      - "traefik.http.routers.api.middlewares=api-stripprefix"
      - "traefik.http.routers.api.priority=10"   # must win over web-app's catch-all
```

Une requête sur `app.example.com/api/orders` est donc transmise à `api` (priorité 10 >
1), qui la reçoit en `/orders` (préfixe retiré) ; une requête sur `app.example.com/`
retombe sur `web-app` (seul router restant qui matche).

## Bloc 5 — le réseau partagé

```yaml
networks:
  proxy:
```

Traefik et les deux services applicatifs partagent tous le réseau `proxy` — sans ça,
labels ou pas, aucun trafic ne circule (module 2).

## À retenir

- Une stack de prod n'introduit **aucun concept nouveau** : c'est l'assemblage exact des
  briques vues modules 1 à 4 (statique vs dynamique, réseau partagé, middlewares,
  certresolver).
- Deux routers sur le **même Host** doivent avoir une **priorité explicite** dès que
  l'un est un cas particulier de l'autre (`/api` vs racine).
- Le dashboard se sécurise comme une route normale : règle `Host` + HTTPS + middleware
  `basicauth`, jamais via `--api.insecure=true` en production.
