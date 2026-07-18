---
title: "Exercice — nettoyer une ligne de données"
type: exercise
---

## Énoncé

Une ligne brute, telle qu'on la reçoit d'un fichier mal formaté, ressemble à ça :

```
"  Notebook ; Office Supplies ; 1 299,90 "
```

Les champs sont séparés par des `;`, avec des espaces parasites, et le prix utilise une **virgule** décimale et un **espace** comme séparateur de milliers.

Écris une fonction `parse_line(line)` qui renvoie un **tuple** `(product, category, price)` où :

- `product` et `category` sont **nettoyés** (sans espaces autour) et en **minuscules** ;
- `price` est un `float` correctement converti.

Exemple attendu :

```python
parse_line("  Notebook ; Office Supplies ; 1 299,90 ")
# ("notebook", "office supplies", 1299.9)
```

> Python ne s'exécute pas dans le navigateur : écris ta solution à la main, puis déroule la correction. (Un runner Pyodide pourra la rendre interactive plus tard.)

<!--correction-->

## Correction

```python
def parse_line(line):
    product, category, raw_price = line.split(";")

    product = product.strip().lower()
    category = category.strip().lower()

    # Remove the thousands space, then turn the decimal comma into a dot.
    price = float(raw_price.strip().replace(" ", "").replace(",", "."))

    return product, category, price
```

On découpe d'abord sur `;` en trois morceaux (décomposition directe dans trois variables). On normalise les libellés avec `strip().lower()`. Pour le prix, on retire l'espace des milliers puis on remplace la virgule par un point avant de convertir en `float`.

Variante plus défensive si le nombre de champs n'est pas garanti :

```python
def parse_line(line):
    parts = [p.strip() for p in line.split(";")]
    product, category, raw_price = parts
    price = float(raw_price.replace(" ", "").replace(",", "."))
    return product.lower(), category.lower(), price
```
