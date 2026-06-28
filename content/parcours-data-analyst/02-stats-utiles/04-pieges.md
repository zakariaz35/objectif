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
| Web | 80 % (sur 100) | **90 %** (sur 1000) |
| Magasin | 30 % (sur 1000) | **40 %** (sur 100) |
| **Global** | **35 %** | **35 %** ?? |

B est meilleure **dans chaque canal**, mais l'agrégat peut donner A gagnante à cause de la
**répartition des effectifs**. C'est le paradoxe de Simpson.

> **Repère —** dès qu'on agrège des groupes de **tailles très différentes**, méfie-toi.
> Vérifie toujours la conclusion **groupe par groupe** avant de globaliser.

## 3. Les axes tronqués

Un graphique dont l'axe Y ne commence **pas à zéro** dramatise une variation minuscule.
Une hausse de 1 % paraît spectaculaire si l'axe va de 99 à 101.

```mermaid
flowchart LR
    A["Axe 0 → 100\nvariation discrète"] -.présente la même donnée.-> B["Axe 99 → 101\nvariation 'énorme'"]
```

Réflexe : pour des **barres**, l'axe **doit** partir de zéro. Pour des courbes, signale
clairement la troncature.

## 4. Corrélation ≠ causalité

Deux courbes qui montent ensemble ne prouvent rien. Ventes de glaces et noyades grimpent
l'été : la cause commune est la **chaleur**, pas l'une l'autre.

## 5. Le survivant manquant

Analyser seulement les clients **restants** (en oubliant ceux qui sont partis) gonfle
artificiellement la satisfaction. C'est le **biais du survivant**.

> **À retenir —** avant de présenter, pose-toi : *« quelqu'un de malveillant pourrait-il
> tirer la conclusion inverse de ces mêmes données ? »* Si oui, tu as un piège à neutraliser.
