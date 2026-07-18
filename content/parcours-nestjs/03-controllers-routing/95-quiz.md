---
title: "Quiz — Contrôleurs & routing"
type: quiz
questions:
  - prompt: |
      Dans `@Controller('products')` avec une méthode `@Get(':id')`, quelle
      route finale est enregistrée ?
    options:
      - "GET /:id"
      - "GET /products/:id"
      - "GET /products (le :id est ignoré)"
    answer: 1
    tags: ["controller", "routing"]
    level: debutant
    explanation: |
      Le préfixe de `@Controller` se compose avec le chemin de la méthode :
      exactement le même principe qu'un `#[Route]` de classe combiné à un
      `#[Route]` de méthode en Symfony.
  - prompt: |
      Pourquoi déclarer `@Get('featured')` AVANT `@Get(':id')` dans la même
      classe, et pas l'inverse ?
    options:
      - |
        Parce que sinon, `GET /products/featured` matche `:id` avec
        `id = "featured"`, et la route statique n'est jamais atteinte.
      - "Cela n'a strictement aucune importance, l'ordre est ignoré par Nest."
      - "Parce que Nest trie les routes par ordre alphabétique au démarrage."
    answer: 0
    tags: ["routing", "ordre", "erreur-frequente"]
    level: intermediaire
    explanation: |
      Nest matche la première route compatible dans l'ordre de
      déclaration : un segment paramétré (`:id`) déclaré avant un segment
      statique (`featured`) capture ce dernier par erreur.
  - prompt: |
      Que renvoie `@Param('id')` sur la route `GET /products/42` ?
    options:
      - "Le nombre `42` (déjà converti en type `number`)."
      - "La chaîne `\"42\"` : aucune conversion de type automatique."
      - "Un objet `{ id: 42 }`."
    answer: 1
    tags: ["param", "types"]
    level: debutant
    explanation: |
      Les segments d'URL sont toujours des chaînes de caractères : Nest ne
      convertit pas automatiquement en `number` (sauf via un `Pipe`, vu au
      module suivant).
  - prompt: |
      `@Body()` valide-t-il automatiquement la forme du JSON envoyé par le
      client ?
    options:
      - |
        Oui, Nest rejette automatiquement tout corps de requête mal formé.
      - |
        Non : sans validation explicite (DTO + class-validator), `@Body()`
        renvoie le JSON reçu tel quel, non vérifié.
      - "Seulement si le Content-Type est `application/xml`."
    answer: 1
    tags: ["body", "validation"]
    level: intermediaire
    explanation: |
      `@Body()` désérialise le JSON, mais ne vérifie rien sur sa forme :
      c'est le rôle de la validation par DTO, couverte au module suivant.
  - prompt: |
      Que produit `throw new NotFoundException('Product #42 not found')`
      dans une méthode de contrôleur ?
    options:
      - |
        Une réponse HTTP `404`, avec un corps JSON contenant le message,
        construite automatiquement par le filtre d'exception de Nest.
      - "Un crash du serveur Node, nécessitant un redémarrage manuel."
      - "Rien : les exceptions sont silencieusement ignorées par Nest."
    answer: 0
    tags: ["exceptions", "http-status"]
    level: intermediaire
    explanation: |
      Les exceptions HTTP intégrées de Nest sont interceptées par un filtre
      d'exception par défaut qui construit la réponse HTTP correspondante —
      le pendant de l'ExceptionListener du kernel HTTP Symfony.
  - prompt: |
      Quel décorateur permet de forcer le code de statut `204 No Content`
      sur une route `DELETE`, plutôt que le défaut de Nest ?
    options:
      - "`@Status(204)`"
      - "`@HttpCode(HttpStatus.NO_CONTENT)`"
      - "`@Response(204)`"
    answer: 1
    tags: ["http-code", "status"]
    level: debutant
    explanation: |
      `@HttpCode(HttpStatus.NO_CONTENT)` (ou `@HttpCode(204)`) surcharge le
      code de statut par défaut d'une route — utile pour une suppression
      qui ne renvoie aucun corps de réponse.
  - prompt: |
      Quel est le meilleur réflexe de conception pour un `ProductsController` ?
    options:
      - |
        Ne contenir QUE la traduction HTTP → appel de service, sans aucune
        logique métier ni accès direct aux données.
      - "Ouvrir directement une connexion base de données dans chaque méthode."
      - "Dupliquer la logique métier dans le contrôleur pour éviter une dépendance au service."
    answer: 0
    tags: ["architecture", "controller", "bonnes-pratiques"]
    level: avance
    explanation: |
      Comme un contrôleur Symfony bien conçu, un contrôleur Nest délègue
      toute la logique métier à un provider injecté (`@Injectable`), pour
      rester testable, réutilisable et concentré sur le protocole HTTP.
---

Sept questions pour vérifier la composition des routes, l'ordre de
déclaration, les décorateurs d'extraction de requête, et le mécanisme des
exceptions HTTP.
