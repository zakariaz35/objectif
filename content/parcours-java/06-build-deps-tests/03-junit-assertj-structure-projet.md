---
title: "JUnit 5 & AssertJ : tester à la Java"
type: lesson
---

## JUnit 5 : le PHPUnit de Java

**JUnit 5** (aussi appelé *JUnit Jupiter*) est le framework de test de référence, avec
des annotations qui parleront immédiatement à un utilisateur de PHPUnit :

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

class ShoppingCartTest {

    private ShoppingCart cart;

    @BeforeEach
    void setUp() {
        // Runs before EACH test method — like setUp() in PHPUnit
        cart = new ShoppingCart();
    }

    @Test
    @DisplayName("An empty cart has a total of zero")
    void emptyCartHasZeroTotal() {
        assertEquals(0.0, cart.total());
    }

    @Test
    void addingAnItemIncreasesTheTotal() {
        cart.add("apple", 1.20);
        assertEquals(1.20, cart.total());
        assertTrue(cart.isNotEmpty());
    }
}
```

> **PHP → Java.** `@BeforeEach` ↔ `setUp()`, `@Test` ↔ le préfixe `test` (ou l'annotation
> `#[Test]` de PHPUnit récent), `assertEquals`/`assertTrue` sont quasi identiques dans
> les deux mondes. Le vrai changement d'habitude : la classe de test **n'a pas besoin
> d'hériter** d'une classe parente (`TestCase` en PHPUnit) — JUnit 5 fonctionne par
> **annotations seules**, sans hiérarchie imposée.

## Tests paramétrés : éviter la répétition

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@ParameterizedTest
@ValueSource(strings = {"", " ", "   "})
void blankStringsAreConsideredEmpty(String input) {
    assertTrue(input.isBlank());
}
```

> **Passerelle.** C'est l'équivalent des `@dataProvider` de PHPUnit — même intention
> (exécuter le même test avec plusieurs jeux de données), syntaxe différente mais tout
> aussi lisible.

## AssertJ : des assertions fluides, plus lisibles

JUnit fournit des assertions basiques (`assertEquals`, `assertTrue`...). **AssertJ** est
une bibliothèque complémentaire, quasi systématiquement ajoutée en pratique, qui offre
une syntaxe **fluide** bien plus expressive :

```java
import static org.assertj.core.api.Assertions.assertThat;

@Test
void cartBehavesCorrectlyAfterAddingItems() {
    cart.add("apple", 1.20);
    cart.add("banana", 0.80);

    assertThat(cart.total()).isEqualTo(2.00);
    assertThat(cart.itemNames()).containsExactly("apple", "banana");
    assertThat(cart.isNotEmpty()).isTrue();
}

@Test
void divisionByZeroThrows() {
    Calculator calc = new Calculator();

    assertThatThrownBy(() -> calc.divide(10, 0))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Division by zero");
}
```

> **Passerelle.** `assertThat(...)->...` (AssertJ) ressemble beaucoup à
> `$this->assertThat(...)` de PHPUnit, ou aux assertions fluides de Pest
> (`expect($value)->toBe(...)`) si tu en as croisé. `assertThatThrownBy(...)` remplace
> avantageusement le `expectException()` de PHPUnit — plus lisible en une seule
> expression chaînée.

## Structure d'un projet réel : les tests en miroir

```
billing-service/
├─ pom.xml
├─ src/
│  ├─ main/java/com/acme/billing/
│  │  ├─ Invoice.java
│  │  └─ InvoiceService.java
│  └─ test/java/com/acme/billing/
│     ├─ InvoiceTest.java
│     └─ InvoiceServiceTest.java
```

> **Réflexe à prendre.** Chaque classe de test **reproduit exactement** le package de la
> classe testée (`com.acme.billing` dans les deux cas), et son nom suit la convention
> `NomDeLaClasseTest` (ou `NomDeLaClasseTests`, selon la config Surefire/Gradle). C'est
> plus rigide que la convention `tests/Unit/...` de PHPUnit/Symfony, mais permet à l'IDE
> de naviguer instantanément entre une classe et son test (raccourci quasi universel dans
> les IDE Java : « Go to test »).

```bash
mvn test              # runs all tests in src/test/java
mvn test -Dtest=InvoiceServiceTest   # runs a single test class
```

## À retenir

- **JUnit 5** fonctionne par annotations (`@Test`, `@BeforeEach`, `@ParameterizedTest`),
  sans classe parente imposée — contrairement à `TestCase` de PHPUnit historique.
- **AssertJ** ajoute des assertions **fluides** (`assertThat(...).isEqualTo(...)`),
  quasi systématiquement utilisées en complément de JUnit en pratique.
- La structure `src/test/java/...` **reproduit exactement** le package du code testé —
  une convention plus rigide que celle de PHPUnit.
- `mvn test` (ou `./gradlew test`) exécute la suite ; le plugin Surefire (Maven) ou la
  tâche `test` (Gradle) orchestre l'exécution.
