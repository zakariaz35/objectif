---
title: "Exercice — traduire un service Symfony autowiré en beans Spring"
type: exercise
---

## Énoncé

Voici un service Symfony existant, injecté par autowiring classique :

```php
<?php
// src/Pricing/TaxRateProviderInterface.php
namespace App\Pricing;

interface TaxRateProviderInterface
{
    public function currentRate(): float;
}
```

```php
<?php
// src/Pricing/StandardTaxRateProvider.php
namespace App\Pricing;

class StandardTaxRateProvider implements TaxRateProviderInterface
{
    public function currentRate(): float
    {
        return 0.20;
    }
}
```

```php
<?php
// src/Billing/InvoiceCalculator.php
namespace App\Billing;

use App\Pricing\TaxRateProviderInterface;

class InvoiceCalculator
{
    public function __construct(
        private TaxRateProviderInterface $taxRateProvider,
    ) {
    }

    public function priceWithTax(float $price): float
    {
        return $price * (1 + $this->taxRateProvider->currentRate());
    }
}
```

**Tâche** : traduis ce code en Java/Spring :

1. Une interface `TaxRateProvider` avec la méthode `currentRate()`.
2. Une implémentation `StandardTaxRateProvider`, déclarée comme bean.
3. Un service `InvoiceCalculator`, injecté par **constructeur**, avec sa
   méthode `priceWithTax(double price)`.

Utilise les bons stéréotypes (`@Component`/`@Service`) et respecte le
réflexe « injection par constructeur ».

<!--correction-->

## Correction

```java
// TaxRateProvider.java
package com.example.shop.pricing;

public interface TaxRateProvider {
    double currentRate();
}
```

```java
// StandardTaxRateProvider.java
package com.example.shop.pricing;

import org.springframework.stereotype.Component;

@Component
public class StandardTaxRateProvider implements TaxRateProvider {

    @Override
    public double currentRate() {
        return 0.20;
    }
}
```

```java
// InvoiceCalculator.java
package com.example.shop.billing;

import com.example.shop.pricing.TaxRateProvider;
import org.springframework.stereotype.Service;

@Service
public class InvoiceCalculator {

    private final TaxRateProvider taxRateProvider;

    public InvoiceCalculator(TaxRateProvider taxRateProvider) {
        this.taxRateProvider = taxRateProvider;
    }

    public double priceWithTax(double price) {
        return price * (1 + taxRateProvider.currentRate());
    }
}
```

- L'interface PHP `TaxRateProviderInterface` devient une interface Java
  `TaxRateProvider` — même rôle : découpler le contrat de son
  implémentation.
- `StandardTaxRateProvider` porte `@Component` : sans cette annotation,
  Spring ne la verrait jamais (contrairement à Symfony, qui autoconfigure
  toute classe de `src/` par défaut).
- `InvoiceCalculator` reçoit son unique dépendance par **constructeur**,
  résolue automatiquement par type (`TaxRateProvider`) — exactement comme
  l'autowiring Symfony résout `TaxRateProviderInterface` grâce au typage du
  paramètre du constructeur.
- Une seule implémentation existe ici : pas besoin de `@Qualifier` ni de
  `@Primary`. S'il y en avait deux, ce serait le moment de trancher, comme en
  Symfony avec un alias explicite.
