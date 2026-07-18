---
title: "ValidationPipe : globale, locale, et ses options"
type: lesson
---

## Brancher la validation sur toutes les routes

Déclarer des contraintes `class-validator` sur un DTO ne suffit pas : il
faut un **Pipe** qui les fasse réellement exécuter avant que le handler ne
s'exécute. Le plus simple : une `ValidationPipe` **globale**, activée une
seule fois dans `main.ts` :

```ts
// main.ts
import { ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // strip properties NOT declared in the DTO
      forbidNonWhitelisted: true,    // reject the request if extra properties are found
      transform: true,               // auto-convert plain JSON into the DTO class instance
    }),
  )

  await app.listen(3000)
}
bootstrap()
```

Une fois cette ligne posée, **toute route** avec un `@Body() dto:
CreateProductDto` est automatiquement validée : requête invalide → réponse
`400 Bad Request` avec le détail des erreurs, **sans écrire une seule ligne
de vérification manuelle** dans le contrôleur.

```json
{
  "statusCode": 400,
  "message": [
    "name must be longer than or equal to 2 characters",
    "price must not be less than 0"
  ],
  "error": "Bad Request"
}
```

> **Symfony → NestJS.** `app.useGlobalPipes(new ValidationPipe(...))` est
> l'équivalent d'activer le composant **Validator** pour tous les
> formulaires/DTO de l'application, avec un mapping automatique des
> violations vers une réponse `422`/`400` — la nuance : Nest le fait pour
> **toutes** les routes en une seule ligne de bootstrap, sans configuration
> par contrôleur.

## Les trois options qui comptent le plus

| Option | Effet |
|---|---|
| `whitelist: true` | Supprime silencieusement toute propriété **non déclarée** dans le DTO |
| `forbidNonWhitelisted: true` | Va plus loin : **rejette** la requête (400) si une propriété en trop est présente, plutôt que de la supprimer silencieusement |
| `transform: true` | Transforme réellement le body en **instance** du DTO (types convertis : ex. `"12"` → `12` pour un `@IsInt()`) |

> ⚠️ **Erreur fréquente — omettre `whitelist`/`forbidNonWhitelisted`.** Sans
> ces options, un client peut envoyer des champs **en plus** de ceux
> déclarés dans le DTO (ex. `{ name: "Book", price: 12, isAdmin: true }`) :
> ils traversent la validation sans erreur et peuvent, selon ce qui est
> fait ensuite du DTO, fuiter jusqu'à la couche de persistance. C'est un
> vrai risque de sécurité (« *mass assignment* ») — le même risque que
> Symfony documente pour les formulaires liés directement à une entité
> sans restreindre les champs autorisés.

## Validation locale : une seule route

Pour valider un DTO sur **une** route précise, sans l'appliquer à toute
l'application :

```ts
import { Body, Controller, Post, UsePipes, ValidationPipe } from "@nestjs/common"

@Controller("products")
export class ProductsController {
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateProductDto) {
    return dto
  }
}
```

> **Réflexe à prendre.** En pratique, sur un vrai projet, la
> `ValidationPipe` **globale** dans `main.ts` est de très loin le cas le
> plus courant : une seule déclaration protège toutes les routes actuelles
> **et futures**. Réserve `@UsePipes` local aux cas où une route a
> vraiment besoin d'un comportement de validation différent du reste de
> l'application.

## À retenir

- `app.useGlobalPipes(new ValidationPipe({...}))` dans `main.ts` active la
  validation `class-validator` sur **toute** l'application — l'endroit où
  poser ça une fois pour toutes.
- `whitelist` + `forbidNonWhitelisted` protègent contre le *mass
  assignment* (champs en trop non déclarés dans le DTO) ; `transform`
  convertit réellement le body en instance typée du DTO.
- La validation **locale** (`@UsePipes` sur une route) existe, mais reste
  l'exception plutôt que la règle.
