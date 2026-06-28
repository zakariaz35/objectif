---
title: "Quiz — les bases"
type: quiz
questions:
  - prompt: "Quel est le type de la valeur lue dans un champ de fichier CSV avant toute conversion ?"
    options:
      - "int"
      - "float"
      - "str"
      - "bool"
    answer: 2
    explanation: "Tout ce qui sort d'un fichier texte (CSV inclus) est une chaîne (`str`). Il faut convertir explicitement avec `int(...)` ou `float(...)` avant de calculer."
  - prompt: "Que vaut `7 // 2` en Python ?"
    options:
      - "3.5"
      - "3"
      - "1"
      - "3.0"
    answer: 1
    explanation: "`//` est la division entière : elle renvoie `3`. `7 / 2` donnerait `3.5`, et `7 % 2` donnerait `1` (le reste)."
  - prompt: "Comment afficher le nombre `12543.6789` avec deux décimales et un séparateur de milliers ?"
    options:
      - "f\"{revenue:.2f,}\""
      - "f\"{revenue:,.2f}\""
      - "f\"{revenue:2f}\""
      - "f\"{revenue:thousands}\""
    answer: 1
    explanation: "La syntaxe est `{valeur:,.2f}` → `12,543.68`. La virgule active le séparateur de milliers, `.2f` fixe deux décimales."
  - prompt: "Laquelle de ces valeurs est considérée comme « fausse » (falsy) dans une condition ?"
    options:
      - "\"0\""
      - "[0]"
      - "[]"
      - "-1"
    answer: 2
    explanation: "Une liste vide `[]` est falsy. En revanche `\"0\"` (chaîne non vide), `[0]` (liste à un élément) et `-1` (entier non nul) sont tous vrais."
  - prompt: "Que renvoie `\"a,b,,c\".split(\",\")` ?"
    options:
      - "['a', 'b', 'c']"
      - "['a', 'b', '', 'c']"
      - "['a,b,,c']"
      - "['a', 'b', 'c', '']"
    answer: 1
    explanation: "`split(\",\")` découpe à chaque virgule sans fusionner les séparateurs : on obtient une chaîne vide entre `b` et `c`. (Seul `split()` sans argument fusionne les espaces multiples.)"
---

Un point rapide sur les bases avant d'attaquer les collections.
