---
title: "Le point de départ : une stack compose réaliste"
type: lesson
---

# Le point de départ : une stack compose réaliste

Voici la stack qu'on va migrer intégralement vers Kubernetes dans ce module : une base
Postgres, une API, et un frontend web — la même structure que le fil rouge du parcours
Traefik, ici sans reverse proxy Docker puisque Kubernetes fournira sa propre porte
d'entrée (module 4).

## La stack compose de départ

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: shop
      POSTGRES_USER: shop
      POSTGRES_PASSWORD: change-me-in-prod
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - shop

  api:
    image: traefik/whoami:latest
    command: ["--port=8080"]
    environment:
      DB_HOST: db
      DB_NAME: shop
      POSTGRES_PASSWORD: change-me-in-prod
    depends_on:
      - db
    networks:
      - shop

  web:
    image: ealen/echo-server:latest
    depends_on:
      - api
    networks:
      - shop
    ports:
      - "8080:80"

volumes:
  db-data:

networks:
  shop:
```

Trois services, une dépendance logique (`web` → `api` → `db`), un volume nommé pour la
persistance Postgres, un réseau partagé. Rien d'exotique — c'est exactement le type de
stack que tu as déjà déployée en Traefik.

## Ce que ce compose ne garantit pas, et qui va compter

- `depends_on` ne garantit que l'**ordre de démarrage des conteneurs**, jamais que `db`
  soit **réellement prête** à accepter des connexions quand `api` démarre — Kubernetes
  formalise ça avec les probes (module 3).
- Si le serveur qui héberge cette stack tombe, **tout** tombe avec lui — aucun
  mécanisme de reprise sur un autre serveur.
- `POSTGRES_PASSWORD` en clair dans le YAML : acceptable pour du développement local,
  jamais pour de la prod versionnée dans Git.

## La table de correspondance

Chaque concept compose a un équivalent Kubernetes, déjà vu dans les modules précédents —
ce module ne fait qu'assembler ce qui est déjà connu :

| Concept `docker compose` | Équivalent Kubernetes | Module |
|---|---|---|
| `services.db` (un service) | `Deployment`/`StatefulSet` + `Service` | 2, 3 |
| `environment:` (variables en clair) | `ConfigMap` (non sensible) | 3 |
| `environment:` (secret) | `Secret` | 3 |
| `volumes: db-data:/...` | `PersistentVolumeClaim` (+ `StorageClass`) | 3 |
| `depends_on` (ordre, pas readiness) | `readinessProbe` (readiness réelle) | 3 |
| `networks: shop` (réseau partagé) | Réseau plat par défaut du cluster, restreint par `NetworkPolicy` | 4 |
| `ports: "8080:80"` (exposition locale) | `Ingress` (+ ingress controller) | 4 |
| Pas d'équivalent (une seule machine) | `Namespace` (regroupement logique) | 5 |

> **Repère —** rien dans cette table n'introduit un concept nouveau : c'est un exercice
> de traduction, pas d'apprentissage. La prochaine leçon écrit les manifests bloc par
> bloc, dans cet ordre : `db` → `api` → `web` → réseau (Ingress + NetworkPolicy).

## À retenir

- La stack de départ reste volontairement simple : 3 services, une dépendance
  logique, un volume, un réseau — rien d'exotique par rapport à ce que tu déploies déjà.
- `depends_on` ≠ readiness réelle : Kubernetes formalise cette distinction avec les
  probes, là où compose se contente d'un ordre de démarrage.
- Chaque concept compose a un équivalent Kubernetes déjà vu dans les modules précédents
  — ce projet est un exercice d'assemblage, pas une nouvelle notion.
