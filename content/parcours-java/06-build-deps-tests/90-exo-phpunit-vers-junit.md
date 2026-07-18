---
title: "Exercice — Traduis ce test PHPUnit en JUnit 5 + AssertJ"
type: exercise
---

## Énoncé

> ⏱️ **Durée conseillée : ~15 min.** Un test PHPUnit classique, tel que tu l'écrirais
> pour une classe métier Symfony. Traduis-le en JUnit 5 + AssertJ, en respectant les
> conventions de structure de projet Java vues dans ce module.

```php
<?php

use PHPUnit\Framework\TestCase;

final class DiscountCalculatorTest extends TestCase
{
    private DiscountCalculator $calculator;

    protected function setUp(): void
    {
        $this->calculator = new DiscountCalculator();
    }

    public function testNoDiscountBelowThreshold(): void
    {
        $this->assertEquals(100.0, $this->calculator->apply(100.0, 50.0));
    }

    public function testTenPercentDiscountAboveThreshold(): void
    {
        $this->assertEquals(90.0, $this->calculator->apply(100.0, 150.0));
    }

    public function testThrowsOnNegativeAmount(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->calculator->apply(-10.0, 0.0);
    }
}
```

`DiscountCalculator::apply(float $amount, float $totalSpent)` applique 10% de remise si
`$totalSpent` dépasse 100, sinon renvoie `$amount` inchangé ; lève une exception si
`$amount` est négatif.

Contraintes :
1. Utilise `@BeforeEach` (pas de classe parente à étendre).
2. Utilise AssertJ (`assertThat`) plutôt que les assertions JUnit basiques.
3. Respecte la structure `src/test/java/...` en miroir du package testé.

<!--correction-->

## Correction

```java
// File: src/main/java/com/acme/billing/DiscountCalculator.java
package com.acme.billing;

public class DiscountCalculator {

    public double apply(double amount, double totalSpent) {
        if (amount < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
        if (totalSpent > 100) {
            return amount * 0.9;
        }
        return amount;
    }
}
```

```java
// File: src/test/java/com/acme/billing/DiscountCalculatorTest.java
package com.acme.billing;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DiscountCalculatorTest {

    private DiscountCalculator calculator;

    @BeforeEach
    void setUp() {
        // No parent class to extend, unlike PHPUnit's TestCase — JUnit 5 works via annotations only
        calculator = new DiscountCalculator();
    }

    @Test
    void noDiscountBelowThreshold() {
        assertThat(calculator.apply(100.0, 50.0)).isEqualTo(100.0);
    }

    @Test
    void tenPercentDiscountAboveThreshold() {
        assertThat(calculator.apply(100.0, 150.0)).isEqualTo(90.0);
    }

    @Test
    void throwsOnNegativeAmount() {
        assertThatThrownBy(() -> calculator.apply(-10.0, 0.0))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
```

Points clés de la traduction :

- **Pas de `extends TestCase`** : JUnit 5 fonctionne uniquement par annotations
  (`@Test`, `@BeforeEach`), sans hiérarchie de classe imposée — un vrai changement
  d'habitude venant de PHPUnit historique.
- **`assertThat(...).isEqualTo(...)`** (AssertJ) plutôt que `assertEquals(...)` : plus
  proche, dans l'esprit, de `$this->assertEquals(...)` mais avec une syntaxe fluide plus
  lisible sur des assertions composées.
- **`assertThatThrownBy(() -> ...)`** remplace `expectException()` de PHPUnit : la
  lambda encapsule l'appel qui doit lever l'exception, dans une seule expression
  chaînée plutôt qu'en deux lignes séparées (`expectException` puis l'appel).
- **Structure en miroir** : `DiscountCalculator.java` vit dans
  `src/main/java/com/acme/billing/`, son test dans
  `src/test/java/com/acme/billing/` — même package, dossier différent.
