---
title: "JUnit 5 : les bases"
type: lesson
---

## JUnit 5, le PHPUnit de Java

```java
// TaxCalculatorTest.java
package com.example.shop.pricing;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TaxCalculatorTest {

    private TaxCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new TaxCalculator(0.20);
    }

    @Test
    @DisplayName("applies the tax rate to a price")
    void appliesTaxRate() {
        double result = calculator.priceWithTax(100.0);

        assertThat(result).isEqualTo(120.0);
    }

    @Test
    void zeroPriceStaysZero() {
        assertThat(calculator.priceWithTax(0.0)).isZero();
    }
}
```

| JUnit 5 | PHPUnit | Rôle |
|---|---|---|
| `@Test` | `#[Test]` / méthode `test*` | Marque une méthode comme test |
| `@BeforeEach` | `setUp()` | Exécuté avant chaque test |
| `@AfterEach` | `tearDown()` | Exécuté après chaque test |
| `@DisplayName("...")` | annotation `#[TestDox]` ou docblock | Libellé lisible du test |
| `assertThat(x).isEqualTo(y)` (AssertJ) | `$this->assertSame($y, $x)` | Assertion |

> **Symfony → Spring.** JUnit 5 et PHPUnit appartiennent tous deux à la
> famille **xUnit** : la structure (classe de test, méthode par cas,
> setup/teardown, assertions) est quasiment identique — un développeur
> PHPUnit lit du JUnit sans effort d'adaptation.

## AssertJ : des assertions fluides et lisibles

```java
import static org.assertj.core.api.Assertions.assertThat;

assertThat(product.getName()).isEqualTo("Laptop");
assertThat(products).hasSize(3);
assertThat(products).extracting(Product::getName).contains("Laptop", "Mouse");
assertThat(price).isGreaterThan(0);
```

> **Symfony → Spring.** AssertJ n'a pas d'équivalent unique en PHPUnit, mais
> son esprit (chaîner des assertions lisibles) se retrouve dans les
> assertions dédiées de PHPUnit (`assertCount`, `assertContains`,
> `assertGreaterThan`) — même intention de lisibilité, syntaxe fluide en
> plus côté Java.

## À retenir

- JUnit 5 et PHPUnit partagent la même structure xUnit — cycle de vie,
  assertions, organisation par classe de test.
- `@BeforeEach`/`@AfterEach` = `setUp()`/`tearDown()`.
- AssertJ (`assertThat(...)`) rend les assertions Java fluides et lisibles,
  dans le même esprit que les assertions dédiées PHPUnit.
