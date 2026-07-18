---
title: "Quiz — Tests & structure d'un projet réel"
type: quiz
questions:
  - prompt: |
      À quelle famille de frameworks de test appartiennent à la fois JUnit
      5 et PHPUnit ?
    options:
      - "xUnit (classe de test, setup/teardown, assertions, un cas par méthode)."
      - "BDD pur (Gherkin, Given/When/Then obligatoire)."
      - "Ce sont deux familles totalement incompatibles dans leur philosophie."
    answer: 0
    tags: ["junit", "phpunit", "xunit"]
    level: debutant
    explanation: |
      JUnit 5 et PHPUnit partagent la même structure xUnit — la transition
      d'un framework à l'autre est presque immédiate pour un développeur
      Symfony.
  - prompt: |
      Que fait `@SpringBootTest`, par rapport à un test unitaire pur ?
    options:
      - "Il démarre le contexte Spring complet, avec tous les vrais beans câblés."
      - "Il exécute le test dans un thread séparé, sans rapport avec Spring."
      - "Il désactive automatiquement tous les beans liés à la base de données."
    answer: 0
    tags: ["springboottest"]
    level: debutant
    explanation: |
      `@SpringBootTest` correspond à `KernelTestCase`/`WebTestCase` : le
      contexte complet démarre, ce qui est plus lent qu'un test unitaire
      pur mais plus proche des conditions réelles.
  - prompt: |
      Pourquoi éviter d'utiliser `@SpringBootTest` pour CHAQUE test de
      l'application, y compris des tests de service isolés ?
    options:
      - |
        Parce que démarrer le contexte complet à chaque test ralentit
        fortement la suite de tests — Mockito isole la classe testée sans
        ce coût.
      - "Parce que `@SpringBootTest` est en réalité obsolète depuis Spring Boot 3."
      - "Ce n'est jamais un problème, quel que soit le nombre de tests."
    answer: 0
    tags: ["performance-tests", "mockito"]
    level: intermediaire
    explanation: |
      Même arbitrage qu'entre `KernelTestCase` (lourd, réaliste) et un test
      PHPUnit pur (léger, rapide) en Symfony : réserve le contexte complet
      aux vrais tests d'intégration.
  - prompt: |
      Que fournit `@DataJpaTest`, en plus de charger uniquement les beans
      liés à JPA ?
    options:
      - "Une base H2 en mémoire, avec un rollback automatique après chaque test."
      - "Une désactivation totale de la validation Bean Validation."
      - "Un mock automatique de TOUS les repositories, y compris celui testé."
    answer: 0
    tags: ["datajpatest"]
    level: intermediaire
    explanation: |
      `@DataJpaTest` isole la couche de persistance : base en mémoire,
      rollback systématique — aucune pollution entre tests.
  - prompt: |
      Quelle annotation Mockito construit automatiquement l'objet testé en
      lui injectant les mocks déclarés (`@Mock`) ?
    options:
      - "`@Autowired`"
      - "`@InjectMocks`"
      - "`@Spy`"
    answer: 1
    tags: ["mockito", "injectmocks"]
    level: intermediaire
    explanation: |
      `@InjectMocks` construit l'objet testé en résolvant ses dépendances
      parmi les `@Mock` déclarés — plus automatique que l'instanciation
      manuelle habituelle en PHPUnit (`new Service($mockRepo)`).
  - prompt: |
      Dans un projet Spring bien structuré, où doit vivre la logique
      métier (règles, calculs, orchestration entre repositories) ?
    options:
      - "Dans le contrôleur, pour un accès direct et rapide."
      - "Dans le service (`@Service`), le contrôleur restant fin."
      - "Directement dans l'entité JPA, pour éviter une classe supplémentaire."
    answer: 1
    tags: ["structure-couches", "bonnes-pratiques"]
    level: debutant
    explanation: |
      Le contrôleur délègue immédiatement au service — même discipline
      qu'un contrôleur Symfony fin, sans logique métier dans l'action.
  - prompt: |
      Pourquoi organiser les packages PAR DOMAINE (`product/`, `order/`,
      `security/`) plutôt que par couche technique (`controllers/`,
      `services/`, `repositories/`) ?
    options:
      - |
        Pour retrouver tout ce qui concerne une fonctionnalité au même
        endroit, à mesure que l'application grossit — le même réflexe
        qu'un bundle Symfony ou un module NestJS bien découpé.
      - "L'organisation par couche technique est en réalité imposée par Spring Boot."
      - "Il n'y a aucune différence pratique entre les deux approches."
    answer: 0
    tags: ["package-par-domaine", "architecture"]
    level: avance
    explanation: |
      Le découpage par domaine métier limite les allers-retours entre
      dossiers pour une même fonctionnalité — un choix d'architecture, pas
      une contrainte technique de Spring.
---

Sept questions sur JUnit 5/PHPUnit, `@SpringBootTest`/MockMvc,
`@DataJpaTest`/Mockito et la structure en couches d'un projet réel.
