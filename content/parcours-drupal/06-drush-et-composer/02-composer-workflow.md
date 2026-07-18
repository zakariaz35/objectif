---
title: "Workflow Composer pour Drupal"
type: lesson
---

# Workflow Composer pour Drupal

Drupal 10+ est entièrement géré par **Composer**. Le projet est initialisé depuis le
template officiel `drupal/recommended-project`, et tous les modules contrib, thèmes
et Drush sont des dépendances Composer. [source: drupal.org/docs/develop/using-composer]

## Structure du composer.json Drupal

```json
{
    "name": "client/my-project",
    "require": {
        "php": ">=8.2",
        "composer/installers": "^2.0",
        "drupal/core-composer-scaffold": "^10.3",
        "drupal/core-recommended": "^10.3",
        "drupal/admin_toolbar": "^3.4",
        "drupal/paragraphs": "^1.17",
        "drupal/pathauto": "^1.12",
        "drupal/metatag": "^2.0",
        "drush/drush": "^12"
    },
    "require-dev": {
        "drupal/devel": "^5.2",
        "drupal/stage_file_proxy": "^2.1",
        "phpunit/phpunit": "^10"
    },
    "extra": {
        "drupal-scaffold": {
            "locations": {
                "web-root": "web/"
            }
        },
        "installer-paths": {
            "web/core": ["type:drupal-core"],
            "web/modules/contrib/{$name}": ["type:drupal-module"],
            "web/themes/contrib/{$name}": ["type:drupal-theme"],
            "web/profiles/contrib/{$name}": ["type:drupal-profile"],
            "web/libraries/{$name}": ["type:drupal-library"],
            "drush/Commands/contrib/{$name}": ["type:drupal-drush"]
        }
    }
}
```

Les chemins d'installation (`installer-paths`) indiquent à Composer où placer chaque
type de paquet Drupal. C'est le plugin `composer/installers` qui gère ça.

## Commandes courantes en agence

```bash
# Add a contrib module
composer require drupal/ctools:^3.14

# Add a module for dev only
composer require --dev drupal/devel

# Update Drupal core (minor version)
composer update drupal/core-recommended drupal/core-composer-scaffold --with-all-dependencies

# Update a specific module
composer update drupal/paragraphs

# Check for outdated packages
composer outdated "drupal/*"

# Remove a module (disable in Drupal first!)
drush pm:uninstall old_module
composer remove drupal/old_module
```

## Gérer les patches

Pour corriger un bug Drupal core ou contrib sans modifier le code directement,
utilise `cweagans/composer-patches` :

```bash
composer require cweagans/composer-patches
```

```json
{
    "extra": {
        "patches": {
            "drupal/core": {
                "Fix critical bug #3456789": "https://www.drupal.org/files/issues/2024-01/3456789-fix.patch"
            },
            "drupal/paragraphs": {
                "Local fix for translation issue": "patches/paragraphs-translation-fix.patch"
            }
        },
        "composer-exit-on-patch-failure": true
    }
}
```

Les patches sont appliqués automatiquement lors de `composer install` ou
`composer update`. Documente **toujours** l'issue Drupal correspondante en commentaire.

## .gitignore Drupal

```gitignore
# Drupal — standard .gitignore for composer-managed project

# Drupal core and contrib (managed by Composer)
/web/core
/web/modules/contrib
/web/themes/contrib
/web/profiles/contrib
/web/libraries

# Vendor
/vendor

# Site configuration (per environment)
/web/sites/default/settings.local.php
/web/sites/default/settings.php
/web/sites/default/services.yml

# Uploaded files
/web/sites/default/files

# Build artifacts
/web/sites/simpletest

# Drush
/drush/Commands/contrib
```

> **Piège courant en reprise** — Trouver `web/modules/contrib/` commité dans Git.
> C'est le signe que le projet n'a pas été converti à Composer correctement.
> Les modules contrib ne doivent **jamais** être dans Git — ils sont gérés par
> `composer.lock`.

## composer.lock : la règle absolue

```bash
# Always commit composer.lock — it guarantees reproducible builds
git add composer.lock
git commit -m "Update paragraphs to 1.17"

# In CI/CD: always use --no-dev --optimize-autoloader
composer install --no-dev --optimize-autoloader

# Never run composer update in CI — only composer install
```

> **À retenir** — `composer.lock` est aussi important que `composer.json` dans un
> projet Drupal. Il garantit que tous les environnements (local, staging, prod) ont
> exactement les mêmes versions. En CI, toujours `composer install` (lit le lock),
> jamais `composer update` (peut changer les versions).
