---
title: "Exercice — un ConfigModule avec validation stricte"
type: exercise
---

> ⏱️ **Durée conseillée : ~15 min.**

## Énoncé

Un projet d'agence a besoin des variables d'environnement suivantes :

| Variable | Type attendu | Obligatoire ? |
|---|---|---|
| `NODE_ENV` | `"development"`, `"test"` ou `"production"` | Non (défaut : `"development"`) |
| `PORT` | nombre | Non (défaut : `3000`) |
| `DATABASE_URL` | chaîne, doit être une URI valide | Oui |
| `JWT_SECRET` | chaîne d'au moins 32 caractères | Oui |

Écris :

1. Un schéma de validation Joi (`env.validation.ts`) reprenant exactement
   ce tableau (types, valeurs par défaut, champs obligatoires).
2. La configuration de `ConfigModule.forRoot(...)` dans `app.module.ts`,
   branchant ce schéma, en mode `isGlobal`.

<!--correction-->

## Correction

```ts
// env.validation.ts
import * as Joi from "joi"

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
})
```

```ts
// app.module.ts
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { envValidationSchema } from "./config/env.validation"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
  ],
})
export class AppModule {}
```

- `NODE_ENV`/`PORT` ont un `.default(...)` : leur absence n'empêche jamais
  le démarrage, contrairement à `DATABASE_URL`/`JWT_SECRET` marqués
  `.required()`.
- `Joi.string().uri()` vérifie que `DATABASE_URL` a bien la **forme**
  d'une URI, pas seulement qu'elle est présente — la même rigueur que le
  typage `env(string:...)` des `parameters` Symfony.
- `isGlobal: true` évite de réimporter `ConfigModule` dans chaque feature
  module : `ConfigService` devient disponible partout après cette seule
  déclaration dans `AppModule`.
- Si une de ces variables manque ou a un type incorrect au démarrage,
  `NestFactory.create(AppModule)` **lève une erreur explicite et
  l'application refuse de démarrer** — un comportement volontaire : mieux
  vaut un échec immédiat et visible qu'un service à moitié configuré qui
  plante en pleine production.
