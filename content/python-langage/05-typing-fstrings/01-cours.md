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
f"Hello {nom} !"          # "Hello Ada !"
f"{2 + 3 = }"               # "2 + 3 = 5"  (debug: expr AND value)
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
from typing import Optional   # legacy form

# These two signatures are equivalent:
def f(x: Optional[str]) -> str: ...
def g(x: str | None) -> str: ...   # modern, preferred form

# Annotating variables, not just functions
compteur: int = 0
labels: dict[str, int] = {}

# f-strings: dynamic width and nesting
largeur = 8
valeur = 3.14159
f"{valeur:>{largeur}.2f}"   # right-aligned over 8 columns: "    3.14"
```

---

## Typing Python vs TypeScript vs PHP

| Concept | TypeScript | PHP 8 | Python |
|---------|-----------|-------|--------|
| Variable annotée | `let x: number` | `int $x` | `x: int` |
| Retour de fonction | `: string` | `: string` | `-> str` |
| Union | `number \| null` | `int\|null` | `int \| None` |
| Générique | `Array<string>` | `array` (partiel) | `list[str]` |
| Paramètre optionnel | `x?: string` | `?string $x` | `x: str \| None = None` |
| Inférence | oui (compilateur `tsc`) | non | non (le runtime ignore les annotations) |
| Vérificateur | `tsc` (intégré) | Psalm, PHPStan | `mypy`, `pyright` (outils externes) |
| Alias de type | `type ID = string` | `class-string` (Psalm) | `type ID = str` (Python 3.12+) |

> Python **n'impose pas** les types à l'exécution — `x: int = "hello"` ne lève aucune erreur sans vérificateur externe. Les annotations sont des **métadonnées** (accessibles via `__annotations__`), pas des contraintes runtime. Pour une validation à l'exécution, utilise `pydantic` ou `beartype`.

---

## Le GIL : un verrou à connaître

Le **GIL (Global Interpreter Lock)** est un mutex interne à CPython qui empêche plusieurs threads natifs d'exécuter du bytecode Python **en même temps**, même sur une machine multi-cœurs.

```python
# CPU-bound work: threads do NOT parallelize (GIL blocks concurrent bytecode)
# → use multiprocessing or concurrent.futures.ProcessPoolExecutor instead
import threading

def crunch(n: int) -> int:
    return sum(range(n))

t1 = threading.Thread(target=crunch, args=(10_000_000,))
t2 = threading.Thread(target=crunch, args=(10_000_000,))
t1.start(); t2.start(); t1.join(); t2.join()
# runs sequentially for CPU work despite two threads

# I/O-bound work: threads ARE useful (GIL is released during I/O wait)
import time

def wait_for_io():
    time.sleep(0.1)   # releases the GIL → true concurrency here
```

**Quand utiliser quoi :**

| Type de tâche | Outil recommandé | Raison |
|--------------|-----------------|--------|
| I/O réseau / fichiers | `threading` ou `asyncio` | Le GIL est relâché pendant l'attente I/O |
| Calcul CPU intensif | `multiprocessing` | Processus distincts, chacun son GIL |
| Librairies C (NumPy) | Threads possibles | NumPy relâche le GIL dans ses routines C |

> **Python 3.13+** introduit une option expérimentale `--disable-gil` (PEP 703). En production aujourd'hui, `multiprocessing` reste la référence pour le vrai parallélisme CPU.

## Bac à sable

> Ajoute un champ de format : par exemple f"{solde:>12,.2f}" (aligné, milliers, 2 décimales), ou affiche un f"{moyenne([10,20]) = }" en mode debug.

```python
# Typing (annotations) + f-strings (formatting)
from __future__ import annotations   # modern, robust type syntax

def moyenne(notes: list[float]) -> float:
    return sum(notes) / len(notes)

print("average:", moyenne([12.0, 15.0, 9.0]))

# Type union: "an int OR None" is written int | None
def trouver(table: dict[str, int], cle: str) -> int | None:
    return table.get(cle)

stock = {"apple": 12}
print("found  :", trouver(stock, "apple"))
print("missing:", trouver(stock, "kiwi"))   # None, properly typed

print("--- f-strings: the Swiss army knife of formatting ---")
nom = "Ada"
solde = 1234.5678
print(f"Hello {nom}, balance = {solde:.2f} EUR")   # 2 decimal places
print(f"right-aligned  : |{nom:>10}|")
print(f"left-aligned   : |{nom:<10}|")
print(f"centered       : |{nom:^10}|")
print(f"thousands      : {1_000_000:,}")
print(f"percentage     : {0.8734:.1%}")
print(f"hexadecimal    : {255:#x}")

# f-string debug (=): prints the expression AND its value (super handy)
x = 42
print(f"{x = }")
print(f"{x * 2 = }")

# Expression directly inside the f-string
items = ["a", "b", "c"]
print(f"{len(items)} items: {', '.join(items)}")
```
