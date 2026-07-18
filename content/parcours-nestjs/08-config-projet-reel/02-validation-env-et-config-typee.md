---
title: "Valider et typer la configuration"
type: lesson
---

## Le problème : une variable d'environnement manquante ne plante rien... jusqu'au crash en pleine requête

Sans validation, un `JWT_SECRET` absent ne se remarque **qu'au moment**
d'une requête qui en a besoin — potentiellement en production, sur un
utilisateur réel. La bonne pratique : **valider tout l'environnement au
démarrage**, pour que l'application refuse de démarrer si une variable
requise manque.

```ts
// env.validation.ts
import * as Joi from "joi"

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
})
```

```ts
// app.module.ts
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { envValidationSchema } from "./env.validation"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,   // app crashes at BOOT if invalid
    }),
  ],
})
export class AppModule {}
```

> **Symfony → NestJS.** C'est le pendant du typage strict des `parameters`
> Symfony (`env(string:DATABASE_URL)`, `env(int:PORT)`) et des
> **processeurs d'env vars** (`env(resolve:...)`) : détecter une
> configuration invalide **au démarrage**, plutôt qu'en pleine production
> au premier appel qui en a besoin.

> 💡 **À retenir.** Faire échouer le démarrage sur une config invalide est
> une **bonne nouvelle**, pas un problème : mieux vaut un déploiement qui
> refuse de démarrer (visible immédiatement en CI/CD) qu'un service qui
> démarre « à moitié » et plante de façon imprévisible sur la première
> requête concernée.

## Configuration typée et regroupée : `registerAs`

Plutôt que de disséminer des `configService.get('DATABASE_URL')` un peu
partout, on regroupe la configuration par domaine, dans des objets
**typés** :

```ts
// config/database.config.ts
import { registerAs } from "@nestjs/config"

export default registerAs("database", () => ({
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== "production",
}))
```

```ts
// app.module.ts
import databaseConfig from "./config/database.config"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validationSchema: envValidationSchema,
    }),
  ],
})
export class AppModule {}
```

```ts
// products.module.ts
import { ConfigService } from "@nestjs/config"

const dbConfig = configService.get<{ url: string; synchronize: boolean }>("database")
```

> **Symfony → NestJS.** `registerAs('database', () => ({...}))` correspond
> à un fichier de config namespacé (`config/packages/doctrine.yaml`) :
> une section de configuration nommée, typée, et injectable en un seul
> accès plutôt qu'un éparpillement de clés individuelles.

## À retenir

- Un `validationSchema` (Joi, ou `class-validator` via une classe dédiée)
  fait **échouer le démarrage** si une variable d'environnement requise
  manque — la même discipline que le typage strict des `parameters`
  Symfony.
- Mieux vaut un crash immédiat au boot qu'un plantage imprévisible en
  pleine production.
- `registerAs('nom', factory)` regroupe la configuration par domaine, en un
  objet typé et injectable — évite les `configService.get('CLE_BRUTE')`
  dispersés dans tout le code.
