---
title: "Quiz — Montées de version & pièges"
type: quiz
questions:
  - prompt: |
      Un projet Drupal 9 est en fin de support (EOL novembre 2023). Tu dois le reprendre
      et le faire monter. Vers quelle version vise-t-on directement ?
    options:
      - "Drupal 9.5 LTS (dernière version stable de D9)"
      - "Drupal 11 directement, car D9 est EOL et D10 arrive à fin de support en 2026"
      - "Drupal 10, puis Drupal 11 dans un second temps"
      - "Il vaut mieux rester sur D9 et attendre que tous les modules aient une version D11"
    answer: 1
    tags: [upgrade, versioning, eol]
    level: intermediaire
    explanation: >
      D9 est EOL depuis novembre 2023 — aucun correctif de sécurité. D10 arrive à fin
      de support début 2026. Viser D11 directement (si les modules contrib le supportent)
      est la bonne stratégie pour ne pas enchaîner deux montées de version rapprochées.
      Rester sur D9 (option 4) est inacceptable pour un site en production.

  - prompt: |
      Avant une montée D10 → D11, quelle action est la plus importante pour le code custom ?
    options:
      - "Sauvegarder la base de données"
      - "Scanner et corriger les usages deprecated dans les modules custom avec phpstan-drupal ou Drupal Rector"
      - "Mettre à jour tous les modules contrib en premier"
      - "Vérifier que le thème est compatible D11"
    answer: 1
    tags: [upgrade, deprecated, rector]
    level: intermediaire
    explanation: >
      Corriger les deprecated dans le code custom est la priorité car c'est le code
      sur lequel on a la main. Lancer Rector ou PHPStan avant la montée permet d'identifier
      et corriger les incompatibilités D11. La sauvegarde (option 1) est une précaution,
      pas une action préparatoire. Les modules contrib (option 3) se mettent à jour avec
      Composer une fois le core mis à jour.

  - prompt: |
      Lors d'un audit de reprise, `git ls-files web/modules/contrib/` retourne des
      centaines de fichiers. Quelle est la conséquence principale ?
    options:
      - "Aucune conséquence : versionner les modules contrib est une bonne pratique de sécurité"
      - "Les modules contrib ne peuvent plus être mis à jour proprement via Composer sans risquer des conflits Git"
      - "Drupal ne peut pas démarrer si les modules contrib sont dans Git"
      - "Il faut réinstaller Composer pour résoudre le conflit"
    answer: 1
    tags: [composer, git, best-practices]
    level: debutant
    explanation: >
      Versionner les modules contrib dans Git crée un conflit entre le gestionnaire
      de versions (Git) et le gestionnaire de dépendances (Composer). Toute mise à
      jour via `composer update` génère des conflits Git si les fichiers sont trackés.
      Drupal peut démarrer malgré ça, mais le workflow de maintenance est cassé.

  - prompt: |
      Comment activer le mode debug Twig en développement local sans modifier le
      settings.php principal ?
    options:
      - "Modifier web/core/lib/Drupal/Core/Template/TwigExtension.php directement"
      - "Créer un settings.local.php avec twig_debug = TRUE, inclus conditionnellement depuis settings.php"
      - "Ajouter une entrée dans services.yml pour activer le debug Twig"
      - "Twig debug s'active automatiquement quand APP_ENV=dev est défini"
    answer: 1
    tags: [twig, debug, dev-environment]
    level: debutant
    explanation: >
      Le settings.local.php est le mécanisme standard Drupal pour les overrides de
      développement — il n'est jamais commité (dans .gitignore). On y place
      $settings['twig_debug'] = TRUE, le cache null backend, etc. settings.php inclut
      ce fichier s'il existe. Ne jamais modifier le core (option 1).
---
