---
title: "Drush : le couteau suisse du développeur Drupal"
type: lesson
---

# Drush : le couteau suisse du développeur Drupal

**Drush** (Drupal Shell) est l'équivalent de `bin/console` Symfony + `artisan` Laravel
pour Drupal. Il permet de tout piloter en ligne de commande : cache, configuration,
utilisateurs, mises à jour, base de données, génération de code…

[source: drush.us / drupal.org]

## Installation (Drush 12 avec Drupal 10/11)

```bash
# Drush 12 is installed per-project via Composer (never globally)
composer require drush/drush:^12

# Run via vendor/bin/drush or via an alias
./vendor/bin/drush status
```

> **Règle** — Ne jamais installer Drush globalement (`drush/drush` en global Composer).
> Chaque projet a sa version de Drush dans `vendor/`. Utilise un alias shell si
> nécessaire : `alias drush='./vendor/bin/drush'`.

## Commandes essentielles — aide-mémoire

### Cache

```bash
drush cache:rebuild          # alias: drush cr
# Clears ALL caches — always run after config changes
```

### Configuration

```bash
drush config:export          # alias: drush cex — export DB config → YAML files
drush config:import          # alias: drush cim — import YAML files → DB
drush config:status          # diff between DB and YAML files
drush config:get system.site # read a specific config key
drush config:set system.site name "My Site"  # write a config key
```

### Modules et thèmes

```bash
drush pm:enable my_module    # alias: drush en — enable module
drush pm:uninstall my_module # disable + uninstall (removes tables/config)
drush pm:list                # list all modules with status
drush pm:list --status=enabled --type=module --no-core
```

### Mises à jour

```bash
drush updatedb               # alias: drush updb — run pending hook_update_N
drush updatedb:status        # list pending updates
```

### Entités et contenu

```bash
drush entity:delete node 42  # delete a node by ID
drush entity:updates         # apply pending entity schema updates
```

### Utilisateurs

```bash
drush user:create johndoe --mail="john@example.com" --password="secret"
drush user:role:add editor johndoe
drush user:login              # generate a one-time login link (useful in dev)
drush user:password johndoe "newpassword"
```

### Base de données

```bash
drush sql:dump > backup.sql        # export database
drush sql:cli < backup.sql         # import database
drush sql:query "SELECT nid, title FROM node_field_data LIMIT 5"
```

### Cron et queues

```bash
drush cron                         # trigger cron
drush queue:list                   # list all queues with item count
drush queue:run my_module_notify   # process a specific queue
```

### Debugging et inspection

```bash
drush status                       # overall Drupal status
drush core:requirements            # check requirements (PHP version, extensions…)
drush php:eval "echo \Drupal::VERSION;"   # eval PHP in Drupal context
drush php:script my_script.php     # run a PHP script in Drupal context
drush watchdog:show                # alias: drush ws — recent watchdog log entries
drush watchdog:show --count=50 --severity=error
```

## Génération de code avec Drush

Drush 12 intègre des générateurs pour accélérer la création de modules :

```bash
# Generate a new module skeleton
drush generate module

# Generate a controller
drush generate controller

# Generate a block plugin
drush generate block

# Generate a service
drush generate service

# Generate a form
drush generate form:config

# List all available generators
drush generate
```

> **En agence** — `drush generate module` crée automatiquement le `.info.yml`,
> le `composer.json` local, un `.module` vide et la structure `src/`. Gain de temps
> significatif sur chaque nouveau mini-module.

## Utiliser Drush en Docker

Dans un setup Docker typique d'agence :

```bash
# Execute drush inside the PHP container
docker compose exec php ./vendor/bin/drush status
docker compose exec php ./vendor/bin/drush cim --yes
docker compose exec php ./vendor/bin/drush cr

# Or use a Makefile target
make drush CMD="cim --yes"
```

```makefile
# Makefile
DRUSH = docker compose exec php ./vendor/bin/drush

drush:
	$(DRUSH) $(CMD)

deploy:
	$(DRUSH) cim --yes
	$(DRUSH) updb --yes
	$(DRUSH) cr
```

> **À retenir** — Le trio `drush cim && drush updb && drush cr` est le **déploiement
> Drupal minimum**. Automatise-le dans un Makefile ou un script CI dès le démarrage
> du projet — jamais à la main en prod.
