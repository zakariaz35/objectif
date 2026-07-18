---
title: "Interceptors & Middleware : encadrer l'exécution"
type: lesson
---

## Interceptors : agir AVANT **et** APRÈS le handler

Un **Interceptor** encadre l'exécution du handler : il peut exécuter du code
**avant** (comme un Guard ou un Pipe), mais aussi **après**, une fois la
réponse produite — pour la transformer, mesurer un temps d'exécution, ou
mettre en cache un résultat.

```ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // `next.handle()` triggers the controller method; `.pipe(map(...))`
    // transforms whatever it returns, AFTER it has run.
    return next.handle().pipe(map((data) => ({ data })))
  }
}
```

```ts
@Get()
@UseInterceptors(WrapResponseInterceptor)
findAll() {
  return [{ id: 1, name: "Book" }]
  // client actually receives: { "data": [{ "id": 1, "name": "Book" }] }
}
```

```ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Observable } from "rxjs"
import { tap } from "rxjs/operators"

// Timing example: code BEFORE next.handle() runs before the controller,
// code inside .pipe(tap(...)) runs AFTER it has returned.
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now()
    const request = context.switchToHttp().getRequest()
    console.log(`--> ${request.method} ${request.url}`)

    return next.handle().pipe(
      tap(() => console.log(`<-- ${request.method} ${request.url} (${Date.now() - start}ms)`)),
    )
  }
}
```

> **Symfony → NestJS.** Le plus proche équivalent Symfony est un
> `EventSubscriber` écoutant à la fois `kernel.controller` (avant
> l'exécution) et `kernel.view`/`kernel.response` (après) — ou, pour un cas
> précis, un attribut décorateur enveloppant une méthode. La particularité
> Nest : un **seul** objet (l'Interceptor) encadre les deux moments, via le
> flux RxJS `next.handle()`.

> 💡 **À retenir.** Distingue clairement Guard, Pipe et Interceptor :
> - **Pipe** : transforme/valide **un argument**, avant le handler.
> - **Guard** : répond **oui/non**, avant le handler.
> - **Interceptor** : encadre **tout l'appel**, avant **et** après.

## Middleware : la couche la plus en amont

Un **Middleware** Nest est la couche la **plus externe** : il s'exécute
**avant même que Nest ne sache quel contrôleur va traiter la requête**
(avant les Guards). C'est la version « industrialisée » du middleware
manuel `(req, res, next)` que tu as construit dans le parcours Node.js.

```ts
// logger.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common"
import { NextFunction, Request, Response } from "express"

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.originalUrl}`)
    next()   // same next() as the manual middleware chain seen in Node
  }
}
```

```ts
// app.module.ts — middleware is wired in configure(), not in @Module(...)
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"

@Module({ controllers: [ProductsController] })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes("products")   // or '*' for the whole application
  }
}
```

> **Symfony → NestJS.** C'est le rôle exact d'un `EventSubscriber` sur
> `kernel.request` (vu dans le parcours Node.js précédent, transposé ici en
> Nest) : la couche la plus en amont, avant même que le routeur n'ait
> déterminé quel contrôleur traiter.

## Pipe, Guard, Interceptor ou Middleware : lequel choisir ?

| Besoin | Bon outil |
|---|---|
| Convertir/valider un paramètre précis | **Pipe** |
| Autoriser/refuser l'accès à une route | **Guard** |
| Logger, mesurer un temps, transformer la réponse | **Interceptor** |
| Agir sur TOUTE requête entrante, avant le routing (CORS, logging bas niveau) | **Middleware** |

## À retenir

- Un **Interceptor** encadre l'appel entier (avant **et** après), via
  `next.handle().pipe(...)` — le pendant d'un `EventSubscriber` sur
  `kernel.controller`/`kernel.response`.
- Un **Middleware** est la couche la plus en amont, avant même les Guards —
  la version industrialisée du middleware manuel `(req, res, next)` déjà
  connu.
- Pipe (argument), Guard (oui/non), Interceptor (avant/après), Middleware
  (le plus en amont) : quatre outils, quatre responsabilités distinctes —
  ne mélange pas leurs rôles.
