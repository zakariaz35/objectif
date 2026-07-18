---
title: "@nestjs/config : ConfigModule & ConfigService"
type: lesson
---

## Lire `.env` proprement, sans `process.env` disséminé partout

```bash
npm install @nestjs/config
```

```
# .env
DATABASE_URL=postgres://user:pass@localhost:5432/app
PORT=3000
JWT_SECRET=change-me-in-production
```

```ts
// app.module.ts
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,          // available EVERYWHERE, no need to re-import per module
      envFilePath: ".env",     // can be an array: [".env.local", ".env"]
    }),
  ],
})
export class AppModule {}
```

```ts
// products.service.ts
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class ProductsService {
  constructor(private readonly configService: ConfigService) {}

  someMethod() {
    const jwtSecret = this.configService.get<string>("JWT_SECRET")
    // ...
  }
}
```

> **Symfony → NestJS.** `ConfigModule.forRoot({ envFilePath: '.env' })` est
> l'exact pendant du chargement `.env`/`.env.local` de Symfony (via
> `symfony/dotenv`). `ConfigService.get('KEY')` correspond à l'accès aux
> `parameters` définis dans `services.yaml` via `%env(KEY)%`, ou à
> `$this->getParameter('key')` dans un contrôleur/service Symfony.

## Plusieurs fichiers `.env`, selon l'environnement

```ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [`.env.${process.env.NODE_ENV ?? "development"}.local`, ".env"],
})
```

Nest charge le **premier** fichier trouvé dans la liste ; c'est le même
réflexe que la hiérarchie Symfony `.env` → `.env.local` → `.env.$(APP_ENV)`
→ `.env.$(APP_ENV).local` (la plus spécifique gagnant).

> ⚠️ **Erreur fréquente — commiter un `.env` avec de vrais secrets.**
> Comme en Symfony (`.env` versionné avec des valeurs **par défaut**
> factices, `.env.local` ignoré par Git pour les vraies valeurs), ne
> committe **jamais** un fichier `.env` contenant un vrai secret. Fournis
> un `.env.example` documentant les clés attendues, sans valeurs
> sensibles.

## `ConfigService.get` avec valeur par défaut et typage

```ts
const port = this.configService.get<number>("PORT", 3000)   // default: 3000 if absent
```

> 💡 **À retenir.** `ConfigService.get<T>(key, default)` accepte un type
> générique **purement déclaratif** : il ne convertit **rien** tout seul —
> toute variable d'environnement est, à la base, une **chaîne**. Pour un
> typage et une conversion réellement fiables, la leçon suivante montre
> comment **valider** et **structurer** la configuration avec un schéma
> explicite.

## À retenir

- `ConfigModule.forRoot({ isGlobal: true })` rend `ConfigService`
  disponible partout, sans réimporter le module — l'équivalent du
  chargement `.env`/`parameters` centralisé de Symfony.
- Plusieurs fichiers `.env` peuvent être empilés selon l'environnement, la
  même hiérarchie de spécificité que `.env.local`/`.env.$(APP_ENV)` côté
  Symfony.
- Ne commite **jamais** de vrai secret dans `.env` : fournis un
  `.env.example` documentant les clés attendues.
