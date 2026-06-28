---
title: "Listes : indexation, slicing, méthodes"
type: lesson
---

# Les listes

Une liste est une séquence **ordonnée** et **modifiable**. C'est la collection la plus courante pour stocker une série de valeurs ou d'enregistrements.

```python
amounts = [19.99, 2.50, 34.00, 12.00]
```

## Indexation

L'index commence à `0`. Les index négatifs partent de la fin.

```python
amounts[0]    # 19.99  → first
amounts[-1]   # 12.00  → last
amounts[-2]   # 34.00  → second to last
```

## Slicing : extraire une tranche

`liste[start:stop]` — `start` inclus, `stop` exclu. Outil de base pour prendre « les 3 premiers », « les 5 derniers »…

```python
amounts[0:2]    # [19.99, 2.50]   → indices 0 and 1
amounts[:2]     # [19.99, 2.50]   → from the start
amounts[2:]     # [34.00, 12.00]  → to the end
amounts[-2:]    # [34.00, 12.00]  → last 2 items
amounts[::-1]   # [12.0, 34.0, 2.5, 19.99] → reversed
```

## Méthodes utiles

```python
amounts.append(5.00)      # appends to the end
amounts.insert(0, 99.0)   # inserts at index 0
amounts.remove(2.50)      # removes the first occurrence of that value
last = amounts.pop()      # removes AND returns the last element
amounts.sort()            # sorts IN PLACE (modifies the list)
amounts.reverse()         # reverses in place
```

> **Attention —** `sort()` modifie la liste d'origine et renvoie `None`. Pour obtenir une **copie triée** sans toucher l'original, utilise `sorted(amounts)` (vu plus loin).

## Fonctions d'agrégation intégrées

Pas besoin d'une boucle pour ces opérations courantes :

```python
total = sum(amounts)
count = len(amounts)
average = total / count
biggest = max(amounts)
smallest = min(amounts)
```

## Tester l'appartenance

```python
if 19.99 in amounts:
    print("found")
```

## Copier sans surprise

Affecter une liste ne la copie **pas** : les deux noms pointent vers la même liste.

```python
a = [1, 2, 3]
b = a            # same list!
b.append(4)
print(a)         # [1, 2, 3, 4]  → a changed too

c = a.copy()     # real copy (or a[:])
```

> **À retenir —** indexation à partir de 0, slicing `[start:stop]` (stop exclu), `sum`/`len`/`max`/`min` pour agréger sans boucle. `sort()` modifie en place ; pour ne pas toucher l'original, utilise `sorted()`.
