---
title: "Routing et controllers : Symfony dans Drupal"
type: lesson
---

# Routing et controllers : Symfony dans Drupal

Le routeur Drupal est **le routeur Symfony** avec un registre de routes construit à
partir des fichiers `*.routing.yml` de chaque module.

## Déclarer une route

```yaml
# my_module/my_module.routing.yml

my_module.hello:
  path: '/hello/{name}'
  defaults:
    _controller: '\Drupal\my_module\Controller\HelloController::greet'
    _title: 'Hello'
  requirements:
    _permission: 'access content'
    name: '[a-zA-Z]+'
```

La structure est **identique** au routing Symfony YAML. Seul `requirements._permission`
est une extension Drupal (vérification d'une permission Drupal avant d'appeler le
controller).

## Écrire un controller

```php
// src/Controller/HelloController.php
namespace Drupal\my_module\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Response;

final class HelloController extends ControllerBase {

    public function greet(string $name): array {
        // Drupal controllers can return a render array (preferred)
        return [
            '#markup' => $this->t('Hello, @name!', ['@name' => $name]),
        ];
    }
}
```

`ControllerBase` est l'équivalent de `AbstractController` en Symfony. Il expose des
raccourcis (`$this->t()`, `$this->entityTypeManager()`, `$this->currentUser()`…).

## Render arrays : le concept clé

En Symfony, un controller retourne une `Response`. En Drupal, il peut retourner un
**render array** — une structure PHP qui sera rendue plus tard par le système de rendu
(avec gestion du cache, des assets CSS/JS, des tags de cache…).

```php
// Return a render array — Drupal converts it to a Response automatically
return [
    '#theme' => 'my_module_page',   // maps to a Twig template
    '#items' => $items,
    '#cache' => [
        'tags' => ['node_list'],    // cache invalidated when any node changes
        'contexts' => ['url'],      // separate cache entry per URL
        'max-age' => 3600,
    ],
];
```

> **Pont Symfony** — Pense au render array comme à un `ViewModel` structuré qui
> transporte à la fois les données **et** les métadonnées de cache. Retourner un render
> array laisse Drupal optimiser le cache de rendu automatiquement.

## Injection de dépendances dans un controller

```php
namespace Drupal\my_module\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class ArticleController extends ControllerBase {

    public function __construct(
        private readonly EntityTypeManagerInterface $entityTypeManager,
    ) {}

    public static function create(ContainerInterface $container): static {
        return new static(
            $container->get('entity_type.manager'),
        );
    }

    public function list(): array {
        $storage = $this->entityTypeManager->getStorage('node');
        $ids = $storage->getQuery()
            ->accessCheck(TRUE)
            ->condition('status', 1)
            ->condition('type', 'article')
            ->sort('created', 'DESC')
            ->range(0, 10)
            ->execute();

        $nodes = $storage->loadMultiple($ids);

        return [
            '#theme' => 'item_list',
            '#items' => array_map(
                fn ($node) => $node->getTitle(),
                $nodes
            ),
        ];
    }
}
```

Le pattern `create(ContainerInterface $container)` est la version Drupal de
l'autowiring Symfony. Il est **identique** pour tous les services qui ont besoin de
l'injection de dépendances (controllers, forms, plugins…).

## Accès et permissions

```yaml
# Route with role check
my_module.admin:
  path: '/admin/my-module'
  defaults:
    _controller: '\Drupal\my_module\Controller\AdminController::index'
  requirements:
    _role: 'administrator'

# Route with custom permission
my_module.report:
  path: '/my-module/report'
  defaults:
    _controller: '\Drupal\my_module\Controller\ReportController::view'
  requirements:
    _permission: 'view my_module report'
```

Les permissions custom se déclarent dans `my_module.permissions.yml` :

```yaml
# my_module/my_module.permissions.yml
view my_module report:
  title: 'View My Module report'
  description: 'Access the custom reporting page.'
```

> **À retenir** — La clé `requirements` dans le routing Drupal est à la fois la
> `requirements` Symfony (regex sur les paramètres) **et** le contrôle d'accès
> (`_permission`, `_role`, `_access`). Ne pas oublier `_permission: 'access content'`
> au minimum, sinon la route est publique sans restriction.
