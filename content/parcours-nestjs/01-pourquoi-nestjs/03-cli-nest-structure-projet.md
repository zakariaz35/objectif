---
title: "Le CLI Nest et l'anatomie d'un projet généré"
type: lesson
---

## Générer un projet

```bash
# Install the CLI globally (once), then scaffold a new project
npm i -g @nestjs/cli
nest new my-app
cd my-app
npm run start:dev   # watch mode, restarts on file change
```

> **Symfony → NestJS.** C'est l'équivalent direct de
> `composer create-project symfony/skeleton my-app` (ou `symfony new`) :
> un squelette de projet fonctionnel, prêt à démarrer, avec les bonnes
> conventions déjà en place.

## Ce que le CLI génère

```
my-app/
├─ src/
│  ├─ main.ts              ← bootstrap : crée et démarre l'application
│  ├─ app.module.ts         ← module racine
│  ├─ app.controller.ts      ← contrôleur d'exemple
│  ├─ app.controller.spec.ts ← test unitaire du contrôleur
│  └─ app.service.ts         ← provider d'exemple
├─ test/
│  └─ app.e2e-spec.ts        ← test end-to-end (supertest)
├─ nest-cli.json             ← config du CLI Nest (compilation, schematics)
├─ tsconfig.json
└─ package.json
```

| Fichier Nest | Rôle | Équivalent Symfony |
|---|---|---|
| `src/main.ts` | Point d'entrée, démarre le serveur | `public/index.php` (front controller) |
| `src/app.module.ts` | Module racine, assemble toute l'app | `config/bundles.php` + `services.yaml` |
| `src/*.controller.ts` | Gère les routes HTTP | `src/Controller/*.php` |
| `src/*.service.ts` | Logique métier, injectable | `src/Service/*.php` (autowire) |
| `nest-cli.json` / `tsconfig.json` | Configuration de build | `config/packages/*.yaml` |
| `*.spec.ts` | Tests unitaires (Jest) | `tests/*Test.php` (PHPUnit) |

## `main.ts` : le bootstrap

```ts
// src/main.ts
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  // Builds the whole dependency graph from the root module,
  // then wraps an Express (or Fastify) HTTP server around it.
  const app = await NestFactory.create(AppModule)
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
```

`NestFactory.create(AppModule)` est le moment où Nest **parcourt tout le
graphe de modules** (imports en cascade), instancie chaque provider dans le
bon ordre, et construit le routeur HTTP à partir des contrôleurs déclarés.

> **Passerelle.** Ce moment correspond à la **compilation du conteneur de
> services** Symfony (visible en dev dans `var/cache/dev/.../*Container.php`) :
> une phase qui résout tout le graphe de dépendances **une fois**, avant de
> traiter la première requête.

## Le module racine : `AppModule`

```ts
// src/app.module.ts
import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"

@Module({
  imports: [],                    // other feature modules go here
  controllers: [AppController],   // controllers handled by this module
  providers: [AppService],        // injectable services this module owns
})
export class AppModule {}
```

Ce module est la **racine** de l'arbre de modules de l'application — le
sujet détaillé du module suivant.

## Générer du code avec les *schematics*

```bash
# Generates a full feature: controller + service + module + spec files,
# wired together and registered automatically in AppModule's imports.
nest generate resource products
# shorthand:
nest g resource products
```

> **Symfony → NestJS.** Le pendant de `bin/console make:controller` /
> `make:entity` / `make:crud` (maker-bundle) : un générateur qui produit du
> code conforme aux conventions, pour éviter le boilerplate répétitif.

## À retenir

- `nest new` scaffold un projet complet, comme
  `composer create-project symfony/skeleton`.
- `main.ts` est le **front controller** : `NestFactory.create(AppModule)`
  résout tout le graphe de dépendances avant de démarrer le serveur HTTP.
- `AppModule` est le **module racine** ; chaque fonctionnalité future
  s'ajoutera comme un module importé (module suivant).
- `nest generate` (schematics) évite le boilerplate, comme les *makers*
  Symfony.
