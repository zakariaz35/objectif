---
title: "Test blanc — Certification Sylius Certified Developer"
type: lesson
---

# Test blanc — Certification Sylius Certified Developer

60 questions couvrant l'ensemble des domaines de la certification officielle Sylius Foundation. Durée conseillée : **90 minutes**. Une seule bonne réponse par question (A/B/C/D).

---

## Domaine 1 — Architecture & ResourceBundle (Q1–Q12)

**Q1.** Quelle couche de Sylius contient les modèles et la logique métier **sans aucune dépendance Symfony** ?

A) `Sylius\Bundle\*`
B) `Sylius\Component\*`
C) `Sylius\Plugin\*`
D) `App\Sylius\*`

---

**Q2.** Dans `composer.json` d'un plugin Sylius, quelle valeur de `"type"` est requise ?

A) `symfony-bundle`
B) `sylius-extension`
C) `sylius-plugin`
D) `php-plugin`

---

**Q3.** Quelle interface doit implémenter toute entité déclarée comme Resource Sylius ?

A) `Sylius\Component\Resource\Model\IdentifiableInterface`
B) `Sylius\Component\Resource\Model\ResourceInterface`
C) `Sylius\Component\Resource\Model\PersistableInterface`
D) `Doctrine\ORM\Entity`

---

**Q4.** Après avoir déclaré `sylius_resource: resources: app.book:`, quel service est automatiquement enregistré dans le conteneur ?

A) `book.service`
B) `app.repository.book`
C) `doctrine.orm.book`
D) `sylius.crud.book`

---

**Q5.** Pourquoi utilise-t-on `$factory->createNew()` plutôt que `new Book()` dans Sylius ?

A) Pour que Doctrine génère un UUID automatiquement
B) Pour déclencher les événements ResourceBundle
C) Pour permettre la substitution de la Factory sans modifier le code appelant
D) Parce que `new` est interdit dans les services Symfony

---

**Q6.** Quel trait fournit l'implémentation de `getId()` pour une entité Resource ?

A) `Sylius\Component\Resource\Model\IdentityTrait`
B) `Sylius\Component\Resource\Model\ResourceTrait`
C) `Sylius\Bundle\ResourceBundle\Doctrine\ResourceTrait`
D) `Sylius\Component\Resource\Model\TimestampableTrait`

---

**Q7.** Quel événement Symfony est dispatché **après** la sauvegarde en base lors de la création d'une Resource `app.order` ?

A) `sylius.order.after_create`
B) `sylius.order.created`
C) `sylius.order.post_create`
D) `kernel.order.flush`

---

**Q8.** Comment déclarer des routes CRUD automatiques pour une Resource `app.book` ?

A) `type: doctrine.resource` dans le fichier de routes
B) `type: sylius.resource` dans le fichier de routes
C) `type: rest` avec l'alias `app.book`
D) Via une annotation `@Resource` sur le controller

---

**Q9.** Quelle classe faut-il étendre pour que le mécanisme d'override de Resource soit activé dans un plugin ?

A) `Symfony\Component\HttpKernel\Bundle\Bundle`
B) `Sylius\Bundle\ResourceBundle\AbstractResourceBundle`
C) `Sylius\Bundle\CoreBundle\AbstractCoreBundle`
D) `Symfony\Bundle\FrameworkBundle\Controller\AbstractController`

---

**Q10.** Quelle méthode de `AbstractResourceBundle` doit-on surcharger pour indiquer le namespace des modèles du plugin ?

A) `getResourceNamespace()`
B) `getEntityPath()`
C) `getModelNamespace()`
D) `getResourcePath()`

---

**Q11.** Où doit-on placer les migrations Doctrine générées pour un plugin Sylius ?

A) Dans le dossier `migrations/` du plugin lui-même
B) Dans le dossier `migrations/` de l'application finale
C) Dans `Resources/config/doctrine/migrations/` du plugin
D) Sylius gère les migrations automatiquement via son installeur

---

**Q12.** Un `ResourceRepository` dans Sylius étend quelle classe de base ?

A) `Doctrine\ORM\EntityRepository`
B) `Sylius\Bundle\ResourceBundle\Doctrine\ORM\EntityRepository`
C) `Symfony\Bridge\Doctrine\RegistryInterface`
D) `Sylius\Component\Resource\Repository\AbstractRepository`

---

## Domaine 2 — State Machine & Workflow (Q13–Q22)

**Q13.** Dans WinzouStateMachineBundle, quel type de callback peut **bloquer** une transition ?

A) `before`
B) `after`
C) `guard`
D) `on_leave`

---

**Q14.** Quelle valeur de `type:` dans la config Symfony Workflow garantit qu'**un seul état est actif** à la fois ?

A) `type: workflow`
B) `type: state_machine`
C) `type: exclusive`
D) `type: single`

---

