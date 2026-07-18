---
title: "Cartes mémo — Catalogue, Commande, Paiement"
type: flashcards
cards:
  - q: |
      Quelle est la différence entre **Product** et **ProductVariant** dans Sylius ?
    a: |
      Un **Product** est le concept générique (ex. « T-shirt »). Il n'a pas de prix ni de stock. Un **ProductVariant** est l'article réellement achetable (ex. « T-shirt Taille L, Couleur Bleu ») : il porte le stock (`onHand`) et les prix **par Channel** via `ChannelPricing`. On ajoute un `ProductVariant` au panier, jamais un `Product`.
  - q: |
      Où sont stockés les prix des produits dans Sylius, et pourquoi ?
    a: |
      Dans l'entité `ChannelPricing`, liée à un `ProductVariant` et à un `Channel`. Un même variant peut avoir des prix différents selon les boutiques (canaux). Les prix sont en **centimes entiers** (pas de float) pour éviter les erreurs d'arrondi.
  - q: |
      Combien d'états de workflow l'entité `Order` porte-t-elle simultanément, et lesquels ?
    a: |
      Quatre états parallèles :
      - `state` : état global (`cart`, `new`, `fulfilled`, `cancelled`)
      - `checkoutState` : avancement du checkout (`cart` → `completed`)
      - `paymentState` : état du paiement (`awaiting_payment` → `paid`)
      - `shippingState` : état de la livraison (`ready` → `shipped`)
      Chacun est piloté par un workflow Symfony distinct.
  - q: |
      Qu'est-ce qu'un `Adjustment` dans une commande Sylius ?
    a: |
      Un `Adjustment` est une ligne de modification de prix (remise, taxe, frais de livraison, coupon…). Il peut être appliqué à trois niveaux : sur l'`Order` (remise globale), sur un `OrderItem` (remise produit) ou sur une `OrderItemUnit` (unité individuelle). Tous les ajustements doivent passer par l'`OrderProcessor` pour être recalculés correctement.
  - q: |
      Quelle librairie PHP Sylius utilise-t-il comme couche d'abstraction des paiements ?
    a: |
      **Payum**. Chaque gateway de paiement (Stripe, Mollie, PayPal…) est un package Payum séparé. Sylius ne gère pas directement l'API de paiement — il orchestre les Actions Payum (`Capture`, `Authorize`, `Refund`) via un token de sécurité.
  - q: |
      Comment créer un calculateur de frais de livraison custom dans Sylius ?
    a: |
      Implémenter `Sylius\Component\Shipping\Calculator\CalculatorInterface` avec les méthodes `calculate(ShipmentInterface $subject, array $configuration): int` (retourne des centimes) et `getType(): string`. Puis tagguer le service :
      ```yaml
      tags:
          - { name: sylius.shipping_calculator }
      ```
  - q: |
      Quel est le piège principal lors de l'ajout d'un nouveau Channel dans Sylius ?
    a: |
      Oublier de créer les **ChannelPricing** pour les ProductVariants existants. Sans ChannelPricing, les produits ne s'affichent pas dans la boutique du nouveau Channel sans aucune erreur visible. Il faut aussi associer les ShippingMethods et PaymentMethods au nouveau Channel.
  - q: |
      Que représente un **Taxon** dans Sylius et quelle structure de données l'implémente ?
    a: |
      Un Taxon est une **catégorie** (ou classification) de produits. Les Taxons forment un **arbre** implémenté via **Gedmo NestedSet** (champs `left`, `right`, `level`). Un produit peut appartenir à plusieurs Taxons. Le Taxon principal (`mainTaxon`) détermine le fil d'Ariane et l'URL dans la boutique.
---

Huit cartes pour mémoriser les concepts clés du catalogue, de la commande et du paiement dans Sylius.
