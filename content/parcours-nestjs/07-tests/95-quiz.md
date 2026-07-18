---
title: "Quiz — Tester une application NestJS"
type: quiz
questions:
  - prompt: |
      Quel runner de test Jest joue, dans un projet NestJS, le rôle que
      joue PHPUnit dans un projet Symfony ?
    options:
      - "Jest est justement l'équivalent direct : runner, assertions, mocks."
      - "Aucun équivalent n'existe côté Node.js."
      - "Cypress, exclusivement."
    answer: 0
    tags: ["jest", "phpunit", "passerelle"]
    level: debutant
    explanation: |
      Jest fournit exactement les mêmes briques que PHPUnit : un runner de
      tests, des assertions (`expect`), et un système de mocks intégré
      (`jest.fn()`).
  - prompt: |
      À quoi sert `Test.createTestingModule({...}).compile()` ?
    options:
      - "À générer automatiquement de la documentation Swagger."
      - |
        À construire un vrai conteneur d'injection de dépendances, réduit
        au périmètre nécessaire pour le test.
      - "À démarrer un vrai serveur HTTP écoutant un port réseau."
    answer: 1
    tags: ["testing-module", "di"]
    level: debutant
    explanation: |
      C'est un mini conteneur DI, le pendant de `KernelTestCase` en
      Symfony : il résout les dépendances déclarées sans démarrer de vrai
      serveur HTTP (sauf appel explicite à `createNestApplication()`).
  - prompt: |
      À quoi sert `getRepositoryToken(Product)` dans un test unitaire ?
    options:
      - |
        À obtenir le jeton exact utilisé par `@InjectRepository(Product)`,
        pour pouvoir substituer ce Repository par un mock.
      - "À générer une nouvelle migration TypeORM."
      - "À convertir une entité en DTO."
    answer: 0
    tags: ["mock", "repository", "getrepositorytoken"]
    level: intermediaire
    explanation: |
      Sans ce jeton exact, Nest ne saurait pas quel provider remplacer :
      `getRepositoryToken` garantit que le mock est injecté exactement là
      où `@InjectRepository(Product)` l'attend.
  - prompt: |
      Pourquoi un test unitaire de provider ne doit-il JAMAIS toucher une
      vraie base de données ?
    options:
      - |
        Pour rester rapide (millisecondes) et fiable (aucune dépendance à
        un état externe partagé).
      - "Parce que TypeORM interdit techniquement les vraies requêtes en test."
      - "Ce n'est en réalité pas un problème, du moment que les tests passent."
    answer: 0
    tags: ["tests-unitaires", "isolation"]
    level: intermediaire
    explanation: |
      L'isolation (mocks à la place des vraies dépendances externes) est
      ce qui rend un test unitaire rapide et déterministe — le même
      principe qu'un test PHPUnit de service Symfony avec des doubles de
      test.
  - prompt: |
      Que fait un test e2e (`*.e2e-spec.ts`) que ne fait PAS un test
      unitaire de provider ?
    options:
      - |
        Il démarre l'application entière (routing, Guards, ValidationPipe
        réels compris) et envoie de vraies requêtes HTTP via supertest.
      - "Il ne teste que la syntaxe TypeScript, sans exécuter aucun code."
      - "Il remplace systématiquement Jest par un autre framework de test."
    answer: 0
    tags: ["e2e", "supertest"]
    level: intermediaire
    explanation: |
      Un test e2e vérifie le comportement HTTP réel de bout en bout,
      l'équivalent d'un `WebTestCase` Symfony — contrairement à un test
      unitaire, qui isole un seul provider avec des mocks.
  - prompt: |
      Pourquoi faut-il répliquer, dans un test e2e, la configuration
      appliquée dans `main.ts` (ex. `app.useGlobalPipes(...)`) ?
    options:
      - |
        Sinon le test e2e ne reflète pas le comportement réel de
        production (ex. une validation absente en test mais présente en
        prod).
      - "Ce n'est jamais nécessaire : Nest applique cette config automatiquement partout."
      - "Uniquement pour améliorer la vitesse d'exécution des tests."
    answer: 0
    tags: ["e2e", "main-ts", "erreur-frequente"]
    level: avance
    explanation: |
      `Test.createTestingModule` ne rejoue pas automatiquement le contenu
      de `main.ts` : sans répliquer explicitement `useGlobalPipes` (et
      autres réglages), un test e2e pourrait valider un comportement qui
      ne correspond pas à la production.
  - prompt: |
      Quelle est la bonne proportion à viser entre tests unitaires et
      tests e2e sur un projet NestJS ?
    options:
      - |
        Beaucoup de tests unitaires rapides, et un nombre restreint de
        tests e2e réservés aux parcours critiques — la « pyramide de tests ».
      - "Uniquement des tests e2e : ils couvrent tout, les unitaires sont inutiles."
      - "Une stricte parité 50/50 entre unitaires et e2e, sur toutes les fonctionnalités."
    answer: 0
    tags: ["strategie-de-test", "pyramide"]
    level: avance
    explanation: |
      Les tests e2e sont plus lents et plus fragiles : la bonne stratégie
      est d'en avoir peu, ciblés sur les parcours critiques, et de couvrir
      la logique métier fine avec de nombreux tests unitaires rapides.
---

Sept questions pour vérifier le rôle de Jest et `@nestjs/testing`, la
substitution de Repository par un mock, la distinction tests unitaires/e2e,
et la stratégie de test à privilégier.
