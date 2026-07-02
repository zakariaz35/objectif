# TODO — Formation « Architecte logiciel » (à créer sur objectif)

> Basée sur la brochure OpenClassrooms « Architecte logiciel » (titre RNCP41330
> « Expert en développement logiciel », bac+5). **Pas encore créée** — plan de modules prêt.

## La brochure est-elle exploitable ?

Oui : elle est **entièrement structurée par projets** — **12 projets** (Projet 1 → 12)
regroupés en **4 blocs de compétences RNCP**. Chaque projet liste ses *compétences cibles*,
ses *cours associés* et son *volume horaire* (total 603 h encadrées). Bonne base de contenu.

Blocs RNCP41330 :
- **BC01** — Analyser & concevoir des solutions logicielles (P5, P6, P7, P11, P12)
- **BC02** — Piloter le dev, les tests et la maintenance (P1, P2, P3, P4)
- **BC03** — Préparer l'intégration & le déploiement continu / DevOps (P8, P9)
- **BC04** — Manager un projet et/ou une équipe (P10)

## Modules à créer (10) — reframe pédagogique des 12 projets

| # | Module | Couvre (brochure) | Contenu suggéré |
|---|---|---|---|
| 1 | Fondations de l'archi logicielle (rôle, qualité, standards UML/C4) | P7, BC01 | leçons + quiz |
| 2 | SOLID & design patterns (code maintenable) | P3 | leçons + exercices |
| 3 | Modélisation données & API (UML→relationnel, REST/OpenAPI) | P5, P7 | leçons + exercice |
| 4 | Tests & qualité (stratégie, recette, débogage) | P2, P8 | leçons + quiz |
| 5 | Refonte & transformation d'architectures (audit, refactor) | P3, P5, P11 | leçons + exercice |
| 6 | Architecture pour la montée en charge (scalabilité, choix techno, PoC) | P7, P12 | leçons + quiz |
| 7 | CI/CD & DevOps (pipeline, Docker, GitLab CI, GitHub Actions, IaC) | P8, P9 (BC03) | leçons + exercice |
| 8 | Veille, audit & Green IT (veille, audit process, ISO 9001, écoconception) | P6, P11, P12 | leçons + flashcards |
| 9 | Management & pilotage Agile/Scrum | P10 (BC04) | leçons + quiz |
| 10 | Capstone — concevoir une archi full-stack de bout en bout | P4, P7 (synthèse) | exercice fil rouge |

## Notes
- Modules **2 (SOLID/patterns)**, **4 (tests)**, **7 (CI/CD)** = bons candidats à `content/_modules/`
  (réutilisables par d'autres parcours via la playlist).
- Étape suivante : scaffolder `content/architecte-logiciel/` (10 dossiers + `formation.yaml` + `module.yaml`).
