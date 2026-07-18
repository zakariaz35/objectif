---
title: "Exercice — convertir une entité Doctrine en entité JPA"
type: exercise
---

## Énoncé

Voici une entité Doctrine `Product`, avec sa relation vers `Category` et son
repository :

```php
<?php
// src/Entity/Category.php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Category
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $name;

    public function __construct(string $name)
    {
        $this->name = $name;
    }

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
}
```

```php
<?php
// src/Entity/Product.php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'products')]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    private string $name;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $price;

    #[ORM\ManyToOne(targetEntity: Category::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Category $category;

    public function __construct(string $name, string $price, Category $category)
    {
        $this->name = $name;
        $this->price = $price;
        $this->category = $category;
    }

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getPrice(): string { return $this->price; }
    public function getCategory(): Category { return $this->category; }
}
```

```php
<?php
// src/Repository/ProductRepository.php
namespace App\Repository;

use App\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    // Custom finder: products of a category, cheaper than a max price.
    public function findAffordableByCategory(int $categoryId, float $maxPrice): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.category = :categoryId')
            ->andWhere('p.price < :maxPrice')
            ->setParameter('categoryId', $categoryId)
            ->setParameter('maxPrice', $maxPrice)
            ->getQuery()
            ->getResult();
    }
}
```

**Tâche** : écris les équivalents Java :

1. L'entité `Category` (JPA).
2. L'entité `Product` (JPA), avec sa relation `@ManyToOne` vers `Category`
   — pense au **fetch type** !
3. Le `ProductRepository` (`JpaRepository`) avec l'équivalent de
   `findAffordableByCategory`, en `@Query` JPQL.

<!--correction-->

## Correction

```java
// Category.java
package com.example.shop.category;

import jakarta.persistence.*;

@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    protected Category() {}

    public Category(String name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
}
```

```java
// Product.java
package com.example.shop.product;

import com.example.shop.category.Category;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // JPA defaults @ManyToOne to EAGER: force LAZY explicitly, unlike Doctrine's default lazy loading.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    protected Product() {}

    public Product(String name, BigDecimal price, Category category) {
        this.name = name;
        this.price = price;
        this.category = category;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
    public Category getCategory() { return category; }
}
```

```java
// ProductRepository.java
package com.example.shop.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.price < :maxPrice")
    List<Product> findAffordableByCategory(
            @Param("categoryId") Long categoryId,
            @Param("maxPrice") BigDecimal maxPrice);
}
```

- `#[ORM\Column(type: 'decimal', precision: ..., scale: ...)]` devient
  `@Column(precision = ..., scale = ...)` typé en `BigDecimal` Java — le
  bon type pour un prix, évitant les erreurs d'arrondi d'un `double`
  (nuance Java au-delà du simple mapping Doctrine, où `string`/`decimal`
  est courant côté PHP faute de type décimal natif).
- La relation `#[ORM\ManyToOne]` devient `@ManyToOne` — **avec
  `fetch = FetchType.LAZY` explicite**, puisque JPA charge cette relation
  en `EAGER` par défaut (piège inverse de Doctrine, toujours lazy).
- `ProductRepository extends ServiceEntityRepository` devient
  `ProductRepository extends JpaRepository<Product, Long>` — sans
  constructeur ni implémentation à écrire.
- Le `QueryBuilder` DQL devient une méthode `@Query` en JPQL — la syntaxe
  (`SELECT p FROM Product p WHERE ...`) est reconnaissable presque telle
  quelle.
