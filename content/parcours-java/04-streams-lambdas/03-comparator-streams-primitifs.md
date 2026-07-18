---
title: "Comparator, tri personnalisé & streams primitifs"
type: lesson
---

## Trier avec un `Comparator`

En PHP, trier avec un critère personnalisé passe par `usort($array, fn($a, $b) => ...)`.
En Java, l'équivalent est l'interface fonctionnelle `Comparator<T>`, combinable de façon
très lisible grâce à des méthodes statiques/par défaut fournies par le JDK :

```java
record Person(String name, int age) {}

List<Person> people = List.of(
    new Person("Bob", 30),
    new Person("Alice", 25),
    new Person("Charlie", 25)
);

List<Person> sorted = people.stream()
    .sorted(Comparator.comparing(Person::age)
        .thenComparing(Person::name))
    .collect(Collectors.toList());

// Sorted by age first, then by name for ties: Alice(25), Charlie(25), Bob(30)
```

> **PHP → Java.** `usort($people, fn($a, $b) => $a->age <=> $b->age ?: $a->name <=>
> $b->name)` (PHP) devient une chaîne lisible `Comparator.comparing(...).thenComparing(...)`
> en Java — plus verbeux, mais chaque critère de tri est nommé et isolé, plus facile à
> relire ou réordonner qu'une expression `<=>` composée.

```java
// Reverse order: easy to compose
List<Person> byAgeDesc = people.stream()
    .sorted(Comparator.comparing(Person::age).reversed())
    .collect(Collectors.toList());
```

## Les streams de primitifs : `IntStream`, `LongStream`, `DoubleStream`

Un `Stream<Integer>` classique **boxe** chaque entier en objet `Integer` — un coût réel
en mémoire et en performance sur de gros volumes. Java fournit des streams spécialisés
pour les primitifs, qui évitent cet autoboxing :

```java
int sum = IntStream.rangeClosed(1, 100)
    .filter(n -> n % 2 == 0)
    .sum();

System.out.println(sum);   // 2550 — sum of even numbers from 1 to 100

// Converting between a Stream<T> and an IntStream when needed:
int totalLength = names.stream()
    .mapToInt(String::length)   // Stream<String> -> IntStream
    .sum();
```

> **Passerelle.** PHP n'a pas cette distinction : un entier reste un entier, jamais
> « boxé » en objet à un coût mémoire différent. C'est une préoccupation **spécifiquement
> Java**, héritée de la distinction primitifs/objets vue au module 2 — à connaître, sans
> en abuser prématurément : n'optimise ce détail que si un profilage réel le justifie.

## Method references dans un pipeline réel

Combiner tri, filtre et transformation avec des références de méthode donne des
pipelines très lisibles une fois l'habitude prise :

```java
List<String> report = people.stream()
    .filter(p -> p.age() >= 18)
    .sorted(Comparator.comparing(Person::name))
    .map(Person::name)
    .collect(Collectors.toList());

System.out.println(report);   // [Alice, Bob, Charlie]
```

> 💡 **À retenir.** Une règle de lisibilité pragmatique : dès qu'un pipeline dépasse 4-5
> opérations chaînées, ou que la logique d'une étape dépasse une ligne, extrais-la dans
> une méthode nommée (`.filter(this::isAdult)` plutôt qu'une lambda multi-lignes en
> ligne). C'est le même réflexe qu'extraire un callback PHP complexe dans une méthode
> plutôt que de l'écrire inline dans un `array_filter`.

## À retenir

- `Comparator.comparing(...).thenComparing(...)` compose un tri multi-critères de façon
  lisible — l'équivalent d'un `usort` avec comparaison en cascade côté PHP.
- `IntStream`/`LongStream`/`DoubleStream` évitent l'autoboxing sur de gros volumes de
  primitifs ; `.mapToInt()`/`.boxed()` permettent de passer d'une forme à l'autre.
- Combine `filter`/`sorted`/`map` avec des **références de méthode** pour des pipelines
  concis et lisibles.
- Extrais une lambda multi-lignes en méthode nommée dès qu'elle nuit à la lisibilité du
  pipeline.
