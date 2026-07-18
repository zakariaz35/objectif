---
title: "Quiz — lockfile, node_modules, cache & permissions"
type: quiz
questions:
  - prompt: |
      Quelle différence essentielle distingue `npm ci` de `npm install` ?
    options:
      - "Aucune, `npm ci` est juste un alias plus court de `npm install`."
      - |
        `npm ci` installe strictement ce que décrit `package-lock.json` (et
        échoue si désynchronisé avec `package.json`) ; `npm install` peut,
        lui, régénérer le lock si nécessaire.
      - "`npm ci` installe uniquement les devDependencies."
    answer: 1
    tags: ["npm-ci", "lockfile"]
    level: debutant
    explanation: |
      `npm ci` supprime d'abord `node_modules/`, installe exactement ce que
      `package-lock.json` décrit, et échoue (erreur `EUSAGE`) si ce fichier
      n'est pas cohérent avec `package.json` — un garde-fou pour la CI/prod.
      `npm install` tolère et peut régénérer le lock.
  - prompt: |
      Un `npm ci` échoue en CI avec `EUSAGE` alors que `npm install`
      fonctionne parfaitement en local sur la même branche. Quelle est la
      cause la plus probable ?
    options:
      - "Un problème réseau propre à l'environnement CI."
      - |
        `package.json` a été modifié (dépendance ajoutée/changée) sans
        relancer `npm install` en local pour resynchroniser
        `package-lock.json` avant de committer.
      - "La CI utilise une version de Node incompatible."
    answer: 1
    tags: ["npm-ci", "lockfile", "drift"]
    level: intermediaire
    explanation: |
      C'est le classique « drift » de lockfile : `package.json` a changé
      sans que `package-lock.json` ne soit régénéré et commité en
      conséquence. `npm install`, plus tolérant, régénère silencieusement le
      lock en local ; `npm ci`, strict, refuse — exactement le comportement
      voulu.
  - prompt: |
      Que fait `npm cache clean --force`, et quand doit-on l'utiliser ?
    options:
      - |
        Il supprime entièrement le cache local des tarballs téléchargés — à
        réserver à une erreur d'intégrité confirmée (`EINTEGRITY`), pas en
        routine.
      - "Il nettoie automatiquement les dépendances inutilisées du projet."
      - "Il vide package-lock.json pour repartir de zéro."
    answer: 0
    tags: ["npm-cache", "eintegrity"]
    level: intermediaire
    explanation: |
      Le cache npm accélère les réinstallations. `npm cache clean --force`
      (le `--force` est obligatoire depuis npm 5, pour éviter une suppression
      accidentelle) le vide entièrement — utile face à une vraie corruption
      (`EINTEGRITY`), pas comme réflexe systématique face à n'importe quelle
      erreur d'installation.
  - prompt: |
      Un `npm install` échoue avec `EACCES` sur `node_modules/`, après
      qu'un conteneur Docker lancé en `root` a écrit dans ce dossier monté en
      volume. Quel est le bon réflexe ?
    options:
      - "Relancer la commande avec `sudo npm install`."
      - |
        Corriger la propriété des fichiers concernés (`chown -R
        $(whoami):$(id -gn) ...`), puis éviter que Docker n'écrive de
        nouveau en root dans ce volume.
      - "Supprimer entièrement le projet et le re-cloner."
    answer: 1
    tags: ["eacces", "permissions", "docker"]
    level: avance
    explanation: |
      `EACCES` signale un problème de propriétaire de fichiers, pas un bug
      npm. `sudo npm install` ferait disparaître l'erreur en créant ENCORE
      PLUS de fichiers appartenant à `root` — le problème s'aggrave à chaque
      répétition. Le bon réflexe : corriger la propriété une fois
      (`chown -R`), puis empêcher la récidive (ne pas laisser Docker écrire
      en root dans un volume monté).
  - prompt: |
      Pourquoi ne faut-il (quasiment) jamais lancer `sudo npm install` ?
    options:
      - |
        Parce que ça aggrave le problème de permissions (plus de fichiers
        `root`) ET exécute les scripts d'installation de paquets tiers avec
        des privilèges élevés — un risque de sécurité en plus du problème
        initial.
      - "Parce que `sudo` ralentit systématiquement l'installation."
      - "Parce que `sudo npm install` n'existe pas en tant que commande valide."
    answer: 0
    tags: ["sudo", "eacces", "securite"]
    level: avance
    explanation: |
      Deux problèmes cumulés : `sudo npm install` crée de nouveaux fichiers
      appartenant à `root`, aggravant la pollution de permissions ; et il
      exécute les scripts `postinstall` de paquets potentiellement
      compromis avec des privilèges root (voir le module Sécurité).
      L'alternative durable : un gestionnaire de versions Node (`nvm`,
      `fnm`, `volta`) qui élimine le besoin de `sudo` pour npm.
  - prompt: |
      À quoi sert un fichier `.npmrc` au niveau du projet (`./.npmrc`,
      commité) ?
    options:
      - |
        À centraliser des réglages partagés par l'équipe (registre, options
        d'installation comme `save-exact`, `engine-strict`...) — l'équivalent
        combiné de `config`/`auth.json` côté Composer, sans jamais y
        commiter de token en dur.
      - "À remplacer entièrement package.json."
      - "À lister les scripts npm disponibles, comme un Makefile."
    answer: 0
    tags: ["npmrc", "config"]
    level: intermediaire
    explanation: |
      `.npmrc` cumule les rôles de `config` et `auth.json` côté Composer :
      réglages de résolution/installation, registre alternatif (dépôt
      privé), et authentification CI via un jeton — toujours référencé par
      variable d'environnement (`${NPM_TOKEN}`), jamais en dur dans un
      fichier commité.
---

Six questions sur la mécanique du lockfile, la différence `npm ci`/`npm
install`, le cache npm, et le classique piège `EACCES` lié aux permissions
(Docker/root/sudo).
