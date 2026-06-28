---
title: "Moyenne vs médiane"
type: lesson
---

# Moyenne vs médiane : ne jamais résumer trop vite

La statistique d'un analyste tient en peu de chose : savoir **résumer** une colonne sans
mentir. La première arme — et le premier piège — c'est la moyenne.

## La moyenne, et son talon d'Achille

La **moyenne** additionne tout et divise par l'effectif. Simple, mais **sensible aux
valeurs extrêmes** (*outliers*). Une seule valeur énorme la tire vers le haut.

Prends les salaires d'une petite équipe (en k€) :

| `2000` | `2100` | `2200` | `2300` | `15000` |
|---|---|---|---|---|

- **Moyenne** = `(2000 + 2100 + 2200 + 2300 + 15000) / 5 =` **`4720`**
- Personne ne gagne « autour de 4720 ». La moyenne **ment** ici.

## La médiane, plus robuste

La **médiane** est la valeur **du milieu** quand on trie : autant de valeurs en dessous
qu'au-dessus. Elle ignore l'ampleur des extrêmes.

- Tri : `2000, 2100, 2200, 2300, 15000` → valeur centrale = **`2200`**.
- `2200` décrit bien mieux « le salaire typique ».

> **Repère —** moyenne ≈ médiane → distribution équilibrée. Moyenne ≫ médiane → quelques
> valeurs hautes tirent la moyenne (revenus, prix immobilier, paniers d'achat). Toujours
> **regarder les deux**.

## Quand utiliser quoi

| Situation | Préfère |
|---|---|
| Distribution symétrique, peu d'extrêmes | Moyenne |
| Salaires, prix, durées, données « à longue traîne » | Médiane |
| Communiquer « le client typique » | Médiane |
| Calculer un total / un coût global | Somme (puis moyenne) |

## Le calcul de la médiane

Deux cas selon l'effectif (`n`) :

- `n` **impair** : la valeur centrale après tri.
- `n` **pair** : la **moyenne des deux valeurs centrales**.

```ts
const sorted = [...values].sort((a, b) => a - b)
const mid = Math.floor(sorted.length / 2)
// pair -> moyenne des deux du milieu ; impair -> celle du milieu
```

> **À retenir —** la moyenne est une promesse fragile ; la médiane tient mieux face aux
> extrêmes. Avant de conclure « en moyenne… », vérifie si une poignée de valeurs ne fausse
> pas tout.
