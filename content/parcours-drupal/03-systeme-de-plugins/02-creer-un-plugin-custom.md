---
title: "Créer un plugin custom : QueueWorker et FieldFormatter"
type: lesson
---

# Créer un plugin custom : QueueWorker et FieldFormatter

Deux exemples concrets fréquents en missions d'agence : traitement asynchrone d'une
file d'attente et affichage personnalisé d'un champ.

## Exemple 1 — QueueWorker (traitement asynchrone)

Cas : envoyer un email de notification lors de la publication d'un nœud, sans bloquer
la requête HTTP.

### 1. Ajouter à la file lors de la publication

```php
// my_module/my_module.module

/**
 * Implements hook_node_insert().
 */
function my_module_node_insert(\Drupal\node\NodeInterface $node): void {
    if ($node->bundle() === 'article' && $node->isPublished()) {
        /** @var \Drupal\Core\Queue\QueueFactory $queue_factory */
        $queue_factory = \Drupal::service('queue');
        $queue = $queue_factory->get('my_module_notification');
        $queue->createItem([
            'node_id' => $node->id(),
            'title'   => $node->getTitle(),
        ]);
    }
}
```

### 2. Déclarer le QueueWorker plugin

```php
// src/Plugin/QueueWorker/NotificationWorker.php
namespace Drupal\my_module\Plugin\QueueWorker;

use Drupal\Core\Queue\Attribute\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\Core\StringTranslation\TranslatableMarkup;

#[QueueWorker(
    id: 'my_module_notification',
    title: new TranslatableMarkup('Article notification'),
    cron: ['time' => 60],   // max 60 seconds per cron run
)]
final class NotificationWorker extends QueueWorkerBase {

    /**
     * {@inheritdoc}
     */
    public function processItem(mixed $data): void {
        // Send email notification for the published article
        $mailManager = \Drupal::service('plugin.manager.mail');
        $mailManager->mail(
            'my_module',
            'new_article',
            'editors@example.com',
            'en',
            ['node_id' => $data['node_id'], 'title' => $data['title']],
        );
    }
}
```

Drush traite la file :

```bash
drush queue:run my_module_notification
# Or trigger via cron
drush cron
```

## Exemple 2 — FieldFormatter custom

Cas : un champ `field_phone` (type `string`) doit être affiché comme un lien `tel:`.

```php
// src/Plugin/Field/FieldFormatter/TelLinkFormatter.php
namespace Drupal\my_module\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\Attribute\FieldFormatter;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;

#[FieldFormatter(
    id: 'my_module_tel_link',
    label: new TranslatableMarkup('Phone link (tel:)'),
    field_types: ['string'],
)]
final class TelLinkFormatter extends FormatterBase {

    /**
     * {@inheritdoc}
     */
    public function viewElements(FieldItemListInterface $items, string $langcode): array {
        $elements = [];

        foreach ($items as $delta => $item) {
            $phone = preg_replace('/\s+/', '', $item->value); // remove spaces
            $elements[$delta] = [
                '#type'  => 'link',
                '#title' => $item->value,
                '#url'   => \Drupal\Core\Url::fromUri('tel:' . $phone),
            ];
        }

        return $elements;
    }
}
```

Après avoir activé le module, le formatter apparaît dans « Gérer l'affichage » pour
tous les champs de type `string`.

## Créer son propre type de plugin

Pour des cas avancés (plusieurs implémentations interchangeables d'un même concept
métier), tu peux créer un nouveau type de plugin :

```php
// src/Annotation/MyPlugin.php — Annotation definition (legacy approach)
// In Drupal 10.2+, prefer PHP attributes

// src/MyPluginInterface.php
namespace Drupal\my_module;

interface MyPluginInterface {
    public function process(array $data): array;
}

// src/MyPluginBase.php
namespace Drupal\my_module;

use Drupal\Core\Plugin\PluginBase;

abstract class MyPluginBase extends PluginBase implements MyPluginInterface {
    // Shared logic for all implementations
}

// src/MyPluginManager.php
namespace Drupal\my_module;

use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Plugin\DefaultPluginManager;

final class MyPluginManager extends DefaultPluginManager {

    public function __construct(
        \Traversable $namespaces,
        CacheBackendInterface $cache_backend,
        ModuleHandlerInterface $module_handler,
    ) {
        parent::__construct(
            'Plugin/MyPlugin',        // subdirectory to scan
            $namespaces,
            $module_handler,
            MyPluginInterface::class, // interface all plugins must implement
            MyPlugin::class,          // annotation/attribute class
        );
        $this->setCacheBackend($cache_backend, 'my_module_plugins');
    }
}
```

```yaml
# my_module.services.yml
services:
  plugin.manager.my_module:
    class: Drupal\my_module\MyPluginManager
    arguments:
      - '@container.namespaces'
      - '@cache.discovery'
      - '@module_handler'
```

> **À retenir** — La convention `Plugin/<TypeDuPlugin>/` + attribut PHP 8 (ou
> annotation) + `DefaultPluginManager` est le contrat standard. Pour les projets
> Drupal 10.2+, préfère les **attributs PHP 8** aux annotations Doctrine (dépréciées).
> En reprise de projet, tu rencontreras quasi-systématiquement les deux.