**Q15.** Dans Symfony Workflow, quelle propriété de config `marking_store` fait le lien avec la propriété PHP de l'entité ?

A) `field`
B) `column`
C) `property`
D) `attribute`

---

**Q16.** Quel événement Symfony Workflow est déclenché **juste avant** qu'une transition commence (et peut la bloquer) ?

A) `workflow.<name>.before.<transition>`
B) `workflow.<name>.guard.<transition>`
C) `workflow.<name>.check.<transition>`
D) `workflow.<name>.pre.<transition>`

---

**Q17.** Quelle commande Symfony affiche la représentation graphique d'un workflow ?

A) `bin/console workflow:show sylius_order`
B) `bin/console workflow:graph sylius_order`
C) `bin/console workflow:dump sylius_order`
D) `bin/console debug:workflow sylius_order`

---

**Q18.** Dans le workflow `sylius_order`, quel est l'état initial d'une nouvelle commande (panier) ?

A) `new`
B) `pending`
C) `cart`
D) `created`

---

**Q19.** Dans WinzouStateMachineBundle, quelle méthode faut-il appeler **avant** `apply()` pour vérifier qu'une transition est applicable ?

A) `isAllowed()`
B) `canTransition()`
C) `can()`
D) `isEnabled()`

---

**Q20.** Dans Symfony Workflow, comment bloquer une transition dans un guard ?

A) `throw new TransitionException()`
B) `$event->setBlocked(true, 'reason')`
C) `$event->reject()`
D) `return false`

---

**Q21.** Quel workflow Sylius gère les états de **chaque objet `Payment`** individuel (pas la commande globale) ?

A) `sylius_order_payment`
B) `sylius_payment`
C) `sylius_order`
D) `sylius_transaction`

---

**Q22.** Quelle est la séquence correcte des états du workflow `sylius_order_checkout` ?

A) `cart` → `new` → `fulfilled` → `completed`
B) `cart` → `addressed` → `shipping_selected` → `payment_selected` → `completed`
C) `pending` → `addressed` → `confirmed` → `paid`
D) `cart` → `checkout` → `payment` → `done`

---

## Domaine 3 — Grid & Admin (Q23–Q30)

**Q23.** Dans SyliusGridBundle, quel type de colonne permet un rendu HTML entièrement custom via un template Twig ?

A) `type: html`
B) `type: custom`
C) `type: twig`
D) `type: template`

---

**Q24.** Où se placent les actions qui apparaissent **sur chaque ligne** d'une Grid Sylius ?

A) `actions: main:`
B) `actions: row:`
C) `actions: item:`
D) `actions: inline:`

---

**Q25.** Pour surcharger `Product/_form.html.twig` de `SyliusAdminBundle`, où créer le fichier ?

A) `templates/admin/Product/_form.html.twig`
B) `templates/bundles/SyliusAdminBundle/Product/_form.html.twig`
C) `templates/override/admin/Product/_form.html.twig`
D) `Resources/views/SyliusAdminBundle/Product/_form.html.twig`

---

**Q26.** Quelle syntaxe Twig permet d'étendre le template **original** d'un bundle sans récursion infinie ?

A) `{% extends '@SyliusAdmin/Product/_form.html.twig' %}`
B) `{% extends '@!SyliusAdmin/Product/_form.html.twig' %}`
C) `{% extends 'original:@SyliusAdmin/Product/_form.html.twig' %}`
D) `{% parent_extends '@SyliusAdmin/Product/_form.html.twig' %}`

---

**Q27.** Quel événement KnpMenu permet d'ajouter des entrées dans le menu principal de l'Admin Sylius ?

A) `sylius.menu.admin.sidebar`
B) `sylius.menu.admin.main`
C) `knp_menu.admin.build`
D) `sylius.admin.navigation`

---

**Q28.** Dans une Grid Sylius, quel filtre de type `select` attend-on pour filtrer par une liste de valeurs fixes ?

A) `type: choice`
B) `type: select`
C) `type: enum`
D) `type: options`

---

**Q29.** Quelle propriété de la config Grid définit le **tri par défaut** de la liste ?

A) `default_sort:`
B) `order:`
C) `sorting:`
D) `sort_by:`

---

**Q30.** Dans une action item de type `links` dans une Grid, quelle option permet de passer l'`id` de la ligne courante dans la route ?

A) `options: { id: row.id }`
B) `options: { parameters: { id: resource.id } }`
C) `options: { route_params: { id: item.id } }`
D) `options: { bind: { id: entity.id } }`

---

## Domaine 4 — Catalogue, Order, Checkout (Q31–Q42)

**Q31.** Dans Sylius, quel objet est ajouté au panier lors d'un achat ?

A) `Product`
B) `ProductVariant`
C) `ProductOption`
D) `ProductTranslation`

---

**Q32.** Où est stocké le prix d'un produit dans Sylius ?

