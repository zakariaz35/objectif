---
title: "Lambdas & interfaces fonctionnelles"
type: lesson
---

## Les closures PHP, en plus contraint

PHP a les fonctions anonymes (`function() {}`) et les fonctions fléchées
(`fn($x) => $x * 2`). Java a l'équivalent : les **expressions lambda** (Java 8+) — mais
avec une contrainte propre au typage statique : une lambda **doit toujours correspondre à
une interface** attendue (dite « interface fonctionnelle »).

```java
// A lambda expression: takes an int, returns an int
Function<Integer, Integer> doubleIt = x -> x * 2;

System.out.println(doubleIt.apply(21));   // 42
```

> **PHP → Java.** `fn($x) => $x * 2` (PHP) et `x -> x * 2` (Java) se lisent presque
> pareil. La différence : en PHP, cette fonction fléchée n'a **aucun type déclaré** de
> "forme de fonction" — c'est juste une `Closure`. En Java, `doubleIt` a un **type précis**,
> `Function<Integer, Integer>` (« prend un `Integer`, renvoie un `Integer` »), vérifié à
> la compilation.

## Interface fonctionnelle : une seule méthode abstraite

Une **interface fonctionnelle** est une interface qui ne déclare **qu'une seule** méthode
abstraite — c'est précisément la forme qu'une lambda peut « remplir ». Le JDK en fournit
plusieurs prêtes à l'emploi dans `java.util.function` :

| Interface | Signature | Usage typique |
|---|---|---|
| `Function<T, R>` | `R apply(T t)` | transformer une valeur en une autre |
| `Predicate<T>` | `boolean test(T t)` | tester une condition (filtre) |
| `Consumer<T>` | `void accept(T t)` | consommer une valeur (effet de bord) |
| `Supplier<T>` | `T get()` | fournir une valeur (sans argument) |
| `Runnable` | `void run()` | une action sans argument ni retour |

```java
Predicate<String> isEmpty = s -> s.isEmpty();
Consumer<String> print = s -> System.out.println("Got: " + s);
Supplier<String> greeting = () -> "Hello!";

System.out.println(isEmpty.test(""));    // true
print.accept("data");                     // "Got: data"
System.out.println(greeting.get());       // "Hello!"
```

> **Réflexe à prendre.** Tu peux aussi déclarer ta **propre** interface fonctionnelle
> avec `@FunctionalInterface` (l'annotation n'est pas obligatoire mais fait échouer la
> compilation si tu ajoutes par erreur une deuxième méthode abstraite — un garde-fou
> utile).

```java
@FunctionalInterface
public interface Validator<T> {
    boolean validate(T value);
}

Validator<String> notBlank = value -> !value.isBlank();
```

## Method references : `::` en remplacement d'une lambda triviale

Quand une lambda se contente d'appeler une méthode existante, une **référence de
méthode** (`::`) est plus concise et souvent plus lisible :

```java
List<String> names = List.of("charlie", "alice", "bob");

// Lambda form
names.forEach(name -> System.out.println(name));

// Equivalent method reference — same effect, less noise
names.forEach(System.out::println);

// Static method reference
Function<String, Integer> parse = Integer::parseInt;

// Instance method reference on an arbitrary object of the type
Function<String, Integer> length = String::length;

// Constructor reference
Supplier<ArrayList<String>> factory = ArrayList::new;
```

> **Passerelle.** PHP 8.1 a introduit une syntaxe comparable : les **first-class callable
> syntax** (`strlen(...)`), qui transforme une fonction nommée en valeur appelable sans
> passer par une closure explicite. `Integer::parseInt` (Java) et `strlen(...)` (PHP)
> répondent à la même envie : éviter d'écrire une lambda triviale juste pour déléguer à
> une fonction/méthode existante.

## À retenir

- Une lambda Java **doit correspondre au type d'une interface fonctionnelle** (une seule
  méthode abstraite) — contrairement à une closure PHP, qui n'a pas de « forme » typée.
- `java.util.function` fournit les interfaces prêtes à l'emploi les plus courantes :
  `Function`, `Predicate`, `Consumer`, `Supplier`, `Runnable`.
- `@FunctionalInterface` sur tes propres interfaces fait échouer la compilation si elles
  perdent leur unicité de méthode abstraite.
- Une **référence de méthode** (`Classe::méthode`) remplace avantageusement une lambda
  qui ne fait que déléguer à une méthode existante — proche du first-class callable de
  PHP 8.1.
