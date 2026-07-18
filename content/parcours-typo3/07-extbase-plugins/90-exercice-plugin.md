---
title: "Exercice — Créer un plugin Extbase complet"
type: exercise
---

## Énoncé

Tu travailles sur le site d'une agence immobilière. Tu dois créer un plugin TYPO3 Extbase
`AcmeImmo / Properties` qui liste des biens immobiliers.

### Contexte

- La table `tx_acmeimmo_domain_model_property` existe déjà en BDD avec les colonnes :
  `uid`, `title`, `price`, `surface`, `city`, `hidden`, `deleted`, `pid`.
- L'extension `acme_immo` est installée et active.

### Travail demandé

1. Écris la classe **Model** `Property` avec les propriétés `title` (string),
   `price` (float), `surface` (int), `city` (string). Ajoute les getters.

2. Écris la classe **Repository** `PropertyRepository` avec une méthode
   `findByCity(string $city): array` qui retourne les biens d'une ville donnée,
   triés par prix croissant.

3. Écris l'**ActionController** `PropertyController` avec :
   - `listAction()` : récupère tous les biens (limite par `$this->settings['limit']`
     ou 10 par défaut) et les passe à la vue.
   - `detailAction(Property $property)` : passe le bien à la vue.

4. Écris le code d'**enregistrement du plugin** dans `ext_localconf.php`.

### Contraintes

- Utilise l'injection de dépendances via le constructeur.
- `detailAction` doit être non-cacheable.
- Le nom du plugin dans le sélecteur backend doit être « Acme Immo — Annonces ».

<!--correction-->

## Correction

### 1. Model Property

```php
<?php
// Classes/Domain/Model/Property.php
namespace Acme\Immo\Domain\Model;

use TYPO3\CMS\Extbase\DomainObject\AbstractEntity;

class Property extends AbstractEntity
{
    protected string $title = '';
    protected float $price = 0.0;
    protected int $surface = 0;
    protected string $city = '';

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getPrice(): float
    {
        return $this->price;
    }

    public function getSurface(): int
    {
        return $this->surface;
    }

    public function getCity(): string
    {
        return $this->city;
    }
}
```

### 2. Repository PropertyRepository

```php
<?php
// Classes/Domain/Repository/PropertyRepository.php
namespace Acme\Immo\Domain\Repository;

use TYPO3\CMS\Extbase\Persistence\Repository;
use TYPO3\CMS\Extbase\Persistence\QueryInterface;

class PropertyRepository extends Repository
{
    public function findByCity(string $city): array
    {
        $query = $this->createQuery();
        $query->matching(
            $query->equals('city', $city)
        );
        $query->setOrderings([
            'price' => QueryInterface::ORDER_ASCENDING,
        ]);
        return $query->execute()->toArray();
    }
}
```

### 3. ActionController

```php
<?php
// Classes/Controller/PropertyController.php
namespace Acme\Immo\Controller;

use Acme\Immo\Domain\Model\Property;
use Acme\Immo\Domain\Repository\PropertyRepository;
use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;

class PropertyController extends ActionController
{
    public function __construct(
        private readonly PropertyRepository $propertyRepository
    ) {}

    public function listAction(): ResponseInterface
    {
        $limit = (int)($this->settings['limit'] ?? 10);
        $properties = $this->propertyRepository->findAll();

        // Apply limit manually (findAll returns QueryResult, not array)
        $this->view->assign('properties', array_slice($properties->toArray(), 0, $limit));

        return $this->htmlResponse();
    }

    public function detailAction(Property $property): ResponseInterface
    {
        $this->view->assign('property', $property);
        return $this->htmlResponse();
    }
}
```

### 4. Enregistrement dans ext_localconf.php

```php
<?php
// ext_localconf.php
\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
    'AcmeImmo',
    'Properties',
    [
        \Acme\Immo\Controller\PropertyController::class => 'list, detail',
    ],
    // Non-cacheable actions (detail depends on URL argument)
    [
        \Acme\Immo\Controller\PropertyController::class => 'detail',
    ]
);
```

```php
<?php
// Configuration/TCA/Overrides/tt_content.php
\TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
    'AcmeImmo',
    'Properties',
    'Acme Immo — Annonces',
    'EXT:acme_immo/Resources/Public/Icons/plugin_properties.svg'
);
```

### Points clés

- Le constructeur reçoit `PropertyRepository` par injection — pas `GeneralUtility::makeInstance()`.
- `detail` est dans le tableau des actions non-cacheables car elle dépend d'un paramètre
  d'URL (`?tx_acmeimmo_properties[property]=42`).
- `configurePlugin` reçoit le nom d'extension sans `acme_` (convention UpperCamelCase).
- `findAll()` retourne un `QueryResult` (iterable) ; `toArray()` est nécessaire pour `array_slice`.
