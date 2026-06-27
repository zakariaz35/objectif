# Formation — plateforme d'apprentissage

Plateforme perso multi-sujets : on **dépose un ZIP de Markdown** (cours + exercices +
corrections), l'application le parse, le range en base et l'expose sur une page web avec
**navigation soignée, corrections repliables et suivi de progression**.

## Stack

- **backend/** — API REST Laravel 13 (import ZIP, parsing Markdown, endpoints de lecture/progression)
- **frontend/** — SPA Vite + Vue 3 (navigation, lecture, progression)
- **content/** — sources Markdown des formations (voir `content/FORMAT.md`)
- **docker-compose.yml** — PostgreSQL + backend + frontend

## Démarrer (Docker)

```bash
docker compose up -d --build
```

- Frontend : http://localhost:5173
- API : http://localhost:8000/api
- PostgreSQL : localhost:5432 (formation / secret)

Le backend migre automatiquement au démarrage. Config DB via `backend/.env.docker` (pgsql).

> ⚠️ `php artisan serve` ne transmet pas les variables d'env du conteneur au serveur PHP
> enfant : la config DB du conteneur vient donc de `backend/.env.docker` (monté sur `/app/.env`),
> pas du bloc `environment` du compose.

## Démarrer (natif, sans Docker)

```bash
# Backend (SQLite)
cd backend && php artisan migrate && php artisan serve

# Frontend
cd frontend && npm install && npm run dev
```

## Importer une formation

**Via l'UI** : page d'accueil → glisser-déposer un `.zip`.

**Via la CLI** :
```bash
# dans le conteneur
docker compose exec backend php artisan formation:import /chemin/vers/formation.zip
# ou en natif, depuis un dossier
cd backend && php artisan formation:import ../content/jwt-hexagonal-ddd
```

## Format du contenu

Voir **[content/FORMAT.md](content/FORMAT.md)** : un dossier = un module, un `.md` = une
leçon (front-matter `title`/`type`), `<!--correction-->` sépare énoncé et correction.

## API (résumé)

| Méthode | Route | Rôle |
|---|---|---|
| `POST` | `/api/import` | Importe un ZIP (`archive`) |
| `GET` | `/api/formations` | Liste des formations |
| `GET` | `/api/formations/{slug}` | Arbre modules + leçons |
| `GET` | `/api/formations/{slug}/lessons/{module}/{lesson}` | Détail leçon (+ prev/next, correction) |
| `GET` | `/api/formations/{slug}/progress` | Leçons complétées (client) |
| `POST` | `/api/formations/{slug}/progress/{module}/{lesson}` | Marque terminé/non |

## Roadmap

- [x] Import ZIP Markdown → base
- [x] API lecture + navigation + progression
- [x] SPA Vue (navigation, correction repliable, progression localStorage/serveur)
- [x] Stack Docker (PostgreSQL)
- [x] 1re formation réelle (JWT/Bearer/OAuth2/Hexagonal/DDD)
- [x] Quiz notés en base (questions structurées, notation, tentatives, UI interactive)
- [x] Auth utilisateur (Sanctum) + progression par compte (avec reprise de la progression anonyme)
- [x] Exercices interactifs (éditeur JS dans le navigateur + validation par tests en Web Worker)
