---
title: "JSON:API : les entités exposées automatiquement"
type: lesson
---

# JSON:API : les entités exposées automatiquement

Depuis Drupal **8.7** (donc natif en Drupal 10/11, aucune dépendance contrib), le module
**JSON:API** expose automatiquement **toutes** les entités du site — nœuds, utilisateurs,
termes de taxonomie, fichiers, blocs de contenu... — en suivant strictement la
spécification [jsonapi.org](https://jsonapi.org). Zéro ligne de code pour commencer :
activer le module suffit.

```bash
# JSON:API is bundled in Drupal core since 8.7 — nothing to require via Composer.
drush en jsonapi
drush cr
```

> **Passerelle.** C'est le pendant exact de ce que fait **API Platform** côté Symfony
> quand tu le branches sur tes entités Doctrine : un endpoint généré automatiquement par
> entité, sans écrire le moindre controller. API Platform peut d'ailleurs produire
> lui-même du **JSON:API** (`Accept: application/vnd.api+json`) — même enveloppe
> `data`/`included`/`relationships`, mêmes principes de `filter`/`include`/`fields`. Si
> tu as déjà consommé une API Platform en JSON:API, ce module ne te dépaysera pas.

## Convention des endpoints

| Endpoint | Rôle |
|---|---|
| `GET /jsonapi` | index — liste tous les types de ressources disponibles |
| `GET /jsonapi/node/article` | collection des nœuds `article` publiés |
| `GET /jsonapi/node/article/{uuid}` | une ressource précise |
| `POST /jsonapi/node/article` | créer un nœud (authentifié) |
| `PATCH /jsonapi/node/article/{uuid}` | modifier |
| `DELETE /jsonapi/node/article/{uuid}` | supprimer |

> ⚠️ **Erreur fréquente — chercher l'entité par son ID interne.** JSON:API identifie
> toujours une ressource par son **UUID** (`3f2b1a4c-9e21-...`), jamais par le `nid`
> interne utilisé dans les routes classiques (`/node/42`). Ça découple volontairement
> l'identifiant public de l'ID auto-incrémenté en base — un identifiant stable même si le
> contenu change d'environnement (dev → prod).

```bash
curl -s "https://example.com/jsonapi/node/article" | jq
```

```json
{
  "data": [
    {
      "type": "node--article",
      "id": "3f2b1a4c-9e21-4b7a-8f21-abcdef123456",
      "attributes": {
        "title": "Hello headless Drupal",
        "created": "2026-01-10T09:00:00+00:00",
        "body": { "value": "<p>...</p>", "format": "basic_html" }
      },
      "relationships": {
        "field_image": {
          "data": { "type": "file--file", "id": "9c1e2f4a-..." }
        }
      }
    }
  ],
  "links": {
    "self": { "href": "https://example.com/jsonapi/node/article" },
    "next": { "href": "https://example.com/jsonapi/node/article?page[offset]=10" }
  }
}
```

## Filtres, relations, champs choisis, pagination

- **Filtrer** : `?filter[status]=1` (publié uniquement) ; filtre complexe avec opérateur :

```
GET /jsonapi/node/article?filter[title-filter][condition][path]=title
                        &filter[title-filter][condition][operator]=CONTAINS
                        &filter[title-filter][condition][value]=drupal
```

- **Inclure une relation** (évite un aller-retour séparé) : `?include=field_image,uid`
- **Sparse fieldset** (ne renvoyer que certains champs, réduit la charge utile) :
  `?fields[node--article]=title,body`
- **Pagination** : `?page[limit]=10&page[offset]=20`
- **Tri** : `?sort=-created` (le `-` = ordre décroissant)

```bash
curl -s "https://example.com/jsonapi/node/article?filter[status]=1&include=field_image&fields[node--article]=title,field_image&sort=-created&page[limit]=5" | jq
```

> **Réflexe à prendre.** Combine toujours `fields[...]` avec `include` : sans sparse
> fieldset, `include` rapatrie **tous** les attributs de l'entité liée (parfois
> volumineux, ex. les métadonnées d'un fichier). C'est l'équivalent du sur-fetching que
> GraphQL (leçon suivante) résout nativement.

## Authentification et CORS

Par défaut, le contenu publié est lisible anonymement si la permission « Access content »
est accordée — les mêmes permissions Drupal que partout ailleurs. Écrire, ou lire du
contenu non publié, nécessite une authentification :

- **Basic Auth** (module core `basic_auth`) : simple, adapté à un serveur-à-serveur
  interne, pas pour un front public.
- **OAuth2** (module contrib `simple_oauth`) : la solution standard pour un front qui
  doit s'authentifier (utilisateur connecté, preview de brouillon — leçon 4) — génère des
  tokens Bearer.
- **CSRF** : les requêtes non-GET via l'authentification par cookie (session Drupal
  classique) nécessitent un `X-CSRF-Token` récupéré via `GET /session/token` — sans objet
  si l'authentification passe par OAuth2/Bearer.

```bash
composer require drupal/simple_oauth
drush en simple_oauth
# Then configure a consumer + generate keys — see drupal.org/project/simple_oauth
```

```bash
# Authenticated request with a Bearer token
curl -s -H "Authorization: Bearer eyJ0eXAiOiJKV1Qi..." \
     "https://example.com/jsonapi/node/article?filter[status]=0" | jq
```

```yaml
# web/sites/default/services.yml — required for a separate front origin to call the API
parameters:
  cors.config:
    enabled: true
    allowedOrigins: ['https://my-frontend.example.com', 'http://localhost:3000']
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
    allowedHeaders: ['x-csrf-token', 'content-type', 'authorization']
    exposedHeaders: false
    maxAge: 1000
    supportsCredentials: true
```

> ⚠️ **Erreur fréquente — oublier CORS en développement local.** Un front React/Next
> lancé sur `http://localhost:3000` qui appelle un Drupal sur un autre domaine se heurte
> au blocage CORS du navigateur si `cors.config` n'autorise pas explicitement cette
> origine — même en local. Pense à ajouter les origines de dev **et** de prod.

## À retenir

- JSON:API est **dans le core Drupal** depuis la 8.7 : `drush en jsonapi` suffit, aucun
  contrib requis — l'équivalent d'API Platform sur des entités Doctrine.
- Les ressources s'identifient par **UUID**, jamais par `nid`. `include`, `fields[...]`,
  `filter[...]`, `sort`, `page[...]` couvrent l'essentiel des besoins d'un front.
- L'authentification passe par **OAuth2** (`simple_oauth`) pour un front applicatif, ou
  Basic Auth pour du serveur-à-serveur ; le **CORS** doit lister explicitement chaque
  origine front (dev et prod).
