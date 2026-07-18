---
title: "Quiz — résolution & conflits de versions"
type: quiz
questions:
  - prompt: |
      Depuis quelle version de npm une peer dependency non satisfaite
      bloque-t-elle l'installation (`ERESOLVE`), au lieu de n'afficher qu'un
      avertissement ?
    options:
      - "npm 5"
      - "npm 7"
      - "Ça a toujours bloqué, depuis la première version de npm"
    answer: 1
    tags: ["eresolve", "peer-dependencies", "historique"]
    level: debutant
    explanation: |
      Avant npm 7, une peer dependency insatisfaite ne produisait qu'un
      `npm WARN` — l'installation continuait quand même. Depuis npm 7
      (2020), npm installe automatiquement les peer dependencies et **bloque**
      en cas de conflit réel entre deux versions exigées. C'est ce changement
      de comportement qui fait apparaître `ERESOLVE` dans des projets plus
      anciens.
  - prompt: |
      Dans un message `ERESOLVE`, que signifie la ligne `Found: react@18.2.0` ?
    options:
      - "React 18.2.0 est la seule version compatible trouvée sur le registre npm."
      - "React 18.2.0 est la version actuellement installée (ou exigée à la racine du projet)."
      - "React 18.2.0 est une vulnérabilité de sécurité détectée."
    answer: 1
    tags: ["eresolve", "diagnostic"]
    level: debutant
    explanation: |
      `Found:` indique ce qui est réellement présent (ou demandé à la racine
      du projet). Le second bloc, `Could not resolve dependency:`, indique ce
      qu'une autre dépendance (souvent via un `peerDependency`) exige
      d'incompatible avec ce qui a été trouvé.
  - prompt: |
      Quelle affirmation décrit le mieux la différence entre
      `--legacy-peer-deps` et `overrides` ?
    options:
      - |
        `--legacy-peer-deps` désactive TOUTE la vérification des peer deps
        pour l'installation ; `overrides` cible un paquet précis et reste
        visible, documenté dans `package.json`.
      - "Les deux ont un effet strictement identique, ce ne sont que deux syntaxes différentes."
      - "`overrides` désactive la vérification des peer deps ; `--legacy-peer-deps` cible un paquet précis."
    answer: 0
    tags: ["legacy-peer-deps", "overrides"]
    level: intermediaire
    explanation: |
      `--legacy-peer-deps` revient au comportement npm 6 : aucune vérification
      de peer dependency, pour toute l'installation — pratique en dépannage
      ponctuel, risqué en réglage permanent. `overrides` (npm 8.3+) force une
      version précise pour un paquet ciblé, documentée dans le `package.json`
      committé : un fix chirurgical et visible en revue de code.
  - prompt: |
      Pourquoi « passer à yarn » fait souvent disparaître une erreur
      `ERESOLVE` que npm affichait ?
    options:
      - |
        Yarn (classic v1) n'a jamais implémenté la vérification stricte des
        peer dependencies : il se contente d'un avertissement et installe
        quand même — il ignore le conflit, il ne le résout pas.
      - "Yarn utilise un algorithme de résolution de versions totalement différent qui élimine mathématiquement tous les conflits."
      - "Yarn ignore complètement les peerDependencies déclarées dans les package.json, elles n'ont aucun effet."
    answer: 0
    tags: ["yarn", "peer-dependencies", "eresolve"]
    level: intermediaire
    explanation: |
      Yarn classic (v1) affiche un simple `warning ... has unmet peer
      dependency` et installe malgré tout — comportement proche de npm avant
      sa version 7. « Yarn qui marche là où npm plante » signifie, dans
      l'immense majorité des cas, que yarn **ignore** le même conflit que
      npm signale : un contournement, pas une résolution du problème sous-jacent.
  - prompt: |
      Que vaut exactement la plage `^0.2.3` (noter le MAJOR à `0`), selon la
      règle spéciale npm/semver ?
    options:
      - "Exactement la même chose que `^4.2.3` : tout ce qui reste dans le MAJOR `0`."
      - ">=0.2.3 <0.3.0 — le caret verrouille aussi le MINOR quand le MAJOR est 0."
      - ">=0.2.3, sans aucune limite supérieure."
    answer: 1
    tags: ["semver", "caret", "0.x"]
    level: avance
    explanation: |
      Semver considère qu'avant la version `1.0.0`, aucune stabilité n'est
      garantie — même un `MINOR` peut casser des choses. npm applique donc une
      règle spéciale au caret : si le `MAJOR` est `0` et le `MINOR` est
      supérieur à `0`, `^` verrouille le `MINOR` en plus du `MAJOR` (et si le
      `MINOR` est aussi `0`, il verrouille même le `PATCH`). C'est un piège
      fréquent avec des paquets encore en version `0.x`.
  - prompt: |
      À quoi sert précisément `npm explain <pkg>` (alias `npm why <pkg>`) ?
    options:
      - "À afficher la documentation officielle du paquet dans le terminal."
      - "À remonter la chaîne de dépendances qui a amené ce paquet dans l'arbre, et pourquoi (dependency directe, peer, transitive...)."
      - "À corriger automatiquement un conflit ERESOLVE."
    answer: 1
    tags: ["npm-explain", "diagnostic"]
    level: intermediaire
    explanation: |
      `npm explain <pkg>` (disponible depuis npm 7) répond à « pourquoi ce
      paquet est-il installé, et par quel chemin de dépendances ? » —
      indispensable pour identifier le vrai responsable d'un conflit avant de
      choisir un fix, surtout pour une dépendance transitive jamais installée
      directement.
---

Six questions sur la résolution de dépendances npm : le tournant npm 7 sur
les peer dependencies, la lecture d'une erreur `ERESOLVE`, le choix entre
`--legacy-peer-deps` et `overrides`, l'étude de cas yarn, et le piège semver
des versions `0.x.y`.
