---
title: "Quiz — fonctions & fichiers"
type: quiz
questions:
  - prompt: "Quel est le principal avantage du bloc `with open(...) as f:` ?"
    options:
      - "Il rend la lecture plus rapide"
      - "Il ferme automatiquement le fichier, même en cas d'erreur"
      - "Il convertit automatiquement les types"
      - "Il ignore les lignes vides"
    answer: 1
    explanation: "`with` garantit la fermeture du fichier à la sortie du bloc, y compris si une exception survient. C'est la raison pour laquelle on l'utilise toujours."
  - prompt: "Avec `csv.DictReader`, que devient chaque ligne du fichier ?"
    options:
      - "Une liste de valeurs indexées par position"
      - "Une chaîne de caractères"
      - "Un dictionnaire {nom_de_colonne: valeur}"
      - "Un tuple immuable"
    answer: 2
    explanation: "`DictReader` utilise la première ligne comme en-tête et produit, pour chaque ligne, un dictionnaire dont les clés sont les noms de colonnes. `csv.reader` (sans Dict) produit, lui, des listes."
  - prompt: "Après avoir lu un CSV, pourquoi convertir la colonne `amount` avec `float(...)` ?"
    options:
      - "Parce que les colonnes CSV sont lues comme des chaînes"
      - "Parce que float est plus rapide que int"
      - "Parce que DictReader corrompt les nombres"
      - "Ce n'est jamais nécessaire"
    answer: 0
    explanation: "Tout ce qui sort d'un fichier texte est une `str`. Sans conversion, `\"39.98\" + \"34.00\"` concaténerait des chaînes au lieu d'additionner des nombres."
  - prompt: "Quel défaut d'argument est un piège à éviter en Python ?"
    options:
      - "def f(x=0)"
      - "def f(x=None)"
      - "def f(items=[])"
      - "def f(rate=0.20)"
    answer: 2
    explanation: "Une valeur par défaut **mutable** comme `[]` est partagée entre tous les appels et accumule les modifications. On utilise `items=None` puis on crée la liste dans le corps."
  - prompt: "Que fait `from statistics import mean` ?"
    options:
      - "Importe tout le module statistics"
      - "Importe uniquement la fonction mean, accessible directement par mean(...)"
      - "Renomme statistics en mean"
      - "Crée une variable mean vide"
    answer: 1
    explanation: "`from module import nom` amène uniquement `nom` dans l'espace courant : on appelle `mean(...)` sans préfixe, contrairement à `import statistics` qui imposerait `statistics.mean(...)`."
---

Vérifie tes réflexes sur les fonctions, les modules et la lecture de fichiers.
