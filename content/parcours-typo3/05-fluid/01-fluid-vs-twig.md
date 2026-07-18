---
title: "Fluid vs Twig : les différences clés"
type: lesson
---

# Fluid vs Twig : les différences clés

Si tu maîtrises Twig (Symfony), Fluid te semblera familier dans les concepts mais
étrange dans la syntaxe. Cette leçon mappera les deux pour que tu sois productif
immédiatement.

## Comparaison rapide

| Concept | Twig | Fluid |
|---|---|---|
| Variable | `{{ variable }}` | `{variable}` |
| Condition | `{% if cond %}` | `<f:if condition="...">` |
| Boucle | `{% for item in items %}` | `<f:for each="{items}" as="item">` |
| Filtre | `{{ var \| upper }}` | `<f:format.case value="{var}" mode="upper" />` |
| Include partial | `{% include 'file.html.twig' %}` | `<f:render partial="File" />` |
| Héritage | `{% extends 'base.html.twig' %}` | `<f:layout name="Default" />` |
| Section | `{% block content %}` | `<f:section name="Main">` |
| Commentaire | `{# ... #}` | `<!-- ... -->` (HTML standard) |

## Structure d'un template Fluid complet

```html
<!-- Resources/Private/Templates/Page/Default.html -->
<!-- Declares which Layout wraps this template -->
<f:layout name="Default" />

<!-- Named section rendered into the Layout -->
<f:section name="Main">

    <!-- Access page title from TypoScript variable -->
    <h1>{pageTitle}</h1>

    <!-- Loop over news items passed from TypoScript/Controller -->
    <f:for each="{newsItems}" as="article" iteration="i">
        <article class="news-item {f:if(condition: i.isFirst, then: 'first')}">
            <h2>
                <!-- Link to the detail page -->
                <f:link.page pageUid="{article.detailPageUid}"
                             additionalParams="{tx_news_pi1: {news: article.uid}}">
                    {article.title}
                </f:link.page>
            </h2>
            <f:if condition="{article.image}">
                <f:image image="{article.image}" width="800" height="400c" />
            </f:if>
            <f:format.html>{article.bodytext}</f:format.html>
        </article>
    </f:for>

    <!-- Render a partial component -->
    <f:render partial="Navigation/Pagination"
              arguments="{currentPage: currentPage, totalPages: totalPages}" />

</f:section>
```

## Le Layout (enveloppe globale)

```html
<!-- Resources/Private/Layouts/Default.html -->
<!DOCTYPE html>
<html lang="{language.twoLetterIsoCode}">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{pageTitle}</title>
    <!-- Header data injected by TypoScript (includeCSS, etc.) -->
    <f:format.raw>{headerData}</f:format.raw>
</head>
<body class="page-{page.uid} doktype-{page.doktype}">

    <f:render partial="Navigation/Main" />

    <main id="content">
        <!-- This is where each Template's "Main" section is inserted -->
        <f:render section="Main" />
    </main>

    <f:render partial="Footer/Default" />

    <f:format.raw>{footerData}</f:format.raw>
</body>
</html>
```

## ViewHelpers : l'équivalent des filtres Twig

Les ViewHelpers sont des classes PHP qui s'utilisent comme des balises XML dans Fluid.
Les namespaces les plus courants :

| Namespace | Préfixe | Rôle |
|---|---|---|
| Core | `f:` | Built-in Fluid (if, for, format, link…) |
| Backend | `be:` | Interface backend |
| Fluid | `f:format.*` | Formatage (html, crop, date, number…) |
| Extensions | `news:`, `t3:` | ViewHelpers d'extensions tierces |

```html
<!-- f:if avec condition inline -->
<f:if condition="{items -> f:count()} > 0">
    <f:then>
        <ul>
            <f:for each="{items}" as="item">
                <li>{item.title}</li>
            </f:for>
        </ul>
    </f:then>
    <f:else>
        <p>No items found.</p>
    </f:else>
</f:if>

<!-- f:format.date -->
<time datetime="{article.publishDate -> f:format.date(format: 'Y-m-d')}">
    {article.publishDate -> f:format.date(format: 'd/m/Y')}
</time>

<!-- f:uri.page — generate URL without <a> tag -->
<meta property="og:url" content="{f:uri.page(pageUid: page.uid, absolute: 1)}" />
```

