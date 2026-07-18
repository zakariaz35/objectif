# Propositions d'enrichissement — Power BI & dataviz (`parcours-powerbi`)

> **But de cette page** — recueillir des avis avant de produire du contenu. Elle dresse
> l'état des lieux du parcours, liste les manques, puis propose des enrichissements
> concrets (avec effort et priorité). Les **questions aux relecteurs** sont en fin de page.

---

## 1. État des lieux

`parcours-powerbi` est déjà une brique solide du cursus **Data-Analyst** : **5 modules,
34 leçons, ~18 000 mots**, avec leçons, exercices, flashcards et quiz.

| Module | Contenu | Exos | Flashcards | Quiz |
|---|---|:--:|:--:|:--:|
| 01 — Principes de dataviz | choisir le graphique, pièges visuels, storytelling | 1 | ✅ | ✅ |
| 02 — Power Query | importer/ETL, nettoyer, fusion/append/unpivot | 2 | ❌ | ❌ |
| 03 — Modèle en étoile | faits vs dimensions, relations, table de dates | 2 | ❌ | ❌ |
| 04 — DAX | colonnes vs mesures, contexte, CALCULATE, time intelligence, pièges | 5 | ✅ | ✅ |
| 05 — Dashboard | visuels/slicers, mise en page/publication, checklist | 1 | ❌ | ✅ |

Le parcours s'appuie en amont sur `parcours-sql` et alimente le hub `parcours-data-analyst`.

## 2. Contrainte plateforme (à garder en tête)

Power BI Desktop, le moteur DAX et Power Query **ne s'exécutent pas dans le navigateur**.
Deux formats interactifs restent possibles (et déjà utilisés) :

1. **Énoncé + correction repliable** — réflexion guidée (`<!--correction-->`).
2. **Exercice « logique » en TypeScript** — on *reproduit* la sémantique (filtrer puis
   agréger) en TS, **validé par des tests** en Web Worker. Déjà fait :
   `content/parcours-powerbi/04-dax/92-exo-agregat-logique.md` (« la logique d'un agrégat
   filtré »). C'est un bon moyen de *faire sentir* DAX sans Power BI.

Les propositions ci-dessous privilégient ces deux formats.

---

## 3. Propositions

### P1 — Nouveau module « DAX avancé » · priorité **haute** · effort **M**
**Pourquoi** : le module DAX actuel s'arrête à `CALCULATE` + time intelligence. Il manque
des briques fondamentales que tout analyste rencontre vite.
**Contenu envisagé** (≈ 5 leçons) :
- Variables `VAR` / `RETURN` (lisibilité, perf, éviter de recalculer).
- **Itérateurs** : `SUMX`, `AVERAGEX`, `RANKX` (contexte de ligne vs de filtre).
- `ALL` / `ALLEXCEPT` / `REMOVEFILTERS` (dénominateurs, % du total).
- `USERELATIONSHIP` + relations inactives.
- Patterns courants : % du total, panier moyen, top N.
**Interactif** : 2-3 exercices « logique TS » (implémenter un `SUMX`, un `RANKX`
simplifié) + 1 exercice énoncé/correction + 1 quiz + flashcards.

### P2 — Nouveau module « Power BI Service & RLS » · priorité **haute** · effort **M**
**Pourquoi** : tout le pan **entreprise** est absent — or c'est là que vit un rapport.
**Contenu envisagé** (≈ 4 leçons) :
- Espaces de travail (workspaces), jeux de données vs rapports.
- **Rafraîchissement planifié** + passerelle (gateway) pour sources on-premise.
- **Sécurité au niveau des lignes (RLS)** : rôles, `USERPRINCIPALNAME()`, RLS statique
  vs dynamique.
- Partage, applications, gouvernance minimale.
**Interactif** : exercice « conçois la stratégie RLS d'un cas » (énoncé/correction) +
quiz + flashcards.

### P3 — Compléter quiz & flashcards manquants · priorité **moyenne** · effort **S**
**Pourquoi** : cohérence pédagogique (certains modules n'ont ni quiz ni cartes).
**Contenu** : quiz pour **Power Query** et **Modèle en étoile** ; flashcards pour
**Power Query**, **Modèle en étoile** et **Dashboard**.

### P4 — Approfondir Power Query · priorité **moyenne** · effort **M**
**Pourquoi** : le module 02 reste introductif.
**Contenu envisagé** (≈ 3 leçons) :
- **Query folding** (pourquoi c'est important pour la perf).
- Paramètres & fonctions M réutilisables.
- **Import vs DirectQuery vs Composite** : quand choisir quoi.
**Interactif** : exercice « logique TS » sur une transformation (unpivot/normalisation)
+ quiz.

### P5 — Module « Modélisation avancée » · priorité **basse / à débattre** · effort **M**
**Pourquoi** : utile mais plus pointu ; peut attendre.
**Contenu** : many-to-many, filtres bidirectionnels (et leurs dangers), dimensions à
rôles multiples (role-playing), flocon vs étoile.

---

## 4. Idées de cours BI connexes (au-delà de `parcours-powerbi`)

- **« DAX patterns »** — un parcours-recettes (YTD/MTD, glissant, cohortes, Pareto,
  segmentation) en capstone du DAX.
- **Pont avec `parcours-projet-ventes`** (capstone du cursus) — ajouter une étape
  « restitution Power BI » au projet fil rouge.
- **Élargir la dataviz** (à débattre) — un parcours **Looker Studio** ou **Tableau** pour
  ne pas être mono-outil.

## 5. Questions aux relecteurs

1. **Priorités** : dans quel ordre attaquer P1–P5 ? (mon hypothèse : P1 puis P2.)
2. **Niveau cible** : on garde « intermédiaire », ou on vise aussi un volet avancé ?
3. **Format** : les exercices « logique en TypeScript » sont-ils pertinents pour des
   profils BI (pas forcément développeurs), ou faut-il privilégier l'énoncé + correction ?
4. **Sujets manquants** : un thème important non listé ici ? (ex. déneigement perf
   VertiPaq, incrémental refresh, déploiement par pipelines…)
5. **Fil rouge** : faut-il un **jeu de données commun** (ventes) réutilisé dans tous les
   exercices pour la continuité ?

> Une fois les avis recueillis, on traduit les propositions retenues en modules
> (`content/parcours-powerbi/<NN-module>/`) au format habituel — voir `content/FORMAT.md`.
