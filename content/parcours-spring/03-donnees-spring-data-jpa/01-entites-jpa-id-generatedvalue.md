---
title: "Entités JPA : @Entity, @Id, @GeneratedValue"
type: lesson
---

## JPA, la spécification derrière Hibernate

**JPA** (*Jakarta Persistence API*) est une **spécification** ; **Hibernate**
en est l'implémentation la plus utilisée. Spring Data JPA vient **par-dessus**
Hibernate pour te donner des repositories tout prêts. C'est exactement la
même architecture en trois couches que Doctrine : une spec (JPA) ↔ Doctrine
lui-même définit sa propre spec+implémentation, mais le rôle est identique —
mapper des classes PHP/Java vers des tables, gérer un cycle de vie d'entité,
générer du SQL.

> ⚠️ **Erreur fréquente — `javax.persistence` au lieu de `jakarta.persistence`.**
> Depuis **Spring Boot 3** (et Jakarta EE 9+), **tous** les packages ont migré
> de `javax.*` vers `jakarta.*`. Un import `javax.persistence.Entity` ne
> **compile même pas** avec Spring Boot 3 — c'est le piège n°1 pour quiconque
> a suivi un ancien tutoriel ou vient de Spring Boot 2. Retiens :
> `jakarta.persistence.*`, `jakarta.validation.*`, `jakarta.servlet.*`.

## Déclarer une entité

```java
// Product.java
package com.example.shop.product;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private double price;

    protected Product() {
        // JPA requires a no-arg constructor (used via reflection).
    }

    public Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    // Getters (JPA/Hibernate needs them to read/write fields via the proxy)
    public Long getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }
}
```

> **Symfony → Spring.** Le mapping est **quasiment ligne à ligne** avec
> Doctrine :

| Doctrine (`#[ORM\...]`) | JPA (`@...`) | Rôle |
|---|---|---|
| `#[ORM\Entity]` | `@Entity` | Marque la classe comme entité persistante |
| `#[ORM\Table(name: '...')]` | `@Table(name = "...")` | Nom de table explicite |
| `#[ORM\Id]` | `@Id` | Clé primaire |
| `#[ORM\GeneratedValue]` | `@GeneratedValue` | Génération automatique de l'id |
| `#[ORM\Column(...)]` | `@Column(...)` | Mapping d'un champ vers une colonne |

## Les stratégies de génération d'id

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)  // DB auto-increment
private Long id;

@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_seq")
@SequenceGenerator(name = "product_seq", sequenceName = "product_seq", allocationSize = 1)
private Long id;
```

| Stratégie | Comportement | Doctrine |
|---|---|---|
| `IDENTITY` | Auto-incrément géré par la base (MySQL, Postgres `SERIAL`) | `AUTO` avec MySQL |
| `SEQUENCE` | Séquence explicite (idéal pour Postgres) | `AUTO` avec Postgres, ou `SEQUENCE` explicite |
| `TABLE` | Table dédiée simulant une séquence (rarement utile) | (rare aussi côté Doctrine) |

> 💡 **À retenir.** `IDENTITY` est simple mais empêche certaines
> optimisations de batch insert d'Hibernate (l'id doit être connu **après**
> l'insert). Sur un vrai projet Postgres, `SEQUENCE` est souvent préféré —
> nuance qu'un Doctrine avec Postgres gère aussi nativement via `AUTO`.

## Colonnes : nullabilité, longueur, unicité

```java
@Column(nullable = false, length = 150)
private String name;

@Column(unique = true)
private String sku;

@Column(name = "created_at", updatable = false)
private LocalDateTime createdAt;
```

> **Symfony → Spring.** Encore une correspondance directe :
> `#[ORM\Column(nullable: false, length: 150)]` ↔
> `@Column(nullable = false, length = 150)`. Même logique, syntaxe
> quasi-identique — c'est l'un des points où Symfony/Doctrine et Spring/JPA
> sont les plus proches.

## À retenir

- JPA/Hibernate joue le rôle de Doctrine : ORM + gestion du cycle de vie des
  entités. Spring Data JPA ajoute les repositories, comme les repositories
  Doctrine par-dessus l'`EntityManager`.
- **`jakarta.persistence.*`, jamais `javax.persistence.*`** avec Spring
  Boot 3 — le piège le plus fréquent en entretien.
- Le mapping `@Entity`/`@Id`/`@GeneratedValue`/`@Column` correspond presque
  ligne à ligne aux annotations Doctrine `#[ORM\...]`.
