---
title: "Quiz — npm & écosystème"
type: quiz
questions:
  - prompt: |
      À quoi correspond `devDependencies` du `package.json`, dans le
      vocabulaire Composer ?
    options:
      - "À `require`"
      - "À `require-dev`"
      - "À `autoload`"
    answer: 1
    tags: ["package-json", "composer", "passerelle"]
    level: debutant
    explanation: |
      `dependencies` ≈ `require` (nécessaires en production).
      `devDependencies` ≈ `require-dev` (outils de développement uniquement :
      linter, tests, bundler...) — jamais requis pour exécuter l'application
      en production.
  - prompt: |
      Quelle plage de versions `^4.19.0` autorise-t-elle ?
    options:
      - "Uniquement `4.19.0` exactement."
      - "Toute version `4.x.x` supérieure ou égale à `4.19.0`, mais pas `5.0.0`."
      - "N'importe quelle version, y compris `5.0.0` ou `10.2.1`."
    answer: 1
    tags: ["semver", "caret"]
    level: debutant
    explanation: |
      Le caret `^` accepte toute mise à jour qui reste dans le **même
      MAJOR** (donc, par convention semver, sans breaking change) : `4.20.0`,
      `4.99.9` sont acceptées, `5.0.0` ne l'est pas.
  - prompt: |
      Quelle est la différence entre `^4.19.0` et `~4.19.0` ?
    options:
      - "Aucune, ce sont deux syntaxes équivalentes."
      - |
        `^` autorise tout changement dans le même MAJOR (MINOR et PATCH) ;
        `~` autorise seulement les PATCH dans le même MINOR — plus stricte.
      - "`~` autorise les changements de MAJOR, contrairement à `^`."
    answer: 1
    tags: ["semver", "caret", "tilde"]
    level: intermediaire
    explanation: |
      `^4.19.0` accepte `4.20.0` (MINOR différent). `~4.19.0` le refuse : elle
      n'accepte que des PATCH dans le **même** MINOR (`4.19.1`, `4.19.9`...).
      `~` est donc strictement plus restrictive que `^`.
  - prompt: |
      Quel est le rôle exact de `package-lock.json` ?
    options:
      - |
        Il fige les versions **exactes** réellement installées (y compris
        des dépendances transitives), pour une installation reproductible
        sur toutes les machines — l'équivalent de `composer.lock`.
      - |
        Il liste uniquement les scripts npm disponibles.
      - |
        Il remplace complètement `package.json` dans les projets récents.
    answer: 0
    tags: ["package-lock", "composer-lock"]
    level: intermediaire
    explanation: |
      `package.json` déclare des **plages** (`^4.19.0`) ; `package-lock.json`
      fige les versions **exactement** résolues (`4.19.2`), y compris pour
      toutes les dépendances des dépendances — à committer systématiquement,
      exactement comme `composer.lock`.
  - prompt: |
      Pourquoi préférer `npm ci` à `npm install` en CI/CD et en production ?
    options:
      - |
        `npm ci` est simplement un alias plus court, sans différence de
        comportement.
      - |
        `npm ci` installe strictement ce qui est figé dans
        `package-lock.json` (échoue si désynchronisé avec `package.json`),
        de façon déterministe — contrairement à `npm install` qui peut
        mettre à jour le lock.
      - |
        `npm ci` n'installe que les `devDependencies`.
    answer: 1
    tags: ["npm-ci", "ci-cd"]
    level: avance
    explanation: |
      `npm ci` supprime d'abord `node_modules/`, installe **exactement** ce
      que `package-lock.json` décrit, et échoue si ce fichier n'est pas
      cohérent avec `package.json` — un garde-fou et une garantie de
      reproductibilité idéale pour la CI/CD, là où `npm install` tolère et
      peut re-générer le lock.
  - prompt: |
      Que fait la commande `npm audit` ?
    options:
      - |
        Elle formate automatiquement le code source selon les conventions
        du projet.
      - |
        Elle compare les dépendances installées à une base de
        vulnérabilités connues (CVE) et signale les paquets concernés avec
        leur sévérité.
      - |
        Elle supprime les dépendances non utilisées du `package.json`.
    answer: 1
    tags: ["npm-audit", "securite"]
    level: intermediaire
    explanation: |
      `npm audit` détecte les vulnérabilités connues dans l'arbre de
      dépendances installé. `npm audit fix` tente une correction automatique
      sans casser les plages semver déclarées — à intégrer en CI plutôt qu'à
      lancer ponctuellement, comme un `composer audit`.
  - prompt: |
      Qu'est-ce qui distingue structurellement `node_modules/` de `vendor/`
      (Composer) ?
    options:
      - |
        `node_modules/` peut imbriquer plusieurs versions différentes d'un
        même paquet pour résoudre des conflits, alors que Composer refuse
        généralement l'installation en cas de contraintes incompatibles.
      - |
        Il n'y a aucune différence, les deux dossiers fonctionnent de façon
        strictement identique.
      - |
        `vendor/` peut contenir plusieurs versions d'un paquet, pas
        `node_modules/`.
    answer: 0
    tags: ["node-modules", "vendor", "passerelle"]
    level: avance
    explanation: |
      npm peut installer plusieurs versions d'un même paquet, imbriquées
      dans l'arborescence, quand des dépendances transitives exigent des
      versions incompatibles entre elles. Composer, plus strict, refuse
      généralement l'installation si les contraintes de version sont
      incompatibles — obligeant à résoudre le conflit explicitement.
---

Sept questions sur l'écosystème npm : correspondance directe avec Composer
(`dependencies`/`require`, lock files), la sémantique précise de `^`/`~`,
l'intérêt de `npm ci` en CI/CD, et le rôle de `npm audit`.
