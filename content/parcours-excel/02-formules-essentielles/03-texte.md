---
title: "Manipuler le texte"
type: lesson
---

# Découper et recomposer du texte

Les fichiers réels regorgent de colonnes mal formées : un nom complet à scinder, un code
région collé à autre chose, des espaces parasites. Voici les outils.

## Nettoyer et homogénéiser la casse

```
=TRIM(A2)            // removes extra spaces (leading, trailing, internal duplicates)
=CLEAN(A2)           // strips non-printable characters (copy-paste from the web)
=UPPER(A2)           // all uppercase
=LOWER(A2)           // all lowercase
=PROPER(A2)          // First Letter Of Each Word Capitalised
```

## Extraire une portion

```
=LEFT(A2, 3)         // first 3 characters, e.g. region code "NOR"
=RIGHT(A2, 4)        // last 4 characters, e.g. year from an identifier
=MID(A2, 4, 2)       // 2 characters starting at position 4
=LEN(A2)             // string length (useful for spotting anomalies)
```

## Assembler

```
// Join several pieces together
=CONCAT([@region], " - ", [@category])

// Join a list with a separator, ignoring empty cells
=TEXTJOIN(", ", TRUE, [@first_name], [@last_name])
```

## Découper une colonne : TEXTSPLIT

Sur les versions récentes, `TEXTSPLIT` éclate une chaîne en colonnes selon un séparateur :

```
// "Nord - Office" -> two cells: "Nord", "Office"
=TEXTSPLIT([@label], " - ")
```

Sur une version plus ancienne, le menu **Données → Convertir** (texte en colonnes) fait le
même travail à la main.

## Retrouver une sous-chaîne

```
// Position of "@" in an email address, empty if not found
=IFERROR(SEARCH("@", [@email]), "")

// The domain after "@"
=MID([@email], SEARCH("@", [@email]) + 1, 50)
```

> **À retenir —** `TRIM` + `PROPER` standardisent une colonne ; `LEFT`/`RIGHT`/`MID` et
> `TEXTSPLIT` découpent ; `CONCAT`/`TEXTJOIN` recomposent. C'est la boîte à outils du
> nettoyage texte.
