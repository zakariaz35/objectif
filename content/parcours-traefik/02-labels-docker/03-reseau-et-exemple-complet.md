---
title: "Le piège du réseau + exemple complet commenté"
type: lesson
---

# Le piège du réseau + exemple complet commenté

Tu maîtrises déjà les réseaux Docker — c'est justement pourquoi ce piège est facile à
manquer : il n'a rien à voir avec les labels, mais tout label bien écrit échoue quand même
si cette condition n'est pas respectée.

## Traefik doit partager un réseau Docker avec le conteneur cible

Traefik lit les labels de **tous** les conteneurs de la machine via le socket Docker
(module précédent) — y compris ceux d'autres projets `compose`. Mais lire un label ne
suffit pas : pour **transmettre effectivement le trafic**, Traefik doit pouvoir
**joindre le conteneur en réseau**, donc partager au moins un réseau Docker avec lui.

> **Piège du réseau — vérifié en conditions réelles.** Un conteneur placé sur un réseau
> Docker différent de celui de Traefik obtient bien un router (visible dans le
> dashboard, labels correctement lus), mais toute requête vers lui **time-out en
> silence** : pas d'erreur explicite dans les logs Traefik, juste une absence de
> réponse. Une tentative de résolution DNS **depuis le conteneur Traefik lui-même**
> vers le nom du conteneur isolé confirme le diagnostic : `bad address` — le nom n'est
> tout simplement pas résolvable, car les deux conteneurs ne sont pas sur le même
> réseau Docker (pas de DNS interne partagé).

La correction est toujours la même : mettre Traefik et le conteneur applicatif sur (au
moins) un réseau **commun**.

```yaml
services:
  traefik:
    image: traefik:v3
    networks:
      - proxy

  my-app:
    image: my-app:latest
    networks:
      - proxy       # must share a network with Traefik
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.my-app.rule=Host(`app.example.com`)"

networks:
  proxy:
```

> **Repère —** si un router apparaît bien dans le dashboard mais que la requête ne
> reçoit jamais de réponse (ni 200, ni 404, ni 502 — un vrai silence), pense **réseau**
> avant de ré-examiner les labels : `docker network inspect` pour vérifier que Traefik
> et le conteneur cible partagent bien un réseau.

## Exemple complet, commenté ligne par ligne

Voici une stack minimale — Traefik + deux services `whoami` — **testée et validée**
telle quelle (routage par `Host`, port explicite, réseau partagé) :

```yaml
# docker-compose.yml
services:
  traefik:
    image: traefik:v3                                  # official Traefik image, v3 line
    command:
      - "--providers.docker=true"                       # enable the Docker provider
      - "--providers.docker.exposedbydefault=false"      # opt-in only (security)
      - "--entrypoints.web.address=:80"                  # define the "web" entrypoint
    ports:
      - "80:80"                                          # publish the entrypoint
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"   # read Docker API, read-only
    networks:
      - proxy                                            # shared network (see above)

  whoami1:
    image: traefik/whoami                                # tiny HTTP server that echoes the request
    networks:
      - proxy                                            # must share a network with Traefik
    labels:
      - "traefik.enable=true"                             # opt-in (exposedbydefault=false)
      - "traefik.http.routers.whoami1.rule=Host(`app1.example.com`)"
      # No explicit "loadbalancer.server.port": whoami exposes a single port (80),
      # so Traefik can safely guess it here.

  whoami2:
    image: traefik/whoami
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whoami2.rule=Host(`app2.example.com`)"
      - "traefik.http.services.whoami2.loadbalancer.server.port=80"
      # Explicit port: good habit as soon as more than one port could exist
      # (documents intent even when there is currently a single port).

networks:
  proxy:
```

Testé avec `curl` en simulant deux domaines différents (résolution DNS remplacée par
l'en-tête `Host` en local) :

```bash
curl -H "Host: app1.example.com" http://localhost/
# Hostname: <container id of whoami1>
# ...

curl -H "Host: app2.example.com" http://localhost/
# Hostname: <container id of whoami2>
# ...

curl -H "Host: unknown.example.com" http://localhost/
# 404 page not found — no router matches this Host
```

> **Repère —** en développement local sans vrai DNS, `-H "Host: app1.example.com"`
> simule exactement ce qu'un navigateur enverrait s'il résolvait ce nom vers ton
> serveur — pratique pour tester le routage par labels sans toucher `/etc/hosts` ni un
> DNS réel.

## À retenir

- Un label bien écrit ne sert à rien si Traefik et le conteneur cible ne partagent
  **aucun réseau Docker** — le symptôme typique est un **silence** (timeout), pas une
  erreur claire.
- Toujours placer Traefik et les services à exposer sur un réseau `networks:` commun.
- Un seul port exposé → Traefik le devine ; dès qu'il y a ambiguïté (ou par habitude de
  clarté), déclare `loadbalancer.server.port` explicitement.