> **Repère —** la syntaxe `{variable -> f:viewHelper(arg: value)}` est le **pipe Fluid**
> (équivalent du `|` Twig). Elle chaîne les ViewHelpers : `{text -> f:format.html() ->
> f:format.crop(maxChars: 200)}`. [source: docs.typo3.org]

## ViewHelpers custom

```php
<?php
// Classes/ViewHelpers/FormatPriceViewHelper.php
namespace Acme\Sitepackage\ViewHelpers;

use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

class FormatPriceViewHelper extends AbstractViewHelper
{
    public function initializeArguments(): void
    {
        $this->registerArgument('price', 'float', 'Price to format', true);
        $this->registerArgument('currency', 'string', 'Currency symbol', false, '€');
    }

    public function render(): string
    {
        $formatted = number_format($this->arguments['price'], 2, ',', ' ');
        return $formatted . ' ' . $this->arguments['currency'];
    }
}
```

Utilisation dans Fluid :

```html
<!-- Import the custom namespace once per file (or in Layout) -->
{namespace acme=Acme\Sitepackage\ViewHelpers}

<p>{product.price -> acme:formatPrice(currency: '€')}</p>
```

## Mapping Twig → Fluid : les pièges fréquents de migration

Quand tu portes des templates Twig vers Fluid pour un projet TYPO3, ces différences
causent des erreurs silencieuses ou des affichages incorrects.

| Situation | Twig | Fluid | Piège |
|---|---|---|---|
| Variable non définie | Rien affiché (silencieux) | Erreur si accès sur `null` | Toujours vérifier `{f:if(condition: variable)}` |
| Filtre `raw` | `{{ html \| raw }}` | `<f:format.raw>{html}</f:format.raw>` | Oublier `format.raw` échappe le HTML |
| Test `is defined` | `{% if var is defined %}` | `<f:if condition="{var}">` | `{var}` = falsy si null ou '' |
| Accès tableau | `{{ items[0] }}` | `{items.0}` | Syntaxe objet, pas crochets |
| Concaténation | `{{ 'Hello ' ~ name }}` | Pas de concaténation native | Utiliser `<f:variable>` ou passer par PHP |
| Macro | `{% macro badge(label) %}` | Partial avec arguments | Pas de macro inline en Fluid |
| Loop index | `loop.index` | `{iteration.index}` (via `iteration`) | L'objet `iteration` ne s'active que si déclaré |

## Namespaces Fluid et problèmes de migration TYPO3 10→11

Avant TYPO3 11, les namespaces Fluid devaient être déclarés explicitement dans chaque
template. TYPO3 11 a introduit les **global namespaces** automatiques, mais les anciens
projets utilisaient la syntaxe longue en tête de fichier.

```html
<!-- ANCIEN (TYPO3 < 11) — déclaration explicite dans chaque fichier -->
{namespace f=TYPO3\CMS\Fluid\ViewHelpers}
{namespace news=GeorgRinger\News\ViewHelpers}

<!-- MODERNE (TYPO3 11+) — les namespaces core sont auto-importés -->
<!-- Seuls les namespaces tiers nécessitent une déclaration -->
{namespace news=GeorgRinger\News\ViewHelpers}
```

## ⚠️ Piège agence — migration TYPO3 10→11 : Fluid namespace obligatoire pour les extensions tierces

En TYPO3 12, la syntaxe de déclaration de namespace a changé pour préférer l'import
HTML-style. Si tu vois des templates qui lèvent `Unknown ViewHelper namespace`, c'est
souvent ce problème.

```html
<!-- TYPO3 10 — syntaxe Fluid inline (toujours valide en 12 mais dépréciée) -->
{namespace vhs=FluidTYPO3\Vhs\ViewHelpers}

<!-- TYPO3 12 — syntaxe recommandée (XML namespace attribute) -->
<html xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers"
      xmlns:news="http://typo3.org/ns/GeorgRinger/News/ViewHelpers"
      data-namespace-typo3-fluid="true">
```

L'attribut `data-namespace-typo3-fluid="true"` indique à Fluid que la balise `<html>`
est un conteneur de namespace et ne doit pas être rendue dans le HTML final.

## Cas concret d'agence : plugin liste d'articles avec pagination Fluid

Voici un template complet tel qu'on le rencontre en production sur un site d'actualités.

