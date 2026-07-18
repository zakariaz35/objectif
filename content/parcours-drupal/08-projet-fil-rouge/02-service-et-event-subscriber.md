---
title: "Service métier et EventSubscriber dans le projet"
type: lesson
---

# Service métier et EventSubscriber dans le projet

Voici comment les concepts du parcours s'articulent dans le contexte du projet
vitrine d'agence — un service métier injectable + un EventSubscriber testable.

## ProjectService : logique métier injectable

```php
// src/Service/ProjectService.php
namespace Drupal\agency_core\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Psr\Log\LoggerInterface;

final class ProjectService {

    public function __construct(
        private readonly EntityTypeManagerInterface $entityTypeManager,
        private readonly LanguageManagerInterface $languageManager,
        private readonly LoggerInterface $logger,
    ) {}

    /**
     * Returns published projects for a given technology term.
     *
     * @param int $term_id  Taxonomy term ID for the technology
     * @param int $limit    Maximum number of projects to return
     * @return array        Array of loaded Node objects
     */
    public function getProjectsByTechnology(int $term_id, int $limit = 6): array {
        $storage = $this->entityTypeManager->getStorage('node');

        $ids = $storage->getQuery()
            ->accessCheck(TRUE)
            ->condition('type', 'project')
            ->condition('status', 1)
            ->condition('field_technologies', $term_id)
            ->sort('field_year', 'DESC')
            ->range(0, $limit)
            ->execute();

        if (empty($ids)) {
            return [];
        }

        return $storage->loadMultiple($ids);
    }

    /**
     * Returns the N most recent projects with a testimonial attached.
     */
    public function getFeaturedProjectsWithTestimonial(int $limit = 3): array {
        $storage = $this->entityTypeManager->getStorage('node');

        $ids = $storage->getQuery()
            ->accessCheck(TRUE)
            ->condition('type', 'project')
            ->condition('status', 1)
            ->exists('field_testimonial')
            ->sort('created', 'DESC')
            ->range(0, $limit)
            ->execute();

        return $storage->loadMultiple($ids);
    }

    /**
     * Computes project statistics for the agency homepage.
     */
    public function getAgencyStats(): array {
        $storage = $this->entityTypeManager->getStorage('node');

        $total = $storage->getQuery()
            ->accessCheck(FALSE)  // stats are public — no access check needed
            ->condition('type', 'project')
            ->condition('status', 1)
            ->count()
            ->execute();

        $this->logger->info(
            'Agency stats computed: @count projects.',
            ['@count' => $total]
        );

        return [
            'project_count' => (int) $total,
            'year_founded'  => 2010,
        ];
    }
}
```

```yaml
# agency_core/agency_core.services.yml
services:
  agency_core.project_service:
    class: Drupal\agency_core\Service\ProjectService
    arguments:
      - '@entity_type.manager'
      - '@language_manager'
      - '@logger.channel.agency_core'

  logger.channel.agency_core:
    parent: logger.channel_base
    arguments: ['agency_core']
```

## EventSubscriber : notification à la publication

```php
// src/EventSubscriber/ProjectPublishSubscriber.php
namespace Drupal\agency_core\EventSubscriber;

use Drupal\core_event_dispatcher\Event\Entity\EntityUpdateEvent;
use Drupal\core_event_dispatcher\CoreEvents;
use Drupal\node\NodeInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class ProjectPublishSubscriber implements EventSubscriberInterface {

    public function __construct(
        private readonly LoggerInterface $logger,
    ) {}

    public static function getSubscribedEvents(): array {
        return [
            CoreEvents::ENTITY_UPDATE => ['onEntityUpdate', 0],
        ];
    }

    public function onEntityUpdate(EntityUpdateEvent $event): void {
        $entity = $event->getEntity();

        if (!$entity instanceof NodeInterface || $entity->bundle() !== 'project') {
            return;
        }

        // Detect transition: unpublished → published
        $was_published = (bool) $entity->original->get('status')->value;
        $is_published  = $entity->isPublished();

        if (!$was_published && $is_published) {
            $this->logger->info(
                'Project @title just went live.',
                ['@title' => $entity->getTitle()]
            );

            // Trigger notification or webhook here
            $this->notifyTeam($entity->getTitle(), $entity->toUrl()->toString());
        }
    }

    private function notifyTeam(string $title, string $url): void {
        // Send Slack webhook, email, etc.
        // Kept simple here — use a queue for production reliability
        $this->logger->notice(
            'Team notified: new project live at @url',
            ['@url' => $url]
        );
    }
}
```

```yaml
# agency_core/agency_core.services.yml (append)
  agency_core.project_publish_subscriber:
    class: Drupal\agency_core\EventSubscriber\ProjectPublishSubscriber
    arguments:
      - '@logger.channel.agency_core'
    tags:
      - { name: event_subscriber }
```

## Utiliser le service dans un bloc

```php
// src/Plugin/Block/FeaturedProjectsBlock.php (excerpt)
use Drupal\agency_core\Service\ProjectService;

final class FeaturedProjectsBlock extends BlockBase implements ContainerFactoryPluginInterface {

    public function __construct(
        array $configuration,
        string $plugin_id,
        mixed $plugin_definition,
        private readonly ProjectService $projectService,
    ) {
        parent::__construct($configuration, $plugin_id, $plugin_definition);
    }

    public static function create(ContainerInterface $container, ...): static {
        return new static(
            $configuration, $plugin_id, $plugin_definition,
            $container->get('agency_core.project_service'),
        );
    }

    public function build(): array {
        $projects = $this->projectService->getFeaturedProjectsWithTestimonial(3);

        $items = array_map(fn ($node) => [
            '#theme'   => 'agency_core_project_card',
            '#node'    => $node,
            '#cache'   => ['tags' => ['node:' . $node->id()]],
        ], $projects);

        return [
            '#theme'  => 'item_list',
            '#items'  => $items,
            '#cache'  => [
                'tags'    => ['node_list:project'],
                'max-age' => 3600,
            ],
        ];
    }
}
```

> **À retenir** — Le pattern service + subscriber + plugin bloc reproduit exactement
> l'architecture Symfony que tu connais : la logique métier est dans des classes
> injectables, le controller/bloc ne fait qu'orchestrer. Les tests unitaires s'écrivent
> sur `ProjectService` en mockant `EntityTypeManagerInterface` — aucun bootstrap
> Drupal requis.
