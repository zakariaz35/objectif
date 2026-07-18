---
title: "Relations JPA : @ManyToOne, @OneToMany, @ManyToMany"
type: lesson
---

## Le mapping des relations, presque à l'identique de Doctrine

```java
// Order.java
package com.example.shop.order;

import com.example.shop.customer.Customer;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderLine> lines = new ArrayList<>();

    protected Order() {}

    public Order(Customer customer) {
        this.customer = customer;
    }

    public void addLine(OrderLine line) {
        lines.add(line);
        line.setOrder(this);   // keep both sides of the relation consistent
    }
}
```

```java
// OrderLine.java
package com.example.shop.order;

import jakarta.persistence.*;

@Entity
public class OrderLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private String label;
    private int quantity;

    protected OrderLine() {}

    public OrderLine(String label, int quantity) {
        this.label = label;
        this.quantity = quantity;
    }

    void setOrder(Order order) { this.order = order; }
}
```

| Doctrine | JPA | Rôle |
|---|---|---|
| `#[ORM\ManyToOne]` | `@ManyToOne` | Côté « propriétaire » de la relation (contient la FK) |
| `#[ORM\OneToMany(mappedBy: '...')]` | `@OneToMany(mappedBy = "...")` | Côté « inverse », `mappedBy` pointe le champ propriétaire côté opposé |
| `#[ORM\JoinColumn(name: '...')]` | `@JoinColumn(name = "...")` | Nom explicite de la colonne de clé étrangère |
| `cascade: ['persist', 'remove']` | `cascade = CascadeType.ALL` | Propagation des opérations sur les entités liées |

> **Symfony → Spring.** `mappedBy` a **exactement** le même sens dans les
> deux mondes : il désigne, côté relation **inverse**, le nom du champ qui
> porte la relation **propriétaire** en face. Un développeur Doctrine
> retrouve ici un concept qu'il connaît déjà, presque mot pour mot.

## Le piège des `fetch` par défaut : EAGER vs LAZY

C'est LA nuance qui surprend un développeur Doctrine, où **tout est lazy par
défaut** (via des proxies) :

| Relation | Fetch par défaut en JPA | Doctrine |
|---|---|---|
| `@ManyToOne` / `@OneToOne` | **EAGER** (chargé immédiatement) | Lazy (proxy) |
| `@OneToMany` / `@ManyToMany` | **LAZY** (chargé à l'accès) | Lazy (proxy/collection) |

```java
@ManyToOne(fetch = FetchType.LAZY)   // explicitly override the EAGER default
@JoinColumn(name = "customer_id")
private Customer customer;
```

> ⚠️ **Erreur fréquente — le piège N+1.** Comme en Doctrine, accéder à une
> collection `LAZY` **dans une boucle** déclenche une requête SQL par
> itération (problème N+1). La solution est la même dans les deux mondes :
> une jointure explicite. Côté JPA, `@Query("SELECT o FROM Order o JOIN
> FETCH o.lines WHERE o.id = :id")` ou une `@EntityGraph` ; côté Doctrine,
> `->leftJoin('o.lines', 'l')->addSelect('l')` en DQL.

> 💡 **À retenir.** Force `FetchType.LAZY` explicitement sur tous les
> `@ManyToOne`/`@OneToOne` d'un vrai projet — le défaut `EAGER` de JPA
> charge silencieusement des entités liées qu'on n'a pas toujours besoin de
> voir, l'exact inverse du réflexe qu'on a en venant de Doctrine.

## Relation bidirectionnelle : qui est responsable de la cohérence ?

JPA/Hibernate ne synchronise **jamais automatiquement** les deux côtés d'une
relation bidirectionnelle en mémoire — c'est au développeur de le faire (la
méthode `addLine` ci-dessus le fait manuellement). Exactement la même
discipline est attendue en Doctrine.

## À retenir

- `@ManyToOne`/`@OneToMany(mappedBy = ...)` correspondent presque littéralement
  aux annotations Doctrine — même vocabulaire, même mécanique de côté
  propriétaire/inverse.
- **Piège critique** : `@ManyToOne`/`@OneToOne` sont **EAGER par défaut** en
  JPA (Doctrine est toujours lazy) — force `FetchType.LAZY` explicitement.
- Le problème N+1 se résout de la même façon dans les deux ORM : une
  jointure explicite (`JOIN FETCH` en JPQL, `addSelect` en DQL).
