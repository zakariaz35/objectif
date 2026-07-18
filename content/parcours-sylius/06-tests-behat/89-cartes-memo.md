---
title: "Cartes mémo — Tests Behat et qualité"
type: flashcards
cards:
  - q: |
      Quelle est la différence fondamentale entre PHPSpec et PHPUnit dans l'approche de test ?
    a: |
      **PHPSpec** suit un paradigme **spec-first (BDD)** : on décrit le comportement attendu d'un objet via une `ObjectBehavior` et une syntaxe fluide (`shouldReturn`, `shouldBeCalled`). On teste l'**unité de comportement**. **PHPUnit** est orienté **assertions** classiques (`assertEquals`, `assertSame`). Sylius utilise PHPSpec pour les Components et PHPUnit pour les tests d'intégration.
  - q: |
      Quel Context Behat Sylius fournit-il pour réinitialiser la base de données entre chaque scénario ?
    a: |
      `Sylius\Behat\Context\Hook\DoctrineORMContext` — il enveloppe chaque scénario dans une transaction Doctrine qui est annulée (`rollback`) à la fin. Sans ce Context, les données créées par un scénario polluent les scénarios suivants.
  - q: |
      Qu'est-ce que le **PageObject pattern** dans Behat, et pourquoi Sylius l'utilise-t-il ?
    a: |
      Un PageObject encapsule les **interactions avec une page** dans une classe PHP dédiée (`ShowPage`, `IndexPage`…). Les selectors CSS et les actions de clic sont dans la Page, pas dans le Context. Avantage : si le template change, on ne met à jour que la Page (pas tous les Contexts qui l'utilisent). Sylius l'implémente via `FriendsOfBehat\PageObjectExtension`.
  - q: |
      Dans PHPSpec, comment indiquer qu'une méthode d'un collaborateur **doit être appelée** lors du test ?
    a: |
      Via `->shouldBeCalled()` sur le double Prophecy :
      ```php
      $item->setOrder($this)->shouldBeCalled();
      ```
      PHPSpec utilise Prophecy pour les doublures. `shouldBeCalled()` = assertion que la méthode est invoquée au moins une fois. `shouldBeCalledTimes(n)` pour un nombre précis.
  - q: |
      Quel outil utilise-t-on pour tester une State Machine Symfony dans Sylius et pourquoi pas PHPSpec ?
    a: |
      **PHPUnit + `KernelTestCase`** — parce que les tests de workflow nécessitent le **conteneur Symfony** (`'state_machine.sylius_order'` est un service) et parfois une base de données. PHPSpec est sans conteneur (tests purs unitaires). Pour les guards sans conteneur, PHPSpec reste possible si on mock l'événement.
  - q: |
      Quel tag Behat réserve-t-on aux scénarios qui nécessitent JavaScript (Selenium) ?
    a: |
      `@javascript` — les scénarios tagués `@javascript` utilisent le driver Selenium (ou Panther) au lieu du driver Symfony (BrowserKit). Les scénarios sans ce tag utilisent BrowserKit, qui est ~10× plus rapide car il ne démarre pas de vrai navigateur.
---

Six cartes pour mémoriser les outils de test Sylius et leurs cas d'utilisation respectifs.
