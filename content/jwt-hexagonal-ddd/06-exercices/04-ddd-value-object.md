---
title: "Exercice 4 — DDD (Value Object)"
type: exercise
---

## Énoncé

Crée un Value Object `Email` : immuable, qui refuse une adresse invalide à la construction, et qui sait dire s'il est égal à un autre Email. Complète les trous `/* (n) */`.

```php
final class Email {
    public function __construct(
        /* (1) immutable property */ $value
    ) {
        if (/* (2) invalid format */) {
            throw new \InvalidArgumentException('Invalid email');
        }
    }

    public function equals(Email $other): bool {
        return /* (3) equality by value */;
    }
}
```

Indices : (1) PHP 8 a un mot-clé pour rendre une propriété non modifiable. (2) une fonction native de validation. (3) deux VO sont égaux si leurs valeurs le sont.

<!--correction-->

## Correction

```php
final class Email {
    public function __construct(
        public readonly string $value          // (1) immutable
    ) {
        if (! filter_var($value, FILTER_VALIDATE_EMAIL)) {  // (2)
            throw new \InvalidArgumentException('Invalid email');
        }
    }

    public function equals(Email $other): bool {
        return $this->value === $other->value;     // (3)
    }
}
```

Les 3 traits d'un Value Object sont là : **immuable** (`readonly`), **auto-validant** (impossible de construire un Email invalide → la règle est garantie partout), et **comparé par valeur** (pas par identité). Une fois ce VO créé, plus aucun `if (!filter_var(...))` dispersé dans le code.
