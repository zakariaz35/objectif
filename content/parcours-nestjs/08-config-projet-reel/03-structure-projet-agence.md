---
title: "Organiser un vrai projet NestJS d'agence"
type: lesson
---

## Découper par domaine métier, pas par couche technique

```
src/
├─ main.ts
├─ app.module.ts
├─ config/
│  ├─ database.config.ts
│  └─ env.validation.ts
├─ common/                      ← transverse, réutilisé PAR tous les modules
│  ├─ filters/
│  │  └─ http-exception.filter.ts
│  ├─ guards/
│  │  └─ roles.guard.ts
│  ├─ interceptors/
│  │  └─ wrap-response.interceptor.ts
│  ├─ decorators/
│  │  └─ current-user.decorator.ts
│  └─ pipes/
│     └─ parse-int.pipe.ts
├─ products/                    ← feature module : produits
│  ├─ products.module.ts
│  ├─ products.controller.ts
│  ├─ products.service.ts
│  ├─ product.entity.ts
│  ├─ dto/
│  │  ├─ create-product.dto.ts
│  │  └─ update-product.dto.ts
│  └─ products.service.spec.ts
├─ orders/                      ← feature module : commandes
│  └─ ...
└─ users/                       ← feature module : utilisateurs
   └─ ...
```

> **Symfony → NestJS.** C'est le même réflexe que **découper Symfony par
> bundle/domaine** plutôt que d'entasser tout dans `src/Controller/`,
> `src/Entity/`, `src/Repository/` séparément : un dossier `products/`
> Nest regroupe **tout** ce qui concerne les produits (contrôleur, service,
> entité, DTO, tests) au même endroit, plutôt que d'éclater ces
> responsabilités par type technique à travers l'arborescence.

> ⚠️ **Erreur fréquente — dossiers `controllers/`, `services/`,
> `entities/` séparés à la racine.** C'est l'organisation « par couche »
> qui rend un vrai projet difficile à naviguer dès qu'il grandit :
> retrouver tout ce qui concerne « commandes » nécessite de fouiller quatre
> dossiers différents. Préfère **un dossier par domaine** (`orders/`,
> `products/`), chacun autonome et déplaçable.

## `common/` : ce qui est réellement transverse

Seul le code utilisé par **plusieurs** modules mérite `common/` — guards de
rôles, filtre d'exception global, décorateurs custom, intercepteurs
génériques (module 5). Une règle simple : si un provider n'est utilisé que
par un seul module, il **reste** dans ce module ; il ne migre vers
`common/` qu'au deuxième usage réel.

```ts
// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common"

// A custom decorator: @CurrentUser() extracts req.user in one line,
// reusable across every controller that needs the authenticated user.
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    return request.user
  },
)
```

```ts
@Get("me")
@UseGuards(AuthGuard)
getProfile(@CurrentUser() user: { id: number; email: string }) {
  return user
}
```

> **Symfony → NestJS.** `createParamDecorator` correspond au rôle d'un
> **argument resolver** custom Symfony (`ValueResolverInterface`) : extraire
> une donnée récurrente (l'utilisateur courant) directement en argument de
> méthode, plutôt que de la relire manuellement à chaque contrôleur.

## Checklist d'agence — ce qu'un vrai projet ajoute vite

- **Linting/format** : ESLint + Prettier configurés dès le premier commit
  (le pendant de PHP-CS-Fixer/PHPStan côté Symfony).
- **`.env.example`** committé, jamais de vrai secret (leçon précédente).
- **CI** : `npm run lint && npm run test && npm run test:e2e` à chaque
  Pull Request — la même discipline qu'un pipeline GitLab/GitHub Actions
  Symfony.
- **Docker Compose** pour l'environnement local (Postgres, Redis...),
  comme le `docker-compose.yml` d'un projet Symfony standard.
- **Un `README.md`** documentant : setup local, variables d'env attendues
  (`.env.example`), commandes de migration, commandes de test.
- **Versionner les migrations** (module 6) avec le code — jamais
  `synchronize: true` au-delà du tout premier prototype.

> 💡 **À retenir.** Rien de tout cela n'est spécifique à Nest : c'est
> exactement la même hygiène de projet qu'une agence applique déjà sur ses
> projets Symfony. Le framework change, la discipline de production reste.

## À retenir

- Découpe par **domaine métier** (un dossier = un feature module complet),
  pas par couche technique — la même logique que découper Symfony par
  bundle plutôt que par type de fichier.
- `common/` n'accueille que le code **réellement** transverse (deuxième
  usage confirmé), pas tout ce qui pourrait théoriquement resservir un
  jour.
- La rigueur d'agence (lint, CI, `.env.example`, migrations versionnées)
  s'applique à l'identique, que le projet soit en Symfony ou en NestJS.
