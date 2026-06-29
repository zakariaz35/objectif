---
title: "Typing & f-strings"
type: lesson
---

## Typing : documenter et faire vérifier

Les **annotations de type** décrivent ce qu'une fonction attend et renvoie. Python ne les impose pas à l'exécution, mais elles documentent ton code et permettent à un vérificateur (`mypy`, `pyright`) de **détecter les erreurs avant de lancer le programme**.

```python
def moyenne(notes: list[float]) -> float:
    return sum(notes) / len(notes)
```

Notations courantes :

- `list[float]`, `dict[str, int]`, `tuple[int, str]` — conteneurs **paramétrés**.
- `int | None` — une **union** : « un `int` **ou** `None` » (l'ancienne forme `Optional[int]` y équivaut).
- `from __future__ import annotations` en tête de fichier rend cette syntaxe disponible partout et évite des coûts d'évaluation.

## f-strings : le formatage moderne

Une **f-string** (préfixe `f`) interpole des expressions directement dans la chaîne, entre accolades `{}`. C'est la façon recommandée de construire du texte :

```python
nom = "Ada"
f"Bonjour {nom} !"          # "Bonjour Ada !"
f"{2 + 3 = }"               # "2 + 3 = 5"  (debug : expr ET valeur)
```

Le **mini-langage de format** (après `:`) est très riche :

| Format | Effet | Exemple |
|--------|-------|---------|
| `:.2f` | 2 décimales | `1234.57` |
| `:,` | séparateur de milliers | `1,000,000` |
| `:.1%` | pourcentage | `87.3%` |
| `:>10` / `:<10` / `:^10` | alignement sur 10 colonnes | `···Ada` |
| `:#x` | hexadécimal | `0xff` |

> **Le suffixe `=` en debug** (`f"{x = }"`) affiche à la fois l'expression et sa valeur — un raccourci précieux pendant le développement.

```python
from typing import Optional   # forme historique

# Ces deux signatures sont équivalentes :
def f(x: Optional[str]) -> str: ...
def g(x: str | None) -> str: ...   # forme moderne, préférée

# Annoter des variables, pas seulement des fonctions
compteur: int = 0
labels: dict[str, int] = {}

# f-strings : largeur dynamique et imbrication
largeur = 8
valeur = 3.14159
f"{valeur:>{largeur}.2f}"   # alignée à droite sur 8 colonnes : "    3.14"
```

## Bac à sable

> Ajoute un champ de format : par exemple f"{solde:>12,.2f}" (aligné, milliers, 2 décimales), ou affiche un f"{moyenne([10,20]) = }" en mode debug.

```python
# Typing (annotations) + f-strings (formatage)
from __future__ import annotations   # syntaxe de types moderne, robuste

def moyenne(notes: list[float]) -> float:
    return sum(notes) / len(notes)

print("moyenne :", moyenne([12.0, 15.0, 9.0]))

# Union de types : « un int OU None » s'écrit int | None
def trouver(table: dict[str, int], cle: str) -> int | None:
    return table.get(cle)

stock = {"pomme": 12}
print("trouvé :", trouver(stock, "pomme"))
print("absent :", trouver(stock, "kiwi"))   # None, proprement typé

print("--- f-strings : le couteau suisse du formatage ---")
nom = "Ada"
solde = 1234.5678
print(f"Bonjour {nom}, solde = {solde:.2f} EUR")   # 2 décimales
print(f"aligné droite  : |{nom:>10}|")
print(f"aligné gauche  : |{nom:<10}|")
print(f"centré         : |{nom:^10}|")
print(f"milliers       : {1_000_000:,}")
print(f"pourcentage    : {0.8734:.1%}")
print(f"hexadécimal    : {255:#x}")

# f-string debug (=) : imprime l'expression ET sa valeur (super pratique)
x = 42
print(f"{x = }")
print(f"{x * 2 = }")

# Expression directement dans la f-string
items = ["a", "b", "c"]
print(f"{len(items)} éléments : {', '.join(items)}")
```
