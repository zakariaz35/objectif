---
title: "@RestController et le mapping des routes"
type: lesson
---

## `@RestController` = `@Controller` + JSON automatique

Un `@RestController` est un bean spécialisé dont chaque méthode renvoie
directement des **données** (sérialisées en JSON par Jackson), et non une vue
HTML à rendre.

```java
// ProductController.java
package com.example.shop.product;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> findAll() {
        return productService.findAll();
    }
}
```

> **Symfony → Spring.** `@RestController` correspond à un contrôleur Symfony
> dont chaque action renvoie un `JsonResponse` — sauf qu'ici, tu renvoies
> directement un **objet Java** (une entité, un DTO, une liste) et Spring se
> charge de le sérialiser en JSON via Jackson, comme le fait le composant
> Serializer de Symfony derrière `$this->json($data)`.

## Les annotations de mapping HTTP

| Annotation Spring | Méthode HTTP | Équivalent Symfony |
|---|---|---|
| `@GetMapping("/products")` | `GET` | `#[Route('/products', methods: ['GET'])]` |
| `@PostMapping("/products")` | `POST` | `#[Route('/products', methods: ['POST'])]` |
| `@PutMapping("/products/{id}")` | `PUT` | `#[Route('/products/{id}', methods: ['PUT'])]` |
| `@PatchMapping("/products/{id}")` | `PATCH` | `#[Route('/products/{id}', methods: ['PATCH'])]` |
| `@DeleteMapping("/products/{id}")` | `DELETE` | `#[Route('/products/{id}', methods: ['DELETE'])]` |

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping("/{id}")
    public Product findOne(@PathVariable Long id) {
        return productService.findOne(id);
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        return productService.create(product);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }
}
```

> **Réflexe à prendre.** `@RequestMapping("/api/products")` posé sur la
> **classe** préfixe toutes les routes de ce contrôleur — comme grouper des
> routes Symfony sous un préfixe commun (`#[Route('/api/products')]` sur la
> classe, ajouté à chaque `#[Route]` de méthode depuis Symfony 6.1). Un
> contrôleur = une **ressource** REST, jamais un fourre-tout de routes sans
> rapport entre elles.

## Nommage des méthodes : libre, seule l'annotation compte

Contrairement à certaines conventions strictes, le **nom** de la méthode Java
(`findAll`, `list`, `getAll`...) n'a aucune importance pour le routage — seule
l'annotation (`@GetMapping`, le chemin) compte. Choisis des noms clairs pour
toi et ton équipe, exactement comme le nom d'une méthode d'action Symfony
n'influence jamais la route qu'elle sert.

## À retenir

- `@RestController` renvoie des données sérialisées en JSON, jamais une vue
  — le pendant d'un contrôleur Symfony qui ne fait que du `JsonResponse`.
- `@GetMapping`/`@PostMapping`/... mappent une méthode HTTP + un chemin, comme
  `#[Route(..., methods: [...])]`.
- `@RequestMapping` sur la classe préfixe toutes les routes du contrôleur —
  regroupe par ressource, pas par hasard.
