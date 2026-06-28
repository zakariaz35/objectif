# Objectif — plateforme d'apprentissage

Plateforme perso **multi-sujets** pour apprendre à partir de contenu écrit en **Markdown**.
On rédige une formation (cours, cartes mémo, quiz, exercices) dans des fichiers `.md`, on
**dépose le ZIP** dans l'appli : elle le parse, le range en base et l'expose sur une page
web avec **navigation soignée, corrections repliables, quiz notés, exercices interactifs
et suivi de progression par compte**.

> 💡 L'appli est un **moteur générique** : elle ne contient aucun cours « en dur ». Le site
> démarre **vide**, on importe les formations que l'on veut. Un cours d'exemple
> (« JWT, Bearer, Hexagonal & DDD ») est fourni dans `content/` pour essayer.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Démarrer (Docker)](#démarrer-docker)
- [Charger une formation](#charger-une-formation)
- [Écrire une formation (format)](#écrire-une-formation-format)
- [Développement](#développement)
- [Modèle de données](#modèle-de-données)
- [API (résumé)](#api-résumé)
- [Authentification & progression](#authentification--progression)
- [Dépannage](#dépannage)
- [Roadmap](#roadmap)

---

## Fonctionnalités

**Pour qui apprend**
- Navigation claire : sommaire (modules/leçons), fil d'Ariane, boutons précédent/suivant.
- **Suivi de progression** : chaque leçon se coche (manuellement ou automatiquement) ;
  barre d'avancement, persistance entre les sessions, rattachée au compte.
- **Cartes mémo** : rappel actif (révéler la réponse + auto-évaluation « su / à revoir »).
- **Quiz notés** : QCM avec score, explication par question, tentatives enregistrées.
- **Exercices interactifs** : éditeur de code JS dans le navigateur, validé par des tests
  exécutés en *Web Worker* isolé (feedback vert/rouge).
- **Comptes** : inscription / connexion ; la progression faite en anonyme est récupérée à
  la connexion.

**Pour qui crée du contenu**
- Tout en **Markdown** + front-matter YAML : aucune base de données à toucher.
- **Multi-formations** : on importe autant de sujets que l'on veut (dépôt de ZIP ou CLI).
- 4 types de leçon (`lesson`, `flashcards`, `quiz`, `exercise`) — voir le format ci-dessous.
- Rendu riche : tables, blocs de code, encadrés, séparation énoncé / correction repliable.

---

## Architecture

```
formation/
├─ backend/    API REST Laravel 13 — import ZIP, parsing Markdown, lecture, quiz, auth
├─ frontend/   SPA Vite + Vue 3 — navigation, lecture, cartes/quiz/exos, progression
├─ content/    sources Markdown des formations (montées en lecture seule dans le conteneur)
└─ docker-compose.yml   PostgreSQL + backend + frontend
```

Flux : **ZIP de Markdown → import (parsing front-matter + Markdown→HTML) → base de données
→ API REST → SPA Vue**. La progression est rattachée à un compte (ou à un identifiant
anonyme tant qu'on n'est pas connecté).

---

## Démarrer (Docker)

Prérequis : **git** et **Docker** (avec Docker Compose).

```bash
git clone <repo> && cd formation
docker compose up -d --build
```

- Frontend : http://localhost:5173
- API : http://localhost:8000/api
- PostgreSQL : localhost:5432 (`formation` / `secret`)

Le premier `--build` prend quelques minutes (images PHP + Node). Le backend migre la base
au démarrage. **Le site démarre vide** : la page d'accueil explique comment importer une
formation (voir ci-dessous).

> ⚠️ **Note technique** — `php artisan serve` ne transmet pas les variables d'environnement
> du conteneur au serveur PHP enfant. La config DB du conteneur vient donc de
> `backend/.env.docker` (monté sur `/app/.env`, committé car sans vrai secret), pas du bloc
> `environment` du `docker-compose.yml`.

---

## Charger une formation

**Via l'interface** (recommandé) : page d'accueil → glisser-déposer un `.zip` de formation
dans la zone prévue (ou cliquer pour le sélectionner).

**Via la CLI** — pratique pour le cours d'exemple fourni :

```bash
# Une formation (dossier ou zip)
docker compose exec backend php artisan formation:import /content/jwt-hexagonal-ddd

# Toutes les formations d'un dossier (ignore celles déjà en base ; --force pour resync)
docker compose exec backend php artisan formation:import-all /content
docker compose exec backend php artisan formation:import-all /content --force
```

> `content/` est monté sur `/content` dans le conteneur backend, d'où le chemin `/content/…`.
> `import-all` est **non destructif** par défaut : il saute une formation déjà importée pour
> ne pas écraser la progression. `--force` réimporte (et **réinitialise** la progression de
> cette formation).

### Construire les ZIP

Les `.zip` importables (un par formation) sont versionnés dans `content/` et **prêts à
glisser-déposer** dans l'interface. Après avoir **modifié le contenu Markdown**,
régénère-les :

```bash
php content/make-zips.php          # un .zip par dossier contenant un formation.yaml
```

> ⚠️ Les `.zip` sont des **artefacts** : si tu édites le Markdown, **régénère-les** (sinon
> ils sont obsolètes), puis commite-les. Le contenu source reste le Markdown.

---

## Écrire une formation (format)

Une formation est un dossier : un `formation.yaml` à la racine, un **sous-dossier par
module**, un fichier `.md` **par leçon**. L'ordre suit le préfixe numérique (`01-`, `02-`…).

```
ma-formation/
├─ formation.yaml          # title, slug, description
├─ 01-chapitre/
│  ├─ 01-cours.md          # type: lesson
│  ├─ 02-cartes.md         # type: flashcards
│  └─ 03-quiz.md           # type: quiz
└─ 02-chapitre/
   └─ 01-exo.md            # type: exercise
```

Quatre **types de leçon** (champ `type` du front-matter) :

| Type | Rôle |
|---|---|
| `lesson` | Cours : Markdown rendu en HTML (tables, code, encadrés). |
| `flashcards` | Cartes mémo : question → révéler la réponse → auto-évaluation « su / à revoir ». |
| `quiz` | QCM noté : questions à choix multiple, score + explications, tentatives enregistrées. |
| `exercise` | Énoncé + correction repliable ; **ou** éditeur de code JS validé par des tests (Web Worker). |

📄 **Format complet et exemples** : voir **[content/FORMAT.md](content/FORMAT.md)**.

---

## Développement

Le code est monté en volume dans les conteneurs : modifier un fichier `backend/` ou
`frontend/` est pris en compte sans rebuild (hot-reload Vite, rechargement PHP par requête).

```bash
docker compose logs -f backend     # logs API
docker compose exec backend bash   # shell dans le conteneur backend
docker compose exec backend php artisan migrate        # migrations
docker compose exec db psql -U formation -d formation  # accès SQL
```

**Sans Docker** (dev natif, base SQLite — la config vient de `backend/.env`) :

```bash
cd backend && cp .env.example .env && php artisan key:generate && php artisan migrate && php artisan serve
cd frontend && npm install && npm run dev
```

---

## Modèle de données

```
formations ──< modules ──< lessons ──< quiz_questions
                                   └──< progress      (par user OU client_token anonyme)
                                   └──< quiz_attempts  (score, total, réponses)
users ──< progress, quiz_attempts, personal_access_tokens (Sanctum)
```

- **formation** : `slug`, `title`, `description`.
- **module** : appartient à une formation, ordonné.
- **lesson** : `type` (`lesson|flashcards|quiz|exercise`), `body_html`, `correction_html`,
  et selon le type des colonnes JSON : `cards` (mémo), `exercise` (starter + tests),
  les `quiz_questions` liées (énoncé, options, bonne réponse, explication).
- **progress** : une ligne par (leçon, propriétaire) ; le propriétaire est un `user_id` si
  connecté, sinon un `client_token` anonyme.
- **quiz_attempts** : historique des tentatives de quiz (score / total / réponses).

## API (résumé)

| Méthode | Route | Rôle |
|---|---|---|
| `POST` | `/api/import` | Importe un ZIP (`archive`) |
| `GET` | `/api/formations` | Liste des formations |
| `GET` | `/api/formations/{slug}` | Arbre modules + leçons |
| `GET` | `/api/formations/{slug}/lessons/{module}/{lesson}` | Détail leçon (+ prev/next, correction, quiz, exercice, cartes) |
| `POST` | `/api/formations/{slug}/lessons/{module}/{lesson}/grade` | Corrige un quiz (score + feedback) |
| `GET` `POST` | `/api/formations/{slug}/progress[...]` | Lecture / bascule de la progression |
| `POST` | `/api/auth/register` · `/api/auth/login` | Création de compte / connexion (token) |
| `POST` `GET` | `/api/auth/logout` · `/api/auth/me` | Déconnexion / profil (auth requise) |
| `GET` | `/api/users` | ⚠️ Debug perso : liste des comptes — **à retirer si non-perso** |

---

## Authentification & progression

- Auth par **token Bearer** (Laravel Sanctum) : `register` / `login` renvoient un token,
  stocké côté SPA et envoyé en `Authorization: Bearer`.
- La progression et les tentatives de quiz sont rattachées au **compte** si connecté, sinon
  à un **identifiant anonyme** (`X-Client-Token`). À la connexion, la progression anonyme du
  navigateur est **récupérée** sur le compte.
- ⚠️ La page **/comptes** et l'endpoint `/api/users` exposent tous les comptes **sans
  contrôle d'accès** : c'est un confort de projet **personnel**. Des commentaires `À SUPPRIMER
  si non-perso` balisent le code à retirer avant tout usage public.

---

## Dépannage

| Symptôme | Cause probable / solution |
|---|---|
| `docker: command not found` (WSL) | Activer l'intégration WSL dans Docker Desktop (*Settings → Resources → WSL Integration*), puis *Apply & Restart*. |
| Le front ne joint pas l'API | Vérifier que le backend tourne (`docker compose ps`) et que `frontend/.env` pointe sur `http://localhost:8000`. |
| Port 8000 ou 5173 déjà pris | Arrêter le processus qui l'occupe, ou changer le mapping de ports dans `docker-compose.yml`. |
| L'API lit la mauvaise base | La config DB du conteneur vient de `backend/.env.docker` (pas du bloc `environment`) — voir la note dans *Démarrer*. |
| Le contenu modifié n'apparaît pas | Réimporter : `docker compose exec backend php artisan formation:import-all /content --force`. |
| Repartir d'une base vide | `docker compose exec backend php artisan migrate:fresh --force` (⚠️ efface comptes + progression). |
| Voir les logs de l'API | `docker compose logs -f backend`. |

## Étendre à un autre framework (React, Angular…)

L'appli est **agnostique du framework enseigné**. Pour ajouter un parcours React ou Angular :

1. **Contenu** — rien de spécial : crée une formation Markdown (`content/parcours-react/…`)
   et importe-la. Le backend (formations / modules / leçons / exercices / cartes / quiz)
   ne connaît aucun framework.
2. **Exercices de logique** — mets `language: ts` / `tsx` / `jsx` dans le bloc `exercise` :
   le runner transpile via Sucrase (`frontend/src/lib/transpile.js`, table `TRANSFORMS`)
   et exécute dans le worker isolé. JS/TS/JSX/TSX déjà couverts.
3. **Playground / bouton « Tester »** — un seul point d'extension :
   `frontend/src/lib/playgrounds.js`. Écris un `openReactPlayground(code)` (sur le modèle
   de `vuePlayground.js`) puis :

   ```js
   registerPlayground(['jsx', 'tsx'], openReactPlayground)
   ```

   Les leçons détectent le langage du bloc de code et branchent le bon playground
   automatiquement — **aucun autre fichier à modifier**.

> Limite connue : exécuter des **composants** (Vue/React) en live demande un playground
> dédié par framework (compilateur + preview). La **logique** (JS/TS/JSX/TSX), elle, tourne
> partout via le même runner.

## Roadmap

- [x] Import ZIP Markdown → base
- [x] API lecture + navigation + progression
- [x] SPA Vue (navigation, correction repliable, progression)
- [x] Stack Docker (PostgreSQL)
- [x] Cours d'exemple (JWT/Bearer/OAuth2/Hexagonal/DDD)
- [x] Cartes mémo + quiz notés (questions structurées, tentatives)
- [x] Auth utilisateur (Sanctum) + progression par compte
- [x] Exercices interactifs (éditeur JS + validation par tests en Web Worker)
- [ ] Éditeur de code riche (CodeMirror : coloration syntaxique)
- [ ] Tests automatisés backend (Pest) des parcours auth / progression / quiz
- [ ] Déploiement (build statique du front, image de prod)
