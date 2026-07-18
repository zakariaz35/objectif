---
title: "Quiz — Tests Behat et qualité"
type: quiz
questions:
  - prompt: |
      Dans PHPSpec, comment s'appelle la classe de base que doit étendre une spécification ?
    options:
      - "`PHPSpec\\TestCase`"
      - "`PhpSpec\\ObjectBehavior`"
      - "`Symfony\\Bundle\\FrameworkBundle\\Test\\KernelTestCase`"
      - "`PHPUnit\\Framework\\TestCase`"
    answer: 1
    tags: [phpspec, tests-unitaires]
    level: débutant
    explanation: |
      Toute spécification PHPSpec étend `PhpSpec\ObjectBehavior`. Le sujet du test (`$this`) est l'objet instancié automatiquement par PHPSpec. C'est la différence clé avec PHPUnit où `$this` est l'objet de test et on crée l'objet testé manuellement.
  - prompt: |
      Dans un scénario Behat, quelle section décrit les **préconditions** communes à tous les scénarios d'une feature ?
    options:
      - "`Setup:`"
      - "`Before:`"
      - "`Background:`"
      - "`Given (global):`"
    answer: 2
    tags: [behat, gherkin]
    level: débutant
    explanation: |
      `Background:` dans Gherkin définit des étapes qui s'exécutent **avant chaque scénario** de la feature. C'est l'équivalent Gherkin du `setUp()` PHPUnit. Les étapes de `Background:` partagent le même contexte que le scénario qui suit.
  - prompt: |
      Pourquoi le `DoctrineORMContext` de Sylius est-il indispensable dans la plupart des suites Behat ?
    options:
      - "Il configure la connexion à la base de données de test"
      - "Il remet à zéro la base de données via une transaction rollback entre chaque scénario"
      - "Il génère les fixtures automatiquement depuis les fichiers YAML"
      - "Il active le mode de journalisation SQL Doctrine"
    answer: 1
    tags: [behat, doctrine, isolation]
    level: intermédiaire
    explanation: |
      `DoctrineORMContext` enveloppe chaque scénario dans une transaction Doctrine et fait un `rollback` à la fin. Sans lui, les données créées par les steps `Given` d'un scénario persistent et polluent les scénarios suivants, rendant les tests non reproductibles.
  - prompt: |
      Dans PHPSpec, comment vérifier que la méthode `addVariant()` n'ajoute **pas** un doublon si le variant est déjà présent ?
    options:
      - "```php\\n$this->addVariant($variant);\\n$this->addVariant($variant);\\n$this->getVariants()->shouldHaveCount(1);\\n```"
      - "```php\\n$this->addVariant($variant);\\nassertCount(1, $this->getVariants());\\n```"
      - "```php\\n$this->addVariant($variant)->shouldThrow('DuplicateException');\\n```"
      - "```php\\n$this->expects()->never()->method('addVariant');\\n```"
    answer: 0
    tags: [phpspec, comportement]
    level: intermédiaire
    explanation: |
      PHPSpec utilise `shouldHaveCount(n)` pour vérifier la taille d'une collection. Appeler deux fois `addVariant($variant)` puis vérifier `shouldHaveCount(1)` teste que la logique de déduplication fonctionne. Les options B (mélange PHPUnit) et C/D (mauvaise syntaxe) ne sont pas valides en PHPSpec.
  - prompt: |
      Quel driver Mink doit-on utiliser pour un scénario Behat qui **ne nécessite pas de JavaScript** dans Sylius ?
    options:
      - "Selenium WebDriver"
      - "Playwright"
      - "Le driver Symfony (BrowserKit) — session `symfony` dans `behat.yaml`"
      - "Chrome Headless"
    answer: 2
    tags: [behat, mink, performance]
    level: avancé
    explanation: |
      Le **driver Symfony (BrowserKit)** n'ouvre pas de vrai navigateur — il simule les requêtes HTTP via le kernel Symfony. Il est ~10× plus rapide que Selenium. Pour les scénarios sans interaction JavaScript (formulaires simples, navigation), c'est toujours le bon choix. Reservez `@javascript` + Selenium aux scénarios avec interactions asynchrones ou AJAX.
---

Cinq questions couvrant PHPSpec, Behat/Gherkin, l'isolation des tests et le choix du driver Mink.
