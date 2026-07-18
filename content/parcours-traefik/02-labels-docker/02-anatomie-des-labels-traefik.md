---
title: "Anatomie des labels Traefik"
type: lesson
---

# Anatomie des labels Traefik

Tous les labels Traefik suivent le même schéma : `traefik.http.<type>.<nom>.<option>=<valeur>`,
où `<type>` vaut `routers`, `services` ou `middlewares`, et `<nom>` est un identifiant que
**tu choisis toi-même** (il n'a besoin d'être unique que parmi les autres routeurs/services
du même type).

## Le Router : `rule`

Un router se déclare avec une **règle** qui décide si une requête lui est destinée.

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.whoami1.rule=Host(`app1.example.com`)"
```

Ici, `whoami1` est le nom **que tu choisis** pour ce router. La règle la plus courante :

| Fonction | Rôle |
|---|---|
| ``Host(`app.example.com`)`` | matche sur le nom de domaine demandé (en-tête `Host`) |
| ``PathPrefix(`/api`)`` | matche si l'URL commence par ce préfixe |
| `Host(...) && PathPrefix(...)` | **ET logique** : les deux conditions doivent être vraies |
| `Host(...) \|\| Host(...)` | **OU logique** : au moins une des conditions doit être vraie |

```yaml
# Route only requests to app2.example.com whose path starts with /api
- "traefik.http.routers.whoami2.rule=Host(`app2.example.com`) && PathPrefix(`/api`)"
```

> **Repère —** ces règles ressemblent à des conditions de code (`&&`, `||`) parce que ce
> sont littéralement des **expressions booléennes** évaluées à chaque requête. Rien de
> magique : chaque fonction (`Host`, `PathPrefix`, `Header`, `Method`…) renvoie
> vrai/faux, combinable comme n'importe quelle condition.

## Le Service : quand Traefik ne devine pas le port

Par défaut, si le conteneur cible **n'expose qu'un seul port**, Traefik le devine tout
seul. Mais dès qu'un conteneur expose (ou déclare) **plusieurs ports**, il faut lever
l'ambiguïté explicitement :

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.whoami2.rule=Host(`app2.example.com`)"
  - "traefik.http.services.whoami2.loadbalancer.server.port=80"
```

> **Piège du multi-port —** vérifié en conditions réelles : un conteneur qui expose
> deux ports (par exemple `80` applicatif et `8080` pour des métriques) sans
> `loadbalancer.server.port` explicite fait deviner Traefik, qui choisit **le premier
> port exposé** (en pratique le plus bas) — pas forcément le bon. Résultat observé : Traefik a routé vers le port
> `9` d'un conteneur de test (un port fictif, sans rien derrière) au lieu du port `80`
> réellement applicatif, produisant une **erreur 502 Bad Gateway** sans aucun message
> d'erreur clair côté logs. La bonne pratique : dès qu'un conteneur a plus d'un port
> exposé, **toujours** déclarer `loadbalancer.server.port` explicitement — ne jamais
> compter sur la devinette de Traefik.

## Priorité des règles

Quand **plusieurs routers** peuvent matcher la même requête (par exemple une règle
générique ``PathPrefix(`/`)`` et une règle plus spécifique
``Host(...) && PathPrefix(`/special`)``), Traefik choisit celui qui a la **priorité la
plus haute** :

```yaml
# Catch-all router: matches everything, low priority.
- "traefik.http.routers.general.rule=PathPrefix(`/`)"
- "traefik.http.routers.general.priority=1"

# Specific router: matches a narrower case, must win over the catch-all.
- "traefik.http.routers.specific.rule=Host(`app.example.com`) && PathPrefix(`/special`)"
- "traefik.http.routers.specific.priority=10"
```

Vérifié : une requête sur `/special` avec le bon `Host` atterrit bien sur le router
`specific` (priorité 10) ; une requête sur `/` sur le même hôte retombe sur `general`
(priorité 1). Sans priorité explicite, Traefik calcule une priorité **par défaut basée
sur la longueur de la règle** (plus une règle est spécifique/longue, plus sa priorité
implicite est haute) — mais dès que le comportement doit être garanti, **fixe la
priorité toi-même** plutôt que de dépendre de ce calcul implicite.

## À retenir

- Schéma général : `traefik.http.<routers|services|middlewares>.<nom-choisi>.<option>=<valeur>`.
- `rule` combine `Host()`, `PathPrefix()`… avec `&&` / `||`, comme des conditions de code.
- Dès qu'un conteneur expose plusieurs ports, déclare **toujours**
  `loadbalancer.server.port` — sinon Traefik devine (le port le plus bas), avec un
  risque réel de 502.
- En cas de règles concurrentes, la **priorité** la plus haute gagne ; fixe-la
  explicitement si l'ordre de résolution est important pour toi.
