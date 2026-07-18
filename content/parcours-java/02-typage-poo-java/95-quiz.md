---
title: "Quiz — Typage statique & POO façon Java"
type: quiz
questions:
  - prompt: |
      Quand une erreur de type est-elle détectée en Java pour un appel comme
      `total("abc", 5)` sur une méthode `int total(int a, int b)` ?
    options:
      - |
        À l'exécution, quand la méthode est réellement appelée
      - |
        À la compilation, avant même de lancer le programme
      - |
        Jamais : Java convertit automatiquement la chaîne en nombre
    answer: 1
    tags: [typage, compilation]
    level: debutant
    explanation: |
      Contrairement au typage PHP (vérifié au runtime, à l'appel), le typage Java est
      vérifié à la COMPILATION : ce code ne compile tout simplement pas, l'erreur apparaît
      dans l'IDE avant toute exécution.
  - prompt: |
      Que se passe-t-il si tu fais `int x = wrapped;` alors que `Integer wrapped = null;` ?
    options:
      - |
        x vaut 0 par défaut, sans erreur
      - |
        Une NullPointerException est levée à l'exécution (unboxing d'un null)
      - |
        Une erreur de compilation empêche ce code de compiler
    answer: 1
    tags: [wrapper-classes, autoboxing, null]
    level: avance
    explanation: |
      L'unboxing automatique (Integer -> int) d'un wrapper null lève une
      NullPointerException à l'exécution — le compilateur ne peut pas détecter ce cas,
      c'est un piège classique des wrapper classes.
  - prompt: |
      `var name = "Ada";` permet-il d'écrire ensuite `name = 42;` ?
    options:
      - |
        Oui, var rend la variable dynamiquement typée comme en PHP
      - |
        Non : le type String est inféré puis figé, comme si tu avais écrit "String name"
      - |
        Oui, mais uniquement si name n'a jamais été affiché avant
    answer: 1
    tags: [var, inference-de-type]
    level: debutant
    explanation: |
      "var" n'est qu'une inférence de type au moment de la compilation : le type déduit
      (ici String) reste figé pour toute la durée de vie de la variable. Ce n'est pas du
      typage dynamique.
  - prompt: |
      Que génère automatiquement un `record` Java (contrairement à une classe manuelle) ?
    options:
      - |
        Uniquement le constructeur
      - |
        Le constructeur, les accesseurs, equals(), hashCode() et toString()
      - |
        Rien : record est juste un raccourci syntaxique sans génération de code
    answer: 1
    tags: [record, immutabilite]
    level: intermediaire
    explanation: |
      Un record génère automatiquement le constructeur, les accesseurs (nommés comme les
      champs, sans préfixe get), equals(), hashCode() et toString() basés sur les
      composants déclarés — le pendant Java des propriétés promues readonly de PHP 8.1+.
  - prompt: |
      Pourquoi une hiérarchie `sealed` est-elle utile avec un `switch` de pattern matching ?
    options:
      - |
        Elle accélère l'exécution du switch au runtime
      - |
        Le compilateur connaît la liste fermée des cas possibles et vérifie l'exhaustivité
      - |
        Elle est obligatoire pour utiliser un switch sur des objets
    answer: 1
    tags: [sealed, pattern-matching]
    level: avance
    explanation: |
      "sealed" liste explicitement les classes autorisées à implémenter/hériter. Le
      compilateur peut alors vérifier qu'un switch couvre bien TOUS les cas possibles,
      sans avoir besoin d'un "default" — une exhaustivité garantie à la compilation.
  - prompt: |
      Que renvoie `new String("hi") == new String("hi")` en Java ?
    options:
      - |
        true, car les deux chaînes ont le même contenu
      - |
        false, car == compare l'identité des objets, pas leur valeur
      - |
        Une erreur de compilation
    answer: 1
    tags: [equals, egalite-objets]
    level: intermediaire
    explanation: |
      En Java, == sur des objets compare TOUJOURS l'identité (la même case mémoire),
      jamais la valeur — même pour deux String au contenu identique créées avec "new".
      Il faut utiliser .equals() pour comparer le contenu. C'est l'inverse de
      l'intuition héritée de PHP.
---
