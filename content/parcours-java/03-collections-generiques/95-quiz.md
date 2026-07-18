---
title: "Quiz — Collections & génériques"
type: quiz
questions:
  - prompt: |
      Quel type Java correspond le mieux à un tableau associatif PHP dont l'ordre
      d'insertion doit être préservé ?
    options:
      - |
        HashMap<K, V>
      - |
        LinkedHashMap<K, V>
      - |
        List<Map.Entry<K, V>>
    answer: 1
    tags: [map, collections]
    level: debutant
    explanation: |
      HashMap NE GARANTIT AUCUN ORDRE d'itération. Comme un tableau associatif PHP
      conserve toujours l'ordre d'insertion par défaut, LinkedHashMap est l'implémentation
      Java qui reproduit ce comportement.
  - prompt: |
      Que renvoie `prices.get("cherry")` si la clé "cherry" est absente d'une
      `Map<String, Double> prices` ?
    options:
      - |
        Une exception NoSuchElementException
      - |
        null
      - |
        0.0 par défaut
    answer: 1
    tags: [map, null]
    level: debutant
    explanation: |
      Map.get() sur une clé absente renvoie null, sans exception — attention si tu
      assignes ce résultat à un type primitif (double au lieu de Double), l'unboxing
      d'un null lèvera une NullPointerException.
  - prompt: |
      Pourquoi les génériques Java (`List<String>`) sont-ils plus sûrs qu'un tag
      PHPStan `@param array<string>` ?
    options:
      - |
        Les génériques Java sont plus rapides à l'exécution
      - |
        Les génériques sont vérifiés par le compilateur, pas seulement par un outil d'analyse statique optionnel
      - |
        Il n'y a en réalité aucune différence de garantie
    answer: 1
    tags: [generiques, typage]
    level: intermediaire
    explanation: |
      PHPStan/Psalm n'est qu'un outil d'analyse statique optionnel, ignoré par le moteur
      PHP au runtime : rien n'empêche un array PHP annoté de recevoir malgré tout un
      élément incompatible. Les génériques Java sont vérifiés par le COMPILATEUR
      lui-même : le code ne compile pas s'il viole le type déclaré.
  - prompt: |
      Que se passe-t-il si tu utilises un "raw type" (`List` sans `<T>`) et que tu
      appelles `.get()` avec un cast vers un mauvais type ?
    options:
      - |
        Une erreur à la compilation
      - |
        Une ClassCastException à l'exécution
      - |
        Rien, Java convertit automatiquement
    answer: 1
    tags: [generiques, raw-types]
    level: avance
    explanation: |
      Un raw type compile (pour compatibilité historique avec le code pré-Java 5), mais
      perd toute vérification de type. L'erreur n'apparaît qu'à l'exécution, sous forme de
      ClassCastException — exactement ce que les génériques sont censés éviter.
  - prompt: |
      Quel est le bon usage d'`Optional<T>` selon les conventions Java ?
    options:
      - |
        Comme type de paramètre de méthode, pour signaler un argument facultatif
      - |
        Comme type de retour de méthode, pour signaler qu'une valeur peut être absente
      - |
        Comme type d'élément dans une List, pour gérer les trous
    answer: 1
    tags: [optional, conventions]
    level: intermediaire
    explanation: |
      Optional est conçu comme type de RETOUR : il documente dans la signature qu'une
      méthode peut ne rien renvoyer. L'utiliser en paramètre, en champ de classe ou en
      élément de collection est un anti-pattern reconnu (complique sans bénéfice réel).
  - prompt: |
      Que fait `maybeEmail.get()` si `maybeEmail` est un `Optional<String>` vide ?
    options:
      - |
        Renvoie null
      - |
        Lève une NoSuchElementException
      - |
        Renvoie une chaîne vide ""
    answer: 1
    tags: [optional, exceptions]
    level: debutant
    explanation: |
      Appeler .get() sur un Optional vide lève une NoSuchElementException — c'est
      exactement le problème que Optional est censé éviter, juste déplacé. Préfère
      orElse(), ifPresent() ou map().
---
