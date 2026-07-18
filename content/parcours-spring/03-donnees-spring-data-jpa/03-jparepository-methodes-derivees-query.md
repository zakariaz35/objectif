---
title: "JpaRepository : méthodes dérivées et @Query"
type: lesson
---

## `JpaRepository<Entity, Id>` : le CRUD gratuit

```java
// ProductRepository.java
package com.example.shop.product;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

C'est **tout** — pas d'implémentation à écrire. Spring Data JPA génère
l'implémentation au démarrage et fournit déjà `save`, `findById`, `findAll`,
`deleteById`, `count`...

> **Symfony → Spring.** C'est l'équivalent direct d'une classe
> `ProductRepository extends ServiceEntityRepository` générée par
> `make:entity` : `find()`, `findAll()`, `findBy()`, `findOneBy()` sont
> déjà là. Spring Data va simplement **plus loin** : il génère aussi des
> requêtes à partir du **nom** de la méthode (section suivante), ce que le
> `__call` magique de Doctrine ne fait qu'en partie (`findByX`/`findOneByX`
> uniquement, pas de combinaisons complexes).

## Méthodes dérivées : le nom de la méthode EST la requête

```java
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(String category);

    List<Product> findByCategoryAndPriceLessThan(String category, double maxPrice);

    Optional<Product> findByName(String name);

    boolean existsBySku(String sku);

    long countByCategory(String category);

    List<Product> findByNameContainingIgnoreCase(String keyword);
}
```

Spring **analyse le nom de la méthode** (`findBy...And...LessThan...`) et
génère la requête SQL correspondante — sans une seule ligne de SQL/JPQL à
écrire.

> **Symfony → Spring.** Doctrine propose `findBy(['category' => $c])` — un
> tableau associatif, pas un nom de méthode « parlant ». Spring pousse le
> concept plus loin en encodant la requête **dans le nom** de la méthode :
> plus verbeux à lire au début, mais **auto-documenté** et vérifié à la
> compilation (une faute de frappe dans un nom de champ casse le démarrage
> de l'application, pas une requête silencieusement vide en production).

## `@Query` : JPQL, le pendant direct du DQL Doctrine

Quand une requête devient trop complexe pour un nom de méthode, `@Query`
prend le relais avec **JPQL** (*Jakarta Persistence Query Language*) — un
langage de requête **orienté objet**, qui manipule des entités et leurs
champs, pas des tables et des colonnes SQL brutes.

```java
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.category = :category AND p.price < :maxPrice")
    List<Product> searchAffordable(@Param("category") String category, @Param("maxPrice") double maxPrice);

    // Native SQL when JPQL isn't enough (DB-specific functions, complex joins...)
    @Query(value = "SELECT * FROM products WHERE price < :maxPrice ORDER BY price ASC LIMIT 5", nativeQuery = true)
    List<Product> topCheapest(@Param("maxPrice") double maxPrice);
}
```

| JPQL (`@Query`) | DQL Doctrine | Similarité |
|---|---|---|
| `SELECT p FROM Product p WHERE p.category = :category` | `SELECT p FROM App\Entity\Product p WHERE p.category = :category` | Quasi identique |
| Manipule des **entités**, pas des tables | Idem | Même philosophie orientée objet |
| `nativeQuery = true` pour du SQL brut | `$em->createNativeQuery(...)` | Même échappatoire |

> 💡 **À retenir.** JPQL et DQL sont, à quelques détails syntaxiques près,
> **le même langage** : un développeur Doctrine qui sait écrire du DQL sait
> déjà lire et écrire du JPQL — c'est l'une des passerelles les plus
> directes de tout Spring Data JPA.

## À retenir

- `JpaRepository<Entity, Id>` fournit le CRUD de base sans implémentation à
  écrire — le pendant de `ServiceEntityRepository`.
- Les **méthodes dérivées** (`findByCategoryAndPriceLessThan`) génèrent la
  requête depuis le nom de la méthode — plus loin que le `findBy()` associatif
  de Doctrine.
- `@Query` en JPQL est quasi identique au DQL Doctrine ; `nativeQuery = true`
  ouvre l'échappatoire SQL brut, comme `createNativeQuery`.
