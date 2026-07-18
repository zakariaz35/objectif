---
title: "Jest & @nestjs/testing : construire un module de test"
type: lesson
---

## Jest, le runner de test par défaut de Nest

Un projet généré par `nest new` embarque déjà **Jest** configuré, avec des
fichiers `*.spec.ts` d'exemple (`app.controller.spec.ts`) et un script prêt
à l'emploi :

```bash
npm run test          # runs all *.spec.ts files once
npm run test:watch    # re-runs on file change
npm run test:cov      # runs with coverage report
npm run test:e2e      # runs end-to-end tests (test/*.e2e-spec.ts)
```

> **Symfony → NestJS.** Jest joue le rôle de **PHPUnit** : un runner de
> tests, des assertions (`expect(x).toBe(y)`), des *mocks*
> (`jest.fn()`/`jest.mock()`), une commande unique pour tout exécuter
> (`npm run test` ↔ `bin/phpunit`).

## `Test.createTestingModule` : un mini conteneur DI, pour les tests

Plutôt que d'instancier une classe à la main (perdant tout l'intérêt de
l'injection de dépendances), Nest fournit un **module de test** : un vrai
conteneur DI, réduit au périmètre nécessaire pour le test.

```ts
// products.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing"
import { ProductsService } from "./products.service"

describe("ProductsService", () => {
  let service: ProductsService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [ProductsService],   // only what THIS test actually needs
    }).compile()

    service = module.get(ProductsService)
  })

  it("starts with an empty product list", () => {
    expect(service.findAll()).toEqual([])
  })
})
```

> **Symfony → NestJS.** `Test.createTestingModule({...}).compile()` est
> l'équivalent Nest de démarrer un **conteneur de services minimal** pour
> un test — le rôle que joue `KernelTestCase` en Symfony, qui donne accès
> au conteneur (`self::getContainer()->get(...)`) sans démarrer un vrai
> serveur HTTP.

## Remplacer une dépendance par un mock : `overrideProvider`

L'intérêt principal de ce module de test : **substituer** une vraie
dépendance (un Repository qui parlerait à une vraie base) par un **mock**
contrôlé, sans toucher au code de `ProductsService`.

```ts
import { getRepositoryToken } from "@nestjs/typeorm"

const mockRepository = {
  find: jest.fn().mockResolvedValue([{ id: 1, name: "Book", price: 12 }]),
  findOneBy: jest.fn(),
  save: jest.fn(),
}

module = await Test.createTestingModule({
  providers: [
    ProductsService,
    { provide: getRepositoryToken(Product), useValue: mockRepository },
  ],
}).compile()
```

`getRepositoryToken(Product)` renvoie le **jeton exact** utilisé en
interne par `@InjectRepository(Product)` (module 6) : en substituant ce
jeton par notre faux objet, `ProductsService` reçoit le mock **sans le
savoir**.

> **Réflexe à prendre.** `overrideProvider`/`useValue` dans un module de
> test répond exactement au même besoin qu'un **double de test** (mock,
> stub) construit à la main en PHPUnit, ou qu'un service PHP substitué via
> les *test doubles* Symfony (`self::getContainer()->set(...)`). Le
> principe est identique : isoler l'unité testée de ses dépendances
> réelles (base de données, API externe...).

## À retenir

- Jest est au projet Nest ce que PHPUnit est à un projet Symfony : runner,
  assertions, mocks.
- `Test.createTestingModule({...}).compile()` construit un **vrai
  conteneur DI**, réduit au périmètre du test — l'équivalent de
  `KernelTestCase`.
- `getRepositoryToken(Entity)` + `useValue` permettent de remplacer un
  Repository réel par un mock, sans modifier le service testé.
