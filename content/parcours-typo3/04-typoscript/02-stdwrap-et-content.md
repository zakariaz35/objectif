---
title: "stdWrap, CONTENT et rendu des content elements"
type: lesson
---

# stdWrap, CONTENT et rendu des content elements

Cette leçon couvre deux aspects fondamentaux du rendu TypoScript en contexte agence :
`stdWrap` (la chaîne de transformation universelle) et l'objet `CONTENT` (la récupération
des content elements d'une colonne de page).

## stdWrap : la chaîne de traitement universelle

`stdWrap` est un ensemble de propriétés disponibles sur presque tous les cObjects. Il
décrit comment transformer une valeur avant de l'afficher.

```typoscript
# Basic stdWrap: wrap the value in a paragraph tag
lib.intro = TEXT
lib.intro {
    value = Welcome to our website
    wrap = <p class="intro">|</p>
    # The pipe | is replaced by the value
}

# stdWrap with field: read from the current database record
lib.pageTitle = TEXT
lib.pageTitle {
    field = title           # reads the "title" field of the current page
    htmlSpecialChars = 1    # escape HTML entities
    wrap = <h1>|</h1>
}

# stdWrap with dataWrap: mix static text and data
lib.breadcrumb = TEXT
lib.breadcrumb {
    dataWrap = <nav aria-label="breadcrumb">{field:nav_title}</nav>
}

# stdWrap with if: conditional rendering
lib.cookieBanner = TEXT
lib.cookieBanner {
    value = <div class="cookie-banner">...</div>
    if.isFalse.GP = cookie_accepted   # render only if GET/POST param is absent
}
```

## Les propriétés stdWrap les plus utilisées

| Propriété | Rôle |
|---|---|
| `field` | Lit un champ du record courant |
| `data` | Accède à diverses sources (GP, TSFE, register…) |
| `wrap` | Entoure la valeur avec `préfixe\|suffixe` |
| `htmlSpecialChars` | Échappe les entités HTML |
| `required` | Supprime le rendu si la valeur est vide |
| `if` | Condition (rendu conditionnel) |
| `typolink` | Génère un lien TYPO3 (page uid, fichier, URL externe) |
| `numRows` | Compte des enregistrements (utile pour les conditions) |
| `cObject` | Délègue à un sous-cObject |

## L'objet CONTENT : rendre les content elements d'une colonne

```typoscript
# Render all content elements from column 0 (normal) of the current page
page.10 = FLUIDTEMPLATE
page.10 {
    templateRootPaths.0 = EXT:acme_sitepackage/Resources/Private/Templates/Page/
    variables {
        # Pass content elements column 0 as a variable to Fluid
        content = CONTENT
        content {
            table = tt_content
            select {
                orderBy = sorting
                where = {#colPos} = 0   # colPos 0 = "Normal" column
                languageField = sys_language_uid
            }
        }
        # Second column (colPos 1 = "Right sidebar")
        sidebar = CONTENT
        sidebar {
            table = tt_content
            select {
                orderBy = sorting
                where = {#colPos} = 1
                languageField = sys_language_uid
            }
        }
    }
}
```

Dans le template Fluid, on accède aux variables passées :

```html
<!-- Resources/Private/Templates/Page/Default.html -->
<f:layout name="Default" />
<f:section name="Main">
    <main>
        <f:format.raw>{content}</f:format.raw>
    </main>
    <aside>
        <f:format.raw>{sidebar}</f:format.raw>
    </aside>
</f:section>
```

> **Repère —** `{#colPos}` dans `where` est la syntaxe TYPO3 pour échapper le nom de
> colonne (protection contre les injections SQL dans les anciennes versions). En TYPO3
> 12, préférer l'API QueryBuilder dans les controllers Extbase. [source: docs.typo3.org]

## Rendu des content elements individuels

Chaque content element (`tt_content`) a un `CType` (type). TYPO3 utilise TypoScript pour
savoir comment rendre chaque type :

```typoscript
# Override the rendering of the "text" CType
tt_content.text {
    10 = FLUIDTEMPLATE
    10 {
        templateName = Text
        templateRootPaths.0 = EXT:acme_sitepackage/Resources/Private/Templates/ContentElements/
    }
}

# Override the rendering of the "textpic" CType (text with image)
tt_content.textpic {
    10 = FLUIDTEMPLATE
    10 {
        templateName = TextPic
        templateRootPaths.0 = EXT:acme_sitepackage/Resources/Private/Templates/ContentElements/
    }
}
```

## Conditions TypoScript (TYPO3 12)

```typoscript
# Condition based on application context
[applicationContext == "Development"]
    config.debug = 1
    config.no_cache = 1
[end]

# Condition based on page type
[page["doktype"] == 4]
    # doktype 4 = external URL page — do something special
[end]

# Condition based on frontend user group
[frontend.user.isLoggedIn == 1]
    page.10.variables.isLoggedIn = TEXT
    page.10.variables.isLoggedIn.value = 1
[end]
```

## À retenir

- `stdWrap` est la boîte à outils universelle de transformation de valeur en TypoScript.
- `CONTENT` avec `table = tt_content` et `where = {#colPos} = X` récupère les
  éléments d'une colonne de page.
- Chaque `CType` peut avoir son propre template Fluid via `tt_content.<ctype>.10 = FLUIDTEMPLATE`.
- Les conditions TypoScript testent le contexte d'application, le type de page ou
  l'état de l'utilisateur.
