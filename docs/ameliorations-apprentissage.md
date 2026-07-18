# Brief d'implémentation — Objectif : améliorations « apprentissage » (anglais par les séries)

> Prompt/brief destiné à être exécuté par toi ou un agent de code. Il est **ancré dans le
> code existant** : respecte les patterns en place, ne réinvente pas, pas de sur-ingénierie.

## Contexte & état actuel (ne pas re-découvrir)

- **Backend** : Laravel + Sanctum. Modèles `Formation, Module, Lesson, Progress, QuizAttempt,
  QuizQuestion, User`. Routes dans `backend/routes/api.php`, contrôleurs dans
  `backend/app/Http/Controllers/` (`QuizController`, `ProgressController`, `LessonController`,
  `FormationController`, `ImportController`, `AuthController`).
- **Frontend** : Vue 3 + Vite. `frontend/src/views/LessonView.vue` **dispatche par
  `lesson.type`** (`lesson | exercise | quiz | flashcards`) vers un composant. Composants
  dans `frontend/src/components/` (`QuizPlayer.vue`, `Flashcards.vue`, `ExercisePlayer.vue`).
  Client API `frontend/src/lib/api.js` (axios ; `client_token` anonyme + auth Sanctum).
  Routes `frontend/src/router/index.js`.
- **Contenu** : formations = Markdown importé par `FormationImporter::importLesson()`
  (`php artisan formation:import` ou `ImportController@store` pour un zip). Format documenté
  dans `content/FORMAT.md`. Une leçon porte sa charge utile selon le type : `quiz_questions`
  (table à part), `cards` (colonne JSON), `exercise` (colonne JSON). **Tout le front-matter est
  aussi stocké tel quel dans `lesson.meta` (colonne json)** ⇒ `kind`, `scoring`, `strategy` sont
  déjà persistés à l'import, **sans nouvelle colonne**. `Formation` a `tags/track/stack`.
- **Ce qui existe déjà** : `POST …/grade` (`QuizController@grade`, filtre `type='quiz'`)
  **enregistre** chaque tentative dans `quiz_attempts` (`score, total, answers(json),
  user_id|client_token`) — **sans contrainte unique**, donc l'historique est déjà complet. La
  propriété est résolue par le trait `Concerns/ResolvesOwner` (`user_id` sinon `client_token`).
- **Ce qui MANQUE** : aucun endpoint pour **lire** l'historique des tentatives ; aucune
  notion de « test de niveau » (barème → CEFR) ; un seul mode de quiz (linéaire) ; pas de
  type d'exercice « relier » ; pas de répétition espacée.

## Principes directeurs
- **Contenu piloté par le front-matter Markdown** (cohérent avec `content/FORMAT.md`).
- **Progression par utilisateur** (Sanctum) avec repli `client_token` (déjà le cas).
- **Pattern Strategy** pour les modes de quiz/cours (une clé `strategy` en front-matter → un
  sélecteur côté front/back). N'ajouter une stratégie que si elle a un usage réel.
- Réutiliser `quiz_attempts` comme table de tentatives générique (colonne `answers` json pour
  tout payload de réponse, y compris un `mapping` de matching) quand c'est possible.
- **Endpoints de lecture publics** (repli `client_token` via `ResolvesOwner`), **pas** derrière
  `auth:sanctum` — comme le reste de l'app. **Pas de store global** (pas de Pinia) : les vues
  refetch via `api.js`.

---

## Lot 1 — Persistance & suivi des résultats des tests de niveau ⭐ (priorité)

**But** : que le test de placement (et tout quiz marqué « niveau ») garde un historique
visible, avec le **niveau CEFR** calculé, pour voir sa progression B1→B2 dans le temps.

**Contenu (front-matter d'un quiz)** — nouveau bloc optionnel :
```yaml
type: quiz
kind: placement            # marque ce quiz comme test de niveau
scoring:                   # barème score -> palier (ordre décroissant)
  - { min: 0.90, label: "C1" }
  - { min: 0.75, label: "B2" }
  - { min: 0.55, label: "B1" }
  - { min: 0.00, label: "A2" }
```

**Backend**
- **Une seule migration** : colonne `level` (string, nullable) sur `quiz_attempts`
  (`QuizAttempt` → `$fillable += 'level'`). **Rien à ajouter sur `lessons`** : `kind` et `scoring`
  vivent déjà dans `lesson.meta` (cf. Contexte).
- `QuizController@grade` : si `data_get($lesson->meta,'kind') === 'placement'`, calculer
  `ratio = score/total`, en déduire le `label` via `$lesson->meta['scoring']` (helper privé
  `cefrLevel($ratio,$scoring)`), stocker `level` sur l'attempt et le renvoyer dans la réponse.
- **Nouveaux endpoints** (publics, scoping `ResolvesOwner`) dans un `ResultsController` :
  - `GET /formations/{formation}/lessons/{module}/{lesson}/attempts` → tentatives de CE quiz
    (date, score/total, level).
  - `GET /me/results` → synthèse groupée par leçon. **Optimisation : filtrer `WHERE level IS NOT
    NULL`** — seuls les quiz `placement` reçoivent un `level`, donc ça sélectionne exactement les
    placements sans joindre `lessons` ni filtrer `meta->kind` en SQL (fragile SQLite↔MySQL), et
    `scoring` n'a pas besoin d'être exposé au front.

**Frontend**
- `QuizPlayer.vue` : après correction d'un quiz `placement`, afficher le **palier** (« Niveau
  estimé : B1 ») en plus du score.
