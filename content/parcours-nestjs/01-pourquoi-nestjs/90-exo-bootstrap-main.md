---
title: "Exercice — enrichir le bootstrap main.ts"
type: exercise
---

> ⏱️ **Durée conseillée : ~10 min.**

## Énoncé

Un projet Nest fraîchement généré démarre avec ce `main.ts` minimal :

```ts
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
}
bootstrap()
```

En t'appuyant sur la leçon précédente et sur tes réflexes Symfony (le
bootstrap Nest joue le rôle de `public/index.php` + config d'environnement),
enrichis ce fichier pour :

1. Ajouter un **préfixe global** `/api` à toutes les routes de
   l'application (méthode `app.setGlobalPrefix(...)`).
2. Activer **CORS** pour permettre à un frontend séparé d'appeler l'API
   (méthode `app.enableCors()`).
3. Lire le **port depuis une variable d'environnement** `PORT`, avec `3000`
   comme valeur par défaut si elle est absente.
4. Logguer, une fois le serveur démarré, l'URL complète d'écoute avec
   `console.log(...)`.

<!--correction-->

## Correction

```ts
// src/main.ts
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 1. Global prefix: every route now lives under /api/...
  app.setGlobalPrefix("api")

  // 2. Allow a separate frontend (different origin) to call this API
  app.enableCors()

  // 3. Read the port from the environment, default to 3000
  const port = process.env.PORT ?? 3000

  await app.listen(port)

  // 4. Log the final listening URL
  console.log(`Application is running on: http://localhost:${port}/api`)
}
bootstrap()
```

- `setGlobalPrefix("api")` est l'équivalent d'un préfixe de route commun à
  toutes les routes de l'application, comme un préfixe défini sur une
  collection de routes Symfony (`#[Route('/api')]` posé au niveau d'un
  contrôleur parent, ou la configuration d'un préfixe global de routing).
- `enableCors()` sans argument autorise **toutes** les origines — pratique
  en développement, à restreindre en production (`app.enableCors({ origin:
  "https://mon-domaine.fr" })`), exactement comme on configure le bundle
  `nelmio/cors-bundle` côté Symfony.
- `process.env.PORT ?? 3000` reproduit le réflexe `.env` de Symfony (une
  valeur par défaut en environnement local, surchargée en production) — le
  module 8 de ce parcours détaille `@nestjs/config`, l'équivalent
  industrialisé de cette lecture manuelle.
