---
title: "Tableaux structurés : la base propre"
type: lesson
---

# Le réflexe n°1 : le tableau structuré

Avant toute formule, transforme ta plage en **Tableau** (Table Excel) : sélectionne les
données → `Ctrl+L` (ou Insertion → Tableau). Avantages immédiats :

- les colonnes ont un **nom** (`Sales[amount]`) au lieu de `D2:D999` ;
- les formules **s'étendent automatiquement** aux nouvelles lignes ;
- filtres, tri et mise en forme sont intégrés.

Pense ensuite à **nommer** le tableau (onglet *Création de tableau* → *Nom du tableau*) :
`Sales`, `Products`… plutôt que `Tableau1`.

## Références structurées vs plages

Sans tableau structuré :

```
=SUM(D2:D100)
```

Avec un tableau nommé `Sales` (colonne `amount`) :

```
=SUM(Sales[amount])
```

La seconde formule est **lisible**, **robuste** (elle suit l'ajout de lignes) et ne casse
pas quand on insère une colonne ailleurs.

Pour désigner la valeur de la **ligne courante** dans une colonne calculée, on écrit
`[@colonne]` :

```
=[@quantity] * [@unit_price]
```

## Références relatives, absolues, mixtes

Hors tableau, le `$` contrôle ce qui est figé quand on recopie une formule :

| Écriture | Comportement en recopiant |
|---|---|
| `A1` | relative : s'adapte (ligne + colonne) |
| `$A$1` | absolue : figée |
| `$A1` / `A$1` | mixte : une seule des deux figée |

Astuce : la touche `F4` fait défiler ces variantes pendant l'édition d'une formule.

> **À retenir —** commence **toujours** par mettre tes données en Tableau (`Ctrl+L`) et
> par le nommer. C'est ce qui rend tes formules et tes TCD fiables.