- Nouvelle vue **Résultats/Progression** (`views/ResultsView.vue`, route `/progres` ou
  `/f/:formation/resultats`) : courbe du score dans le temps + tableau des tentatives +
  dernier niveau. (Un petit SVG maison ou une lib légère ; pas de dépendance lourde.)
- `lib/api.js` : `getAttempts(...)`, `getResults(...)`.

**Critères d'acceptation** : refaire le test de placement crée une 2ᵉ tentative visible ;
la courbe montre l'évolution ; le niveau CEFR s'affiche à la fin et dans l'historique.

---

## Lot 2 — Plusieurs stratégies de cours / tests (pattern Strategy)

**But** : varier la façon dont un quiz est délivré/noté, sans dupliquer la logique.

**Contenu** : `strategy: linear` (défaut) en front-matter du quiz, + niveau par question
pour l'adaptatif :
```yaml
type: quiz
strategy: adaptive         # linear | placement | adaptive | review | random
draw: 12                   # (random/adaptive) nb de questions tirées d'un pool plus grand
questions:
  - { prompt: "...", options: [...], answer: 1, level: "B1", tags: ["phrasal-verbs"] }
```

**Stratégies à implémenter** (ne pas toutes faire d'un coup — commencer par `random` et
`review`, très rentables) :
| strategy | Comportement |
|---|---|
| `linear` | actuel : toutes les questions, dans l'ordre. |
| `random` | tire `draw` questions au hasard dans le pool (re-jouable sans mémoriser l'ordre). |
| `review` | ne repose que les questions **ratées** aux tentatives précédentes (lit `quiz_attempts`). |
| `adaptive` | commence facile, monte/descend selon les réponses via `level` des questions. |
| `placement` | = Lot 1 (barème → CEFR). |

**Implémentation** : un sélecteur `makeQuizStrategy(name)` côté front (dans `QuizPlayer.vue`
ou un `lib/quizStrategies.js`) qui décide **quelles questions** présenter et **dans quel
ordre** ; la correction reste côté backend (`grade`). Idem, plus tard, une notion de
**stratégie de parcours** (linéaire vs « test-out » : réussir un quiz déverrouille/skippe un
module) dans `ParcoursController` — **à ne faire que si le besoin se confirme**.

**Critères d'acceptation** : un quiz `random` re-joué propose un sous-ensemble différent ;
un quiz `review` ne repropose que les ratés.

---

## Lot 3 — Nouveau type de leçon `matching` : relier EN ↔ FR ⭐ (ton idée)

**But** : deux colonnes (anglais / français), on **relie** chaque phrase EN à sa traduction
FR ; auto-noté. **Alimenté directement par le `pairs.tsv` de `convert-tv learn --pairs`.**

**Contenu (front-matter)** :
```yaml
type: matching
title: Relier les répliques — GoT S04E01
pairs:
  - { en: "Looks fresh-forged.", fr: "Elle paraît neuve." }
  - { en: "It's time to come home.", fr: "Il est temps de rentrer." }
```

**Backend**
- `Lesson` : ajouter une colonne `pairs` (json), comme `cards`/`exercise` (migration
  `add_pairs_to_lessons_table` ; `$casts['pairs']='array'`, `$fillable += 'pairs'`).
  `FormationImporter::importLesson()` : `normalizePairs($meta['pairs'])` calqué sur
  `normalizeCards()` → `[{en_html, fr_html}]`.
- Servir la leçon **sans révéler l'appariement** : renvoyer deux listes — `left` (EN, ordre
  d'origine) et `right` (FR **mélangée**), chacune avec un **`id` = index dans `pairs`** (stable,
  sert de clé de correction ; seul l'ordre d'affichage de `right` est mélangé).
- **Correction sur la même route `…/grade`, rendue polymorphe** : relâcher le filtre `type='quiz'`
  de `QuizController@grade`, puis `switch($lesson->type)`. Pour `matching`, comparer le `mapping`
  soumis (`{leftId: rightId}`) aux `pairs`, `score` = nb de bonnes liaisons, persister le
  `QuizAttempt` en **réutilisant la colonne `answers`** pour le `mapping`. Branche `quiz` inchangée ;
  rejeter en 422 tout type non notable. (Pas de `MatchingController` ni de 2ᵉ endpoint.)

