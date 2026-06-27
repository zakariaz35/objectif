---
title: "Exercice 4 — DDD (Value Object)"
type: exercise
---

## Énoncé

Crée un Value Object `Email` : immuable, qui refuse une adresse invalide à la construction, et qui sait dire s'il est égal à un autre Email. Complète les trous `/* (n) */`.

```php
final class Email {
    public function __construct(
        /* (1) propriété immuable */ $valeur
    ) {
        if (/* (2) format invalide */) {
            throw new \InvalidArgumentException('Email invalide');
        }
    }

    public function equals(Email $autre): bool {
        return /* (3) égalité par valeur */;
    }
}
```

Indices : (1) PHP 8 a un mot-clé pour rendre une propriété non modifiable. (2) une fonction native de validation. (3) deux VO sont égaux si leurs valeurs le sont.

<!--correction-->

## Correction

```php
final class Email {
    public function __construct(
        public readonly string $valeur          // (1) immuable
    ) {
        if (! filter_var($valeur, FILTER_VALIDATE_EMAIL)) {  // (2)
            throw new \InvalidArgumentException('Email invalide');
        }
    }

    public function equals(Email $autre): bool {
        return $this->valeur === $autre->valeur;     // (3)
    }
}
```

Les 3 traits d'un Value Object sont là : **immuable** (`readonly`), **auto-validant** (impossible de construire un Email invalide → la règle est garantie partout), et **comparé par valeur** (pas par identité). Une fois ce VO créé, plus aucun `if (!filter_var(...))` dispersé dans le code.