```html
<!-- Resources/Private/Templates/Article/List.html -->
<f:layout name="Default" />

<f:section name="Main">

    <section class="article-list">
        <h1><f:translate key="LLL:EXT:acme_blog/Resources/Private/Language/locallang.xlf:article.list.title" /></h1>

        <!-- Filter by category (passed from FlexForm settings) -->
        <f:if condition="{settings.categoryUid}">
            <p class="filter-hint">
                <f:translate key="LLL:EXT:acme_blog/Resources/Private/Language/locallang.xlf:article.list.filteredBy" />
                <strong>{currentCategory.title}</strong>
            </p>
        </f:if>

        <f:if condition="{articles -> f:count()} > 0">
            <f:then>
                <ul class="article-grid">
                    <f:for each="{articles}" as="article" iteration="iter">
                        <li class="article-card {f:if(condition: iter.isFirst, then: 'article-card--featured')}">

                            <!-- FAL image with automatic resizing -->
                            <f:if condition="{article.image}">
                                <f:image image="{article.image}"
                                         width="800"
                                         height="450c"
                                         class="article-card__image"
                                         alt="{article.image.alternative}"
                                         title="{article.image.title}" />
                            </f:if>

                            <div class="article-card__body">
                                <time datetime="{article.publishDate -> f:format.date(format: 'Y-m-d')}">
                                    {article.publishDate -> f:format.date(format: 'd/m/Y')}
                                </time>
                                <h2 class="article-card__title">
                                    <f:link.action action="detail"
                                                   arguments="{article: article}"
                                                   pageUid="{settings.detailPageUid}">
                                        {article.title}
                                    </f:link.action>
                                </h2>
                                <p>{article.teaser -> f:format.crop(maxChars: 160, append: '…')}</p>
                            </div>
                        </li>
                    </f:for>
                </ul>

                <!-- Pagination partial — currentPage and totalPages set by controller -->
                <f:render partial="Widget/Pagination"
                          arguments="{currentPage: currentPage,
                                      totalPages: totalPages,
                                      pageUid: settings.listPageUid}" />
            </f:then>
            <f:else>
                <p class="no-results"><f:translate key="LLL:EXT:acme_blog/Resources/Private/Language/locallang.xlf:article.list.noResults" /></p>
            </f:else>
        </f:if>
    </section>

</f:section>
```

```html
<!-- Resources/Private/Partials/Widget/Pagination.html -->
<f:if condition="{totalPages} > 1">
    <nav class="pagination" aria-label="Pagination">
        <ul>
            <f:if condition="{currentPage} > 1">
                <li>
                    <f:link.page pageUid="{pageUid}"
                                 additionalParams="{tx_acmeblog_list: {page: currentPage - 1}}"
                                 class="pagination__prev">
                        &laquo; Précédent
                    </f:link.page>
                </li>
            </f:if>
            <f:for each="{0: 1}" as="unused" iteration="i">
                <!-- Fluid does not have a range() equivalent — pass pages array from controller -->
            </f:for>
            <f:if condition="{currentPage} < {totalPages}">
                <li>
                    <f:link.page pageUid="{pageUid}"
                                 additionalParams="{tx_acmeblog_list: {page: currentPage + 1}}"
                                 class="pagination__next">
                        Suivant &raquo;
                    </f:link.page>
                </li>
            </f:if>
        </ul>
    </nav>
</f:if>
```

> **Repère —** `f:link.action` génère une URL vers une action Extbase (en tenant compte
> des Route Enhancers si configurés). `f:link.page` génère une URL vers une page TYPO3
> avec des `additionalParams` pour passer des arguments non-Extbase (page de pagination
> gérée manuellement).

## À retenir

- Fluid utilise des **balises XML** là où Twig utilise `{{ }}` et `{% %}`.
- `<f:layout>` déclare l'enveloppe globale ; `<f:section>` découpe le contenu.
- Les ViewHelpers sont des classes PHP réutilisables dans tous les templates.
- Le pipe `->` chaîne les ViewHelpers sur une valeur.
- En migration TYPO3 10→12 : migrer les namespaces inline `{namespace x=…}` vers la
  syntaxe XML `xmlns:x="…"` sur la balise `<html>`.
- `f:format.raw` est indispensable pour tout HTML rendu par TypoScript ou RTE.
