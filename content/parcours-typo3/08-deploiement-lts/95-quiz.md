---
title: "Quiz — Déploiement & LTS"
type: quiz
questions:
  - prompt: |
      Un client te contacte en urgence : son site TYPO3 9.5 est en production depuis
      2019 et il vient de recevoir une alerte de sécurité. TYPO3 9 est EOL depuis
      septembre 2021. Quelle est la bonne stratégie de montée de version ?
    options:
      - "Sauter directement de TYPO3 9 à TYPO3 13 en une seule opération pour gagner du temps."
      - "Monter par paliers LTS : 9 → 10 → 11 → 12 (ou 12 → 13 si possible), en testant l'Upgrade Wizard et les extensions à chaque étape."
      - "Maintenir TYPO3 9 avec des patches de sécurité manuels sur les fichiers core."
      - "Réinstaller TYPO3 12 from scratch et ré-importer le contenu via export/import."
    answer: 1
    tags: [lts, upgrade, legacy]
    level: intermediaire
    explanation: >
      On ne saute jamais plusieurs LTS en une seule opération — les Upgrade Wizards sont
      conçus pour fonctionner étape par étape (chaque wizard suppose les données dans le
      format de la version précédente). Patcher manuellement le core est une impasse (les
      patchs sont remplacés à chaque update). Réinstaller from scratch est possible mais
      nécessite une migration de contenu risquée. La voie sûre : 9→10→11→12, en validant
      à chaque palier.
  - prompt: |
      Lors d'un déploiement avec Deployer, quel est l'avantage de déclarer
      `public/fileadmin` comme `shared_dir` ?
    options:
      - "Cela compresse automatiquement les images au déploiement."
      - "Cela garantit que les fichiers uploadés par les éditeurs persistent entre les releases et ne sont pas supprimés lors d'un rollback."
      - "Cela synchronise fileadmin entre la prod et le staging automatiquement."
      - "Cela exclut fileadmin du repository Git pour réduire sa taille."
    answer: 1
    tags: [deployer, deployment, fileadmin]
    level: debutant
    explanation: >
      Les `shared_dirs` Deployer sont des répertoires **partagés entre toutes les
      releases** via un symlink. `public/fileadmin` (fichiers uploadés) et
      `public/typo3temp` (images redimensionnées, caches générés) doivent persister
      indépendamment des déploiements — sinon les fichiers uploadés par les éditeurs
      disparaîtraient à chaque déploiement ou rollback.
  - prompt: |
      Quelle variable d'environnement TYPO3 doit être positionnée à `Production` sur
      le serveur de production, et quel comportement active-t-elle ?
    options:
      - "TYPO3_ENV=production — active le mode maintenance automatiquement."
      - "APP_ENV=prod — standard Symfony, TYPO3 lit la même variable."
      - "TYPO3_CONTEXT=Production — désactive le debug, active les caches stricts, désactive les outils de développement."
      - "TYPO3_MODE=production — change le comportement de l'Install Tool."
    answer: 2
    tags: [deployment, environment, context]
    level: debutant
    explanation: >
      `TYPO3_CONTEXT` est la variable TYPO3 native. En `Production`, TYPO3 désactive
      `displayErrors`, active tous les caches, masque les traces d'erreurs aux
      utilisateurs. En `Development`, le débogueur est actif, `no_cache` peut être
      positionné, les dépréciations sont loguées. Ne pas confondre avec `APP_ENV`
      (Symfony) — TYPO3 ne lit pas cette variable.
  - prompt: |
      Sur un projet TYPO3 repris, tu constates que le TypoScript est stocké
      directement dans le champ `config` de la table `sys_template` en BDD. Pourquoi
      est-ce problématique et que faire ?
    options:
      - "Ce n'est pas un problème : c'est le fonctionnement normal de TYPO3, le TypoScript a toujours été en BDD."
      - "Le TypoScript en BDD n'est pas versionné dans Git, difficile à relire, et disparaît si on recrée la BDD. Il faut l'exporter en fichiers .typoscript et l'inclure via @import."
      - "Il suffit d'activer une extension pour synchroniser la BDD et les fichiers Git."
      - "Le TypoScript en BDD est plus performant car il évite les lectures de fichiers."
    answer: 1
    tags: [typoscript, legacy, reprise]
    level: intermediaire
    explanation: >
      Le TypoScript stocké dans `sys_template.config` n'est pas dans Git — impossible
      à versionner, à revoir en code review, ni à déployer proprement. La bonne pratique
      depuis TYPO3 9 : mettre le TypoScript dans des fichiers `.typoscript` dans le
      SitePackage, et n'utiliser `sys_template` que pour les `@import` et l'inclusion
      statique. Sur une reprise, exporter le TS via le backend (Web > Template > Edit),
      le placer dans `Configuration/TypoScript/`, et l'inclure via `addStaticFile()`.
---

Quiz final — Déploiement et cycle de vie des projets TYPO3 en agence.
