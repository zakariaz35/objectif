---
title: "Quiz — Drush & Composer"
type: quiz
questions:
  - prompt: |
      Un développeur veut installer le module Drupal `drupal/token`. Quelle séquence
      est correcte ?
    options:
      - "drush en token (Drush télécharge automatiquement le code)"
      - "composer require drupal/token, puis drush en token, puis drush cex"
      - "Télécharger l'archive depuis drupal.org et décompresser dans web/modules/contrib/"
      - "drush pm:download token, puis drush en token"
    answer: 1
    tags: [composer, drush, modules]
    level: debutant
    explanation: >
      La bonne séquence Drupal 10 est : composer require (code) → drush en (activation
      Drupal) → drush cex (export de la nouvelle config core.extension.yml). `drush en`
      seul ne télécharge pas le code. `drush pm:download` est une commande Drush 8
      obsolète. Décompresser manuellement (option 3) contourne Composer et le lock file.

  - prompt: |
      Un développeur veut désinstaller un module qui n'est plus utilisé. Quelle est
      la bonne procédure ?
    options:
      - "Supprimer le dossier web/modules/contrib/old_module/ directement"
      - "drush pm:uninstall old_module, puis composer remove drupal/old_module, puis drush cex"
      - "composer remove drupal/old_module directement — Composer gère aussi la désactivation"
      - "Désactiver le module dans l'UI admin, puis supprimer le dossier"
    answer: 1
    tags: [composer, drush, modules]
    level: intermediaire
    explanation: >
      L'ordre est impératif : 1) drush pm:uninstall (exécute hook_uninstall, supprime
      tables et config) 2) composer remove (supprime le code) 3) drush cex (exporte
      core.extension.yml mis à jour). Faire composer remove avant uninstall laisse des
      données orphelines et peut provoquer des erreurs fatales. Supprimer le dossier
      directement est dangereux.

  - prompt: |
      Pourquoi doit-on commiter `composer.lock` dans Git ?
    options:
      - "Pour éviter que les autres développeurs aient à lancer composer install"
      - "Pour garantir que tous les environnements utilisent exactement les mêmes versions de toutes les dépendances"
      - "composer.lock contient les clés d'API nécessaires aux modules contrib"
      - "Sans composer.lock, Drupal refuse de démarrer"
    answer: 1
    tags: [composer, best-practices, deployment]
    level: debutant
    explanation: >
      Le composer.lock enregistre les versions exactes de toutes les dépendances
      résolues. Sans lui, `composer install` pourrait installer des versions différentes
      selon le moment d'exécution, rendant les environnements non-reproductibles. C'est
      la garantie de builds déterministes. Il ne contient pas de clés d'API.

  - prompt: |
      `drush config:status` affiche plusieurs entrées « Different » après un merge Git.
      Que signifie « Different » et que doit-on faire ?
    options:
      - "Le YAML est corrompu — il faut le supprimer et relancer drush cex"
      - "La config en base de données et les fichiers YAML ne sont pas synchronisés : lancer drush cim pour appliquer les fichiers YAML"
      - "Different signifie que le module n'est pas installé — lancer drush en"
      - "La base de données est plus récente que le YAML : lancer drush cex pour mettre à jour les fichiers"
    answer: 1
    tags: [config-management, drush, deployment]
    level: intermediaire
    explanation: >
      « Different » signifie qu'il y a une divergence entre la config active en base
      et les fichiers YAML. Après un merge Git qui ramène des changements de config,
      la bonne action est `drush cim` — les fichiers YAML font référence (c'est la
      source de vérité versionnée). Faire drush cex dans ce cas écraserait les
      changements du collègue avec ta propre config.
---
