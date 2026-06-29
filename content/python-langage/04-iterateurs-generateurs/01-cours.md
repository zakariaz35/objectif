---
title: "Itérateurs & générateurs"
type: lesson
---

## Le concept

Tout ce que tu parcours avec `for` est **itérable**. Sous le capot, Python obtient un **itérateur** (via `__iter__`) puis appelle `__next__` jusqu'à ce qu'il lève `StopIteration`.

Tu peux écrire un itérateur à la main, mais c'est verbeux. La voie royale, c'est le **générateur** : une fonction qui utilise `yield` au lieu de `return`.

```python
def compte_a_rebours(n):
    while n > 0:
        yield n      # renvoie une valeur PUIS met la fonction en pause
        n -= 1

list(compte_a_rebours(3))   # [3, 2, 1]
```

Chaque `yield` **suspend** la fonction et renvoie une valeur ; au `next` suivant, l'exécution **reprend exactement où elle s'était arrêtée**, en conservant ses variables locales.

## Pourquoi : la paresse, c'est de l'efficacité

Un générateur est **paresseux** : il produit les valeurs **une à une, à la demande**, sans jamais matérialiser toute la séquence en mémoire.

```python
# Construit une liste d'un million d'éléments en mémoire :
sum([x * x for x in range(1_000_000)])

# Ne garde qu'une valeur à la fois (expression génératrice) :
sum(x * x for x in range(1_000_000))
```

Conséquences pratiques :

- On peut représenter des séquences **infinies** (`fibonacci()`) et n'en consommer que le début.
- On traite des fichiers ou flux **énormes** sans saturer la RAM.
- On compose des **pipelines** paresseux (un générateur qui consomme un autre générateur).

> **`enumerate`** (index + valeur) et **`zip`** (parcours parallèle) sont les compagnons indispensables de toute boucle.

```python
# Liste vs expression génératrice
[x * x for x in range(5)]    # list : [0, 1, 4, 9, 16] (tout en mémoire)
(x * x for x in range(5))    # generator : produit à la demande

# Pipeline paresseux : un générateur en alimente un autre
def pairs(it):
    for x in it:
        if x % 2 == 0:
            yield x

list(pairs(range(10)))       # [0, 2, 4, 6, 8]

# itertools : briques d'itération avancées
import itertools
list(itertools.islice(itertools.count(0, 2), 4))   # [0, 2, 4, 6]
```

## Bac à sable

> Écris un générateur pairs(it) qui ne laisse passer que les nombres pairs, puis fais list(pairs(compte_a_rebours(10))).

```python
# Itérateurs & générateurs : produire des valeurs à la demande

# 1) Itérateur "à la main" : __iter__ + __next__
class Compteur:
    def __init__(self, limite: int) -> None:
        self.limite = limite
        self.n = 0

    def __iter__(self) -> "Compteur":
        return self

    def __next__(self) -> int:
        if self.n >= self.limite:
            raise StopIteration   # signale la fin
        self.n += 1
        return self.n

print("itérateur custom :", list(Compteur(4)))

# 2) Générateur : beaucoup plus simple, avec 'yield'
def compte_a_rebours(n: int):
    while n > 0:
        yield n          # met en pause, renvoie une valeur, reprend ici
        n -= 1

print("générateur       :", list(compte_a_rebours(5)))

# 3) Générateur infini + consommation paresseuse
def fibonacci():
    a, b = 0, 1
    while True:          # infini, mais on n'en prend que ce qu'on veut
        yield a
        a, b = b, a + b

gen = fibonacci()
premiers = [next(gen) for _ in range(10)]
print("10 Fibonacci     :", premiers)

# 4) Expression génératrice : mémoire constante (pas de liste intermédiaire)
somme = sum(x * x for x in range(1, 1001))
print("somme carrés     :", somme)

# 5) Outils d'itération du quotidien
for i, lettre in enumerate(["a", "b", "c"], start=1):
    print(f"   {i}: {lettre}")
print("zip :", list(zip([1, 2, 3], ["un", "deux", "trois"])))
```