A) Dans `Product` (une propriété `price`)
B) Dans `ProductVariant` (une propriété `price`)
C) Dans `ChannelPricing` (lié à un variant ET un channel)
D) Dans `Taxon` (prix de catégorie)

---

**Q33.** Quel est le format de tous les montants monétaires dans Sylius ?

A) Float PHP (ex. `29.99`)
B) String (ex. `"29.99"`)
C) Entier en centimes (ex. `2999`)
D) Objet `Money`

---

**Q34.** Quelle structure de données Doctrine utilisent les Taxons pour former un arbre ?

A) Closure Table
B) Adjacency List
C) NestedSet (Gedmo)
D) Materialized Path

---

**Q35.** Un `Product` peut appartenir à combien de Taxons dans Sylius ?

A) Un seul (mainTaxon)
B) Exactement deux
C) Plusieurs (many-to-many)
D) Aucun (les Taxons sont sur les Variants)

---

**Q36.** Qu'est-ce qu'un `Channel` dans Sylius ?

A) Un canal de communication email/SMS
B) Une boutique ou sous-site avec sa propre locale, devise et catalogue de méthodes
C) Un segment de clients
D) Un canal de distribution logistique

---

**Q37.** Quelle entité porte les `Adjustment` (taxes, remises, frais) dans une commande ?

A) Seulement `Order`
B) `Order`, `OrderItem` et `OrderItemUnit`
C) Seulement `OrderItem`
D) `Payment` et `Shipment`

---

**Q38.** Quel service Sylius recalcule les totaux d'une commande après modification ?

A) `OrderRecalculator`
B) `OrderTotalUpdater`
C) `OrderProcessor` (CompositeOrderProcessor)
D) `AdjustmentCalculator`

---

**Q39.** Dans le workflow `sylius_order_checkout`, quelle transition fait passer de `addressed` à `shipping_selected` ?

A) `address`
B) `select_shipping`
C) `add_shipping`
D) `shipping_done`

---

**Q40.** Comment ajouter un champ à l'entité `Address` de Sylius sans modifier le vendor ?

A) Créer `App\Entity\Address` qui étend `Sylius\Component\Addressing\Model\Address` + déclarer l'override dans `sylius_addressing.yaml`
B) Modifier directement `vendor/sylius/.../Address.php`
C) Ajouter une colonne SQL via une migration orpheline
D) Créer un EventListener qui hydrate le champ depuis la session

---

**Q41.** Quelle interface représente une étape du checkout dans Sylius ?

A) `Sylius\Component\Core\Checkout\CheckoutStepInterface`
B) `Sylius\Component\Order\Model\OrderInterface`
C) Il n'y a pas d'interface step — ce sont des controllers Symfony standard
D) `Sylius\Bundle\ShopBundle\Step\AbstractStep`

---

**Q42.** Quelle méthode de l'`OrderInterface` retourne le total de la commande **en centimes** ?

A) `getAmount()`
B) `getTotalPrice()`
C) `getTotal()`
D) `getGrandTotal()`

---

## Domaine 5 — Payment & Shipping (Q43–Q48)

**Q43.** Quelle librairie PHP Sylius utilise-t-il comme couche d'abstraction des paiements ?

A) OmniPay
B) Payum
C) Stripe SDK natif
D) Symfony Payment Component

---

**Q44.** Comment une `ShippingMethod` Sylius est-elle associée à une zone géographique ?

A) Via une propriété `country_code` sur la ShippingMethod
B) Via une entité `Zone` associée à la ShippingMethod
C) Via le Channel uniquement
D) Via les Taxons du produit

---

**Q45.** Quel tag de service Symfony faut-il déclarer pour enregistrer un calculateur de frais de livraison custom ?

A) `sylius.shipping_method`
B) `sylius.shipping_rate`
C) `sylius.shipping_calculator`
D) `sylius.delivery_calculator`

---

**Q46.** Quels sont les états possibles d'un objet `Payment` dans le workflow `sylius_payment` ?

A) `pending`, `confirmed`, `failed`
B) `new`, `processing`, `completed`, `failed`, `cancelled`, `refunded`
C) `awaiting`, `paid`, `error`, `void`
D) `cart`, `new`, `shipped`, `delivered`

---

**Q47.** Quelle méthode de `CalculatorInterface` retourne le code unique du calculateur, utilisé dans la config Admin ?

A) `getName()`
B) `getCode()`
C) `getType()`
D) `getIdentifier()`

---

**Q48.** Dans Payum, quelle `Request` représente la **capture** (débit) d'un paiement ?

A) `Payum\Core\Request\Charge`
B) `Payum\Core\Request\Capture`
C) `Payum\Core\Request\Execute`
D) `Payum\Core\Request\Pay`

---

## Domaine 6 — Plugin development & Override (Q49–Q56)

