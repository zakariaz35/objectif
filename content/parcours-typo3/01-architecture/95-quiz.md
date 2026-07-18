---
title: "Quiz — Architecture TYPO3"
type: quiz
questions:
  - prompt: |
      Un développeur Symfony rejoint une mission TYPO3. Il cherche le fichier de routes
      pour comprendre comment les URLs sont résolues. Où doit-il regarder en priorité ?
    options:
      - "Dans vendor/typo3/cms-frontend/Configuration/Routes.yaml"
      - "Dans la table `pages` en base de données (slug, uid) et dans config/sites/*/config.yaml"
      - "Dans le fichier public/.htaccess uniquement"
      - "Dans ext_localconf.php de chaque extension active"
    answer: 1
    tags: [architecture, routing, pages]
    level: debutant
    explanation: >
      En TYPO3, les URLs sont résolues via l'arbre de pages (table `pages`, champ `slug`)
      combiné à la site configuration (`config/sites/<site>/config.yaml` qui définit le
      domaine et la page racine). Il n'y a pas de fichier de routes YAML comme en Symfony.
      Le `.htaccess` ne fait que réécrire vers `index.php` (point d'entrée unique).
  - prompt: |
      En Composer mode TYPO3 12, quel est le document root à configurer dans le vhost
      Apache/Nginx ?
    options:
      - "La racine du projet (là où se trouve composer.json)"
      - "vendor/typo3/cms-core/Resources/Public"
      - "public/ (là où se trouve index.php)"
      - "typo3/ (dossier du backend)"
    answer: 2
    tags: [composer-mode, installation]
    level: debutant
    explanation: >
      En Composer mode, le document root est toujours `public/` — c'est le seul dossier
      exposé sur le web. Il contient `index.php`, `fileadmin/`, et un symlink `typo3/`
      vers le backend. La racine du projet (composer.json, vendor/, config/) ne doit
      jamais être accessible depuis le web.
  - prompt: |
      Tu veux ajouter un champ personnalisé à la table `tt_content` (les content elements).
      Quelle est la bonne approche ?
    options:
      - "Modifier directement le fichier core vendor/typo3/cms-core/Configuration/TCA/tt_content.php"
      - "Créer Configuration/TCA/tt_content.php dans ton extension"
      - "Créer Configuration/TCA/Overrides/tt_content.php dans ton extension"
      - "Modifier ext_tables.php du core"
    answer: 2
    tags: [tca, overrides]
    level: intermediaire
    explanation: >
      Les modifications de tables existantes passent obligatoirement par
      `Configuration/TCA/Overrides/<nom_table>.php` dans ton extension. Modifier
      directement les fichiers du vendor/ serait écrasé à la prochaine mise à jour.
      `Configuration/TCA/<nom_table>.php` (sans Overrides/) est réservé aux nouvelles
      tables. `ext_tables.php` est déprécié pour les TCA depuis TYPO3 9.
  - prompt: |
      Après avoir modifié le fichier Configuration/TCA/Overrides/tt_content.php de ton
      extension sitepackage, le nouveau champ n'apparaît toujours pas dans le backend.
      Quelle est la cause la plus probable ?
    options:
      - "Le fichier TCA Overrides n'est lu qu'une fois par jour par un scheduler."
      - "Il faut redémarrer PHP-FPM pour que TYPO3 recharge les fichiers TCA."
      - "Le cache TYPO3 n'a pas été vidé — les TCA compilés sont mis en cache."
      - "Il manque une déclaration dans ext_emconf.php pour activer les overrides."
    answer: 2
    tags: [tca, cache]
    level: debutant
    explanation: >
      TYPO3 compile les TCA dans son cache au premier appel. Après toute modification
      d'un fichier TCA (ou Overrides), vider le cache est impératif :
      `vendor/bin/typo3 cache:flush` ou Maintenance > Flush All Caches dans le backend.
      Pas besoin de redémarrer PHP-FPM ni de scheduler.
  - prompt: |
      Quelle est la différence entre `ext_localconf.php` et les fichiers
      `Configuration/TCA/Overrides/` d'une extension ?
    options:
      - "ext_localconf.php gère les templates, TCA/Overrides/ gère les routes."
      - "ext_localconf.php est chargé très tôt (avant la BDD) pour les plugins/hooks ; TCA/Overrides/ est chargé après le TCA complet pour surcharger les définitions de tables."
      - "ext_localconf.php et TCA/Overrides/ font exactement la même chose, c'est redondant."
      - "ext_localconf.php n'est utilisé qu'en mode legacy (sans Composer)."
    answer: 1
    tags: [bootstrap, tca, architecture]
    level: intermediaire
    explanation: >
      `ext_localconf.php` est le point d'entrée d'une extension chargé très tôt dans le
      bootstrap (avant même la connexion BDD) — on y enregistre les plugins Extbase, les
      hooks, les icônes. Les fichiers `Configuration/TCA/Overrides/` sont chargés plus
      tard, après que tous les TCA de base ont été définis, pour les surcharger
      proprement. Les deux ont des rôles bien distincts.
---

Vérifie ta compréhension de l'architecture avant d'attaquer l'installation.
