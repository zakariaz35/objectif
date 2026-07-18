---
title: "@DataJpaTest et Mockito pour isoler les couches"
type: lesson
---

## `@DataJpaTest` : tester un repository, sans tout démarrer

```java
// ProductRepositoryTest.java
package com.example.shop.product;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest   // only loads JPA-related beans, backed by an in-memory H2 database
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Test
    void findByCategoryReturnsMatchingProducts() {
        productRepository.save(new Product("Laptop", 999.0, "electronics"));
        productRepository.save(new Product("Desk", 199.0, "furniture"));

        var results = productRepository.findByCategory("electronics");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Laptop");
    }
}
```

`@DataJpaTest` ne charge que les beans liés à JPA, utilise une base **H2 en
mémoire** par défaut, et **annule automatiquement** (rollback) chaque test —
aucune donnée ne persiste d'un test à l'autre.

> **Symfony → Spring.** Le pendant Symfony le plus proche : un test
> `KernelTestCase` ciblé sur le repository, avec une base de test isolée et
> un rollback systématique en fin de test (via une transaction englobante,
> pattern souvent mis en place manuellement ou via un bundle dédié). Le
> principe — isoler la couche de persistance, sans effet de bord entre
> tests — est identique.

## Mockito : isoler un service de ses dépendances

```java
// OrderServiceTest.java
package com.example.shop.order;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private StockService stockService;

    @InjectMocks   // creates OrderService, injecting the two mocks above
    private OrderService orderService;

    @Test
    void placeOrderReservesStockAndSavesTheOrder() {
        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Order order = orderService.placeOrder(1L, java.util.List.of());

        verify(stockService).reserve(anyList());   // side effect actually happened
        assertThat(order).isNotNull();
    }

    @Test
    void placeOrderDoesNothingWhenStockServiceFails() {
        doThrow(new IllegalStateException("Out of stock")).when(stockService).reserve(anyList());

        assertThatThrownBy(() -> orderService.placeOrder(1L, java.util.List.of()))
                .isInstanceOf(IllegalStateException.class);

        verify(orderRepository, never()).save(any());   // no save happened after the failure
    }
}
```

| Mockito | PHPUnit | Rôle |
|---|---|---|
| `@Mock` | `$this->createMock(Foo::class)` | Créer un double de test |
| `when(x).thenReturn(y)` | `$mock->method('foo')->willReturn($y)` | Programmer le comportement du mock |
| `verify(mock).method(...)` | `$mock->expects($this->once())->method(...)` | Vérifier qu'une méthode a été appelée |
| `@InjectMocks` | (souvent manuel : `new Service($mock1, $mock2)`) | Injection automatique des mocks dans l'objet testé |

> **Symfony → Spring.** L'esprit est le même que les doubles de test
> PHPUnit (`createMock`, `prophesize`) : isoler la classe testée de ses
> vraies dépendances, pour un test **rapide et déterministe**. `@InjectMocks`
> va un cran plus loin que PHPUnit en construisant automatiquement l'objet
> testé avec les mocks déclarés — en PHPUnit, cette injection reste
> généralement manuelle (`new OrderService($mockRepo, $mockStock)`).

## À retenir

- `@DataJpaTest` isole la couche de persistance avec une base H2 en mémoire,
  rollback automatique par test.
- Mockito (`@Mock`/`@InjectMocks`/`when`/`verify`) isole un service de ses
  dépendances — le pendant des doubles de test PHPUnit.
- Réserve `@DataJpaTest`/`@SpringBootTest` aux tests réellement
  d'intégration ; Mockito pour les tests unitaires rapides et nombreux.
