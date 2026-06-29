---
title: "Fonctions (défauts, *args/**kwargs, lambda)"
type: lesson
---

## Le concept

Une fonction regroupe une logique réutilisable. On la définit avec `def`, on la documente avec des annotations de type, on en sort avec `return` :

```python
def saluer(nom: str, politesse: str = "Bonjour") -> str:
    return f"{politesse}, {nom} !"
```

- `politesse: str = "Bonjour"` est un **paramètre avec valeur par défaut** : on peut l'omettre à l'appel.
- On peut passer les arguments **par position** (`saluer("Ada")`) ou **par nom** (`saluer(nom="Ada")`). Les arguments nommés rendent l'appel auto-documenté.

## `*args`, `**kwargs` et `lambda`

Quand le nombre d'arguments est variable :

- **`*args`** capture les arguments **positionnels** restants dans un **tuple**.
- **`**kwargs`** capture les arguments **nommés** restants dans un **dict**.

```python
def somme(*nombres):        # somme(1, 2, 3) -> nombres = (1, 2, 3)
    return sum(nombres)

def config(**options):      # config(debug=True) -> options = {"debug": True}
    ...
```

Une **lambda** est une fonction anonyme d'une seule expression, surtout utile comme paramètre (`sorted(..., key=lambda x: ...)`).

> **Le piège n°1 des débutants : la valeur par défaut mutable.** `def f(x, panier=[])` partage **la même liste** entre tous les appels — un bug vicieux. La parade : `panier=None` puis `if panier is None: panier = []`.

```python
# Décomposition à l'appel : * étale une liste, ** étale un dict
def point(x, y, z):
    return (x, y, z)

coords = [1, 2, 3]
point(*coords)            # équivaut à point(1, 2, 3)

params = {"x": 1, "y": 2, "z": 3}
point(**params)           # équivaut à point(x=1, y=2, z=3)

# Une fonction est un objet : on peut la passer en argument
def appliquer(fn, valeur):
    return fn(valeur)

appliquer(str.upper, "ada")   # "ADA"
```

## Bac à sable

> Remplace panier=None par panier=[] (le mauvais réflexe) et relance ajouter('a') puis ajouter('b') pour voir la liste partagée grandir. Puis remets None.

```python
# Fonctions : paramètres, défauts, *args, **kwargs, lambda

def saluer(nom: str, politesse: str = "Bonjour") -> str:
    return f"{politesse}, {nom} !"

print(saluer("Ada"))                      # défaut "Bonjour"
print(saluer("Linus", politesse="Salut"))  # argument nommé

# *args : nombre variable d'arguments positionnels (reçus en tuple)
def somme(*nombres: int) -> int:
    total = 0
    for n in nombres:
        total += n
    return total

print("somme(1,2,3,4) =", somme(1, 2, 3, 4))

# **kwargs : nombre variable d'arguments nommés (reçus en dict)
def profil(**infos: str) -> None:
    for cle, valeur in infos.items():
        print(f"   {cle} = {valeur}")

print("profil :")
profil(nom="Ada", ville="Londres")

# lambda : petite fonction anonyme, idéale comme paramètre 'key'
nombres = [5, 2, 9, 1, 7]
print("trié décroissant :", sorted(nombres, key=lambda x: -x))

# PIÈGE : ne JAMAIS utiliser un objet muable comme valeur par défaut
def ajouter(item, panier=None):
    if panier is None:   # bon réflexe
        panier = []
    panier.append(item)
    return panier

print(ajouter("a"))   # ['a']
print(ajouter("b"))   # ['b']  (et NON ['a', 'b'] !)
```