**Frontend**
- Composant `components/Matching.vue` : colonne gauche EN, colonne droite FR (mélangée) ;
  interaction **clic-gauche puis clic-droite** pour lier (plus simple et mobile-friendly que
  le drag ; le drag peut venir après). Surligne juste/faux à la validation, montre les bonnes
  paires. Brancher dans `LessonView.vue` (`v-if lesson.type === 'matching'`) + icône dans
  `FormationView.vue`.
- Bonne pratique UX : limiter à **5-7 paires par écran** (au-delà, paginer) — sinon illisible.

**Critères d'acceptation** : import d'une leçon `matching` → 2 colonnes mélangées → liaisons
→ note + correction visuelle → tentative enregistrée.

---

## Lot 4 — Autres ajouts proposés (rangés par ROI)

### 4.1 Répétition espacée (SRS) sur les flashcards ⭐ (fort ROI)
Aujourd'hui `Flashcards.vue` est en auto-éval « su / à revoir » **sans planification** → Anki
reste supérieur pour *retenir*. Ajouter un planificateur **SM-2 / Leitner** :
- table `card_reviews` (user_id, lesson_id, card_index, ease, interval_days, due_at, reps) ;
- endpoints `GET /me/cards/due` + `POST …/review` (note 0-5 → recalcul interval/ease) ;
- une vue **« À réviser aujourd'hui »** qui pioche les cartes `due` toutes formations
  confondues. → Objectif remplacerait Anki.

### 4.2 Type `cloze` (texte à trous)
`type: cloze` : phrase avec `{{gap}}` à compléter (saisie ou choix). Parfait pour
grammaire/vocabulaire tirés des sous-titres. Auto-noté, réutilise `quiz_attempts`.

### 4.3 Type `shadowing` / audio (dépend de convert-tv)
`type: shadowing` : lit un **clip audio** + affiche le texte + **enregistre la voix** (Web
Audio / MediaRecorder) pour comparer. Nécessite que `convert-tv` **exporte les clips audio**
par réplique (nouvelle sortie). Plus gros lot — après les autres.

### 4.4 Tableau de bord & maîtrise par tag CEFR
Page d'accueil apprenant : niveau actuel, série (streak), cartes dues, **points faibles par
tag** (ex. « phrasal-verbs : 45 % ») calculés depuis `quiz_attempts` + `tags` de questions.

### 4.5 Exporteur `convert-tv → Objectif` (chaînon inter-projets)
Option `convert-tv learn --objectif` qui génère une **formation Objectif par épisode** :
module `flashcards` (vocab), `quiz` (compréhension via IA), `matching` (depuis `pairs.tsv`),
`formation.yaml` avec `track: "Anglais par les séries"`, `order = num épisode`. Puis
`formation:import`. C'est ce qui relie tes deux projets bout à bout.

---

## Ordre conseillé
1. **Lot 1** (suivi des résultats de niveau) — 1 seule migration ; débloque la mesure *et* les
   données pour `review`. Seul prérequis des autres.
2. **Lot 2 — `random`/`review`** seulement (quasi gratuit, ne dépend que du Lot 1). Reste du Lot 2
   (`adaptive`) plus tard.
3. **Lot 3** (`matching`) — nouveau type visible, alimenté par convert-tv, gros effet « waouh ».
4. **Lot 4.1** (SRS) — remplace Anki, cœur de la rétention (le lot le plus lourd).
5. **4.5** (exporteur convert-tv→Objectif, autre dépôt) une fois `matching` prêt.
6. Le reste (4.2 cloze, 4.4 dashboard, 4.3 shadowing/audio) selon l'envie.

## Récap des fichiers à toucher
- **Backend** : `database/migrations/*` (`level` sur quiz_attempts en L1, `pairs` sur lessons en L3 ;
  `card_reviews` en L4) ; `app/Models/{Lesson,QuizAttempt}.php` ;
  `app/Http/Controllers/{QuizController,LessonController}.php` + **nouveau `ResultsController`**
  (`ReviewController` en L4) ; `app/Services/FormationImporter.php` (`normalizePairs`) ; `routes/api.php`.
- **Frontend** : `views/LessonView.vue` (dispatch), nouveaux `components/{Matching,Cloze}.vue`,
  `views/ResultsView.vue`, `lib/quizStrategies.js`, `router/index.js`, `lib/api.js`,
  `QuizPlayer.vue` (stratégies + niveau), `views/FormationView.vue` (icône).
- **Doc** : mettre à jour `content/FORMAT.md` (nouveaux `kind`, `scoring`, `strategy`, `type: matching`).