**Q49.** Dans le pattern d'override d'entité Sylius, pourquoi utilise-t-on un **Trait** plutôt qu'une propriété directement dans la classe enfant ?

A) Pour des raisons de performance Doctrine
B) Pour faciliter la réutilisation du code dans plusieurs entités et isoler les champs ajoutés
C) Parce que Sylius interdit d'ajouter des propriétés dans les classes enfants
D) Pour que PHPSpec puisse mocker les propriétés

---

**Q50.** Quel est le nom du dossier Symfony standard pour surcharger les templates d'un Bundle ?

A) `templates/override/<BundleName>/`
B) `templates/bundles/<BundleName>/`
C) `templates/views/<BundleName>/`
D) `Resources/views/<BundleName>/`

---

**Q51.** Comment décorer le service `sylius.shipping_calculator.flat_rate` en Symfony 6+ ?

A) `implements: [sylius.shipping_calculator.flat_rate]` dans `services.yaml`
B) Attribut PHP `#[AsDecorator(decorates: 'sylius.shipping_calculator.flat_rate')]` sur la classe
C) `tags: [{ name: decorator, target: sylius.shipping_calculator.flat_rate }]`
D) Appeler `$container->decorate()` dans l'Extension DI

---

**Q52.** Dans un `AbstractTypeExtension` Symfony qui étend un FormType Sylius, quelle méthode indique le FormType cible ?

A) `getExtendedType()`
B) `getParentType()`
C) `getExtendedTypes()`
D) `supports()`

---

**Q53.** Quel prefixe doit avoir l'alias de vos Resources dans la config `sylius_resource:` pour éviter les collisions avec les plugins tiers ?

A) Le nom de votre entité (`book.book`)
B) Le nom de votre application ou plugin (`app.book`, `acme_review.review`)
C) Le nom du Bundle parent (`sylius.book`)
D) Un UUID généré (`uuid1234.book`)

---

**Q54.** Dans un plugin Sylius, où placer les fichiers de mapping Doctrine (`.orm.xml`) pour qu'ils soient chargés automatiquement ?

A) `src/Doctrine/`
B) `Resources/config/doctrine/model/`
C) `config/packages/doctrine/`
D) `doctrine/mappings/`

---

**Q55.** Vous décorrez le service `app.factory.product`. Dans la config du décorateur, quel alias pointe vers l'instance décorée (l'original) ?

A) `'@app.factory.product.original'`
B) `'@.inner'`
C) `'@decorated'`
D) `'@parent'`

---

**Q56.** Quel est le principal risque d'un override de template **complet** (sans `{% extends %}`) dans Sylius ?

A) Performances dégradées
B) Les corrections de sécurité ou d'accessibilité apportées par Sylius ne seront pas appliquées automatiquement
C) Twig refuse de charger les templates complets
D) Le système de traduction Sylius ne fonctionnera plus

---

## Domaine 7 — Tests Behat & PHPSpec (Q57–Q60)

**Q57.** Dans Behat, quelle section d'une feature définit des étapes exécutées **avant chaque scénario** ?

A) `Setup:`
B) `Before:`
C) `Background:`
D) `Prerequisites:`

---

**Q58.** Dans PHPSpec, quelle syntaxe vérifie qu'une méthode d'un collaborateur est appelée lors du test ?

A) `$collaborator->expects()->once()->method('doSomething')`
B) `$collaborator->doSomething()->shouldBeCalled()`
C) `self::assertMethodCalled($collaborator, 'doSomething')`
D) `$this->spy($collaborator)->doSomething()`

---

**Q59.** Quel Context Behat Sylius est indispensable pour **isoler les scénarios** entre eux (reset de la DB) ?

A) `Sylius\Behat\Context\Setup\ProductContext`
B) `Sylius\Behat\Context\Ui\Shop\HomepageContext`
C) `Sylius\Behat\Context\Hook\DoctrineORMContext`
D) `Behat\MinkExtension\Context\MinkContext`

---

**Q60.** Quel tag Gherkin réserve-t-on dans Sylius aux scénarios Behat qui nécessitent un **vrai navigateur** (JavaScript) ?

A) `@browser`
B) `@selenium`
C) `@javascript`
D) `@ui_full`

---

---

## Corrigé complet avec justifications

### Domaine 1 — Architecture & ResourceBundle

**Q1 — Réponse : B**
Les `Sylius\Component\*` contiennent les modèles, interfaces et logique métier en PHP pur, sans aucune dépendance sur Symfony. Les Bundles (`Sylius\Bundle\*`) s'appuient sur Symfony (DI, Doctrine, Forms…). La séparation permet d'utiliser les Components dans n'importe quel projet PHP.

**Q2 — Réponse : C**
`"type": "sylius-plugin"` est la valeur requise dans `composer.json` d'un plugin Sylius. Elle permet aux outils Sylius et Flex de traiter le package différemment d'un simple bundle Symfony (`symfony-bundle`). Les options A, B, D n'existent pas comme conventions Sylius.

