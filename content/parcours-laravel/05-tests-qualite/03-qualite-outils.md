---
title: "Outils qualité : Larastan, Pint, Artisan"
type: lesson
---

# Outils qualité : Larastan, Pint, Artisan

## L'équivalent de la chaîne qualité Symfony

| Symfony | Laravel |
|---|---|
| PHPStan / Psalm | **Larastan** (PHPStan + plugin Laravel) |
| PHP-CS-Fixer | **Laravel Pint** (PHP-CS-Fixer préconfiguré) |
| bin/console debug:container | php artisan about + route:list |
| bin/console debug:router | php artisan route:list |
| make:entity | php artisan make:model -mfsr |
| PHPUnit | php artisan test (Pest ou PHPUnit) |

## Laravel Pint : formatage zero-config

```bash
composer require laravel/pint --dev
./vendor/bin/pint           # formate tous les fichiers PHP
./vendor/bin/pint --test    # vérifie sans modifier (CI)
./vendor/bin/pint app/      # formate un dossier spécifique
```

Pint utilise PHP-CS-Fixer en interne avec les règles Laravel par défaut (PSR-12 +
quelques conventions Laravel). Aucune configuration requise pour commencer.

```json
// pint.json — surcharger des règles (optionnel)
{
    "preset": "laravel",
    "rules": {
        "simplified_null_return": true,
        "blank_line_before_statement": {
            "statements": ["return"]
        }
    }
}
```

## Larastan : analyse statique niveau 5+

```bash
composer require nunomaduro/larastan --dev
```

```neon
# phpstan.neon
includes:
    - vendor/nunomaduro/larastan/extension.neon

parameters:
    paths:
        - app
    level: 5           # 0 (permissif) → 9 (strict) — niveau 5 est un bon départ
    ignoreErrors:
        - '#Access to an undefined property#'
```

```bash
./vendor/bin/phpstan analyse
./vendor/bin/phpstan analyse --level=5
```

Larastan connaît les Facades, les modèles Eloquent, les helpers Laravel — contrairement
à PHPStan nu qui signalerait des centaines de faux positifs sur les appels magiques.

## Commandes Artisan de diagnostic

```bash
# Vue d'ensemble du projet (version, config, drivers)
php artisan about

# Liste toutes les routes (équivalent bin/console debug:router)
php artisan route:list
php artisan route:list --path=api     # filtre par préfixe
php artisan route:list --name=invoice # filtre par nom

# Vider les caches (équivalent bin/console cache:clear)
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear           # tout d'un coup

# Optimiser pour la prod (compile config, routes, autoload)
php artisan optimize                  # équivalent warmup Symfony

# Voir les bindings du container
php artisan tinker
>>> app('cache')       // résout le service 'cache'
>>> app()->make(\App\Services\PdfGenerator::class)
```

## Tinker : le REPL Laravel

```bash
php artisan tinker
```

```php
// Dans Tinker — exploration interactive (équivalent bin/console shell Symfony)
>>> Invoice::count()
=> 42

>>> Invoice::with('client')->where('status', 'pending')->first()
=> App\Models\Invoice { ... }

>>> User::factory()->create(['email' => 'test@example.com'])
=> App\Models\User { id: 5, email: "test@example.com", ... }

>>> app(\App\Services\PdfGenerator::class)
=> App\Services\PdfGenerator { ... }
```

## Workflow qualité recommandé pour une mission d'agence

```bash
# Avant chaque commit
./vendor/bin/pint                   # formatage
./vendor/bin/phpstan analyse        # analyse statique
php artisan test                    # suite de tests

# En CI (GitHub Actions / GitLab CI)
./vendor/bin/pint --test            # vérifier sans modifier
./vendor/bin/phpstan analyse --error-format=github
php artisan test --parallel         # parallèle = plus rapide
```

```yaml
# .github/workflows/ci.yml — pipeline type
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: '8.4' }
      - run: composer install --no-interaction
      - run: cp .env.example .env && php artisan key:generate
      - run: php artisan migrate --env=testing
      - run: ./vendor/bin/pint --test
      - run: ./vendor/bin/phpstan analyse
      - run: php artisan test --parallel
```

> **À retenir —** sur une mission d'agence, la combinaison Pint + Larastan niveau 5 +
> Pest couvre 90 % des besoins qualité sans configuration complexe. Montez à Larastan
> niveau 8+ progressivement sur les projets long terme.
