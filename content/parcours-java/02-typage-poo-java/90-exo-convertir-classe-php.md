---
title: "Exercice — Traduis cette classe PHP en Java idiomatique"
type: exercise
---

## Énoncé

> ⏱️ **Durée conseillée : ~15 min.** Voici une classe PHP 8.1 telle que tu l'écrirais
> naturellement en Symfony : un DTO immuable avec propriétés promues `readonly`. Traduis-la
> en Java **idiomatique** — pas juste une traduction mot à mot, mais en utilisant les
> outils du langage qui rendent exactement le même service.

```php
<?php

final class Money
{
    public function __construct(
        public readonly int $amountInCents,
        public readonly string $currency,
    ) {}

    public function add(Money $other): self
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException('Currency mismatch');
        }

        return new self($this->amountInCents + $other->amountInCents, $this->currency);
    }
}

$a = new Money(1000, 'EUR');
$b = new Money(500, 'EUR');
$total = $a->add($b);

var_dump($total == new Money(1500, 'EUR')); // expected: true (value equality)
```

Contraintes :
1. Choisis la construction Java la plus adaptée pour un objet **immuable, comparable par
   valeur** (indice : ce n'est pas une classe classique avec des champs `private final`
   écrits à la main).
2. `add()` doit lever une exception si les devises diffèrent.
3. `total.equals(new Money(1500, "EUR"))` doit renvoyer `true`.

<!--correction-->

## Correction

```java
package com.acme.billing;

// A record: immutable by construction, equals()/hashCode()/toString() generated for us —
// exactly the Java counterpart of the PHP readonly-promoted-properties class.
public record Money(long amountInCents, String currency) {

    public Money {
        // Compact constructor: runs before the fields are assigned, ideal for validation
        if (amountInCents < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
    }

    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            // NEVER use == to compare Strings — always .equals()
            throw new IllegalArgumentException("Currency mismatch");
        }
        return new Money(this.amountInCents + other.amountInCents, this.currency);
    }
}
```

```java
Money a = new Money(1000, "EUR");
Money b = new Money(500, "EUR");
Money total = a.add(b);

System.out.println(total.equals(new Money(1500, "EUR"))); // true — value equality, for free
```

Points clés de la traduction :

- **`record` au lieu d'une classe manuelle** : `equals()`/`hashCode()`/`toString()` sont
  générés automatiquement, exactement comme les propriétés promues `readonly` de PHP te
  donnent une classe immuable sans boilerplate.
- **`long` plutôt que `int`** pour un montant en centimes : par réflexe défensif contre un
  éventuel dépassement (`int` overflow silencieux, voir la leçon sur les primitifs) —
  une préoccupation qui n'existe pas en PHP où les entiers s'agrandissent automatiquement.
- **`.equals(other.currency)` et jamais `==`** pour comparer les `String` : le piège n°1
  vu dans ce module.
- Le **constructeur compact** (`public Money { ... }`, sans parenthèses ni liste de
  paramètres répétée) est l'endroit idiomatique pour valider les invariants d'un `record`.