**Q3 — Réponse : B**
`Sylius\Component\Resource\Model\ResourceInterface` est l'interface de base que doit implémenter toute entité Resource. Elle fournit `getId(): mixed`. En pratique, on utilise le `ResourceTrait` pour l'implémentation. Sans cette interface, ResourceBundle ne reconnaît pas l'entité.

**Q4 — Réponse : B**
ResourceBundle enregistre automatiquement `app.repository.book`, `app.factory.book` et `app.manager.book`. Le pattern de nommage est `<namespace>.<type>.<resource>`. `doctrine.orm.book` et `sylius.crud.book` ne sont pas des services générés par Sylius.

**Q5 — Réponse : C**
La Factory est un service injectable et remplaçable. N'importe quel plugin peut la décorer (`app.factory.book: class: CustomBookFactory`) sans modifier le code métier. Avec `new Book()`, le code est couplé à la classe concrète. Les options A et D sont incorrectes (Doctrine n'a pas besoin de Factory pour les UUID, et `new` n'est pas interdit dans Symfony).

**Q6 — Réponse : B**
`Sylius\Component\Resource\Model\ResourceTrait` fournit l'implémentation de la propriété `$id` et de la méthode `getId()`. C'est le seul trait officiel pour les Resources. `TimestampableTrait` existe aussi mais ne fournit pas `getId()`.

**Q7 — Réponse : C**
La convention ResourceBundle est `sylius.<resource_name>.<pre|post>_<action>`. Pour une Resource `app.order`, l'événement après création est `sylius.order.post_create`. `after_create` et `created` ne suivent pas la convention officielle.

**Q8 — Réponse : B**
`type: sylius.resource` dans la config de routes Symfony active la génération automatique des routes CRUD pour une Resource. `doctrine.resource` n'existe pas, `type: rest` est le FOSRestBundle, et les annotations `@Resource` ne font pas partie de Sylius.

**Q9 — Réponse : B**
`Sylius\Bundle\ResourceBundle\AbstractResourceBundle` active le mécanisme d'override via `getModelNamespace()`. Un `Bundle` Symfony standard ne connaît pas ce mécanisme. `AbstractCoreBundle` et `AbstractController` n'existent pas dans ce contexte Sylius.

**Q10 — Réponse : C**
`getModelNamespace()` retourne le namespace PHP des modèles du plugin (ex. `'Acme\SyliusWishlistPlugin\Model'`). C'est cette valeur que Sylius utilise pour résoudre les overrides déclarés dans `sylius_<bundle>: resources:`. Les autres méthodes de l'option A, B, D n'existent pas dans `AbstractResourceBundle`.

**Q11 — Réponse : B**
Les migrations doivent toutes résider dans le dossier `migrations/` de l'**application finale**. Inclure des migrations dans un plugin crée des conflits de numérotation entre plugins. La convention Sylius est de livrer les fichiers de mapping Doctrine dans le plugin et de laisser `doctrine:migrations:diff` dans l'app générer la migration combinée.

**Q12 — Réponse : B**
`Sylius\Bundle\ResourceBundle\Doctrine\ORM\EntityRepository` est la classe de base des repositories Sylius. Elle étend `Doctrine\ORM\EntityRepository` mais ajoute des méthodes Resource (`add`, `remove`) et est compatible avec `RepositoryInterface`. La réponse A est le repo Doctrine pur, sans les extensions Sylius.

---

### Domaine 2 — State Machine & Workflow

