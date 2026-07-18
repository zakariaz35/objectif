---
title: "Récupérer les données : @PathVariable, @RequestParam, @RequestBody"
type: lesson
---

## `@PathVariable` : un segment de l'URL

```java
@GetMapping("/products/{id}")
public Product findOne(@PathVariable Long id) {
    return productService.findOne(id);
}
```

Spring convertit automatiquement le segment textuel de l'URL vers le type
Java déclaré (`Long` ici) ; une valeur non convertible (`/products/abc`)
provoque une erreur `400 Bad Request` avant même d'entrer dans la méthode.

> **Symfony → Spring.** Identique au `{id}` d'une route Symfony
> (`#[Route('/products/{id}')]`) combiné à un argument typé dans la méthode
> — Symfony convertit aussi automatiquement (et peut même résoudre une
> **entité entière** via un `ParamConverter`/`#[MapEntity]`, ce que Spring ne
> fait pas nativement : côté Spring, tu récupères l'id, puis tu charges
> l'entité toi-même dans le service).

## `@RequestParam` : les paramètres de requête (`?clé=valeur`)

```java
@GetMapping("/products")
public List<Product> search(
        @RequestParam(required = false) String category,
        @RequestParam(defaultValue = "20") int limit) {
    return productService.search(category, limit);
}
```

- `required = false` : le paramètre est optionnel (sans lui, Spring renvoie
  `400` par défaut si absent et requis — ici on l'autorise absent).
- `defaultValue` : valeur utilisée si le paramètre est absent de l'URL.

> **Symfony → Spring.** Équivalent à `$request->query->get('category')` /
> `$request->query->getInt('limit', 20)` — sauf que Spring **type et valide**
> la conversion pour toi (paramètre de méthode `int limit`), là où Symfony
> te renvoie généralement des chaînes à convertir manuellement.

## `@RequestBody` : désérialiser le corps JSON

```java
public record CreateProductRequest(String name, double price) {}

@PostMapping("/products")
public Product create(@RequestBody CreateProductRequest request) {
    return productService.create(request.name(), request.price());
}
```

`@RequestBody` indique à Spring de désérialiser le corps de la requête (JSON)
vers l'objet Java grâce à **Jackson**, avant même l'exécution du corps de la
méthode.

> **Symfony → Spring.** Le pendant le plus proche est le composant
> **Serializer** Symfony : soit tu désérialises manuellement
> (`$serializer->deserialize($request->getContent(), Dto::class, 'json')`),
> soit — depuis Symfony 7 — l'attribut `#[MapRequestPayload]` fait
> automatiquement ce que `@RequestBody` fait nativement en Spring depuis
> toujours. Les deux frameworks convergent vers la même idée : binder le JSON
> entrant directement sur un objet typé.

```java
// Full example combining the three
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping("/{id}")
    public Product findOne(@PathVariable Long id) {
        return productService.findOne(id);
    }

    @GetMapping
    public List<Product> search(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "20") int limit) {
        return productService.search(category, limit);
    }

    @PostMapping
    public Product create(@RequestBody CreateProductRequest request) {
        return productService.create(request.name(), request.price());
    }
}
```

> ⚠️ **Erreur fréquente — oublier `@RequestBody`.** Sans cette annotation,
> Spring cherche le paramètre parmi les *query params*/*path variables*, pas
> dans le corps JSON — la requête échoue silencieusement ou renvoie une
> valeur nulle inattendue. Le corps JSON **doit** être marqué explicitement.

## À retenir

- `@PathVariable` lit un segment d'URL, `@RequestParam` un paramètre de
  requête, `@RequestBody` le corps JSON désérialisé par Jackson.
- Spring convertit et type automatiquement — une conversion impossible
  renvoie `400` avant d'entrer dans la méthode.
- Le plus proche équivalent Symfony de `@RequestBody` est le composant
  Serializer (ou `#[MapRequestPayload]` en Symfony 7+).
