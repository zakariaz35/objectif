---
title: "Installer TYPO3 12.4 en Composer mode"
type: lesson
---

# Installer TYPO3 12.4 en Composer mode

TYPO3 12.4 est la version LTS courante (support jusqu'en **octobre 2026**). En contexte
agence, c'est la version que tu rencontreras sur les nouveaux projets et les reprises
récentes. Cette leçon couvre l'installation propre ; la leçon suivante traite le `.env`
et l'environment management.

## Prérequis

| Logiciel | Version minimale |
|---|---|
| PHP | 8.1 (8.2 recommandé) |
| MySQL/MariaDB | MySQL 8.0 ou MariaDB 10.4 |
| Composer | 2.x |
| Extensions PHP | `pdo_mysql`, `gd`, `intl`, `mbstring`, `xml`, `zip` |

## Créer le projet

```bash
# Create a new TYPO3 12.4 project via Composer
composer create-project typo3/cms-base-distribution:^12.4 my-project
cd my-project
```

Cela génère la structure de base avec un `composer.json` déjà configuré et le core
dans `vendor/`. [source: docs.typo3.org]

## Structure générée

```bash
my-project/
├─ composer.json
├─ composer.lock
├─ .env              # (à créer — voir leçon suivante)
├─ config/
│  └─ sites/         # vide au départ
├─ packages/         # tes extensions locales (à créer)
├─ public/
│  ├─ index.php
│  ├─ typo3/         # symlink → vendor/typo3/cms-backend/Resources/Public/...
│  └─ typo3conf/     # dossier legacy (AdditionalConfiguration.php…)
├─ var/
│  ├─ cache/
│  └─ log/
└─ vendor/
```

## Finaliser l'installation via l'Install Tool

Après avoir configuré le vhost (document root = `public/`) et la base de données, accède
à `https://ton-domaine/typo3/install.php`. L'assistant te guidera pour :

1. Tester la connexion BDD et créer les tables.
2. Choisir un preset de données (Introduction Package ou site vide — **toujours vide** en
   contexte agence).
3. Créer l'administrateur initial.
4. Définir le nom du site.

> **Repère —** supprime `public/typo3conf/ENABLE_INSTALL_TOOL` après l'installation
> initiale (ou utilise le backend Admin Tools > Maintenance pour le désactiver). Laisser
> ce fichier en production est une faille de sécurité. [source: docs.typo3.org]

## Ajouter des extensions via Composer

```bash
# Install the popular news extension (EXT:news)
composer require georgringer/news:^11.0

# Install a rendering helper
composer require b13/container:^2.0

# After adding extensions, flush the cache
vendor/bin/typo3 cache:flush
```

Puis dans le backend : Admin Tools > Extensions > activer les extensions nouvellement
installées (ou `vendor/bin/typo3 extension:setup`).

## Commandes CLI utiles

```bash
# Flush all caches (most used command)
vendor/bin/typo3 cache:flush

# Setup database (run migrations after adding extensions)
vendor/bin/typo3 extension:setup

# List active extensions
vendor/bin/typo3 extension:list

# Run the database schema updater (add missing columns/tables)
vendor/bin/typo3 database:updateschema

# List all available CLI commands
vendor/bin/typo3 list
```

> **Repère —** `vendor/bin/typo3 extension:setup` remplace l'ancienne combinaison
> `extension:activate` + `database:updateschema`. C'est la commande à lancer après
> chaque `composer require` ou `composer update` sur les extensions. [source: docs.typo3.org]

## À retenir

- `composer create-project typo3/cms-base-distribution:^12.4` est le point de départ
  standard pour tout nouveau projet TYPO3 12.
- Document root du vhost : `public/` uniquement.
- Supprimer `ENABLE_INSTALL_TOOL` après installation.
- Après chaque `composer require` d'extension : `vendor/bin/typo3 extension:setup` puis
  `vendor/bin/typo3 cache:flush`.
