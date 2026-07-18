---
title: "Transactions avec @Transactional"
type: lesson
---

## `@Transactional` : délimiter une transaction sur une méthode

```java
// OrderService.java
package com.example.shop.order;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final StockService stockService;

    public OrderService(OrderRepository orderRepository, StockService stockService) {
        this.orderRepository = orderRepository;
        this.stockService = stockService;
    }

    @Transactional
    public Order placeOrder(Customer customer, List<OrderLine> lines) {
        Order order = new Order(customer);
        lines.forEach(order::addLine);

        stockService.reserve(lines);      // if this throws, everything rolls back
        return orderRepository.save(order);
    }
}
```

Si `stockService.reserve(...)` lève une exception, **toutes** les
modifications faites dans `placeOrder` (y compris le `save`) sont annulées —
une seule transaction couvre la méthode entière.

> **Symfony → Spring.** Le principe rejoint le **Unit of Work** de
> Doctrine : les entités modifiées pendant la transaction sont suivies
> (*dirty checking*), et Hibernate génère les `UPDATE`/`INSERT` au moment du
> **commit** (ou d'un `flush` intermédiaire), exactement comme Doctrine
> détecte les entités modifiées et génère le SQL lors de `$em->flush()`.
> La vraie différence : `@Transactional` définit **la frontière** de la
> transaction de façon déclarative, alors qu'en Doctrine tu appelles
> `flush()` explicitement (ou tu englobes manuellement dans
> `$connection->transactional(fn () => ...)`).

## Rollback automatique : uniquement sur les exceptions *unchecked*

```java
@Transactional
public void riskyOperation() {
    // A RuntimeException triggers an automatic rollback.
    if (somethingIsWrong()) {
        throw new IllegalStateException("Inconsistent state");
    }
}

@Transactional(rollbackFor = Exception.class)
public void riskyOperationWithCheckedException() throws Exception {
    // Without rollbackFor, a CHECKED exception would NOT roll back by default!
    if (somethingIsWrong()) {
        throw new Exception("Something went wrong");
    }
}
```

> ⚠️ **Erreur fréquente — les exceptions *checked*.** Par défaut,
> `@Transactional` ne fait un rollback **que** sur `RuntimeException` (et
> `Error`) — une exception *checked* (`throws Exception`) laisse la
> transaction se **valider quand même**. C'est une surprise fréquente pour
> qui découvre Java : précise `rollbackFor = Exception.class` si tu veux un
> rollback sur une exception checked. Symfony n'a pas cette distinction
> (PHP n'a pas d'exceptions checked) : toute exception non interceptée
> annule la transaction courante.

## `readOnly = true` : une optimisation, pas une contrainte stricte

```java
@Transactional(readOnly = true)
public List<Product> findAll() {
    return productRepository.findAll();
}
```

`readOnly = true` indique à Hibernate qu'aucune modification n'est attendue :
il peut désactiver le *dirty checking* pour cette transaction, un gain de
performance mesurable sur les endpoints de lecture.

> **Réflexe à prendre.** Annote systématiquement tes méthodes de **lecture
> seule** avec `@Transactional(readOnly = true)` — un réflexe équivalent à
> ouvrir une transaction en lecture seule quand ton ORM/SGBD le permet, ou
> simplement à ne jamais appeler `flush()` inutilement en Doctrine.

## À retenir

- `@Transactional` délimite une transaction déclarativement sur une
  méthode — le rôle du Unit of Work Doctrine, mais avec une frontière
  explicite plutôt qu'un `flush()` manuel.
- **Rollback automatique uniquement sur les exceptions *unchecked*** par
  défaut — utilise `rollbackFor` pour les exceptions *checked*.
- `readOnly = true` sur les méthodes de lecture est une optimisation à
  prendre en réflexe.
