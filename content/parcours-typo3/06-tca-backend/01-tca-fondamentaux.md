---
title: "TCA : Table Configuration Array"
type: lesson
---

# TCA : Table Configuration Array

Le TCA (Table Configuration Array) est le mécanisme central qui définit comment chaque
table de la base de données est **affichée et éditée dans le backend TYPO3**. C'est
l'équivalent TYPO3 des formulaires Symfony Form + les attributs Doctrine Entity — mais
en PHP natif sans annotations.

## Structure d'un TCA complet

```php
<?php
// Configuration/TCA/tx_acmeblog_domain_model_article.php
// Full TCA definition for a new "article" table

return [
    'ctrl' => [
        // Table metadata and behavior
        'title'             => 'LLL:EXT:acme_blog/Resources/Private/Language/locallang_db.xlf:tx_acmeblog_domain_model_article',
        'label'             => 'title',          // field displayed as record title in lists
        'sortby'            => 'sorting',        // drag-and-drop sorting field
        'crdate'            => 'crdate',         // auto-set creation timestamp
        'tstamp'            => 'tstamp',         // auto-set modification timestamp
        'delete'            => 'deleted',        // soft-delete field
        'enablecolumns'     => [
            'disabled'  => 'hidden',             // "hidden" checkbox in backend
            'starttime' => 'starttime',          // publication start
            'endtime'   => 'endtime',            // publication end
        ],
        'searchFields'      => 'title, teaser',  // fields searched in backend search
        'iconfile'          => 'EXT:acme_blog/Resources/Public/Icons/tx_acmeblog_article.svg',
        'languageField'     => 'sys_language_uid',
        'transOrigPointerField' => 'l10n_parent',
        'transOrigDiffSourceField' => 'l10n_diffsource',
    ],

    'types' => [
        // Layout of the edit form (fields shown, order, tabs)
        '1' => [
            'showitem' => '
                --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:general,
                    title, teaser, bodytext,
                --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:images,
                    image, image_caption,
                --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:language,
                    --palette--;;language, --palette--;;hidden,
                --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:access,
                    starttime, endtime,
            ',
        ],
    ],

    'palettes' => [
        'language' => ['showitem' => 'sys_language_uid, l10n_parent, l10n_diffsource'],
        'hidden'   => ['showitem' => 'hidden'],
    ],

    'columns' => [
        'title' => [
            'label' => 'LLL:EXT:acme_blog/Resources/Private/Language/locallang_db.xlf:article.title',
            'config' => [
                'type'     => 'input',
                'size'     => 50,
                'max'      => 255,
                'required' => true,
                'eval'     => 'trim',
            ],
        ],
        'teaser' => [
            'label' => 'LLL:EXT:acme_blog/Resources/Private/Language/locallang_db.xlf:article.teaser',
            'config' => [
                'type' => 'text',
                'rows' => 3,
                'cols' => 50,
            ],
        ],
        'bodytext' => [
            'label' => 'LLL:EXT:acme_blog/Resources/Private/Language/locallang_db.xlf:article.bodytext',
            'config' => [
                'type'                  => 'text',
                'enableRichtext'        => true,       // activate RTE (rich text editor)
                'richtextConfiguration' => 'default',
                'rows'                  => 15,
            ],
        ],
        'image' => [
            'label' => 'LLL:EXT:acme_blog/Resources/Private/Language/locallang_db.xlf:article.image',
            'config' => \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::getFileFieldTCAConfig(
                'image',
                [
                    'appearance' => ['createNewRelationLinkTitle' => 'Add image'],
                    'minitems' => 0,
                    'maxitems' => 1,
                ],
                'jpg,jpeg,png,gif,webp,svg'
            ),
        ],
    ],
];
```

## Les types de champs TCA essentiels

| `type` | Widget backend | Usage |
|---|---|---|
| `input` | Champ texte court | Titre, URL, identifiant |
| `text` | Textarea (± RTE) | Corps de texte, HTML |
| `check` | Case à cocher | Booléen, options multiples |
| `select` | Liste déroulante | Enum, relation simple |
| `group` | Relation N-N générique | Relations avec d'autres tables |
| `inline` | IRRE (enregistrements enfants) | Relations 1-N avec formulaire imbriqué |
| `file` | Gestionnaire de fichiers FAL | Images, PDF, documents |
| `slug` | Générateur de slug | URLs propres (depuis TYPO3 9) |
| `json` | Éditeur JSON | Données structurées libres |
| `category` | Sélection de catégories | Système de catégories core |

## Ajouter un champ à `tt_content` (Override)

```php
<?php
// Configuration/TCA/Overrides/tt_content.php
// Add a "button_label" field to all content elements

$GLOBALS['TCA']['tt_content']['columns']['tx_acmesitepackage_button_label'] = [
    'label'  => 'LLL:EXT:acme_sitepackage/Resources/Private/Language/locallang_db.xlf:tt_content.button_label',
    'config' => [
        'type' => 'input',
        'size' => 30,
        'max'  => 100,
    ],
];

// Show this field in the "Text with button" CType only
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addFieldsToPalette(
    'tt_content',
    'acme_cta',
    'tx_acmesitepackage_button_label, tx_acmesitepackage_button_url'
);

// Add the palette to the "textmedia" CType form
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addToAllTCAtypes(
    'tt_content',
    '--palette--;Call to action;acme_cta',
    'textmedia',   // only for CType = textmedia
    'after:subheader'
);
```

## Backend Layouts : contrôler la mise en page des éditeurs

Les Backend Layouts définissent la **grille de colonnes** que les éditeurs voient pour
placer leurs content elements. Ils se créent dans le backend ou via TypoScript :

```typoscript
# TypoScript: define a backend layout with a sidebar
mod.web_layout.BackendLayouts {
    twoColumns {
        title = 2 columns (main + sidebar)
        config {
            backend_layout {
                colCount = 12
                rowCount = 1
                rows {
                    1 {
                        columns {
                            1 {
                                name = Main content
                                colspan = 9
                                colPos = 0
                            }
                            2 {
                                name = Sidebar
                                colspan = 3
                                colPos = 1
                            }
                        }
                    }
                }
            }
        }
    }
}
```

> **Repère —** les `colPos` définis dans le Backend Layout doivent correspondre aux
> `colPos` utilisés dans le `select.where` de ton objet `CONTENT` TypoScript. Si un
> éditeur place un élément en sidebar (colPos=1) et que ton TypoScript ne récupère que
> colPos=0, l'élément n'apparaît jamais — c'est l'erreur la plus fréquente sur les
> reprises. [source: docs.typo3.org]

## À retenir

- Le TCA est l'unique source de vérité pour l'interface backend d'une table.
- Les nouvelles tables : `Configuration/TCA/<table>.php`.
- Les overrides de tables existantes : `Configuration/TCA/Overrides/<table>.php`.
- Les `colPos` du Backend Layout doivent correspondre à ceux du TypoScript CONTENT.
- Après modification TCA : **vider le cache**.
