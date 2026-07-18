---
title: "Les génériques : pourquoi <T> partout"
type: lesson
---

## Le problème que les génériques résolvent

Avant les génériques (Java 5, 2004), une `List` stockait des `Object` génériques : rien
n'empêchait de mélanger des types incompatibles, et il fallait **caster** (convertir
explicitement) à chaque lecture, avec un risque d'erreur découverte tardivement :

```java
List rawList = new ArrayList();   // no type parameter: a "raw type", AVOID this
rawList.add("hello");
rawList.add(42);                   // compiles fine — but is this really intended?

String s = (String) rawList.get(1);  // ClassCastException AT RUNTIME: 42 is not a String!
```

Les génériques rendent ce type d'erreur **impossible dès la compilation** :

```java
List<String> safeList = new ArrayList<>();
safeList.add("hello");
// safeList.add(42);      // ❌ compile-time error: int cannot be converted to String

String s = safeList.get(0);   // no cast needed, guaranteed to be a String
```

> **PHP → Java.** PHPStan/Psalm te permettent d'écrire `@param array<int, string> $items`
> en doc-bloc — mais c'est une **annotation d'outillage statique**, ignorée par le moteur
> PHP lui-même à l'exécution : rien n'empêche `$items[] = 42;` de fonctionner en
> production. En Java, les génériques sont une **garantie du compilateur**, pas d'un
> outil tiers optionnel : `safeList.add(42)` ne compile tout simplement pas.

## Déclarer ses propres types génériques

```java
public class Box<T> {
    private T content;

    public void set(T content) {
        this.content = content;
    }

    public T get() {
        return content;
    }
}

Box<String> stringBox = new Box<>();
stringBox.set("hello");
String value = stringBox.get();   // no cast needed

Box<Integer> intBox = new Box<>();
intBox.set(42);
// intBox.set("oops");             // ❌ compile-time error
```

`T` est un **paramètre de type** — une convention de nommage (`T` pour *Type*, `E` pour
*Element*, `K`/`V` pour *Key*/*Value*) plutôt qu'une règle stricte, mais quasi
universellement respectée.

> 💡 **À retenir.** `Box<String>` et `Box<Integer>` partagent **une seule** classe
> `Box.class` compilée — le compilateur remplace `T` par le type concret **à la
> compilation** seulement (mécanisme appelé *type erasure*), puis efface l'info de type
> générique du bytecode final. Conséquence concrète : impossible de faire
> `new T()` ou `instanceof T` à l'intérieur d'une classe générique — le type `T` n'existe
> plus une fois compilé.

## Bornes génériques : `<T extends ...>`

On peut restreindre les types acceptés par un paramètre générique :

```java
// T must be Comparable — i.e. it must implement compareTo()
public static <T extends Comparable<T>> T max(List<T> items) {
    T best = items.get(0);
    for (T item : items) {
        if (item.compareTo(best) > 0) {
            best = item;
        }
    }
    return best;
}

Integer biggest = max(List.of(3, 7, 2));   // works: Integer implements Comparable<Integer>
```

> **Passerelle.** C'est l'équivalent des **templates génériques PHPStan**
> (`@template T of Comparable`), mais **appliqué et vérifié réellement par le
> compilateur**, pas seulement par un outil d'analyse statique lancé en CI à part.

## À retenir

- Les génériques Java (`List<String>`, `Box<T>`) donnent une **sécurité de type vérifiée
  à la compilation**, là où PHPStan/Psalm ne font que de l'analyse statique optionnelle.
- Un **type brut** (`List` sans `<T>`) compile mais expose au `ClassCastException` à
  l'exécution — à éviter systématiquement en code moderne.
- Le *type erasure* efface l'info générique du bytecode final : pas de `new T()` ni
  `instanceof T` possible dans une classe générique.
- `<T extends Comparable<T>>` restreint un paramètre générique à un type respectant un
  contrat précis.
