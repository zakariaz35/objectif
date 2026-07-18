---
title: "Bean Validation : @NotNull, @Email, @Size..."
type: lesson
---

## Bean Validation, la spécification derrière `@Valid`

**Bean Validation** (implémentée par Hibernate Validator) permet de poser des
**contraintes** directement sur les champs d'une classe, via des annotations
`jakarta.validation.constraints.*`.

```java
// CreateUserRequest.java
package com.example.shop.user;

import jakarta.validation.constraints.*;

public record CreateUserRequest(
        @NotBlank(message = "Name is required")
        String name,

        @Email(message = "Must be a valid email address")
        String email,

        @Min(value = 18, message = "Must be at least 18 years old")
        int age,

        @Size(min = 8, message = "Password must be at least 8 characters")
        String password
) {}
```

> **Symfony → Spring.** Le mapping avec les contraintes Symfony est presque
> direct :

| Symfony (`#[Assert\...]`) | Bean Validation (`@...`) | Rôle |
|---|---|---|
| `#[Assert\NotBlank]` | `@NotBlank` | Chaîne non vide (ni `null`, ni juste des espaces) |
| `#[Assert\NotNull]` | `@NotNull` | Valeur non nulle (mais chaîne vide acceptée) |
| `#[Assert\Email]` | `@Email` | Format d'email valide |
| `#[Assert\Length(min: 8)]` | `@Size(min = 8)` | Longueur min/max (chaîne ou collection) |
| `#[Assert\Range(min: 18)]` | `@Min(18)` / `@Max(...)` | Valeur numérique bornée |
| `#[Assert\Positive]` | `@Positive` | Nombre strictement positif |

> 💡 **À retenir.** `@NotNull` ≠ `@NotBlank` : `@NotNull` refuse `null` mais
> accepte `""`, `@NotBlank` refuse en plus les chaînes vides ou uniquement
> composées d'espaces — même distinction que `#[Assert\NotNull]` vs
> `#[Assert\NotBlank]` côté Symfony.

## Contraintes sur les collections et objets imbriqués

```java
public record CreateOrderRequest(
        @NotEmpty(message = "An order needs at least one line")
        List<@Valid OrderLineRequest> lines
) {}

public record OrderLineRequest(
        @NotBlank String productSku,
        @Positive int quantity
) {}
```

`@Valid` sur les éléments d'une liste force la validation **récursive** de
chaque objet imbriqué — sans lui, seule la présence de la liste serait
vérifiée, pas le contenu de chaque `OrderLineRequest`.

> **Symfony → Spring.** Équivalent à `#[Assert\Valid]` posé sur une propriété
> objet ou `#[Assert\All([new Assert\Valid()])]` sur une collection — même
> logique de validation en cascade.

## À retenir

- Bean Validation (`jakarta.validation.constraints.*`) pose des contraintes
  directement sur les champs — le pendant des `#[Assert\...]` Symfony.
- `@NotNull` ≠ `@NotBlank` : attention à la nuance sur les chaînes vides.
- `@Valid` déclenche la validation **récursive** des objets/collections
  imbriqués — sans lui, seule la structure de premier niveau est vérifiée.
