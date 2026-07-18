---
title: "Exercice — Module custom : bloc de dernières actualités"
type: exercise
---

## Énoncé

Tu dois créer un module custom `news_block` pour un site d'agence. Ce module expose
un **bloc** réutilisable qui affiche les **N dernières actualités** (nœuds de type
`article`, publiés), avec N configurable via l'interface admin du bloc.

### Exigences

1. Le module se déclare dans `news_block.info.yml` avec la dépendance `drupal:node`.
2. Le bloc est un plugin `Block` dans `src/Plugin/Block/LatestNewsBlock.php` avec :
   - `id: 'news_block_latest'`
   - Un paramètre de configuration `count` (entier, défaut : 5) exposé dans
     le formulaire de configuration du bloc (`blockForm` / `blockSubmit`).
   - L'injection de `EntityTypeManagerInterface` via `ContainerFactoryPluginInterface`.
   - La méthode `build()` qui retourne un render array `#theme: item_list` avec
     les titres des derniers articles publiés.
   - Des tags de cache `['node_list:article']`.
3. La méthode `build()` utilise `EntityQuery` avec `->accessCheck(TRUE)`.

### Structure attendue

```
web/modules/custom/news_block/
├─ news_block.info.yml
└─ src/Plugin/Block/LatestNewsBlock.php
```

Écris les deux fichiers complets.

<!--correction-->

## Correction

### news_block.info.yml

```yaml
# web/modules/custom/news_block/news_block.info.yml
name: 'News Block'
type: module
description: 'Provides a configurable block displaying latest articles.'
package: Custom
core_version_requirement: ^10 || ^11
dependencies:
  - drupal:node
```

### src/Plugin/Block/LatestNewsBlock.php

```php
<?php

declare(strict_types=1);

// src/Plugin/Block/LatestNewsBlock.php
namespace Drupal\news_block\Plugin\Block;

use Drupal\Core\Block\Attribute\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Symfony\Component\DependencyInjection\ContainerInterface;

#[Block(
    id: 'news_block_latest',
    admin_label: new TranslatableMarkup('Latest News'),
    category: new TranslatableMarkup('Custom'),
)]
final class LatestNewsBlock extends BlockBase implements ContainerFactoryPluginInterface {

    public function __construct(
        array $configuration,
        string $plugin_id,
        mixed $plugin_definition,
        private readonly EntityTypeManagerInterface $entityTypeManager,
    ) {
        parent::__construct($configuration, $plugin_id, $plugin_definition);
    }

    public static function create(
        ContainerInterface $container,
        array $configuration,
        string $plugin_id,
        mixed $plugin_definition,
    ): static {
        return new static(
            $configuration,
            $plugin_id,
            $plugin_definition,
            $container->get('entity_type.manager'),
        );
    }

    public function defaultConfiguration(): array {
        return ['count' => 5];
    }

    public function blockForm(array $form, FormStateInterface $form_state): array {
        $form = parent::blockForm($form, $form_state);

        $form['count'] = [
            '#type'          => 'number',
            '#title'         => $this->t('Number of articles to display'),
            '#default_value' => $this->configuration['count'],
            '#min'           => 1,
            '#max'           => 20,
        ];

        return $form;
    }

    public function blockSubmit(array $form, FormStateInterface $form_state): void {
        $this->configuration['count'] = (int) $form_state->getValue('count');
    }

    public function build(): array {
        $count = (int) ($this->configuration['count'] ?? 5);

        $ids = $this->entityTypeManager
            ->getStorage('node')
            ->getQuery()
            ->accessCheck(TRUE)
            ->condition('type', 'article')
            ->condition('status', 1)
            ->sort('created', 'DESC')
            ->range(0, $count)
            ->execute();

        $nodes = $this->entityTypeManager
            ->getStorage('node')
            ->loadMultiple($ids);

        $items = array_map(
            fn ($node) => $node->getTitle(),
            $nodes
        );

        return [
            '#theme' => 'item_list',
            '#title' => $this->t('Latest News'),
            '#items' => $items,
            '#cache' => [
                'tags'     => ['node_list:article'],
                'contexts' => ['user.permissions'],
            ],
        ];
    }
}
```

### Activation et test

```bash
drush en news_block
drush cr
# Then go to /admin/structure/block and place the "Latest News" block
```
