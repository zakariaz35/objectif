# Format d'une formation (source Markdown → ZIP)

Une formation est un dossier de fichiers Markdown que l'application importe via un `.zip`
(ou via `php artisan formation:import <dossier|zip>`).

## Arborescence

```
ma-formation/
├─ formation.yaml          # métadonnées de la formation (optionnel mais recommandé)
├─ 01-premier-module/      # un DOSSIER = un module ; ordre par le préfixe numérique
│  ├─ 01-une-lecon.md      # un FICHIER .md = une leçon
│  ├─ 02-autre-lecon.md
│  └─ 90-exo-pratique.md   # un exercice (front-matter type: exercise)
└─ 02-second-module/
   └─ 01-...md
```

- **Ordre** : déterminé par le préfixe numérique (`01-`, `02-`, `90-`). Le préfixe est
  retiré du slug final. À défaut, ordre alphabétique naturel.
- **Slug** : dérivé du nom de fichier/dossier sans préfixe (surchargeable en front-matter).

## formation.yaml

```yaml
title: JWT, Bearer, Hexagonal & DDD
slug: jwt-hexagonal-ddd        # optionnel (déduit du titre sinon)
description: Formation pour devs Laravel.
order: 0                       # optionnel
```

## Front-matter d'une leçon (.md)

```markdown
---
title: Structure d'un JWT
type: lesson          # lesson | exercise | quiz   (défaut: lesson)
order: 2              # optionnel (sinon préfixe du fichier)
---

Contenu Markdown de la leçon… tables, code, **gras**, etc.
```

## Exercices : énoncé + correction repliable

Dans un fichier `type: exercise`, le marqueur HTML `<!--correction-->` sépare
l'énoncé (affiché) de la correction (repliée dans l'UI).

```markdown
---
title: Décoder un token
type: exercise
---
## Énoncé
Écris une fonction `decode(token)`…

<!--correction-->
## Correction
```js
function decode(token) { /* ... */ }
```
```

## Rendu
Le Markdown est converti en HTML côté serveur (CommonMark + GitHub Flavored :
tables, listes de tâches, autoliens). Le HTML inline est autorisé (callouts, etc.).
