---
title: "Conditions & boucles"
type: lesson
---

# Conditions et boucles

C'est le cœur de toute logique de traitement : décider, et répéter. En data, on s'en sert pour catégoriser des valeurs et parcourir des relevés.

## Conditions : `if` / `elif` / `else`

L'indentation **fait partie de la syntaxe** en Python (4 espaces, pas d'accolades).

```python
amount = 120

if amount >= 100:
    tier = "high"
elif amount >= 50:
    tier = "medium"
else:
    tier = "low"

print(tier)   # "high"
```

Les opérateurs de comparaison : `==`, `!=`, `<`, `<=`, `>`, `>=`. Les opérateurs logiques s'écrivent en toutes lettres : `and`, `or`, `not`.

```python
if amount > 0 and tier == "high":
    print("big sale")
```

### Ce qui est « faux » (falsy)

Une condition n'a pas besoin d'être un booléen. Sont considérés comme faux : `0`, `0.0`, `""`, `[]`, `{}`, `None`. Tout le reste est vrai.

```python
readings = []
if not readings:          # empty list → falsy
    print("no data")
```

## Boucle `for` : parcourir une collection

```python
amounts = [12.0, 50.0, 120.0]

for amount in amounts:
    print(amount)
```

### `range` : répéter / générer des nombres

```python
for i in range(3):        # 0, 1, 2
    print(i)

for i in range(1, 4):     # 1, 2, 3  (start inclusive, end exclusive)
    print(i)
```

### `enumerate` : index + valeur

Très utile pour numéroter des lignes.

```python
products = ["pen", "notebook", "eraser"]

for index, product in enumerate(products):
    print(index, product)
# 0 pen
# 1 notebook
# 2 eraser
```

## Boucle `while` : tant que…

À réserver aux cas où l'on ne connaît pas le nombre d'itérations à l'avance.

```python
balance = 100
while balance > 0:
    balance -= 30
print(balance)   # -20
```

## Accumuler dans une boucle

Le motif le plus courant en data : initialiser, puis accumuler.

```python
total = 0.0
for amount in amounts:
    total += amount        # accumulate
print(total)               # 182.0
```

> **À retenir —** `for` pour parcourir une collection (le cas standard en data), `while` quand le nombre de tours est inconnu. `enumerate` donne l'index, `range` génère une séquence de nombres.
