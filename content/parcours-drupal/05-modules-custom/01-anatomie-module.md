---
title: "Anatomie d'un module Drupal"
type: lesson
---

# Anatomie d'un module Drupal

Un module Drupal est l'équivalent d'un **Bundle Symfony** — mais plus léger et
sans la complexité du `registerBundles()`. La structure minimale est un dossier
dans `web/modules/custom/` avec deux fichiers.

## Structure minimale

```
web/modules/custom/my_module/
├─ my_module.info.yml        # module declaration (required)
├─ my_module.module          # procedural hooks (optional)
├─ my_module.routing.yml     # routes HTTP (optionnel)
├─ my_module.services.yml    # services DI (optionnel)
├─ my_module.permissions.yml # permissions (optionnel)
├─ my_module.links.menu.yml  # menu entries (optional)
├─ my_module.install         # hook_install/update/uninstall (optionnel)
└─ src/
   ├─ Controller/
   ├─ Form/
   ├─ Plugin/
   │  ├─ Block/
   │  └─ Field/
   ├─ EventSubscriber/
   └─ Entity/
```

## Le fichier .info.yml

```yaml
# my_module/my_module.info.yml
name: 'My Custom Module'
type: module
description: 'Business logic for the client project.'
package: Custom
core_version_requirement: ^10 || ^11
dependencies:
  - drupal:node
  - drupal:taxonomy
  - drupal:views
  - paragraphs:paragraphs
```

- `core_version_requirement` : contrainte Composer-like sur la version Drupal
- `dependencies` : modules requis, format `{provider}:{module_machine_name}`

## Activation et commandes Drush essentielles

```bash
# Activer le module après création des fichiers
drush en my_module

# Vider le cache (redécouvre les plugins, routes, services)
drush cr

# Vérifier que le module est bien activé
drush pm:list --status=enabled | grep my_module

# Désactiver un module (ne supprime pas les données)
drush pmu my_module

# Supprimer la configuration d'un module (après pmu)
drush config:delete my_module.settings
```

## Le fichier .module

Contient uniquement les hooks procéduraux. Garde-le **le plus léger possible** —
délègue la logique à des services ou des EventSubscribers injectables.

```php
// my_module/my_module.module
<?php

declare(strict_types=1);

use Drupal\Core\Form\FormStateInterface;
use Drupal\node\NodeInterface;

/**
 * Implements hook_form_FORM_ID_alter().
 *
 * Customize the node article edit form.
 */
function my_module_form_node_article_edit_form_alter(
    array &$form,
    FormStateInterface $form_state,
    string $form_id
): void {
    // Add a custom validation callback
    $form['#validate'][] = 'my_module_article_validate';

    // Hide the author field for non-admin users
    if (!\Drupal::currentUser()->hasPermission('administer nodes')) {
        $form['uid']['#access'] = FALSE;
    }
}

/**
 * Custom form validation for article nodes.
 */
function my_module_article_validate(array &$form, FormStateInterface $form_state): void {
    $title = $form_state->getValue('title')[0]['value'] ?? '';
    if (mb_strlen($title) < 10) {
        $form_state->setErrorByName(
            'title',
            t('The title must be at least 10 characters long.')
        );
    }
}

/**
 * Implements hook_theme().
 *
 * Declare custom Twig templates.
 */
function my_module_theme(): array {
    return [
        'my_module_card' => [
            'variables' => [
                'title'   => NULL,
                'excerpt' => NULL,
                'url'     => NULL,
                'image'   => NULL,
            ],
        ],
    ];
}
```

## Exemple concret d'agence : module de listing actualités avec hook_views_data

Un cas typique en agence : exposer des données custom à Views pour que le client
les configure lui-même via l'UI Drupal.

```php
// my_news/my_news.module
<?php

declare(strict_types=1);

/**
 * Implements hook_views_data_alter().
 *
 * Expose a custom "reading time" pseudo-field to Views.
 */
function my_news_views_data_alter(array &$data): void {
    $data['node_field_data']['reading_time'] = [
        'title'  => t('Reading time (minutes)'),
        'help'   => t('Estimated reading time computed from body length.'),
        'field'  => [
            'id'      => 'standard',
            'handler' => 'Drupal\\views\\Plugin\\views\\field\\NumericField',
        ],
    ];
}

/**
 * Implements hook_node_presave().
 *
 * Compute reading time before saving a news node.
 */
function my_news_node_presave(\Drupal\node\NodeInterface $node): void {
    if ($node->getType() !== 'news') {
        return;
    }

    $body = $node->get('body')->value ?? '';
    $word_count = str_word_count(strip_tags($body));
    // Average reading speed: 200 words per minute
    $reading_time = (int) ceil($word_count / 200);
    $node->set('field_reading_time', $reading_time);
}

/**
 * Implements hook_preprocess_node().
 *
 * Add computed variables to news node templates.
 */
function my_news_preprocess_node(array &$variables): void {
    /** @var \Drupal\node\NodeInterface $node */
    $node = $variables['node'];

    if ($node->getType() !== 'news') {
        return;
    }

    $variables['reading_time'] = $node->get('field_reading_time')->value;
    $variables['author_name']  = $node->getOwner()->getDisplayName();
}
```

Ce module illustre trois hooks différents pour trois moments du cycle de vie :
- `hook_views_data_alter` : configuration de Views (appelé rarement, mis en cache)
- `hook_node_presave` : logique avant sauvegarde (appelé à chaque save)
- `hook_preprocess_node` : préparation du template Twig (appelé à chaque rendu)

## Les menus et liens d'administration

