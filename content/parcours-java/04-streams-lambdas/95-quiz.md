---
title: "Quiz — Streams & lambdas"
type: quiz
questions:
  - prompt: |
      Quelle interface fonctionnelle du JDK correspond à `x -> x.isEmpty()` (un test
      renvoyant un booléen) ?
    options:
      - |
        Function<T, R>
      - |
        Predicate<T>
      - |
        Supplier<T>
    answer: 1
    tags: [lambdas, interfaces-fonctionnelles]
    level: debutant
    explanation: |
      Predicate<T> déclare "boolean test(T t)" — c'est l'interface fonctionnelle adaptée
      à un test renvoyant un booléen. Function<T, R> transforme une valeur en une autre ;
      Supplier<T> ne prend aucun argument et fournit une valeur.
  - prompt: |
      Que se passe-t-il si on appelle `stream.count()` après avoir déjà consommé
      `stream` via `stream.collect(Collectors.toList())` ?
    options:
      - |
        Le count() fonctionne normalement sur le même stream
      - |
        Une IllegalStateException est levée : le stream a déjà été consommé
      - |
        Le stream recommence son pipeline depuis le début automatiquement
    answer: 1
    tags: [stream, pipeline]
    level: intermediaire
    explanation: |
      Un Stream ne se parcourt qu'une seule fois. Une deuxième opération terminale sur
      un stream déjà consommé lève une IllegalStateException — contrairement à
      array_map/array_filter en PHP qui sont eager et renvoient un nouveau tableau
      réutilisable à volonté.
  - prompt: |
      Quand les opérations intermédiaires d'un Stream (`.filter()`, `.map()`) sont-elles
      réellement exécutées ?
    options:
      - |
        Immédiatement, dès leur appel
      - |
        Seulement quand une opération terminale est appelée (collect, reduce, forEach...)
      - |
        Jamais : elles ne servent qu'à décrire l'intention, sans exécution réelle
    answer: 1
    tags: [stream, evaluation-paresseuse]
    level: intermediaire
    explanation: |
      Un Stream est paresseux : les opérations intermédiaires (filter, map, sorted...)
      ne s'exécutent qu'au moment où une opération TERMINALE (collect, reduce, forEach,
      count...) est invoquée, qui déclenche tout le pipeline en une passe.
  - prompt: |
      Pourquoi préférer un `IntStream` à un `Stream<Integer>` sur un gros volume de
      nombres ?
    options:
      - |
        IntStream a une syntaxe plus courte, sans autre différence
      - |
        IntStream évite l'autoboxing de chaque entier en objet Integer
      - |
        Stream<Integer> ne supporte pas .sum()
    answer: 1
    tags: [streams-primitifs, performance]
    level: avance
    explanation: |
      Un Stream<Integer> boxe chaque entier en objet Integer, un coût mémoire réel sur
      un gros volume. IntStream (et LongStream/DoubleStream) manipulent directement les
      primitifs, sans ce coût — une préoccupation spécifiquement Java, absente en PHP.
  - prompt: |
      Quelle est l'équivalence la plus proche de `Integer::parseInt` en PHP 8.1 ?
    options:
      - |
        Le null coalescing operator ??
      - |
        La first-class callable syntax, ex. strlen(...)
      - |
        Les traits
    answer: 1
    tags: [method-references, php-vs-java]
    level: intermediaire
    explanation: |
      Les method references Java (Classe::methode) et la first-class callable syntax de
      PHP 8.1 (strlen(...)) répondent au même besoin : transformer une fonction/méthode
      nommée en valeur appelable, sans écrire une lambda triviale de délégation.
  - prompt: |
      Comment trier une liste de `Person` d'abord par âge, puis par nom en cas d'égalité ?
    options:
      - |
        Comparator.comparing(Person::age).thenComparing(Person::name)
      - |
        Comparator.comparing(Person::age).or(Person::name)
      - |
        Comparator.sort(Person::age, Person::name)
    answer: 0
    tags: [comparator, tri]
    level: intermediaire
    explanation: |
      Comparator.comparing(critère1).thenComparing(critère2) compose un tri
      multi-critères : le second critère ne départage que les éléments égaux selon le
      premier. C'est l'équivalent lisible d'un usort avec comparaison en cascade en PHP.
---
