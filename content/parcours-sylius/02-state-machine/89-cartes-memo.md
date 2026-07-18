---
title: "Cartes mémo — State Machine"
type: flashcards
cards:
  - q: |
      Quels sont les trois concepts fondamentaux d'une State Machine (Winzou ou Symfony Workflow) ?
    a: |
      **States** (les états possibles de l'objet), **Transitions** (les actions qui font passer d'un état à un autre) et **Guards** (les conditions qui bloquent une transition). Dans Winzou on ajoute les **Callbacks** (hooks avant/après) ; dans Symfony Workflow ce sont des événements standards.
  - q: |
      Dans Sylius 1.x avec WinzouStateMachineBundle, comment vérifier qu'une transition est applicable avant de l'appliquer ?
    a: |
      ```php
      $sm = $factory->get($order, 'sylius_order');
      if ($sm->can('checkout')) {
          $sm->apply('checkout');
      }
      ```
      Ne jamais appeler `apply()` sans `can()` : Winzou lève une exception si la transition est impossible depuis l'état courant.
  - q: |
      Dans Sylius 2.x avec Symfony Workflow, quelle propriété de config fait le lien entre le workflow et la propriété PHP de l'entité ?
    a: |
      ```yaml
      marking_store:
          type: method
          property: state
      ```
      Cela indique au Workflow d'appeler `getState()` / `setState()` sur l'objet. La propriété doit exister sur l'entité.
  - q: |
      Quel événement Symfony Workflow se déclenche pour bloquer conditionnellement une transition `checkout` du workflow `sylius_order` ?
    a: |
      `workflow.sylius_order.guard.checkout`. On injecte un `GuardEvent` et on appelle `$event->setBlocked(true, 'raison')` pour empêcher la transition.
  - q: |
      Quelle commande Symfony affiche le graphe d'un workflow en Mermaid ou Graphviz ?
    a: |
      ```bash
      bin/console workflow:dump sylius_order --dump-format=mermaid
      ```
      Sans `--dump-format`, la sortie est au format Graphviz `.dot` (utile pour générer un PNG avec `dot -Tpng`).
  - q: |
      Citez deux workflows Sylius intégrés et leurs états principaux.
    a: |
      - **`sylius_order`** : `cart` → `new` → `fulfilled` / `cancelled`
      - **`sylius_order_checkout`** : `cart` → `addressed` → `shipping_selected` → `payment_selected` → `completed`
      Il existe aussi `sylius_payment` (`new` → `processing` → `completed` / `failed` / `refunded`) et `sylius_order_shipping`.
  - q: |
      Quel est le principal piège agence lors de la surcharge d'un graph State Machine Sylius ?
    a: |
      Ajouter des transitions sans vérifier les **callbacks ou événements existants**. Sylius a des effets de bord critiques sur certaines transitions (envoi d'email, mise à jour de stock, mise à jour du paiement). Les supprimer ou les court-circuiter provoque des bugs silencieux difficiles à diagnostiquer.
---

Sept cartes pour mémoriser les deux implémentations de State Machine dans Sylius et leurs différences pratiques.