**Q13 — Réponse : C**
Dans WinzouStateMachineBundle, le type `guard` est le seul qui peut **bloquer** une transition via `$event->setRejected()`. Les callbacks `before` et `after` s'exécutent mais ne peuvent pas annuler la transition. `on_leave` n'est pas un type de callback Winzou (c'est une notion de Symfony Workflow).

**Q14 — Réponse : B**
`type: state_machine` garantit qu'un seul état est actif à la fois (marquage singulier). `type: workflow` est un Petri net qui permet plusieurs états simultanés. `exclusive` et `single` ne sont pas des valeurs valides dans la config Symfony Workflow.

**Q15 — Réponse : C**
```yaml
marking_store:
    type: method
    property: state
```
`property: state` indique au Workflow d'appeler `getState()` / `setState()` sur l'objet. `field` et `column` sont des options Doctrine, pas Symfony Workflow. `attribute` n'est pas une option valide.

**Q16 — Réponse : B**
`workflow.<name>.guard.<transition>` est l'événement qui permet de bloquer une transition. Il est dispatché avant tout autre événement de la transition. `before`, `check` et `pre` ne sont pas des suffixes d'événements Symfony Workflow.

**Q17 — Réponse : C**
`bin/console workflow:dump <name>` génère une représentation graphique au format Graphviz (`.dot`) par défaut, ou Mermaid avec `--dump-format=mermaid`. `workflow:show`, `workflow:graph`, `debug:workflow` ne sont pas des commandes existantes dans Symfony.

**Q18 — Réponse : C**
L'état initial du workflow `sylius_order` est `cart`. Une commande fraîche (panier en cours) est dans l'état `cart`. La transition `checkout` fait passer vers `new`. `pending` et `created` ne sont pas des états de ce workflow.

**Q19 — Réponse : C**
`$stateMachine->can('transition')` retourne un booléen indiquant si la transition est applicable depuis l'état courant. `isAllowed()`, `canTransition()` et `isEnabled()` ne sont pas des méthodes de l'API WinzouStateMachine.

**Q20 — Réponse : B**
Dans un guard Symfony Workflow, `$event->setBlocked(true, 'reason')` bloque la transition avec un message optionnel. Lancer une exception `TransitionException` est une approche valide pour signaler une erreur, mais pas le mécanisme officiel de blocage dans un guard. `reject()` et `return false` ne fonctionnent pas.

**Q21 — Réponse : B**
`sylius_payment` gère l'état de chaque objet `Payment` individuel (`new` → `processing` → `completed` / `failed` / `refunded`). `sylius_order_payment` gère l'état de paiement **global** de la commande (ex. `awaiting_payment` → `partially_paid` → `paid`). Ce sont deux workflows distincts.

**Q22 — Réponse : B**
La séquence du workflow `sylius_order_checkout` est : `cart` → (transition `address`) → `addressed` → (transition `select_shipping`) → `shipping_selected` → (transition `select_payment`) → `payment_selected` → (transition `complete`) → `completed`. Les autres options mélangent des états d'autres workflows.

---

### Domaine 3 — Grid & Admin

**Q23 — Réponse : C**
`type: twig` permet de déléguer le rendu à un template Twig via l'option `template`. La variable `data` contient la valeur du champ. `html` et `custom` ne sont pas des types de colonne SyliusGridBundle. `template` est le nom de l'option, pas du type.

**Q24 — Réponse : C**
Les actions `item` apparaissent sur chaque ligne du tableau. Les actions `main` apparaissent au-dessus du tableau. `row` et `inline` ne sont pas des groupes d'actions dans SyliusGridBundle (il existe aussi `bulk` pour les sélections multiples).

**Q25 — Réponse : B**
La convention Symfony pour surcharger les templates d'un Bundle est `templates/bundles/<BundleName>/<chemin>`. Pour `SyliusAdminBundle` : `templates/bundles/SyliusAdminBundle/Product/_form.html.twig`. Les autres chemins ne sont pas reconnus par Symfony.

**Q26 — Réponse : B**
`{% extends '@!SyliusAdmin/Product/_form.html.twig' %}` avec le `!` force Twig à charger le template depuis le Bundle d'origine (pas depuis la surcharge). Sans `!`, Twig tente d'étendre le fichier de surcharge lui-même → récursion infinie. `original:` et `parent_extends` ne sont pas des syntaxes Twig valides.

**Q27 — Réponse : B**
`sylius.menu.admin.main` est l'événement dispatché pour construire le menu principal de l'Admin. C'est un événement KnpMenu (`MenuBuilderEvent`). `sylius.menu.admin.sidebar`, `knp_menu.admin.build` et `sylius.admin.navigation` ne sont pas les noms corrects.

**Q28 — Réponse : B**
`type: select` dans les filtres Grid génère un `<select>` avec les options définies dans `form_options: choices:`. `choice` et `enum` ne sont pas des types de filtre SyliusGridBundle. `options` est l'option de configuration, pas le type.

**Q29 — Réponse : C**
La propriété `sorting:` à la racine de la définition Grid définit le tri par défaut :
```yaml
sorting:
    title: asc
```
`default_sort:`, `order:` et `sort_by:` ne sont pas des clés reconnues par SyliusGridBundle.

**Q30 — Réponse : B**
La structure correcte est :
```yaml
options:
    parameters:
        id: resource.id
```
`resource.id` est une expression qui résout l'ID de la ligne courante. Les autres syntaxes (`row.id`, `item.id`, `entity.id`) ne sont pas celles de SyliusGridBundle.

---

### Domaine 4 — Catalogue, Order, Checkout

**Q31 — Réponse : B**
On ajoute toujours un `ProductVariant` au panier via `OrderItem`. Le `Product` est l'objet générique (nom, description). Même un produit « simple » sans options de variation a un variant par défaut créé automatiquement. `ProductOption` définit les axes de variation, `ProductTranslation` gère les traductions.

**Q32 — Réponse : C**
Les prix sont dans `ChannelPricing`, liée à un `ProductVariant` et à un `Channel`. Cette structure permet des prix différents par boutique (canal). Sans `ChannelPricing` pour un canal, le produit n'est pas visible dans ce canal — sans erreur affichée.

**Q33 — Réponse : C**
Tous les montants Sylius sont des **entiers en centimes** (ex. `2999` pour 29,99 €). Les floats introduisent des erreurs d'arrondi inévitables. Sylius n'utilise pas d'objet `Money` dans ses entités de base (même si brick/money peut être utilisé en dehors). C'est une règle absolue du framework.

**Q34 — Réponse : C**
Les Taxons utilisent **Gedmo NestedSet** (champs `left`, `right`, `level`, `root`). C'est la structure la plus efficace pour les arbres en lecture (une seule requête pour récupérer tout un sous-arbre). Closure Table et Materialized Path sont d'autres approches, non utilisées par Sylius.

**Q35 — Réponse : C**
Un `Product` peut appartenir à **plusieurs Taxons** (relation many-to-many). Le `mainTaxon` est la catégorie principale utilisée pour le fil d'Ariane et l'URL, mais un produit peut apparaître dans plusieurs catégories simultaneously.

**Q36 — Réponse : B**
Un `Channel` représente une **boutique ou sous-site** avec sa propre locale, devise, zone fiscale, et catalogue de méthodes de paiement/livraison. C'est le mécanisme de Sylius pour gérer le multi-boutique (ex. boutique FR + boutique ES + boutique B2B).

**Q37 — Réponse : B**
Les `Adjustment` peuvent être appliqués à trois niveaux : `Order` (remises globales, frais de livraison), `OrderItem` (remises par produit) et `OrderItemUnit` (ajustements par unité individuelle, ex. taxes unitaires). Ne pas confondre avec `Payment` et `Shipment` qui sont des entités différentes.

**Q38 — Réponse : C**
`OrderProcessor` (implémenté par `CompositeOrderProcessor`) orchestre une chaîne de `OrderProcessorInterface` qui recalculent les totaux. Ne jamais appeler `$order->setTotal()` directement — la valeur serait écrasée au prochain `process()`. `OrderRecalculator`, `OrderTotalUpdater` et `AdjustmentCalculator` ne sont pas les noms corrects.

**Q39 — Réponse : B**
La transition `select_shipping` fait passer de `addressed` à `shipping_selected` dans le workflow `sylius_order_checkout`. `address` fait passer de `cart` à `addressed`. `add_shipping` et `shipping_done` ne sont pas des transitions de ce workflow.

**Q40 — Réponse : A**
L'override d'entité Sylius = créer une classe qui **étend** la classe Sylius + déclarer l'override dans la config du bundle correspondant. Pour `Address` : `App\Entity\Address extends Sylius\Component\Addressing\Model\Address` + déclaration dans `sylius_addressing.yaml`. Modifier le vendor (B) casse les mises à jour. Les options C et D sont des anti-patterns.

**Q41 — Réponse : C**
Dans Sylius 2.x, les étapes du checkout sont des **controllers Symfony standard**, pas des classes implémentant une interface Step. Il n'y a pas d'interface `CheckoutStepInterface` officielle dans Sylius 2.x — la State Machine `sylius_order_checkout` pilote l'avancement. L'interface D n'existe pas.

**Q42 — Réponse : C**
`getTotal()` retourne le total de la commande en centimes. C'est la méthode héritée de `AdjustableInterface`. `getAmount()` est sur les entités `Payment`. `getTotalPrice()` et `getGrandTotal()` ne font pas partie de l'API officielle de `OrderInterface`.

---

### Domaine 5 — Payment & Shipping

**Q43 — Réponse : B**
**Payum** est la couche d'abstraction de paiement utilisée par Sylius. Chaque gateway (Stripe, Mollie, PayPal…) est un package Payum. OmniPay est une alternative non utilisée par Sylius. Il n'existe pas de Symfony Payment Component officiel.

**Q44 — Réponse : B**
Une `ShippingMethod` est associée à une `Zone` (entité Sylius qui regroupe des pays ou provinces). Si l'adresse de livraison de la commande est dans la zone, la méthode est disponible. La relation est sur la ShippingMethod, pas uniquement sur le Channel.

**Q45 — Réponse : C**
Le tag `sylius.shipping_calculator` enregistre le service comme calculateur de livraison et le rend disponible dans la liste des calculateurs de l'Admin. `sylius.shipping_method` et `sylius.shipping_rate` ne sont pas des tags valides pour les calculateurs.

**Q46 — Réponse : B**
Les états du workflow `sylius_payment` sont : `new` (initial), `processing`, `completed`, `failed`, `cancelled`, `refunded`. Les options A et C utilisent des noms qui n'existent pas dans ce workflow. L'option D mélange des états du workflow Order.

**Q47 — Réponse : C**
`getType(): string` retourne l'identifiant unique du calculateur (ex. `'flat_rate'`, `'free_over_threshold'`). C'est cette valeur qui apparaît dans le sélecteur de l'Admin et dans la config de la ShippingMethod. `getName()` n'est pas dans `CalculatorInterface`, `getCode()` est pour d'autres entités.

**Q48 — Réponse : B**
`Payum\Core\Request\Capture` représente la capture (débit) d'un paiement. `Authorize` représente une pré-autorisation sans débit. `Execute` est la méthode pour déclencher une requête Payum. `Charge` et `Pay` n'existent pas dans l'API Payum.

---

### Domaine 6 — Plugin development & Override

**Q49 — Réponse : B**
Un Trait isolé facilite la réutilisation (le même Trait peut équiper plusieurs entités), isole proprement les champs ajoutés, et simplifie les diffs lors des mises à jour. Ce n'est pas une contrainte de Sylius ou de PHPSpec — c'est une bonne pratique pour l'extensibilité.

**Q50 — Réponse : B**
La convention Symfony est `templates/bundles/<BundleName>/<chemin>`. C'est le mécanisme standard de surcharge de templates Bundle dans Symfony, indépendant de Sylius. `templates/override/` et `Resources/views/` ne sont pas les conventions Symfony 4+.

**Q51 — Réponse : B**
L'attribut PHP `#[AsDecorator(decorates: 'service.id')]` (Symfony 6.3+) est la syntaxe moderne pour déclarer un décorateur. La config YAML avec `decorates:` fonctionne aussi mais est moins élégante. L'option A (`implements:`) et C (`tags: decorator`) n'existent pas. D (`$container->decorate()`) n'est pas une API Symfony.

**Q52 — Réponse : C**
`getExtendedTypes()` (pluriel, statique) retourne un iterable de classes FormType à étendre. C'est la méthode requise par `AbstractTypeExtension` depuis Symfony 4.2 (l'ancienne méthode `getExtendedType()` au singulier est dépréciée). `getParentType()` et `supports()` ne font pas partie de l'API TypeExtension.

