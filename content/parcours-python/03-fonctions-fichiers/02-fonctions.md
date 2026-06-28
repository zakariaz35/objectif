---
title: "Fonctions"
type: lesson
---

# Les fonctions

Une fonction encapsule un traitement réutilisable. En data, on factorise les calculs récurrents (nettoyer une valeur, calculer un KPI…) pour ne pas se répéter.

## Définir et appeler

```python
def average(values):
    return sum(values) / len(values)

average([10, 20, 30])    # 20.0
```

Le `return` renvoie le résultat. Sans `return`, la fonction renvoie `None`.

## Plusieurs paramètres

```python
def total_with_tax(amount, rate):
    return amount * (1 + rate)

total_with_tax(100, 0.20)    # 120.0
```

## Arguments par défaut

Donner une valeur par défaut rend un paramètre **optionnel**.

```python
def total_with_tax(amount, rate=0.20):
    return amount * (1 + rate)

total_with_tax(100)         # 120.0   → utilise rate=0.20
total_with_tax(100, 0.05)   # 105.0   → on surcharge
```

> **Piège classique —** ne jamais utiliser une **liste** (ou un dict) comme valeur par défaut mutable (`def f(items=[])`). Elle serait partagée entre les appels. Utilise `None` puis crée la liste dans le corps :
>
> ```python
> def f(items=None):
>     if items is None:
>         items = []
>     ...
> ```

## Arguments nommés (keyword arguments)

On peut passer les arguments par leur nom, dans n'importe quel ordre. C'est plus lisible quand il y en a plusieurs.

```python
def report(product, amount, currency="€"):
    return f"{product}: {amount:.2f} {currency}"

report(amount=19.99, product="notebook")          # "notebook: 19.99 €"
report("lamp", 34.0, currency="$")                # "lamp: 34.00 $"
```

## Renvoyer plusieurs valeurs

On renvoie un tuple, qu'on décompose à la réception.

```python
def stats(values):
    return min(values), max(values), sum(values) / len(values)

low, high, avg = stats([10, 20, 30])
print(low, high, avg)     # 10 30 20.0
```

## Une docstring pour documenter

Une chaîne en première ligne du corps décrit la fonction (apparaît dans l'aide).

```python
def average(values):
    """Return the average of a list of numbers."""
    return sum(values) / len(values)
```

> **À retenir —** une fonction = un traitement nommé et réutilisable. Arguments par défaut pour les options (jamais de mutable comme défaut), arguments nommés pour la lisibilité, tuple pour renvoyer plusieurs valeurs.
