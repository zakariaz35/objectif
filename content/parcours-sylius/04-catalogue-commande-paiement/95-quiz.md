---
title: "Quiz — Catalogue, Commande, Paiement"
type: quiz
questions:
  - prompt: |
      Dans Sylius, quel objet est réellement ajouté au panier lors d'un achat ?
    options:
      - "Un `Product`"
      - "Un `ProductVariant`"
      - "Un `ProductOption`"
      - "Un `Taxon`"
    answer: 1
    tags: [catalogue, product]
    level: débutant
    explanation: |
      On ajoute toujours un **`ProductVariant`** au panier (via `OrderItem`), jamais un `Product`. Le `Product` est l'objet générique (nom, description, images) ; le `ProductVariant` est l'article achetable avec stock et prix. Même un produit « simple » (sans options) a un variant par défaut.
  - prompt: |
      Dans quel type d'entité Sylius les **prix** des produits sont-ils stockés, et pourquoi cette structure ?
    options:
      - "Dans `Product` directement — prix unique pour toutes les boutiques"
      - "Dans `ProductVariant` — un prix par variante"
      - "Dans `ChannelPricing` — un prix par variante ET par Channel"
      - "Dans `Taxon` — catégorie → prix"
    answer: 2
    tags: [catalogue, prix, channel]
    level: débutant
    explanation: |
      `ChannelPricing` porte le prix d'un `ProductVariant` pour un `Channel` donné. Cette structure permet à une même boutique multi-canal (FR, ES, B2B…) d'avoir des prix différents par canal. Sans `ChannelPricing` pour un canal, le produit n'est pas visible dans ce canal.
  - prompt: |
      Quel est le format des montants monétaires dans Sylius (prix, totaux, frais…) ?
    options:
      - "Float PHP (ex. `29.90`)"
      - "String (ex. `\"29.90\"`)"
      - "Entier en centimes (ex. `2990`)"
      - "Objet `Money\\Money` de brick/money"
    answer: 2
    tags: [ordre, montants]
    level: débutant
    explanation: |
      Tous les montants dans Sylius sont des **entiers en centimes** (ex. `2990` pour 29,90 €). Utiliser des floats pour les calculs monétaires introduit des erreurs d'arrondi inévitables en virgule flottante. C'est une règle absolue : ne jamais stocker ni calculer de montant en float.
  - prompt: |
      Quelle interface faut-il implémenter pour créer un calculateur de frais de livraison custom dans Sylius ?
    options:
      - "`Sylius\\Component\\Shipping\\Calculator\\CalculatorInterface`"
      - "`Sylius\\Component\\Shipping\\Model\\ShippingMethodInterface`"
      - "`Symfony\\Component\\Form\\FormTypeInterface`"
      - "`Sylius\\Bundle\\ShippingBundle\\Calculator\\AbstractCalculator`"
    answer: 0
    tags: [paiement-livraison, calculateur]
    level: intermédiaire
    explanation: |
      `Sylius\Component\Shipping\Calculator\CalculatorInterface` définit deux méthodes : `calculate(ShipmentInterface $subject, array $configuration): int` (retourne des centimes) et `getType(): string`. Le service doit être tagué `sylius.shipping_calculator`. C'est la bonne couche d'abstraction — pas la ShippingMethod (configuration) ni un FormType.
  - prompt: |
      Dans quel workflow Sylius l'état `awaiting_payment` est-il défini ?
    options:
      - "`sylius_order`"
      - "`sylius_order_checkout`"
      - "`sylius_order_payment`"
      - "`sylius_payment`"
    answer: 2
    tags: [commande, workflow, etats]
    level: intermédiaire
    explanation: |
      `awaiting_payment` est un état du workflow **`sylius_order_payment`**, qui gère l'état de paiement global de la commande (`paymentState`). Le workflow `sylius_payment` gère lui l'état de chaque objet `Payment` individuel (`new` → `processing` → `completed`). Les deux coexistent sur une commande.
  - prompt: |
      Comment s'appelle l'outil Sylius qui recalcule les totaux et ajustements d'une commande après modification ?
    options:
      - "`OrderRecalculator`"
      - "`OrderProcessor`"
      - "`AdjustmentCalculator`"
      - "`OrderTotalUpdater`"
    answer: 1
    tags: [commande, totaux]
    level: avancé
    explanation: |
      L'**`OrderProcessor`** (`Sylius\Component\Order\Processor\CompositeOrderProcessor`) orchestre une chaîne de `OrderProcessorInterface` qui recalculent les totaux, ajustements (taxes, promotions, frais de livraison). Ne jamais appeler `$order->setTotal()` directement — les valeurs seraient écrasées au prochain appel `process()`.
---

Six questions couvrant catalogue, commande et paiement : structure des données, calculs, états et couches d'extension.
