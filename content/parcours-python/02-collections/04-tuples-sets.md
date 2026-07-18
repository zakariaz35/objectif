---
title: "Tuples & sets"
type: lesson
---

# Tuples et sets

Deux collections plus spécialisées, mais très utiles au quotidien.

## Tuple : une séquence figée

Un tuple ressemble à une liste, mais il est **immuable** (on ne peut plus le modifier après création). On l'utilise pour des regroupements fixes — typiquement une paire `(clé, valeur)` ou des coordonnées.

```python
point = (48.85, 2.35)      # latitude, longitude
point[0]                   # 48.85
# point[0] = 0.0           # ERROR: a tuple is immutable
```

### Décomposition (unpacking)

C'est l'usage le plus fréquent : éclater un tuple en plusieurs variables.

```python
latitude, longitude = point
print(latitude)     # 48.85

# Swap two variables in one line
a, b = 1, 2
a, b = b, a         # a is 2, b is 1
```

On le retrouve dans `for key, value in sale.items():` — chaque élément est un tuple décomposé à la volée.

## Set : des valeurs uniques

Un set est une collection **non ordonnée** sans doublon. Parfait pour répondre à « quelles sont les valeurs **distinctes** ? ».

```python
categories = ["office", "home", "office", "garden", "home"]

unique = set(categories)        # {"office", "home", "garden"}
print(len(unique))              # 3  → number of distinct categories
```

### Opérations ensemblistes

```python
a = {"office", "home"}
b = {"home", "garden"}

a & b      # {"home"}            → intersection (present in both)
a | b      # {"office","home","garden"} → union
a - b      # {"office"}          → difference
```

### Tester l'appartenance — très rapide

Vérifier `x in mon_set` est nettement plus rapide que sur une grande liste.

```python
known_products = {"notebook", "pen", "lamp"}
"pen" in known_products      # True
```

> **À retenir —** le **tuple** est une séquence figée (idéal pour le unpacking et les paires). Le **set** stocke des valeurs uniques : `set(liste)` pour dédupliquer, `len(set(...))` pour compter les valeurs distinctes, `in` pour des tests d'appartenance rapides.