**Q53 — Réponse : B**
Le préfixe doit être le nom de votre application (`app.book`) ou de votre plugin (`acme_review.review`) pour éviter les collisions. Utiliser `sylius.book` entrerait en collision avec les Resources Sylius natives. Un préfixe UUID serait peu lisible et non conventionnel.

**Q54 — Réponse : B**
`Resources/config/doctrine/model/` est le chemin conventionnel pour les fichiers de mapping Doctrine dans un plugin Sylius (hérité de la convention Bundle Symfony). `AbstractResourceBundle` charge automatiquement les mappings depuis ce dossier. Les autres chemins ne sont pas reconnus automatiquement.

**Q55 — Réponse : B**
Dans la config Symfony, `'@.inner'` est l'alias automatique généré par le framework pour pointer vers l'instance décorée (l'originale). `'@app.factory.product.original'` est le nom complet généré automatiquement mais `@.inner` est l'alias court préféré dans la config du décorateur. `@decorated` et `@parent` n'existent pas.

**Q56 — Réponse : B**
Un template entièrement surchargé (sans `{% extends %}`) ne bénéficie pas des mises à jour automatiques de Sylius : corrections de sécurité, améliorations d'accessibilité, nouvelles fonctionnalités. À chaque mise à jour de Sylius, il faut manuellement comparer et reporter les changements. C'est le risque majeur de la surcharge totale vs l'extension par blocs.

---

### Domaine 7 — Tests Behat & PHPSpec

**Q57 — Réponse : C**
`Background:` dans Gherkin définit des étapes exécutées avant chaque scénario de la feature. C'est l'équivalent du `setUp()` PHPUnit au niveau Gherkin. `Setup:`, `Before:` et `Prerequisites:` ne sont pas des mots-clés Gherkin valides.

**Q58 — Réponse : B**
La syntaxe PHPSpec/Prophecy est `$collaborator->doSomething()->shouldBeCalled()`. PHPSpec utilise Prophecy pour les doublures, avec une syntaxe chaînée. L'option A est la syntaxe PHPUnit Mock. L'option C (`assertMethodCalled`) n'existe pas. L'option D n'est pas une API PHPSpec.

**Q59 — Réponse : C**
`Sylius\Behat\Context\Hook\DoctrineORMContext` enveloppe chaque scénario dans une transaction Doctrine qui est annulée (`rollback`) à la fin. Sans lui, les données persistent entre scénarios. `ProductContext` sert à créer des fixtures, `HomepageContext` teste la page d'accueil, `MinkContext` fournit des steps Mink génériques.

**Q60 — Réponse : C**
`@javascript` est le tag Behat standard (convention Mink) pour indiquer qu'un scénario nécessite JavaScript et doit utiliser le driver Selenium (ou Panther). Sans ce tag, le driver Symfony (BrowserKit, sans JS) est utilisé. `@browser`, `@selenium` et `@ui_full` ne sont pas des tags Behat/Sylius conventionnels.
