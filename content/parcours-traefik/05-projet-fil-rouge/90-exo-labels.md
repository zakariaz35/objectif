---
title: "Exercice — écrire les bons labels"
type: exercise
---

## Énoncé

Pour chaque besoin ci-dessous, écris les **labels Docker** (dans un `docker-compose.yml`)
qui répondent exactement à la demande. Précise le nom que tu choisis pour chaque
router/service/middleware quand c'est pertinent.

1. Exposer un service nommé `blog` sur `blog.example.com`, en HTTPS via le certresolver
   `le` (déjà configuré côté Traefik).
2. Ce même conteneur `blog` expose en réalité **deux ports** : `80` (l'app) et `9000`
   (des métriques internes). Force Traefik à utiliser le bon port.
3. Un service `grafana` doit être protégé par une authentification basique (utilisateur
   `ops`, mot de passe déjà hashé en `$apr1$saltvalue$hashvalue`).
4. Une application legacy tourne sur un service `legacy-shop`, doit répondre sur
   `shop.example.com` uniquement sous le chemin `/legacy`, et ne connaît que des routes
   à la racine (elle doit recevoir les requêtes **sans** le préfixe `/legacy`).
5. Un service `internal-tool` (rule ``Host(`tool.example.com`)``) doit **toujours**
   gagner face à un autre router `catch-all` (rule ``PathPrefix(`/`)``) qui répondrait
   sinon à la même requête sur le même hôte.

<!--correction-->

## Correction

```yaml
# 1. Expose "blog" over HTTPS via the "le" certresolver
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.blog.rule=Host(`blog.example.com`)"
  - "traefik.http.routers.blog.entrypoints=websecure"
  - "traefik.http.routers.blog.tls.certresolver=le"

# 2. Force the correct port (container exposes both 80 and 9000)
  - "traefik.http.services.blog.loadbalancer.server.port=80"

# 3. Basic auth on "grafana" (user: ops)
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.grafana.rule=Host(`grafana.example.com`)"
  - "traefik.http.middlewares.grafana-auth.basicauth.users=ops:$$apr1$$saltvalue$$hashvalue"
  - "traefik.http.routers.grafana.middlewares=grafana-auth"

# 4. Legacy app under /legacy, prefix stripped before reaching the container
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.legacy-shop.rule=Host(`shop.example.com`) && PathPrefix(`/legacy`)"
  - "traefik.http.middlewares.legacy-stripprefix.stripprefix.prefixes=/legacy"
  - "traefik.http.routers.legacy-shop.middlewares=legacy-stripprefix"

# 5. "internal-tool" must always win over a catch-all on the same Host
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.internal-tool.rule=Host(`tool.example.com`)"
  - "traefik.http.routers.internal-tool.priority=10"
  # (the catch-all router keeps a lower priority, e.g. priority=1)
```

Points clés :

- Besoin 1 : `entrypoints=websecure` + `tls.certresolver=le` sont **deux labels
  distincts**, tous deux nécessaires pour un vrai certificat Let's Encrypt (module 4).
- Besoin 2 : dès qu'un conteneur a plus d'un port, `loadbalancer.server.port` explicite
  n'est pas optionnel — sans lui, Traefik devine (module 2).
- Besoin 3 : le hash `$apr1$...` doit avoir **chaque `$` doublé** (`$$`) dans le
  `docker-compose.yml`, sinon Compose le corrompt avant que Traefik ne le voie
  (module 3).
- Besoin 4 : la règle exige `/legacy` (sinon la requête ne matche même pas ce router),
  et `stripprefix` retire ce préfixe **avant** que la requête n'atteigne le conteneur —
  déclaration et attachement du middleware restent deux labels séparés (module 3).
- Besoin 5 : sans priorité explicite plus haute sur `internal-tool`, rien ne garantit
  qu'il l'emporte sur un catch-all qui matcherait la même requête (module 2 et 5).
