---
title: "Pièges visuels à éviter"
type: lesson
---

# Quand le graphique ment (souvent sans le vouloir)

Un visuel peut être techniquement correct et **trompeur**. Connaître les pièges classiques, c'est protéger ta crédibilité : un manager qui repère un axe truqué ne fait plus confiance à *aucun* de tes chiffres.

## 1. L'axe vertical tronqué

Commencer l'axe des Y ailleurs qu'à **zéro** exagère artificiellement les écarts. Une hausse de `amount` de 100 à 103 paraît spectaculaire si l'axe va de 99 à 104.

```text
Axe tronqué (trompeur)        Axe à 0 (honnête)
104 ┤        █                 103 ┤   █     █
103 ┤   █    █                  …  ┤   █     █
102 ┤   █    █                   0 ┴───────────
    → « +200 % !! »                 → « presque stable »
```

> Règle : pour des **barres**, l'axe commence **toujours à zéro** (la longueur encode la valeur). Pour une **courbe**, un zoom est tolérable s'il est assumé et annoté.

## 2. Le camembert (pie chart) à fuir

L'œil humain compare mal des **angles**. Au-delà de 2-3 parts, ou quand les valeurs sont proches, un camembert devient illisible. Préfère des **barres triées**.

```mermaid
flowchart LR
    A["Camembert à 7 parts<br/>angles proches"] -->|remplacer par| B["Barres horizontales<br/>triées par valeur"]
```

Le seul cas presque acceptable : **deux parts** très contrastées (ex. 80 % / 20 %).

## 3. La surcharge

Trop de couleurs, trop de séries, des étiquettes partout, un fond chargé. Chaque élément ajouté **coûte** de l'attention. Demande-toi pour chaque pixel : *est-ce qu'il aide à comprendre le message ?* Sinon, on supprime.

**Avant** (dashboard chargé) : 12 visuels sur une seule page, 6 couleurs sans logique, une légende répétée sur chaque graphique, un fond en dégradé, une étiquette de donnée sur chacun des 12 points d'une courbe.

**Après** (épuré) — ce qu'on retire, et pourquoi :

| On retire | Pourquoi |
|---|---|
| Les couleurs redondantes (6 → 1 accent + gris) | Une seule couleur forte guide l'œil vers l'essentiel |
| La légende répétée sur chaque visuel | Une légende partagée suffit ; le reste est du bruit |
| Le fond en dégradé | Un fond neutre ne fait pas concurrence aux données |
| Les étiquettes sur chaque point de la courbe | Seuls le premier, le dernier et les pics méritent une étiquette |
| Les visuels redondants (même info, présentation différente) | Une seule vue suffit ; les doublons n'ajoutent rien |

## 4. Échelles et couleurs trompeuses

- **Double axe Y** (deux échelles différentes) : on peut faire dire n'importe quoi à une corrélation. À manier avec une extrême prudence.

  **Avant** (double axe, trompeur) : `CA` borné 100-103 (axe gauche), `Pannes` bornées 10-40 (axe droite).

  ```text
  Mois          1     2     3     4     5     6
  CA (K€)     100   101   100   102   101   103
  Pannes (nb)  10    16    22    28    34    40
  ```

  Sur le graphique, les deux courbes remplissent la **même hauteur visuelle** et semblent évoluer ensemble — comme si le CA « suivait » les pannes.

  **Après** (échelle honnête, un seul axe démarrant à 0) : le CA n'a bougé que de **+3 %** (100 → 103, quasi invisible sur une échelle 0-40), pendant que les pannes ont **triplé** (+300 %, 10 → 40). Les deux séries n'ont pas du tout la même ampleur de variation — la « corrélation » venait uniquement du choix des bornes d'axe, pas de la donnée.

- **Dégradé de couleur** sur une dimension non ordonnée (les régions ne sont pas « plus » ou « moins » que d'autres) : suggère un ordre qui n'existe pas.
- **Aires 3D / effets de volume** : déforment la perception des tailles. À bannir.

> **À retenir —** Les trois fautes les plus courantes en entretien comme en mission : *axe tronqué sur des barres*, *camembert illisible*, *surcharge*. Un visuel honnête est souvent un visuel plus simple.
