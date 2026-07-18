---
title: "Quiz — State Machine"
type: quiz
questions:
  - prompt: |
      Dans WinzouStateMachineBundle, quel type de callback **bloque** une transition si une condition n'est pas remplie ?
    options:
      - "Un callback `before`"
      - "Un callback `after`"
      - "Un callback `guard`"
      - "Un callback `on_enter`"
    answer: 2
    tags: [state-machine, winzou]
    level: débutant
    explanation: |
      Les callbacks de type `guard` sont les seuls qui peuvent **bloquer** une transition en appelant `$event->setRejected()`. Les callbacks `before` et `after` s'exécutent mais ne peuvent pas empêcher la transition. Il n'existe pas de `on_enter` dans Winzou (c'est une notion de Symfony Workflow).
  - prompt: |
      Dans Symfony Workflow configuré pour Sylius 2.x, quelle valeur de `type` garantit qu'**un seul état est actif** à la fois sur l'objet ?
    options:
      - "`type: workflow`"
      - "`type: state_machine`"
      - "`type: single_state`"
      - "`type: exclusive`"
    answer: 1
    tags: [state-machine, symfony-workflow]
    level: débutant
    explanation: |
      `type: state_machine` indique à Symfony Workflow que l'objet ne peut être que dans **un seul état à la fois** (contrairement à `type: workflow` qui est un Petri net autorisant plusieurs marquages simultanés). C'est le type correct pour les flux de commande Sylius.
  - prompt: |
      Vous écoutez l'événement `workflow.sylius_order.entered.fulfilled` dans Symfony Workflow. À quel moment est-il déclenché ?
    options:
      - "Avant que la transition vers `fulfilled` commence"
      - "Après que l'objet a **quitté** son ancien état"
      - "Après que l'objet est **entré** dans l'état `fulfilled` et que la transition est terminée"
      - "Quand on vérifie si la transition est possible"
    answer: 2
    tags: [state-machine, symfony-workflow, events]
    level: intermédiaire
    explanation: |
      `entered.<place>` se déclenche **après** que l'objet a été placé dans le nouvel état et que tous les traitements internes du Workflow sont terminés. C'est l'endroit idéal pour les effets de bord post-transition (envoi d'email, mise à jour d'index, etc.). `guard` intervient avant, `leave` quand l'objet quitte l'ancien état, `enter` quand il entre dans le nouvel état (avant `entered`).
  - prompt: |
      Comment injecter le workflow `sylius_order` (Symfony Workflow) dans un service Symfony ?
    options:
      - "Injecter `Symfony\\Component\\Workflow\\Registry` et appeler `->get($order, 'sylius_order')`"
      - "Injecter `WorkflowInterface $syliusOrderWorkflow` (autowiring par nom)"
      - "Utiliser `$container->get('sylius_order')` directement"
      - "Injecter `StateMachineInterface` depuis `winzou/state-machine-bundle`"
    answer: 1
    tags: [state-machine, symfony-workflow, di]
    level: intermédiaire
    explanation: |
      Symfony Workflow supporte l'autowiring par nom : déclarer `WorkflowInterface $syliusOrderWorkflow` (ou utiliser le binding `$syliusOrderWorkflow: '@state_machine.sylius_order'`) injecte automatiquement le bon workflow. L'injection via `Registry` fonctionne aussi mais est plus verbeux. `winzou` est l'ancienne API, non applicable ici.
  - prompt: |
      Quel est l'**état initial** du workflow `sylius_order_checkout` dans Sylius (celui dans lequel arrive une commande fraîche) ?
    options:
      - "`new`"
      - "`cart`"
      - "`addressed`"
      - "`pending`"
    answer: 1
    tags: [state-machine, sylius-workflow-builtin]
    level: avancé
    explanation: |
      Le workflow `sylius_order_checkout` démarre à l'état `cart`. C'est l'état d'une commande en cours de constitution (panier). La transition `address` fait passer vers `addressed`, puis `select_shipping` vers `shipping_selected`, etc. `new` est un état du workflow `sylius_order` (post-checkout), pas du checkout lui-même.
---

Cinq questions couvrant les deux implémentations State Machine de Sylius : guards, types, events, injection et workflows intégrés.
