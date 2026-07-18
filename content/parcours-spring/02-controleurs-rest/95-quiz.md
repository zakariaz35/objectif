---
title: "Quiz — Contrôleurs & REST"
type: quiz
questions:
  - prompt: |
      Quelle est la différence entre `@Controller` et `@RestController` ?
    options:
      - "Aucune : ce sont des alias exacts l'un de l'autre."
      - |
        `@RestController` = `@Controller` + `@ResponseBody` implicite sur
        chaque méthode : le retour est sérialisé directement dans le corps
        de la réponse, sans rendu de vue.
      - "`@RestController` ne peut gérer que des requêtes GET."
    answer: 1
    tags: ["restcontroller", "responsebody"]
    level: debutant
    explanation: |
      `@RestController` évite d'ajouter `@ResponseBody` sur chaque méthode :
      la valeur renvoyée devient directement le corps de la réponse
      (sérialisé en JSON par défaut), au lieu d'être interprétée comme un
      nom de vue à rendre.
  - prompt: |
      À quoi correspond le plus directement `@RequestMapping("/api/books")`
      posé sur une classe de contrôleur ?
    options:
      - "Un préfixe de route commun à toutes les méthodes du contrôleur, comme `#[Route('/api/books')]` sur une classe Symfony."
      - "Une contrainte de sécurité limitant l'accès aux utilisateurs authentifiés."
      - "Une configuration de cache HTTP pour toutes les routes du contrôleur."
    answer: 0
    tags: ["requestmapping", "routing"]
    level: debutant
    explanation: |
      `@RequestMapping` sur la classe définit un préfixe commun, combiné aux
      chemins de chaque `@GetMapping`/`@PostMapping`... — exactement le rôle
      d'un `#[Route]` de classe en Symfony.
  - prompt: |
      Un contrôleur reçoit `/products?category=books&limit=5`. Quelle
      annotation permet de récupérer `category` et `limit` ?
    options:
      - "`@PathVariable`"
      - "`@RequestParam`"
      - "`@RequestBody`"
    answer: 1
    tags: ["requestparam"]
    level: debutant
    explanation: |
      `@RequestParam` lit les paramètres de la *query string* — l'équivalent
      de `$request->query->get(...)` en Symfony, mais avec conversion de
      type et valeur par défaut natives.
  - prompt: |
      Pourquoi `@RequestBody` est-il OBLIGATOIRE pour désérialiser un corps
      JSON, contrairement à `@PathVariable`/`@RequestParam` qui n'ont pas
      besoin d'être aussi explicites ?
    options:
      - |
        Sans `@RequestBody`, Spring chercherait la valeur parmi les
        paramètres d'URL, jamais dans le corps de la requête — l'oubli est
        une source fréquente de bugs silencieux.
      - "`@RequestBody` n'est en réalité jamais nécessaire, Spring le devine toujours."
      - "`@RequestBody` ne fonctionne qu'avec les requêtes GET."
    answer: 0
    tags: ["requestbody", "erreur-frequente"]
    level: intermediaire
    explanation: |
      Sans `@RequestBody`, Spring tente de résoudre le paramètre comme un
      *query param* ou un *path variable* — pas dans le corps JSON. C'est
      une erreur fréquente qui produit des valeurs nulles inattendues.
  - prompt: |
      Quel est l'intérêt principal de `ResponseEntity<T>` par rapport à un
      simple retour d'objet (`public Product create(...)`) ?
    options:
      - "Aucun : les deux renvoient toujours un statut 200."
      - |
        Il permet de contrôler explicitement le code de statut HTTP, les
        headers et le corps de la réponse (ex. 201 après une création).
      - "Il désactive la sérialisation JSON automatique."
    answer: 1
    tags: ["responseentity", "statuts-http"]
    level: intermediaire
    explanation: |
      Sans `ResponseEntity`, un retour direct donne toujours `200 OK`.
      `ResponseEntity` (comme construire un `JsonResponse` avec un statut
      explicite en Symfony) permet de renvoyer `201`, `204`, `404`...
  - prompt: |
      Dans le cycle de vie d'une requête Spring MVC, quel composant joue le
      rôle du `HttpKernel` Symfony (point d'entrée unique) ?
    options:
      - "Le `HandlerMapping`."
      - "Le `DispatcherServlet`."
      - "Le `HttpMessageConverter`."
    answer: 1
    tags: ["dispatcherservlet", "cycle-de-vie"]
    level: avance
    explanation: |
      Le `DispatcherServlet` reçoit toutes les requêtes HTTP, délègue la
      résolution de route au `HandlerMapping`, appelle le contrôleur puis
      passe le résultat au `HttpMessageConverter` — le pendant exact du
      `HttpKernel::handle()` Symfony.
  - prompt: |
      Comment centraliser la traduction d'une exception métier
      (`ProductNotFoundException`) en réponse HTTP `404`, sans répéter un
      `try/catch` dans chaque méthode de contrôleur ?
    options:
      - "Avec un `@RestControllerAdvice` + `@ExceptionHandler(ProductNotFoundException.class)`."
      - "En appelant `System.exit(404)` dans le service."
      - "Ce n'est pas possible : chaque contrôleur doit gérer ses propres exceptions."
    answer: 0
    tags: ["exceptionhandler", "controlleradvice"]
    level: avance
    explanation: |
      `@RestControllerAdvice` + `@ExceptionHandler` centralise la gestion des
      exceptions pour toute l'application — l'équivalent d'un listener sur
      l'événement `kernel.exception` en Symfony.
---

Sept questions sur le mapping des routes, la récupération des données
(`@PathVariable`/`@RequestParam`/`@RequestBody`), `ResponseEntity` et la
gestion centralisée des erreurs.
