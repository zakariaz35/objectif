---
title: "Qu'est-ce qu'un label Docker ?"
type: lesson
---

# Qu'est-ce qu'un label Docker ?

Avant de parler de Traefik, il faut être au clair sur ce qu'**est** un label Docker —
c'est la brique de base de tout ce parcours, et c'est précisément ce qui manque quand on
maîtrise déjà `compose`, les réseaux et les volumes mais qu'on n'a jamais eu besoin des
labels.

## Un label, c'est une métadonnée clé/valeur

Un **label** est une paire **clé/valeur textuelle** attachée à un conteneur (ou une
image, un réseau, un volume). Ce n'est **pas** une variable d'environnement : le
processus qui tourne **dans** le conteneur ne les voit jamais. Les labels vivent dans les
**métadonnées Docker**, à côté du conteneur — lisibles uniquement depuis l'extérieur, via
l'API/le CLI Docker.

```yaml
# docker-compose.yml
services:
  web:
    image: nginx:alpine
    labels:
      - "com.example.owner=backend-team"
      - "com.example.environment=production"
```

Par défaut, Docker **ne fait strictement rien** avec ces labels : ce sont de simples
annotations, comme des tags dans un système de gestion d'inventaire. C'est un **outil
tiers qui lit ces labels** qui leur donne un sens — et Traefik est justement de ceux-là.

## Les voir avec `docker inspect`

Les labels d'un conteneur en cours d'exécution s'inspectent directement :

```bash
docker inspect web --format '{{json .Config.Labels}}'
# {"com.example.owner":"backend-team","com.example.environment":"production"}
```

> **Repère —** si un label que tu as écrit dans ton `docker-compose.yml` ne produit pas
> l'effet attendu chez Traefik, `docker inspect` est ton premier réflexe : vérifie que
> le label est bien **présent et orthographié correctement** sur le conteneur réellement
> démarré (un `docker compose up -d` après édition d'un label **recrée** le conteneur —
> sans ça, l'ancien label reste actif).

## Le provider Docker : Traefik qui lit ces labels

Traefik se connecte au **socket Docker** (le même point d'accès que `docker ps` utilise)
via son **provider Docker**, monté en volume dans le conteneur Traefik :

```yaml
# docker-compose.yml
services:
  traefik:
    image: traefik:v3
    command:
      - "--providers.docker=true"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"   # read-only: Traefik only reads
    ports:
      - "80:80"
```

Une fois connecté, Traefik **liste tous les conteneurs en cours d'exécution** sur la
machine et lit leurs labels dont le préfixe est `traefik.*`. C'est ce flux continu qui
alimente sa configuration dynamique (vue au module précédent).

> **Piège classique —** le socket Docker donne accès à **tout** l'hôte Docker, pas
> seulement au conteneur Traefik lui-même. Monte-le systématiquement en **lecture
> seule** (`:ro`) : Traefik n'a besoin que de *lire* la liste des conteneurs, jamais d'en
> créer ou d'en modifier.

## `exposedByDefault: false` + `traefik.enable=true` : le réflexe sécurité

Par défaut (`exposedByDefault: true`), Traefik crée une route pour **tout conteneur
démarré sur la machine**, même ceux qui n'ont jamais entendu parler de Traefik. C'est
dangereux : une base de données ou un outil interne pourrait se retrouver exposé sans
que personne ne l'ait décidé.

La bonne pratique consiste à **inverser la logique** :

```yaml
# On the Traefik service: nothing is exposed unless explicitly opted in.
command:
  - "--providers.docker=true"
  - "--providers.docker.exposedbydefault=false"
```

```yaml
# On every service you actually WANT to expose:
services:
  web:
    image: my-app:latest
    labels:
      - "traefik.enable=true"     # opt-in: without this, no route is created
      - "traefik.http.routers.web.rule=Host(`app.example.com`)"
```

> **Piège classique —** oublier `traefik.enable=true` est la première cause de « ma
> route n'apparaît pas dans le dashboard ». Avec `exposedByDefault: false` (recommandé),
> **aucune règle, aucun label de routage ne suffit sans ce label explicite** — vérifié :
> sans lui, le routeur n'existe simplement pas, même si `traefik.http.routers.web.rule`
> est bien présent sur le conteneur.

## À retenir

- Un label = métadonnée clé/valeur sur un conteneur, invisible au processus interne,
  lisible via `docker inspect` ou l'API Docker.
- Le **provider Docker** de Traefik lit en continu les labels `traefik.*` de tous les
  conteneurs de la machine (via le socket Docker, monté en `:ro`).
- Bonne pratique de sécurité : `exposedByDefault: false` (statique, sur Traefik) +
  `traefik.enable=true` (dynamique, sur chaque service à exposer explicitement).
- Éditer un label nécessite de **recréer** le conteneur (`docker compose up -d`) pour
  qu'il soit pris en compte.
