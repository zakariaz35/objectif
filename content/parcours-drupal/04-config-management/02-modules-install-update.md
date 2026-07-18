---
title: "Installer, mettre à jour et désinstaller des modules"
type: lesson
---

# Installer, mettre à jour et désinstaller des modules

## Workflow Composer + Drush

En Drupal moderne, l'installation d'un module se fait en deux étapes séparées :

```bash
# Step 1: Download the module code via Composer
composer require drupal/views_bulk_operations

# Step 2: Enable the module in Drupal (adds it to core.extension.yml)
drush en views_bulk_operations

# Then export the new state of core.extension.yml
drush cex
git add config/sync/core.extension.yml
git commit -m "Enable views_bulk_operations"
```

Ces deux étapes sont **distinctes** et ne s'interchangent pas :
- Composer gère le code PHP (dans `vendor/` ou `web/modules/contrib/`)
- Drush gère l'état Drupal (activation, hooks d'installation, tables SQL)

## Désinstaller un module proprement

```bash
# Step 1: Disable in Drupal (runs hook_uninstall, removes tables/config)
drush pm:uninstall my_old_module

# Step 2: Remove from composer.json
composer remove drupal/my_old_module

# Export the updated configuration
drush cex
```

> **Piège** — Supprimer un module de `composer.json` sans le désinstaller d'abord
> laisse des tables orphelines et des erreurs fatales au prochain bootstrap.

## hook_install, hook_update_N et hook_uninstall

Ces trois hooks vivent dans le fichier `my_module.install` :

```php
// my_module/my_module.install

/**
 * Implements hook_install().
 *
 * Runs once when the module is first enabled.
 */
function my_module_install(): void {
    // Create default taxonomy terms, set permissions, create files…
    $storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');
    foreach (['Tech', 'Design', 'Business'] as $name) {
        $storage->create([
            'vid'  => 'article_category',
            'name' => $name,
        ])->save();
    }
}

/**
 * Implements hook_update_N().
 *
 * Runs when the module version is updated (like a Doctrine migration).
 * N must be unique and always increasing: 10001, 10002, ...
 */
function my_module_update_10001(array &$sandbox): void {
    // Add a new field to existing nodes programmatically
    \Drupal::service('entity_field.manager')->clearCachedFieldDefinitions();
    \Drupal::entityDefinitionUpdateManager()->applyPendingUpdates();
}

function my_module_update_10002(array &$sandbox): void {
    // Migrate data: copy field_old_title to field_seo_title
    $database = \Drupal::database();
    $database->update('node__field_seo_title')
        ->expression('field_seo_title_value', 'field_old_title_value')
        ->execute();
}

/**
 * Implements hook_uninstall().
 *
 * Runs when the module is disabled. Clean up custom data.
 */
function my_module_uninstall(): void {
    // Delete custom config created by this module
    \Drupal::configFactory()->getEditable('my_module.settings')->delete();
}
```

Pour appliquer les updates :

```bash
drush updatedb     # alias: drush updb
drush cr           # always rebuild cache after updates
```

> **Pont Symfony↔Drupal** — `hook_update_N()` est l'équivalent des migrations Doctrine.
> La numérotation suit la convention `{MAJOR}{MINOR}{PATCH}` — pour Drupal 10, commence
> à `10001`. **Ne jamais modifier** un `hook_update_N` déjà exécuté sur un serveur :
> Drupal enregistre les numéros exécutés et n'exécutera plus un numéro déjà vu.

## Configuration de module : le Config API

Pour stocker la configuration d'un module (paramètres, clés d'API…) :

```php
// Write module configuration (goes to config storage — exportable)
$config = \Drupal::service('config.factory')->getEditable('my_module.settings');
$config->set('api_key', 'abc123');
$config->set('items_per_page', 10);
$config->save();

// Read configuration
$settings = \Drupal::config('my_module.settings');
$api_key  = $settings->get('api_key');

// Provide default values in config/install/my_module.settings.yml
// (installed automatically when the module is enabled)
```

```yaml
# config/install/my_module.settings.yml — default configuration
api_key: ''
items_per_page: 10
enable_cache: true
```

Le fichier dans `config/install/` est installé lors de `drush en my_module` et devient
exportable via `drush cex`.

> **À retenir** — Le workflow de déploiement Drupal en agence est :
> `composer install` → `drush cim` → `drush updb` → `drush cr`.
> Dans cet ordre, sans exception. L'oublier (ex. faire `drush cr` avant `drush cim`)
> provoque des erreurs difficiles à debugger.
