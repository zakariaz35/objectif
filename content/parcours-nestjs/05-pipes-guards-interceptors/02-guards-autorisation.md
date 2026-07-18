---
title: "Guards : décider si une requête a le droit de continuer"
type: lesson
---

## Le rôle d'un Guard

Un **Guard** répond à une seule question, **avant** que le handler ne
s'exécute : *cette requête a-t-elle le droit de continuer ?* Il renvoie
`true` (on continue) ou `false`/lève une exception (la requête est
rejetée, typiquement `403 Forbidden`).

```ts
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    return Boolean(request.headers.authorization)   // true = allowed to proceed
  }
}
```

```ts
import { Controller, Get, UseGuards } from "@nestjs/common"

@Controller("products")
@UseGuards(AuthGuard)   // applies to EVERY route of this controller
export class ProductsController {
  @Get()
  findAll() {
    return []
  }
}
```

> **Symfony → NestJS.** C'est le rôle des **Voters** et de
> `#[IsGranted(...)]` en Symfony : une classe dédiée qui répond à une
> question binaire d'autorisation (« cet utilisateur a-t-il ce rôle/cette
> permission sur cette ressource ? »), invoquée avant que le contrôleur ne
> s'exécute. `@UseGuards(AuthGuard)` correspond directement à
> `#[IsGranted('ROLE_USER')]` posé sur une classe de contrôleur.

## `ExecutionContext` : accéder à la requête (et plus)

`ExecutionContext` généralise `ArgumentsHost` : selon le contexte
d'exécution (HTTP, WebSocket, microservice...), `switchToHttp()` donne accès
à la requête/réponse Express sous-jacentes.

```ts
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly allowedRoles = ["admin", "manager"]

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const userRoles: string[] = request.user?.roles ?? []
    // At least ONE of the user's roles must be in the allowed list.
    return userRoles.some((role) => this.allowedRoles.includes(role))
  }
}
```

## Portée : méthode, contrôleur, ou application entière

```ts
@Get(":id")
@UseGuards(AuthGuard)          // this ONE route only
findOne() {}

@Controller("products")
@UseGuards(AuthGuard)          // every route of this controller
export class ProductsController {}

// main.ts — applies to EVERY route of the whole application
app.useGlobalGuards(new AuthGuard())
```

> **Symfony → NestJS.** Exactement la même hiérarchie que la sécurité
> Symfony : un `#[IsGranted]` par action, un firewall configuré par route
> dans `security.yaml`, ou une règle d'accès globale
> (`access_control:` couvrant tout un préfixe d'URL).

> ⚠️ **Erreur fréquente — mettre de la logique métier dans un Guard.** Un
> Guard répond à une question **binaire** (autorisé/refusé). Si tu te
> surprends à calculer un prix ou transformer une donnée dans un Guard,
> cette logique appartient ailleurs (un service, ou un Interceptor pour la
> transformation de réponse — leçon suivante).

## À retenir

- Un Guard répond à **une** question : « cette requête peut-elle
  continuer ? » — le rôle des Voters/`#[IsGranted]` côté Symfony.
- `@UseGuards(...)` s'applique à une route, un contrôleur, ou globalement
  (`app.useGlobalGuards`) — la même hiérarchie que la config de sécurité
  Symfony.
- Un Guard **ne transforme jamais de données** : c'est un aiguillage
  binaire, rien d'autre.
