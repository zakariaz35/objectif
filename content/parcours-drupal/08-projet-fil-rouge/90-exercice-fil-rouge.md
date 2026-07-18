---
title: "Exercice fil rouge — Déploiement complet et checklist de reprise"
type: exercise
---

## Énoncé

### Partie A — Script de déploiement

Écris un **Makefile** complet pour le projet vitrine d'agence (Drupal 10, stack Docker
avec un conteneur PHP nommé `php`). Le Makefile doit exposer les cibles suivantes :

1. `make install` — installation complète depuis zéro (composer install, drush si, import de config)
2. `make deploy` — séquence de déploiement (composer install + cim + updb + cr)
3. `make drush CMD="…"` — exécuter n'importe quelle commande Drush dans le container
4. `make dev` — activer le mode développement (cache null, Twig debug)

### Partie B — Checklist de reprise

Liste les **8 premières commandes** que tu lances en reprenant un projet Drupal
existant en agence, avec une courte explication de ce que chaque commande révèle.

<!--correction-->

## Correction

### Partie A — Makefile

```makefile
# Makefile — Drupal 10 agency project
# Usage: make <target> [CMD="..."]

PHP_CONTAINER = php
DRUSH = docker compose exec $(PHP_CONTAINER) ./vendor/bin/drush
COMPOSER = docker compose exec $(PHP_CONTAINER) composer

.PHONY: install deploy drush dev

# Full installation from scratch
install:
	$(COMPOSER) install --no-interaction
	$(DRUSH) site:install --existing-config --yes
	$(DRUSH) cr

# Deployment sequence (CI/CD or manual)
deploy:
	$(COMPOSER) install --no-dev --optimize-autoloader --no-interaction
	$(DRUSH) cim --yes
	$(DRUSH) updb --yes
	$(DRUSH) cr

# Generic Drush command wrapper
drush:
	$(DRUSH) $(CMD)

# Enable development mode (never run on production)
dev:
	$(DRUSH) php:eval "\$$settings = \Drupal::service('settings'); \$$settings->set('twig_debug', TRUE);"
	$(DRUSH) config:set system.logging error_level verbose --yes
	$(DRUSH) cr
	@echo "Dev mode enabled. Add settings.local.php for persistent cache disabling."
```

### Partie B — 8 premières commandes en reprise de projet

```bash
# 1. General status: Drupal version, PHP, DB, files path
./vendor/bin/drush status
# Reveals: compatibility info, config sync directory, DB accessibility

# 2. Configuration divergence: DB vs YAML
./vendor/bin/drush config:status
# Reveals: config never exported (Only in DB), config modified in prod (Different)

# 3. Active non-core modules
./vendor/bin/drush pm:list --status=enabled --type=module --no-core
# Reveals: installed contrib modules, present custom modules

# 4. Contrib modules tracked in Git (bad practice)
git ls-files web/modules/contrib/ | wc -l
# Reveals: if = 0 → OK, if > 0 → Composer issue to fix

# 5. Core modified directly
git log --oneline -- web/core/ | head -5
# Reveals: unofficial patches on core to convert to composer-patches

# 6. Settings.php committed to Git
git ls-files web/sites/default/settings.php
# Reveals: credentials exposed in the repository

# 7. Recent errors in Drupal logs
./vendor/bin/drush watchdog:show --count=20 --severity=error
# Reveals: PHP errors, misconfigured modules, permission issues

# 8. Modules with pending security updates
composer outdated "drupal/*"
# Reveals: versions to update (some may be critical)
```

Ces 8 commandes donnent une image complète de la santé du projet avant de
commencer toute modification. Durée estimée : 10 minutes.
