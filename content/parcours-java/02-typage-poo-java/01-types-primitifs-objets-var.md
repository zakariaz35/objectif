---
title: "Types primitifs, objets & var"
type: lesson
---

## Le changement de paradigme n°2 : le typage est vérifié à la compilation

En PHP 8, tu as le choix : `function total(int $a, int $b): int` type tes signatures,
mais rien ne t'y oblige, et même typée, la vérification a lieu **à l'exécution** (le
moteur Zend lève une `TypeError` **quand la fonction est appelée**, pas avant). En Java,
**tout** est typé, **sans exception**, et la vérification a lieu **à la compilation** —
avant même que le programme ne tourne une seule fois.

```java
int a = 10;
int b = 5;
int total = a + b;   // the compiler KNOWS both are int — no ambiguity possible

// total = "hello";  // ❌ compile-time error: incompatible types
//                    //    (this line never even reaches the JVM)
```

> **PHP → Java.** Le typage PHP 8 (`int $a`) est **optionnel et vérifié au runtime** :
> `total("abc", 5)` compile toujours, l'erreur surgit à l'appel. En Java, `total("abc", 5)`
> ne compile **pas du tout** — l'erreur apparaît dans ton IDE avant même que tu lances quoi
> que ce soit. C'est une garantie beaucoup plus forte, au prix d'une verbosité assumée.

## Les 8 types primitifs

Java distingue strictement les **types primitifs** (valeurs brutes, stockées directement,
jamais `null`) des **objets** (références). Il existe exactement 8 primitifs :

| Type | Contenu | Taille | Exemple |
|---|---|---|---|
| `int` | entier | 32 bits | `int age = 42;` |
| `long` | entier large | 64 bits | `long id = 42L;` |
| `double` | décimal | 64 bits | `double price = 19.99;` |
| `float` | décimal (moins précis) | 32 bits | `float f = 3.14f;` |
| `boolean` | vrai/faux | 1 bit (JVM-dépendant) | `boolean active = true;` |
| `char` | un caractère | 16 bits | `char c = 'A';` |
| `byte` | petit entier | 8 bits | `byte b = 127;` |
| `short` | entier moyen | 16 bits | `short s = 1000;` |

> ⚠️ **Erreur fréquente — croire que `number` PHP a un équivalent unique en Java.** En
> PHP, un nombre est `int` ou `float`, et le moteur jongle entre les deux sans que tu y
> penses. En Java, **tu choisis explicitement** `int` vs `long` (selon la taille attendue)
> et `double` vs `float` (selon la précision requise) — et un `int` qui déborde (au-delà
> de ~2,1 milliards) **boucle silencieusement** en négatif (overflow), sans erreur ni
> exception. C'est une classe de bug qui n'existe pas en PHP.

## Les wrapper classes : quand un primitif devient un objet

Chaque primitif a une **classe enveloppe** (*wrapper*) correspondante : `int` → `Integer`,
`double` → `Double`, `boolean` → `Boolean`, etc. Pourquoi en avoir besoin ? Parce que les
primitifs ne peuvent **jamais** être `null`, alors qu'un `Integer` (objet) le peut — utile
pour représenter « aucune valeur » (un champ optionnel en base, par exemple), ou dès qu'un
type générique est nécessaire (les génériques Java ne fonctionnent qu'avec des objets,
voir module 3).

```java
int primitive = 5;          // can NEVER be null
Integer wrapped = 5;        // CAN be null — same value, different nature
Integer missing = null;     // valid: this is an object reference

// Autoboxing: Java converts automatically between the two forms
Integer boxed = primitive;      // int -> Integer (autoboxing)
int unboxed = wrapped;          // Integer -> int (unboxing)
```

> ⚠️ **Erreur fréquente — unboxing d'un `null`.** Si `wrapped` vaut `null` et que tu
> écris `int x = wrapped;`, Java tente un *unboxing* automatique... et lève une
> `NullPointerException` à l'exécution. Le compilateur ne le détecte pas : c'est le piège
> classique des wrapper classes.

## `var` : de l'inférence de type, pas du typage dynamique

Depuis Java 10, `var` évite de répéter un type évident :

```java
var name = "Ada";          // the compiler infers String — and String it stays, forever
var count = 42;            // inferred as int

// name = 42;               // ❌ still a compile-time error: name IS a String, fixed at compile time
```

> **Passerelle.** `var` ressemble à une variable PHP non typée (`$name = "Ada";`), mais
> c'est trompeur : le **type est figé au moment de la compilation**, juste écrit une seule
> fois au lieu de deux (`String name = "Ada";` vs `var name = "Ada";`). Ce n'est **pas**
> un retour au typage dynamique — Java reste statiquement typé de bout en bout, `var` est
> un confort syntaxique, jamais une relaxation des règles.

## À retenir

- Java vérifie les types **à la compilation** : une erreur de type ne compile pas, elle
  n'atteint jamais l'exécution.
- **8 primitifs** (jamais `null`) + leurs **wrapper classes** correspondantes (peuvent
  être `null`, nécessaires pour les génériques et les valeurs optionnelles).
- L'**autoboxing/unboxing** est automatique mais peut lever une `NullPointerException`
  silencieuse si un wrapper `null` est déboxé.
- `var` = **inférence de type**, pas typage dynamique : le type est déduit une fois, puis
  figé pour toujours.
