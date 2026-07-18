---
title: "Pièges courants en reprise de projet d'agence"
type: lesson
---

# Pièges courants en reprise de projet d'agence

La reprise d'un projet Drupal existant en agence révèle régulièrement les mêmes
anti-patterns. Ce guide recense les 10 pièges les plus fréquents et comment les
adresser méthodiquement.

## Piège 1 : Fichiers core/ modifiés

**Symptôme** : `git diff vendor/ web/core/` montre des modifications.

**Impact** : impossible de mettre à jour le core sans perdre les correctifs.

```bash
# Detect core modifications
git log --oneline -- web/core/
git diff HEAD~20 -- web/core/

# Solution: convert to Composer patches
composer require cweagans/composer-patches

# Find the corresponding Drupal.org issue and use the official patch
# Document in composer.json patches section
```

## Piège 2 : Configuration jamais exportée

**Symptôme** : `drush config:status` montre des dizaines de « Only in DB ».

**Impact** : impossible de reproduire le site sur un autre environnement.

```bash
# Establish a baseline
drush config:export
git add config/sync/
git commit -m "chore: establish config baseline (never exported before)"

# Going forward: always drush cex before committing
```

## Piège 3 : Modules contrib dans Git

**Symptôme** : `web/modules/contrib/` est suivi par Git.

**Impact** : conflits, repo surchargé, mises à jour impossibles proprement.

```bash
# Check if contrib is tracked
git ls-files web/modules/contrib/ | head -20

# Solution: remove from tracking, add to .gitignore, use composer.lock
git rm -r --cached web/modules/contrib/
echo "/web/modules/contrib" >> .gitignore
git add .gitignore
git commit -m "chore: stop tracking contrib modules — use Composer"

# Make sure all modules are in composer.json
composer require drupal/$(ls web/modules/contrib/ | tr '\n' ' ')
```

## Piège 4 : Settings.php en clair dans Git

**Symptôme** : `web/sites/default/settings.php` est dans le dépôt avec les
credentials de base de données.

**Impact** : fuite de credentials, impossible à partager entre envs.

```bash
# Remove from Git
git rm --cached web/sites/default/settings.php
echo "/web/sites/default/settings.php" >> .gitignore

# Create a settings.php template without credentials
# Use environment variables for sensitive values
```

```php
// web/sites/default/settings.php (template, committed)
$databases['default']['default'] = [
    'driver'   => 'mysql',
    'database' => getenv('DB_NAME'),
    'username' => getenv('DB_USER'),
    'password' => getenv('DB_PASS'),
    'host'     => getenv('DB_HOST') ?: '127.0.0.1',
    'port'     => (int) (getenv('DB_PORT') ?: 3306),
    'prefix'   => '',
];

$settings['hash_salt'] = getenv('DRUPAL_HASH_SALT') ?: 'CHANGE_ME_IN_ENV';
$settings['config_sync_directory'] = '../config/sync';
```

## Piège 5 : `drush_make` / profils d'installation obsolètes

**Symptôme** : présence d'un fichier `build.make` ou d'un dossier `profiles/`.

**Impact** : workflow de build Drupal 7 incompatible avec Composer.

```bash
# Convert make file to composer.json dependencies
# Use drush make:convert (available in older Drush versions)
# Or manually map each project: line to a composer require drupal/...
```

## Piège 6 : Modules custom dans le dossier contrib

**Symptôme** : du code custom dans `web/modules/contrib/` ou `web/modules/` sans
sous-dossier `custom/`.

**Impact** : risque d'écrasement lors d'un `composer update`, confusion.

```bash
# Move to the correct location
mv web/modules/old_custom_place/my_module web/modules/custom/my_module
# Update any hardcoded paths
```

## Piège 7 : Permissions UNIX incorrectes

**Symptôme** : pages blanches, erreurs 500, impossible d'uploader des fichiers.

**Règles Drupal** :
- `web/sites/default/settings.php` : `444` (lecture seule)
- `web/sites/default/files/` : `755` (écriture pour le serveur web)
- `web/core/` et `web/modules/` : `555` (pas d'écriture)

```bash
# Fix permissions
chmod 444 web/sites/default/settings.php
chmod -R 755 web/sites/default/files/
find web/ -type d -not -path "*/files/*" -exec chmod 755 {} \;
find web/ -type f -not -path "*/files/*" -exec chmod 644 {} \;
```

## Piège 8 : Cache agressif non désactivé en dev

**Symptôme** : les modifications Twig ou CSS ne s'affichent pas sans `drush cr`.

```php
// web/sites/default/settings.local.php (dev only, NOT in Git)
$settings['cache']['bins']['render'] = 'cache.backend.null';
$settings['cache']['bins']['dynamic_page_cache'] = 'cache.backend.null';
$settings['cache']['bins']['page'] = 'cache.backend.null';

// Enable Twig debug mode
$settings['twig_debug'] = TRUE;
$settings['twig_auto_reload'] = TRUE;
$settings['twig_cache'] = FALSE;
```

```php
// web/sites/default/settings.php — include local settings if present
if (file_exists(__DIR__ . '/settings.local.php')) {
    include __DIR__ . '/settings.local.php';
}
```

## Piège 9 : PHP fatal après mise à jour partielle

**Symptôme** : écran blanc / erreur 500 après `composer update`.

**Cause** : `drush cr` ou `drush updb` n'ont pas été exécutés.

```bash
# Always run the full deployment sequence
composer install
drush cim --yes
drush updb --yes
drush cr

# If the site is completely broken (can't bootstrap Drupal)
php web/update.php  # access via browser at /update.php
```

## Piège 10 : Données sensibles en config exportée

**Symptôme** : clés API, mots de passe dans les fichiers YAML de `config/sync/`.

```bash
# Search for potential leaks in config files
grep -r "password\|api_key\|secret\|token" config/sync/ --include="*.yml"

# Solution: use settings.php override for sensitive values
# $config['module.settings']['api_key'] = getenv('API_KEY');
# This override is never exported by drush cex
```

## Checklist de reprise de projet

```
[ ] drush status — versions PHP, Drupal, DB
[ ] drush config:status — état de la configuration
[ ] git ls-files web/core/ — vérifier si core est modifié
[ ] git ls-files web/modules/contrib/ — vérifier si contrib est dans Git
[ ] git ls-files web/sites/default/settings.php — vérifier les credentials
[ ] composer outdated "drupal/*" — modules à mettre à jour
[ ] drush pm:list --status=enabled — modules actifs
[ ] drush watchdog:show --severity=error — erreurs récentes
[ ] Vérifier .gitignore — fichiers sensibles exclus
[ ] Vérifier la présence d'un config/sync/ et de fichiers exportés
```

> **À retenir** — La reprise d'un projet Drupal commence par un **audit de l'état du
> dépôt Git** avant toute modification. Les 10 pièges ci-dessus couvrent 90% des
> situations rencontrées en agence. La résolution se fait dans l'ordre : état Git
> propre → config baseline → Composer clean → déploiement automatisé.
