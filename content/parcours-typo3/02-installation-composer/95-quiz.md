---
title: "Quiz — Installation & configuration"
type: quiz
questions:
  - prompt: |
      Quelle commande crée un nouveau projet TYPO3 12.4 en Composer mode ?
    options:
      - "composer init typo3/cms-core:^12.4"
      - "composer create-project typo3/cms-base-distribution:^12.4 my-project"
      - "composer require typo3/cms-base-distribution:^12.4"
      - "typo3 new project --version=12.4"
    answer: 1
    tags: [composer-mode, installation]
    level: debutant
    explanation: >
      `composer create-project` est la commande Composer pour créer un projet à partir
      d'un template. `typo3/cms-base-distribution` est le package de départ officiel.
      `composer require` ajoute seulement une dépendance à un projet existant.
      `composer init` crée uniquement un `composer.json` vide. Il n'existe pas de commande
      `typo3 new project`.
  - prompt: |
      Après avoir installé une nouvelle extension TYPO3 avec `composer require`, quelle
      commande active l'extension ET crée les tables SQL manquantes ?
    options:
      - "vendor/bin/typo3 cache:flush"
      - "vendor/bin/typo3 extension:activate"
      - "vendor/bin/typo3 extension:setup"
      - "php artisan migrate"
    answer: 2
    tags: [composer-mode, extensions]
    level: debutant
    explanation: >
      `vendor/bin/typo3 extension:setup` est la commande complète depuis TYPO3 10 : elle
      active l'extension ET exécute `database:updateschema` pour créer/modifier les tables.
      `cache:flush` vide les caches mais n'active pas les extensions. `extension:activate`
      seul n'exécute pas le schéma BDD. `php artisan migrate` est une commande Laravel,
      pas TYPO3.
  - prompt: |
      Dans `config/system/additional.php`, comment tester si le contexte courant est
      `Development` pour activer le débogage ?
    options:
      - "if (getenv('TYPO3_CONTEXT') === 'Development')"
      - "if (\\TYPO3\\CMS\\Core\\Core\\Environment::getContext()->isDevelopment())"
      - "if (defined('TYPO3_MODE') && TYPO3_MODE === 'Development')"
      - "if ($_ENV['APP_ENV'] === 'dev')"
    answer: 1
    tags: [configuration, context, environment]
    level: intermediaire
    explanation: >
      L'API officielle TYPO3 est `Environment::getContext()->isDevelopment()`. Bien que
      `getenv('TYPO3_CONTEXT') === 'Development'` puisse fonctionner, elle est fragile
      (casse, sous-contextes non pris en compte). `TYPO3_MODE` est une constante legacy
      dépréciée. `APP_ENV` est une variable Symfony, pas TYPO3.
  - prompt: |
      Quel fichier de configuration TYPO3 est généré automatiquement par l'Install Tool
      et ne doit JAMAIS être commité dans Git ?
    options:
      - "config/system/additional.php"
      - "config/sites/*/config.yaml"
      - "config/system/settings.php (ex-LocalConfiguration.php)"
      - ".env"
    answer: 2
    tags: [configuration, security]
    level: debutant
    explanation: >
      `config/system/settings.php` (ou `public/typo3conf/LocalConfiguration.php` selon
      la version) est généré par l'Install Tool et contient l'`encryptionKey` et les
      credentials BDD. Le committer expose ces secrets. `additional.php` est un override
      manuel versionnable. `config.yaml` des sites est versionné. `.env` ne doit pas
      être commité non plus, mais la question porte sur le fichier généré par l'Install Tool.
---

Vérifie ta compréhension de l'installation avant de créer ton SitePackage.
