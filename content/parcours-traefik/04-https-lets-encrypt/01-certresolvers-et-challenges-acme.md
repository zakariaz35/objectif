---
title: "Certresolvers et challenges ACME"
type: lesson
---

# Certresolvers et challenges ACME

Traefik peut obtenir et renouveler automatiquement des certificats TLS via **Let's
Encrypt**, sans intervention manuelle. Cette capacité s'appelle un **certificate
resolver** (`certresolver`) — et comme les EntryPoints, c'est de la **configuration
statique** : elle se définit sur le conteneur Traefik lui-même, pas via un label sur
un autre conteneur.

```yaml
# docker-compose.yml — static config, on the traefik service itself
services:
  traefik:
    image: traefik:v3
    command:
      - "--certificatesresolvers.le.acme.email=admin@example.com"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.le.acme.httpchallenge.entrypoint=web"
    volumes:
      - "./letsencrypt:/letsencrypt"
```

Ici, `le` est le nom **que tu choisis** pour ce resolver (raccourci fréquent pour « Let's
Encrypt », mais n'importe quel nom fonctionne).

## Les 3 challenges ACME

Pour prouver à Let's Encrypt que tu contrôles bien le domaine demandé, Traefik doit
réussir un **challenge**. Trois méthodes existent :

| Challenge | Principe | Quand l'utiliser |
|---|---|---|
| `httpChallenge` | Let's Encrypt fait une requête HTTP sur le port **80** vers ton domaine ; Traefik répond au bon endroit | Le cas courant : le port 80 est public et pointe vers Traefik |
| `tlsChallenge` | Validation via une poignée de main TLS sur le port **443** | Alternative quand le port 80 n'est pas exploitable pour la validation |
| `dnsChallenge` | Traefik crée un enregistrement DNS `TXT` temporaire (via l'API de ton fournisseur DNS) | **Seul moyen** de valider un certificat **wildcard** (`*.example.com`) ou un service **non exposé publiquement** sur 80/443 |

> **Repère —** `httpChallenge` et `tlsChallenge` exigent que Let's Encrypt puisse
> **joindre ton serveur directement** sur 80 ou 443 — donc que le domaine pointe
> réellement vers ton IP publique. `dnsChallenge` ne dépend d'aucune exposition
> réseau : c'est la seule option si ton service reste derrière un VPN, ou si tu veux
> un certificat wildcard couvrant tous les sous-domaines d'un coup.

```yaml
# httpChallenge (the common case)
command:
  - "--certificatesresolvers.le.acme.httpchallenge.entrypoint=web"

# tlsChallenge (alternative, no port 80 dependency for validation)
command:
  - "--certificatesresolvers.le.acme.tlschallenge=true"

# dnsChallenge (wildcard certs, or non-publicly-exposed services)
command:
  - "--certificatesresolvers.le.acme.dnschallenge.provider=<your-dns-provider>"
```

## À retenir

- Un `certresolver` est de la configuration **statique** : défini sur le conteneur
  Traefik (`command:`), un nom au choix.
- `httpChallenge` (port 80) est le choix par défaut le plus simple, tant que le domaine
  pointe publiquement vers Traefik.
- `dnsChallenge` est **obligatoire** pour un certificat wildcard, et utile pour un
  service qui ne serait pas exposé sur 80/443.
