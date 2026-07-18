---
title: "Exercice — Corrige ce code Java qui ne compile pas"
type: exercise
---

## Énoncé

> ⏱️ **Durée conseillée : ~10 min.** Un fichier reçu d'un collègue ne compile pas. Ton
> travail : lire le message d'erreur (mental, pas de compilateur ici) et corriger le
> fichier. Il y a **trois erreurs distinctes**, chacune liée à une règle vue dans ce
> module.

Voici le fichier `src/main/java/com/acme/shop/PriceCalculator.java` tel que livré :

```java
package com.acme.shop

public class PriceCalculator {

    static void main(String[] args) {
        PriceCalculator calc = new PriceCalculator();
        System.out.println(calc.applyDiscount(100.0, 0.1));
    }

    public double applyDiscount(double price, double rate) {
        return price - (price * rate);
    }
}
```

Indices :
1. Une ligne du fichier manque de ponctuation obligatoire.
2. La méthode `main` ne respecte pas totalement la signature imposée par la JVM.
3. (Piège plus subtil) Vérifie que le nom du fichier et le nom de la classe correspondent
   bien — ici ils correspondent, mais imagine que ce fichier s'appelle en réalité
   `Calculator.java` sur le disque : que se passerait-il ?

Écris la version corrigée avant de dérouler la correction.

<!--correction-->

## Correction

```java
// File: src/main/java/com/acme/shop/PriceCalculator.java
package com.acme.shop; // (1) Missing semicolon after the package declaration

public class PriceCalculator {

    // (2) "main" must be "public static void main(String[] args)" — "public" was missing
    public static void main(String[] args) {
        PriceCalculator calc = new PriceCalculator();
        System.out.println(calc.applyDiscount(100.0, 0.1));
    }

    public double applyDiscount(double price, double rate) {
        return price - (price * rate);
    }
}
```

Détail des trois erreurs :

1. **`package com.acme.shop` sans `;`** : chaque déclaration Java se termine par un
   point-virgule, y compris `package` et `import`. Une simple oublie et `javac` refuse
   de compiler tout le fichier.
2. **`static void main` sans `public`** : la JVM cherche précisément la signature
   `public static void main(String[] args)`. Sans `public`, la JVM ne trouve pas de
   point d'entrée accessible et refuse de lancer le programme (erreur « main method not
   found »), même si le fichier compile.
3. **Nom de fichier ≠ nom de classe** : si ce fichier s'appelait `Calculator.java` sur le
   disque tout en déclarant `public class PriceCalculator`, `javac` refuserait de
   compiler avec l'erreur « class PriceCalculator is public, should be declared in a file
   named PriceCalculator.java ». En PHP, un mauvais nom de fichier ne casse l'autoload
   qu'à l'exécution (`Class not found`) ; en Java, c'est détecté **à la compilation**.
