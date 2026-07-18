---
title: "Twig et theming : le pont avec Symfony"
type: lesson
---

# Twig et theming : le pont avec Symfony

Drupal utilise **Twig** — le même moteur que Symfony. La syntaxe est identique,
mais Drupal ajoute des filtres, fonctions et tags spécifiques, et la résolution
des templates suit une convention de nommage différente.

## Résolution de template (theme suggestion)

Drupal résout quel template Twig utiliser selon une hiérarchie du plus spécifique
au plus générique :

```
node--article--full.html.twig       ← nœud article, mode "full"
node--article.html.twig             ← nœud article (tous modes)
node--full.html.twig                ← tous nœuds, mode "full"
node.html.twig                      ← tous les nœuds
```

Idem pour les champs :
```
field--field-image--article.html.twig   ← champ field_image sur article
field--field-image.html.twig            ← champ field_image partout
field--image.html.twig                  ← tous les champs type image
field.html.twig                         ← tous les champs
```

## Créer un template custom dans un module

Après avoir déclaré le thème dans `hook_theme()` :

```twig
{# my_module/templates/my-module-card.html.twig #}
{#
/**
 * @file
 * Template for a content card component.
 *
 * Variables:
 *  - title: string
 *  - excerpt: string
 *  - url: string
 *  - image: render array (optional)
 */
#}
<article class="card" {{ attributes }}>
  {% if image %}
    <div class="card__image">
      {{ image }}
    </div>
  {% endif %}

  <div class="card__body">
    <h3 class="card__title">
      <a href="{{ url }}">{{ title }}</a>
    </h3>

    {% if excerpt %}
      <p class="card__excerpt">{{ excerpt }}</p>
    {% endif %}
  </div>
</article>
```

## Variables et filtres Drupal spécifiques

```twig
{# Translate a string #}
{{ 'Published on'|t }}
{{ 'Hello @name'|t({'@name': user.name}) }}

{# Render a render array (important: use |render to force rendering) #}
{{ content.field_image|render }}

{# Check access #}
{% if is_admin %}
  <a href="{{ path('entity.node.edit_form', {'node': node.id}) }}">Edit</a>
{% endif %}

{# Generate a URL (like Symfony's path()) #}
{{ url('my_module.settings') }}
{{ path('entity.node.canonical', {'node': node.id}) }}

{# File URL (for managed files) #}
{{ file_url(node.field_image.entity.fileUri) }}

{# Format a date #}
{{ node.created.value|date('d/m/Y') }}
{{ node.created.value|format_date('long') }}

{# Attach a library (CSS/JS) #}
{{ attach_library('my_module/card-component') }}
```

## Bibliothèques CSS/JS (Asset API)

Drupal gère les assets via les bibliothèques — pas de `<script>` ou `<link>` en dur :

```yaml
# my_module/my_module.libraries.yml
card-component:
  version: 1.0
  css:
    component:
      css/card.css: {}
  js:
    js/card.js: {}
  dependencies:
    - core/jquery     # optional: use vanilla JS when possible
    - core/drupal

admin-tweaks:
  version: 1.0
  css:
    theme:
      css/admin.css: {}
  # Attach only on admin pages
```

Attacher une bibliothèque dans un render array :

```php
// In a controller or block build() method
return [
    '#theme' => 'my_module_card',
    '#title' => $node->getTitle(),
    '#attached' => [
        'library' => ['my_module/card-component'],
    ],
];
```

## Preprocesseurs : passer des variables aux templates

Le `hook_preprocess_HOOK()` est l'équivalent d'un `ViewModel` : tu prépares les
variables avant le rendu Twig.

```php
// my_module/my_module.module

/**
 * Implements hook_preprocess_node() for article nodes.
 */
function my_module_preprocess_node__article(array &$variables): void {
    /** @var \Drupal\node\NodeInterface $node */
    $node = $variables['node'];

    // Add a computed variable available in the template
    $variables['reading_time'] = my_module_compute_reading_time(
        strip_tags((string) $node->get('body')->value)
    );

    // Add a flag based on field value
    $variables['is_featured'] = (bool) $node->get('field_featured')->value;
}

function my_module_compute_reading_time(string $text): int {
    $word_count = str_word_count($text);
    return (int) ceil($word_count / 200); // 200 words per minute
}
```

```twig
{# node--article.html.twig #}
{% if is_featured %}
  <span class="badge badge--featured">{{ 'Featured'|t }}</span>
{% endif %}

<p class="reading-time">
  {{ 'Reading time: @min min'|t({'@min': reading_time}) }}
</p>
```

> **Pont Symfony** — Le `hook_preprocess_node()` est l'équivalent du `createView()`
> d'un formulaire ou d'un `TwigExtension` : il injecte des variables calculées dans
> le contexte Twig. La différence : c'est un hook (fonction nommée), pas une méthode
> d'une classe. Pour de la logique complexe, délègue à un service injecté.

> **À retenir** — Ne jamais faire de logique métier directement dans un template Twig.
> Twig en Drupal est configuré en mode strict : les variables indéfinies lèvent une
> erreur. Prépare toujours les variables dans un préprocesseur ou le render array.
