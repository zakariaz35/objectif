---
title: "Chaînes de caractères pour la data"
type: lesson
---

# Manipuler les chaînes (côté data)

Les données arrivent presque toujours sous forme de **texte** : un CSV, une saisie, une cellule mal remplie. Savoir nettoyer et découper des chaînes, c'est 80 % du travail de préparation des données.

## Nettoyer : `strip`, `lower`, `upper`

```python
raw = "  Notebook  "

print(raw.strip())        # "Notebook"   → removes leading/trailing whitespace
print(raw.strip().lower()) # "notebook"
print("paris".upper())     # "PARIS"
```

> **Réflexe data —** `strip()` puis `lower()` pour normaliser une catégorie avant de la comparer. `"Office "` et `"office"` doivent être considérés comme la même valeur.

## Découper : `split`

`split` transforme une ligne en liste de morceaux. C'est exactement ce qui se passe en lisant un CSV à la main.

```python
line = "notebook;office;19.99"

parts = line.split(";")
print(parts)          # ['notebook', 'office', '19.99']

product, category, price = line.split(";")   # direct unpacking
print(product)        # notebook
```

Sans argument, `split()` découpe sur les espaces (et ignore les espaces multiples) :

```python
"  a   b  c ".split()   # ['a', 'b', 'c']
```

## Recoller : `join`

L'opération inverse de `split`. Pratique pour reconstruire une ligne ou afficher une liste.

```python
parts = ["notebook", "office", "19.99"]
print(";".join(parts))     # notebook;office;19.99
print(", ".join(parts))    # notebook, office, 19.99
```

## Remplacer et tester

```python
price = "1 299,90"
clean = price.replace(" ", "").replace(",", ".")
print(float(clean))        # 1299.9

email = "alice@example.com"
print(email.endswith(".com"))    # True
print("@" in email)              # True
print(email.startswith("alice")) # True
```

## Un nettoyage complet, étape par étape

```python
raw = "  Office Supplies ;  19,99  "

category, price = raw.split(";")
category = category.strip().lower()              # "office supplies"
price = float(price.strip().replace(",", "."))   # 19.99

print(f"{category} -> {price:.2f}")              # office supplies -> 19.99
```

> **À retenir —** `split` pour découper, `join` pour recoller, `strip`/`lower` pour normaliser, `replace` + `float` pour transformer un nombre « sale » (virgule, espaces) en valeur calculable. Ce sont tes outils de nettoyage de base.