```yaml
# my_module/my_module.links.menu.yml
my_module.admin:
  title: 'My Module Settings'
  route_name: my_module.settings
  parent: system.admin_config_content
  weight: 10
```

```yaml
# my_module/my_module.links.task.yml  — tabs on pages
my_module.settings_tab:
  title: 'Settings'
  route_name: my_module.settings
  base_route: my_module.settings
  weight: 0
```

## Formulaire de configuration (Form API)

```php
// src/Form/SettingsForm.php
namespace Drupal\my_module\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

final class SettingsForm extends ConfigFormBase {

    protected function getEditableConfigNames(): array {
        return ['my_module.settings'];
    }

    public function getFormId(): string {
        return 'my_module_settings_form';
    }

    public function buildForm(array $form, FormStateInterface $form_state): array {
        $config = $this->config('my_module.settings');

        $form['items_per_page'] = [
            '#type'          => 'number',
            '#title'         => $this->t('Items per page'),
            '#default_value' => $config->get('items_per_page') ?? 10,
            '#min'           => 1,
            '#max'           => 100,
        ];

        $form['api_endpoint'] = [
            '#type'          => 'url',
            '#title'         => $this->t('API endpoint'),
            '#default_value' => $config->get('api_endpoint'),
            '#required'      => TRUE,
        ];

        return parent::buildForm($form, $form_state);
    }

    public function submitForm(array &$form, FormStateInterface $form_state): void {
        $this->config('my_module.settings')
            ->set('items_per_page', $form_state->getValue('items_per_page'))
            ->set('api_endpoint', $form_state->getValue('api_endpoint'))
            ->save();

        parent::submitForm($form, $form_state);
    }
}
```

> **Pont Symfony** — `ConfigFormBase` est l'équivalent d'un `AbstractType` Symfony
> branché sur la configuration Drupal. La Form API de Drupal est un système déclaratif
> (tableaux PHP) différent des classes `FormType` Symfony — pense-y comme à un
> `FormBuilder` qui produit aussi le rendu.

## Hook update : gérer les mises à jour de schéma

L'équivalent Drupal des migrations Doctrine : les `hook_update_N` dans le fichier
`.install`. Ils sont exécutés par `drush updb` dans l'ordre numérique.

```php
// my_module/my_module.install

/**
 * Add index on field_published_at for performance.
 */
function my_module_update_10001(): void {
    $schema = \Drupal::database()->schema();
    if (!$schema->indexExists('node__field_published_at', 'field_published_at_value')) {
        $schema->addIndex(
            'node__field_published_at',
            'field_published_at_value',
            ['field_published_at_value'],
            ['fields' => ['field_published_at_value' => ['type' => 'varchar', 'length' => 20]]]
        );
    }
}

/**
 * Migrate legacy field_intro to field_summary on article nodes.
 */
function my_module_update_10002(array &$sandbox): string {
    // Batch processing for large datasets
    if (!isset($sandbox['total'])) {
        $sandbox['total'] = \Drupal::entityQuery('node')
            ->accessCheck(FALSE)
            ->condition('type', 'article')
            ->count()
            ->execute();
        $sandbox['current'] = 0;
    }

    $batch_size = 50;
    $ids = \Drupal::entityQuery('node')
        ->accessCheck(FALSE)
        ->condition('type', 'article')
        ->range($sandbox['current'], $batch_size)
        ->execute();

    foreach (\Drupal::entityTypeManager()->getStorage('node')->loadMultiple($ids) as $node) {
        if ($node->hasField('field_intro') && $node->hasField('field_summary')) {
            $node->set('field_summary', $node->get('field_intro')->value);
            $node->save();
        }
    }

    $sandbox['current'] += count($ids);
    $sandbox['#finished'] = $sandbox['total'] ? $sandbox['current'] / $sandbox['total'] : 1;

    return "Migrated {$sandbox['current']} of {$sandbox['total']} articles.";
}
```

```bash
# Voir quels update hooks sont en attente
drush updatedb:status

# Exécuter les update hooks
drush updb --yes

# Toujours suivre d'un cex pour capturer les éventuels changements de config
drush cex --yes
```

## ⚠️ Pièges agence sur les modules custom

**Hooks deprecated en D8/D9** : beaucoup de projets repris utilisent encore
`hook_entity_load()` ou `hook_menu()` (D7). En D10, `hook_menu()` n'existe plus —
c'est le routing YAML. Utilise PHPStan pour les détecter :

```bash
./vendor/bin/phpstan analyse web/modules/custom --level=deprecation
```

**`\Drupal::` dans les services** : les services injectés sont testables ; les appels
statiques `\Drupal::service()` ne le sont pas. En reprise de projet, chaque appel
statique dans une classe de service est une dette à rembourser.

**Modules contrib cassés après composer update** : toujours vérifier le statut
avant de pousser en production :

```bash
composer outdated "drupal/*"
drush pm:list --status=enabled | grep -i "incompatible\|error"
```

**Fichier `.install` oublié** : un champ ajouté via l'UI en dev doit être accompagné
d'un `hook_update_N` si le site de production a déjà des données dans ce type de
contenu. Sans update hook, `drush updb` ne fait rien et le nouveau champ n'existe
pas en prod (mais `drush cim` essaiera de l'attacher, ce qui provoque une erreur).

> **À retenir** — Un module bien structuré garde le fichier `.module` minimal (hooks
> procéduraux seulement). Toute logique métier va dans des services, controllers ou
> event subscribers — testables unitairement. Le fichier `.module` est le seul endroit
> où les hooks sont découverts.
