---
title: "Exercice — Créer un plugin Sylius de wishlist"
type: exercise
---

## Énoncé

> Durée conseillée : ~45 min. Cet exercice simule un cas réel en agence : créer un plugin Sylius minimal pour ajouter une wishlist (liste de souhaits) sur la boutique.

### Contexte

Votre client veut permettre aux clients connectés d'ajouter des produits à une wishlist. Le plugin doit être standalone (réutilisable dans d'autres projets).

### Ce qu'on vous demande

#### Partie 1 — Structure du plugin

Créez l'arborescence suivante et remplissez chaque fichier :

```
acme/sylius-wishlist-plugin/
├── composer.json
├── AcmeSyliusWishlistPlugin.php
├── DependencyInjection/
│   └── AcmeSyliusWishlistExtension.php
└── src/
    └── Model/
        ├── WishlistInterface.php
        └── Wishlist.php
```

Questions à répondre dans votre code :
1. Quel est le `"type"` dans `composer.json` ?
2. Quelle classe la classe principale du plugin doit-elle étendre ?
3. Quelle méthode de la classe principale indique le namespace des modèles ?
4. Quelle interface doit implémenter l'entité `Wishlist` ?

#### Partie 2 — Override d'entité

L'entité `Wishlist` doit :
- Appartenir à un `CustomerInterface` (relation ManyToOne)
- Contenir une collection de `ProductVariantInterface`
- Avoir un nom (`name`, string)

Esquissez les propriétés Doctrine et les méthodes nécessaires.

#### Partie 3 — Déclaration Resource

Écrivez la configuration `sylius_resource:` qui déclare `acme_sylius_wishlist.wishlist` avec les classes correctes.

#### Partie 4 — Question de réflexion

Expliquez pourquoi on déclare une `WishlistInterface` séparément de la classe `Wishlist`, et dans quel scénario concret cette interface serait utilisée par un autre plugin.

<!--correction-->

## Correction

### Partie 1 — Structure du plugin

#### `composer.json`

```json
{
    "name": "acme/sylius-wishlist-plugin",
    "type": "sylius-plugin",
    "description": "Wishlist plugin for Sylius",
    "require": {
        "php": "^8.2",
        "sylius/sylius": "^2.0"
    },
    "autoload": {
        "psr-4": {
            "Acme\\SyliusWishlistPlugin\\": "src/"
        },
        "files": ["AcmeSyliusWishlistPlugin.php"]
    },
    "extra": {
        "sylius-plugin": {
            "admin": false,
            "shop": true,
            "api": false
        }
    }
}
```

Réponses :
1. `"type": "sylius-plugin"` — distingue du bundle Symfony (`symfony-bundle`).
2. La classe principale étend `Sylius\Bundle\ResourceBundle\AbstractResourceBundle`.
3. La méthode `getModelNamespace()` retourne `'Acme\SyliusWishlistPlugin\Model'`.
4. `Wishlist` doit implémenter `WishlistInterface` qui elle-même étend `Sylius\Component\Resource\Model\ResourceInterface`.

#### `AcmeSyliusWishlistPlugin.php`

```php
<?php

namespace Acme\SyliusWishlistPlugin;

use Sylius\Bundle\ResourceBundle\AbstractResourceBundle;
use Sylius\Bundle\ResourceBundle\SyliusResourceBundle;

final class AcmeSyliusWishlistPlugin extends AbstractResourceBundle
{
    public static function getSupportedDrivers(): array
    {
        return [SyliusResourceBundle::DRIVER_DOCTRINE_ORM];
    }

    protected function getModelNamespace(): string
    {
        return 'Acme\SyliusWishlistPlugin\Model';
    }
}
```

#### `DependencyInjection/AcmeSyliusWishlistExtension.php`

```php
<?php

namespace Acme\SyliusWishlistPlugin\DependencyInjection;

use Sylius\Bundle\ResourceBundle\DependencyInjection\Extension\AbstractResourceBundleExtension;
use Symfony\Component\DependencyInjection\ContainerBuilder;

final class AcmeSyliusWishlistExtension extends AbstractResourceBundleExtension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $config = $this->processConfiguration(
            $this->getConfiguration([], $container),
            $configs
        );

        $this->registerResources(
            'acme_sylius_wishlist',
            'doctrine/orm',
            $config['resources'],
            $container
        );
    }
}
```

