---
title: "Pourquoi Excel, et comment aborder ce parcours"
type: lesson
---

# Excel pour l'analyste

Excel était sans doute absent de ton cursus d'ingénieure. C'est pourtant l'outil cité sur
**quasiment toutes** les offres de Data-Analyst, parce qu'il est partout : le métier vit
de fichiers `.xlsx` qui circulent par mail entre la finance, les achats et les RH.

Ce parcours va droit à l'essentiel de l'analyste : **structurer**, **calculer**,
**rechercher**, **croiser**, **nettoyer**. On reste sur des cas concrets — vente, achat,
RH — pas sur des recettes décoratives.

> **Objectif du parcours —** être autonome sur les formules clés, la recherche entre
> tables, les tableaux croisés dynamiques (TCD) et le nettoyage d'un fichier reçu.

## Comment lire les exemples

Excel ne s'exécute pas dans la plateforme. Les leçons montrent donc les **formules** dans
des blocs de code, à reproduire dans ton propre classeur. La convention est simple :

- la **prose** est en français ;
- les **formules, noms de colonnes et de tables** sont en anglais
  (`amount`, `region`, `category`, `order_date`, `Sales`, `Products`…).

C'est aussi la bonne hygiène en entreprise : des noms de colonnes en anglais, sans
espaces ni accents, te suivront partout (Excel, SQL, Python).

## Le jeu de données fil rouge

On travaillera surtout sur une table de ventes `Sales` :

| order_id | order_date | region | category | quantity | amount |
|---|---|---|---|---|---|
| 1001 | 2024-01-12 | Nord | Hardware | 2 | 500 |
| 1002 | 2024-01-15 | Sud | Office | 5 | 150 |
| 1003 | 2024-02-03 | Nord | Office | 1 | 200 |

…et une table de référence `Products` : `product_id | name | unit_price`.

## Où ce parcours se situe

C'est une **brique autonome** du cursus Data-Analyst : tu peux la valider seule et
l'afficher sur ton CV. Pour la vue d'ensemble du métier, retourne au hub
`parcours-data-analyst` ; pour interroger des bases de données, enchaîne sur
`parcours-sql`.

> **À retenir —** Excel est une vraie compétence métier, pas un détail. Vise
> l'autonomie sur quelques outils bien choisis plutôt que l'exhaustivité.
