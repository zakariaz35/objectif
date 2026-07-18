---
title: "Les pièges qui font mentir un chiffre"
type: lesson
---

# Les pièges classiques : un chiffre juste, une conclusion fausse

Tes calculs peuvent être exacts et ton analyse fausse. Voici les pièges que les recruteurs
adorent tester — et que tu dois savoir **repérer chez les autres**.

## 1. La moyenne trompeuse

Une moyenne sur une population hétérogène cache tout. « Le panier moyen est de 80 € » alors
que la moitié achète à 20 € et l'autre à 140 €. Réflexe : **segmenter** (par profil,
région, canal) et regarder la **médiane**.

## 2. Le paradoxe de Simpson

Une tendance vraie dans chaque sous-groupe **s'inverse** une fois les groupes agrégés.

| Canal | Méthode A | Méthode B |
|---|---|---|
| Web | **90 %** (90 / 100) | 85 % (850 / 1000) |
| Magasin | **40 %** (400 / 1000) | 30 % (30 / 100) |
| **Global** | 44,5 % (490 / 1100) | **80 %** (880 / 1100) |

A gagne **dans chaque canal pris séparément** (90 % > 85 % sur le Web, 40 % > 30 % en
Magasin), mais c'est B qui l'emporte largement une fois les canaux **agrégés** (80 % contre
44,5 %). Le mécanisme : A et B n'ont pas le même **poids** par canal. A fait l'essentiel de
son volume en Magasin (1000 essais sur 1100, un canal structurellement plus dur), alors que
B fait l'essentiel du sien sur le Web (1000 essais sur 1100, un canal structurellement plus
facile). C'est la **répartition des effectifs**, pas la méthode elle-même, qui domine
l'agrégat.

> **Repère —** dès qu'on agrège des groupes de **tailles très différentes**, méfie-toi.
> Vérifie toujours la conclusion **groupe par groupe** avant de globaliser.

## 3. Les axes tronqués

Un graphique dont l'axe Y ne commence **pas à zéro** dramatise une variation minuscule.
Une hausse de 1 % paraît spectaculaire si l'axe va de 99 à 101. Même trois valeurs de CA
mensuel (99, 100, 101 k€) — une variation de moins de 2 % — racontent deux histoires
totalement différentes selon l'axe choisi :

| Axe à zéro (0 → 110) — variation réelle | Axe tronqué (99 → 101) — variation « énorme » |
|---|---|
| `99  ` `███████████████████████` <br> `100 ` `████████████████████████` <br> `101 ` `████████████████████████` | `99  ` <br> `100 ` `█████████████` <br> `101 ` `██████████████████████████` |

À gauche, les trois barres sont quasi identiques (la vérité). À droite, la troncature de
l'axe fait passer une variation négligeable pour une explosion.

Réflexe : pour des **barres**, l'axe **doit** partir de zéro. Pour des courbes, signale
clairement la troncature.

## 4. Corrélation ≠ causalité

Deux courbes qui montent ensemble ne prouvent rien. Ventes de glaces et noyades grimpent
l'été : la cause commune est la **chaleur**, pas l'une l'autre.

| Mois | Ventes de glaces | Noyades | Température |
|---|---|---|---|
| Janvier | 50 | 1 | 5 °C |
| Juillet | 500 | 12 | 30 °C |

Les glaces sont corrélées aux noyades (les deux sont ×10 environ entre janvier et
juillet), mais manger une glace ne provoque pas de noyade : la **variable cachée**
(la chaleur, qui pousse à la baignade **et** aux glaces) explique les deux à la fois.

## 5. Le survivant manquant

Analyser seulement les éléments **restants** (en oubliant ceux qui ont disparu de
l'échantillon) gonfle artificiellement une conclusion. C'est le **biais du survivant**.

**Exemple classique** — l'armée étudie les avions **revenus** de mission pour savoir où
blinder : sur 100 avions revenus, 60 ont des impacts sur les **ailes**, 20 sur le
**fuselage**, seulement 5 sur le **moteur**. Conclusion naïve : blinder les ailes.
Conclusion correcte : blinder le **moteur** — les avions touchés au moteur ne sont
**jamais revenus** pour être comptés dans l'échantillon. L'analyse ne voit que les
survivants, pas les absents qui porteraient le vrai signal.

Même logique côté clients : analyser seulement les clients **restants** (en oubliant ceux
qui sont partis) gonfle artificiellement la satisfaction mesurée.

> **À retenir —** avant de présenter, pose-toi : *« quelqu'un de malveillant pourrait-il
> tirer la conclusion inverse de ces mêmes données ? »* Si oui, tu as un piège à neutraliser.
