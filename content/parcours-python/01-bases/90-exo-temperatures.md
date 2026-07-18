---
title: "Exercice — moyenne de températures"
type: exercise
---

## Énoncé

On dispose d'une liste de relevés de températures (en degrés Celsius).
Écris une fonction `average_temperature(readings)` qui renvoie la **moyenne**
de ces relevés.

- Si la liste est **vide**, renvoie `0.0`.
- Utilise une boucle `for` (pas besoin de `sum`/`len` si tu veux t'entraîner sur les bases).

Exemple : `average_temperature([20.0, 22.0, 24.0])` doit renvoyer `22.0`.

> Python ne s'exécute pas dans le navigateur : écris ta solution à la main,
> puis déroule la correction pour comparer.

<!--correction-->

## Correction

```python
def average_temperature(readings):
    if not readings:
        return 0.0

    total = 0.0
    for value in readings:
        total += value

    return total / len(readings)
```

On gère d'abord le cas de la liste vide pour éviter une division par zéro.
Ensuite, on accumule les valeurs dans `total`, puis on divise par le nombre de
relevés. Une version plus courte utiliserait directement `sum(readings) / len(readings)`.
