---
title: "Lire et écrire des fichiers"
type: lesson
---

# Ouvrir des fichiers avec `with`

Toute analyse commence par **lire un fichier**. La bonne pratique en Python est le bloc `with open(...)`, qui ferme automatiquement le fichier à la fin (même en cas d'erreur).

## Lire un fichier texte

```python
with open("notes.txt", encoding="utf-8") as f:
    content = f.read()        # entire content as a single string
print(content)
```

> **Toujours préciser `encoding="utf-8"`** : c'est la source numéro un de bugs sur des données avec accents ou caractères spéciaux.

## Lire ligne par ligne

Pour un gros fichier, on itère ligne par ligne plutôt que tout charger d'un coup.

```python
with open("notes.txt", encoding="utf-8") as f:
    for line in f:
        print(line.strip())    # strip() removes the trailing \n
```

## Écrire dans un fichier

Le mode `"w"` crée (ou écrase) le fichier ; `"a"` ajoute à la fin.

```python
with open("report.txt", "w", encoding="utf-8") as f:
    f.write("Total: 56.49 €\n")
    f.write("Items: 3\n")
```

| Mode | Effet |
|---|---|
| `"r"` | lecture (défaut) |
| `"w"` | écriture — **écrase** le fichier |
| `"a"` | ajout en fin de fichier |

## Pourquoi `with` plutôt que `open` seul ?

Sans `with`, il faut penser à `f.close()` — et si une erreur survient avant, le fichier reste ouvert. Le `with` garantit la fermeture.

```python
# Avoid
f = open("notes.txt")
content = f.read()
f.close()              # skipped if an exception is raised above

# Recommended
with open("notes.txt", encoding="utf-8") as f:
    content = f.read()
# file is guaranteed to be closed here
```

## Un CSV est un fichier texte… mais ne le parse pas à la main

On *pourrait* lire un CSV ligne à ligne et faire `line.split(",")`. Mais ça casse dès qu'une valeur contient une virgule entre guillemets (`"Paris, France"`). C'est exactement le problème que le module `csv` règle pour nous — c'est l'objet de la leçon suivante.

> **À retenir —** `with open(path, encoding="utf-8") as f:` est le motif standard : fermeture automatique. Itère ligne par ligne pour les gros fichiers, et **ne parse jamais un CSV à la main** — utilise le module `csv`.