### Partie 2 — Override d'entité

#### `src/Model/WishlistInterface.php`

```php
<?php

namespace Acme\SyliusWishlistPlugin\Model;

use Doctrine\Common\Collections\Collection;
use Sylius\Component\Core\Model\CustomerInterface;
use Sylius\Component\Core\Model\ProductVariantInterface;
use Sylius\Component\Resource\Model\ResourceInterface;

interface WishlistInterface extends ResourceInterface
{
    public function getName(): ?string;
    public function setName(?string $name): void;

    public function getCustomer(): ?CustomerInterface;
    public function setCustomer(?CustomerInterface $customer): void;

    public function getVariants(): Collection;
    public function addVariant(ProductVariantInterface $variant): void;
    public function removeVariant(ProductVariantInterface $variant): void;
    public function hasVariant(ProductVariantInterface $variant): bool;
}
```

#### `src/Model/Wishlist.php`

```php
<?php

namespace Acme\SyliusWishlistPlugin\Model;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Sylius\Component\Core\Model\CustomerInterface;
use Sylius\Component\Core\Model\ProductVariantInterface;
use Sylius\Component\Resource\Model\ResourceTrait;

#[ORM\Entity]
#[ORM\Table(name: 'acme_wishlist')]
class Wishlist implements WishlistInterface
{
    use ResourceTrait; // provides $id and getId()

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $name = null;

    #[ORM\ManyToOne(targetEntity: CustomerInterface::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?CustomerInterface $customer = null;

    #[ORM\ManyToMany(targetEntity: ProductVariantInterface::class)]
    #[ORM\JoinTable(name: 'acme_wishlist_product_variant')]
    private Collection $variants;

    public function __construct()
    {
        $this->variants = new ArrayCollection();
    }

    public function getName(): ?string { return $this->name; }
    public function setName(?string $name): void { $this->name = $name; }

    public function getCustomer(): ?CustomerInterface { return $this->customer; }
    public function setCustomer(?CustomerInterface $customer): void { $this->customer = $customer; }

    public function getVariants(): Collection { return $this->variants; }

    public function addVariant(ProductVariantInterface $variant): void
    {
        if (!$this->hasVariant($variant)) {
            $this->variants->add($variant);
        }
    }

    public function removeVariant(ProductVariantInterface $variant): void
    {
        $this->variants->removeElement($variant);
    }

    public function hasVariant(ProductVariantInterface $variant): bool
    {
        return $this->variants->contains($variant);
    }
}
```

### Partie 3 — Déclaration Resource

```yaml
# Resources/config/app/config.yaml
sylius_resource:
    resources:
        acme_sylius_wishlist.wishlist:
            classes:
                model:     Acme\SyliusWishlistPlugin\Model\Wishlist
                interface: Acme\SyliusWishlistPlugin\Model\WishlistInterface
                repository: Sylius\Bundle\ResourceBundle\Doctrine\ORM\EntityRepository
                factory:    Sylius\Component\Resource\Factory\Factory
```

### Partie 4 — Réflexion sur l'interface

L'interface `WishlistInterface` est déclarée séparément pour permettre le **découplage par type**. Scénario concret :

Un plugin tiers (ex. `acme/sylius-wishlist-email-plugin`) veut envoyer un email de rappel aux clients qui ont des articles en wishlist depuis plus de 7 jours. Ce plugin dépend de `WishlistInterface` (pas de `Wishlist` concrète) :

```php
<?php
// In the email plugin:
use Acme\SyliusWishlistPlugin\Model\WishlistInterface;

final class WishlistReminderService
{
    /** @param WishlistInterface[] $wishlists */
    public function sendReminders(array $wishlists): void
    {
        foreach ($wishlists as $wishlist) {
            // Works with any class implementing WishlistInterface
            // including App\Entity\Wishlist (override by the final project)
        }
    }
}
```

Si l'application finale override `Wishlist` par sa propre entité (ex. pour ajouter un champ `isPublic`), le plugin email continue de fonctionner sans modification car il dépend de l'interface. **C'est le principe de Liskov appliqué aux bundles Sylius.**
