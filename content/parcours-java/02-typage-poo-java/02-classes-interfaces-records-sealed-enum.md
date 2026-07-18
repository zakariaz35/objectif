---
title: "Classes, interfaces, record, sealed & enum"
type: lesson
---

## Classes & interfaces : le socle connu

Rien de dépaysant sur le fond : une **classe** définit un type d'objet, une **interface**
définit un contrat sans implémentation. La syntaxe change, l'idée reste identique à
Symfony (`interface`/`implements`).

```java
public interface Notifier {
    void notify(String message);   // no body: a contract, like a PHP interface
}

public class EmailNotifier implements Notifier {
    @Override
    public void notify(String message) {
        System.out.println("Email sent: " + message);
    }
}
```

> **Passerelle.** `implements` fonctionne comme en PHP. La différence notable :
> l'annotation `@Override` n'est **pas obligatoire** pour compiler, mais elle est une
> **bonne pratique systématique** — elle fait échouer la compilation si la méthode
> annotée ne correspond en réalité à **aucune** méthode de l'interface/la classe parente
> (faute de frappe dans le nom, mauvaise signature). PHP n'a pas d'équivalent : une
> méthode mal nommée dans une classe enfant compile silencieusement.

## `record` : le DTO immuable, sans boilerplate

C'est la nouveauté Java (16+) la plus proche de ta pratique PHP actuelle. Un `record`
déclare en une ligne un objet **immuable** avec constructeur, accesseurs, `equals`,
`hashCode` et `toString` **générés automatiquement** :

```java
public record Point(int x, int y) {
    // That's it. The compiler generates:
    // - a constructor Point(int x, int y)
    // - accessors x() and y() (not getX()/getY() — records use the field name directly)
    // - equals(), hashCode() and toString() based on the fields
}

Point p1 = new Point(1, 2);
Point p2 = new Point(1, 2);
System.out.println(p1.x());          // 1
System.out.println(p1.equals(p2));   // true — value equality, generated for you
```

> **PHP → Java.** Un `record` correspond presque trait pour trait aux **propriétés
> promues en constructeur `readonly`** de PHP 8.1+ :
> ```php
> final class Point {
>     public function __construct(
>         public readonly int $x,
>         public readonly int $y,
>     ) {}
> }
> ```
> La différence : PHP ne génère **pas** `equals()`/`hashCode()` pour toi (`==` sur deux
> objets PHP compare déjà les propriétés une à une par défaut, mais reste différent du
> mécanisme Java — voir la leçon suivante). Le `record` va plus loin : il fige aussi la
> **sémantique d'égalité et de hachage**, gratuitement.

> 💡 **À retenir.** Un `record` est **toujours** immuable (pas de setter généré) et
> **ne peut pas hériter** d'une autre classe (il peut implémenter des interfaces). C'est
> voulu : un `record` sert à modéliser une **donnée**, pas un comportement riche avec
> état mutable — exactement l'usage qu'on donne à un DTO en Symfony.

## `sealed` : fermer une hiérarchie de classes

Une interface ou classe `sealed` **liste explicitement** qui a le droit de l'implémenter
ou d'en hériter — impossible pour un tiers d'en ajouter une sous-classe surprise ailleurs
dans le code :

```java
public sealed interface PaymentMethod
        permits CreditCard, BankTransfer, Cash {
}

public record CreditCard(String last4Digits) implements PaymentMethod {}
public record BankTransfer(String iban) implements PaymentMethod {}
public record Cash() implements PaymentMethod {}
```

L'intérêt majeur apparaît avec le **pattern matching** sur `switch` (Java 21) : le
compilateur **sait** qu'il n'existe que 3 implémentations possibles, et t'oblige à toutes
les couvrir (ou explicitement ignorer via `default`) — une exhaustivité vérifiée à la
compilation :

```java
String describe(PaymentMethod method) {
    return switch (method) {
        case CreditCard c -> "Card ending in " + c.last4Digits();
        case BankTransfer t -> "Transfer from " + t.iban();
        case Cash c -> "Cash payment";
        // no "default" needed: the compiler KNOWS these 3 cases are exhaustive
    };
}
```

> **Passerelle.** PHP n'a rien de directement équivalent aux hiérarchies `sealed` — le
> plus proche est un `enum` PHP 8.1 combiné à `match` (qui, lui, est bien exhaustif à
> l'exécution via une `UnhandledMatchError`). La différence : `sealed` en Java verrouille
> une **hiérarchie de classes/objets porteurs de données propres**, pas juste un ensemble
> de cas nommés.

## `enum` : bien plus riche qu'en PHP

Un `enum` Java peut avoir des **champs**, un **constructeur**, et des **méthodes** — ce
n'est pas juste une liste de constantes nommées :

```java
public enum OrderStatus {
    PENDING(false),
    SHIPPED(false),
    DELIVERED(true),
    CANCELLED(true);

    private final boolean isFinal;

    OrderStatus(boolean isFinal) {
        this.isFinal = isFinal;
    }

    public boolean isFinal() {
        return isFinal;
    }
}

OrderStatus status = OrderStatus.DELIVERED;
System.out.println(status.isFinal());   // true
```

> **PHP → Java.** L'`enum` PHP 8.1 (`enum OrderStatus: string { case Pending = 'pending';
> }`) reste plus limité : il peut avoir des méthodes, mais pas de constructeur ni de champs
> **par instance** différents comme ici (`isFinal` diffère selon le cas). En Java, chaque
> valeur d'`enum` est en réalité une **instance unique** de la classe enum, avec ses
> propres champs initialisés dans son propre constructeur.

## À retenir

- **Classes/interfaces** : même logique qu'en PHP ; utilise systématiquement `@Override`.
- **`record`** = DTO immuable généré automatiquement (constructeur, accesseurs, `equals`,
  `hashCode`, `toString`) — le pendant Java des propriétés promues `readonly` de PHP 8.1+.
- **`sealed`** ferme une hiérarchie à une liste connue, permettant un `switch` **exhaustif**
  vérifié à la compilation.
- **`enum`** Java peut porter des champs et un constructeur par valeur — plus riche que
  l'enum PHP.
