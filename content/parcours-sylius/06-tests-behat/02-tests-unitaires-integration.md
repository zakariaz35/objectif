---
title: "Tests unitaires et d'intégration"
type: lesson
---

# Tests unitaires et d'intégration dans Sylius

Sylius utilise **PHPSpec** pour les tests unitaires des Components (pas PHPUnit) et **PHPUnit** pour les tests d'intégration. Si PHPSpec est nouveau pour vous, le changement conceptuel est significatif : on spécifie le **comportement attendu** via une syntaxe fluide, pas via des assertions classiques.

## PHPSpec — tests unitaires des Components

PHPSpec suit le paradigme **spec-first** (BDD) : on décrit comment un objet **devrait se comporter** via une `ObjectBehavior`.

### Comparaison PHPUnit vs PHPSpec

```php
<?php
// PHPUnit style (assertion-based):
class OrderTest extends TestCase
{
    public function testAddItemIncreasesItemsTotal(): void
    {
        $order = new Order();
        $item = new OrderItem();
        $item->setUnitPrice(1000);

        $order->addItem($item);

        $this->assertEquals(1000, $order->getItemsTotal());
    }
}

// PHPSpec style (specification-based):
class OrderSpec extends ObjectBehavior
{
    function it_should_increase_items_total_when_item_is_added(
        OrderItemInterface $item
    ): void {
        $item->getTotal()->willReturn(1000);
        $item->setOrder($this)->shouldBeCalled();

        $this->addItem($item);
        $this->getItemsTotal()->shouldReturn(1000);
    }
}
```

### Structure d'une Spec

```php
<?php
// spec/Model/WishlistSpec.php

namespace spec\Acme\SyliusWishlistPlugin\Model;

use Acme\SyliusWishlistPlugin\Model\Wishlist;
use PhpSpec\ObjectBehavior;
use Sylius\Component\Core\Model\CustomerInterface;
use Sylius\Component\Core\Model\ProductVariantInterface;

class WishlistSpec extends ObjectBehavior
{
    function it_is_initializable(): void
    {
        $this->shouldHaveType(Wishlist::class);
    }

    function it_has_no_variants_by_default(): void
    {
        $this->getVariants()->shouldHaveCount(0);
    }

    function it_can_add_a_product_variant(ProductVariantInterface $variant): void
    {
        $this->addVariant($variant);
        $this->hasVariant($variant)->shouldReturn(true);
    }

    function it_does_not_add_duplicate_variants(ProductVariantInterface $variant): void
    {
        $this->addVariant($variant);
        $this->addVariant($variant); // second add should be ignored

        $this->getVariants()->shouldHaveCount(1);
    }

    function it_can_be_associated_to_a_customer(CustomerInterface $customer): void
    {
        $this->setCustomer($customer);
        $this->getCustomer()->shouldReturn($customer);
    }
}
```

### Lancer PHPSpec

```bash
# Run all specs
vendor/bin/phpspec run

# Run a specific spec
vendor/bin/phpspec run spec/Model/WishlistSpec.php

# Describe a new class (generates the spec template)
vendor/bin/phpspec describe Acme\\SyliusWishlistPlugin\\Model\\Wishlist
```

## Tester les State Machines

C'est le cas le plus délicat. On doit tester qu'une transition est possible et que les effets de bord sont correctement déclenchés.

### Test d'une transition avec PHPUnit (intégration)

```php
<?php
// tests/Integration/Workflow/OrderWorkflowTest.php

namespace App\Tests\Integration\Workflow;

use Sylius\Component\Order\Model\Order;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Workflow\WorkflowInterface;

final class OrderWorkflowTest extends KernelTestCase
{
    private WorkflowInterface $orderWorkflow;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->orderWorkflow = self::getContainer()->get('state_machine.sylius_order');
    }

    public function testCheckoutTransitionFromCart(): void
    {
        $order = new Order();
        // state is 'cart' by default (from initial_marking config)

        self::assertTrue(
            $this->orderWorkflow->can($order, 'checkout'),
            'Order in cart state should be able to checkout'
        );
    }

    public function testCannotCheckoutFromFulfilledState(): void
    {
        $order = new Order();
        // Simulate a fulfilled order
        $order->setState('fulfilled');

        self::assertFalse(
            $this->orderWorkflow->can($order, 'checkout'),
            'A fulfilled order should not be able to checkout again'
        );
    }

    public function testCheckoutTransitionUpdatesState(): void
    {
        $order = new Order();
        $this->orderWorkflow->apply($order, 'checkout');

        self::assertSame('new', $order->getState());
    }
}
```

### Test d'un Guard

```php
<?php
// spec/Workflow/Guard/OrderCheckoutGuardSpec.php

namespace spec\App\Workflow\Guard;

use App\Workflow\Guard\OrderCheckoutGuard;
use PhpSpec\ObjectBehavior;
use Sylius\Component\Order\Model\OrderInterface;
use Symfony\Component\Workflow\Event\GuardEvent;
use Symfony\Component\Workflow\Marking;
use Symfony\Component\Workflow\StateMachine;
use Symfony\Component\Workflow\Transition;

class OrderCheckoutGuardSpec extends ObjectBehavior
{
    function it_blocks_checkout_when_order_has_no_items(
        GuardEvent $event,
        OrderInterface $order,
    ): void {
        // Mock: empty order
        $order->getItems()->willReturn(new \Doctrine\Common\Collections\ArrayCollection());
        $event->getSubject()->willReturn($order);

        $event->setBlocked(true, \Prophecy\Argument::type('string'))->shouldBeCalled();

        $this->__invoke($event);
    }
}
```

## PHPUnit pour les tests d'intégration

Pour les tests qui nécessitent le conteneur Symfony (repository, workflow, etc.) :

```php
<?php
// tests/Integration/Repository/WishlistRepositoryTest.php

namespace App\Tests\Integration\Repository;

use Acme\SyliusWishlistPlugin\Model\Wishlist;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class WishlistRepositoryTest extends KernelTestCase
{
    public function testFindByCustomer(): void
    {
        self::bootKernel();
        $repository = self::getContainer()->get('acme_sylius_wishlist.repository.wishlist');

        // This test requires a test database with fixtures
        $wishlists = $repository->findBy(['customer' => null]);

        self::assertIsArray($wishlists);
    }
}
```

## Matrice des outils de test Sylius

| Ce qu'on teste | Outil | Pourquoi |
|---|---|---|
| Comportement d'un modèle | PHPSpec | Rapide, pas de conteneur |
| Logique d'un service | PHPSpec | Mock propre via Prophecy |
| Workflow / State Machine | PHPUnit + KernelTestCase | Besoin du conteneur |
| Repository Doctrine | PHPUnit + KernelTestCase | Besoin de la DB |
| Comportement UI end-to-end | Behat + Mink | Teste comme un humain |

## À retenir

- PHPSpec = tests unitaires **orientés comportement** — syntaxe fluide, pas `assert`.
- Les tests de State Machine nécessitent le conteneur Symfony → `KernelTestCase`.
- La matrice test = PHPSpec pour les modèles/services, PHPUnit pour l'intégration, Behat pour l'acceptance.
- Les guards se testent en vérifiant `$event->setBlocked()` est appelé dans les bonnes conditions.

> **Piège agence** : tester l'état de la commande en assignant directement `$order->setState('new')` dans les tests. En production, l'état est géré par le Workflow — le forcer manuellement ne teste pas le comportement réel. Préférez `$workflow->apply($order, 'checkout')` pour que le test soit fidèle.
