---
title: "Personnalisation de l'interface Admin"
type: lesson
---

# Personnalisation de l'interface Admin Sylius

L'Admin Sylius est un ensemble de templates Twig surchargeables, d'un menu configurable via service, et d'onglets extensibles. Contrairement à SonataAdmin (que vous connaissez peut-être), il n'y a pas de builder PHP : on surcharge des templates et on enregistre des événements de menu.

## Arborescence des templates Admin

Les templates Admin Sylius sont dans le Bundle `SyliusAdminBundle` :

```
vendor/sylius/sylius/src/Sylius/Bundle/AdminBundle/Resources/views/
├── Product/
│   ├── index.html.twig
│   ├── _form.html.twig
│   └── show.html.twig
├── Order/
│   └── ...
└── layout.html.twig
```

Pour surcharger, créez le même chemin dans `templates/bundles/SyliusAdminBundle/` :

```
templates/
└── bundles/
    └── SyliusAdminBundle/
        └── Product/
            └── _form.html.twig    ← override
```

## Surcharger un template Admin

```twig
{# templates/bundles/SyliusAdminBundle/Product/_form.html.twig #}

{# Extend the original template to add a tab #}
{% extends '@!SyliusAdmin/Product/_form.html.twig' %}

{% block content %}
    {{ parent() }}

    {# Add a custom "SEO" tab #}
    <div class="ui segment">
        <h4>{{ 'app.ui.seo_settings'|trans }}</h4>
        {{ form_row(form.metaTitle) }}
        {{ form_row(form.metaDescription) }}
    </div>
{% endblock %}
```

> **Note** : `@!SyliusAdmin` (avec `!`) force Twig à chercher le template **original** dans le bundle, pas votre surcharge. Sans le `!`, vous obtiendriez une récursion infinie.

## Ajouter un onglet sur une page Admin

Sylius Admin utilise des onglets Semantic UI. Pour ajouter un onglet sur la page Produit :

```twig
{# templates/bundles/SyliusAdminBundle/Product/_form.html.twig #}
{% extends '@!SyliusAdmin/Product/_form.html.twig' %}

{% block form_tabs %}
    {{ parent() }}
    <a class="item" data-tab="seo">{{ 'app.ui.seo'|trans }}</a>
{% endblock %}

{% block form_tab_content %}
    {{ parent() }}
    <div class="ui tab" data-tab="seo">
        {{ form_row(form.metaTitle) }}
        {{ form_row(form.metaDescription) }}
    </div>
{% endblock %}
```

## Menu Admin

Le menu Admin est construit via des événements Symfony. Sylius dispatche `SyliusAdminBundle\Event\AdminMenuBuilderEvent` :

```php
<?php
// src/EventListener/AdminMenuListener.php

namespace App\EventListener;

use Knp\Menu\ItemInterface;
use Sylius\Bundle\UiBundle\Menu\Event\MenuBuilderEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(event: 'sylius.menu.admin.main')]
final class AdminMenuListener
{
    public function __invoke(MenuBuilderEvent $event): void
    {
        $menu = $event->getMenu();

        // Add an item in the "catalog" section
        $catalog = $menu->getChild('catalog');
        if ($catalog !== null) {
            $catalog->addChild('books', [
                'route'           => 'app_admin_book_index',
                'labelAttributes' => ['icon' => 'book'],
            ])->setLabel('app.ui.books');
        }

        // Or create a new top-level section
        $menu->addChild('library', [
            'labelAttributes' => ['icon' => 'university'],
        ])->setLabel('app.ui.library');

        $menu->getChild('library')
            ->addChild('books', ['route' => 'app_admin_book_index'])
            ->setLabel('app.ui.books');
    }
}
```

## Comparaison avec SonataAdmin

| SonataAdmin | Sylius Admin |
|---|---|
| `AdminInterface::configureListFields()` PHP | Grid YAML déclarative |
| `AdminInterface::configureFormFields()` PHP | FormType Symfony standard |
| Surcharge via service `admin` | Surcharge de template Twig |
| Menu via `sonata.admin.block.admin_list` | Events `sylius.menu.admin.main` |
| Chaque admin = classe PHP | Pas de classe admin, tout en config + template |

> **Repère** : si vous venez de SonataAdmin, l'approche Sylius est plus légère mais moins centralisée. Vous n'avez pas de classe unique pour configurer liste + formulaire + show. Les trois sont séparés : Grid (liste), FormType (formulaire), template Twig (affichage).

## Surcharger le layout Admin global

```twig
{# templates/bundles/SyliusAdminBundle/layout.html.twig #}
{% extends '@!SyliusAdmin/layout.html.twig' %}

{% block logo %}
    <img src="{{ asset('build/admin/images/logo.png') }}" alt="Mon Agence" />
{% endblock %}

{% block stylesheets %}
    {{ parent() }}
    {{ encore_entry_link_tags('admin') }}
{% endblock %}
```

## Flash messages et notifications

```twig
{# Add a custom flash in a controller or listener #}
```

```php
<?php
// In a controller or event listener:
$this->addFlash('success', $this->translator->trans('app.ui.book_published'));
```

## À retenir

- Surcharge de template : `templates/bundles/SyliusAdminBundle/<Entité>/<template>.html.twig`.
- Utilisez `@!SyliusAdmin/` (avec `!`) pour étendre le template original sans récursion.
- Le menu Admin est construit via l'événement `sylius.menu.admin.main` (KnpMenu).
- Les onglets Semantic UI (`data-tab`) permettent d'organiser les formulaires complexes sans JS custom.

> **Piège agence** : surcharger `layout.html.twig` entier au lieu d'étendre avec `{% block %}`. Chaque mise à jour de Sylius peut modifier le layout, et votre surcharge totale ne bénéficiera pas des corrections de sécurité ou d'accessibilité. Toujours **étendre** et surcharger uniquement les blocs nécessaires.
