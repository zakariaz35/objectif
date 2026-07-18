---
title: "Exercice — traduire un contrôleur Symfony en contrôleur Spring"
type: exercise
---

## Énoncé

Voici un contrôleur Symfony pour une ressource `Book` :

```php
<?php
// src/Controller/BookController.php
namespace App\Controller;

use App\Entity\Book;
use App\Service\BookService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/books')]
class BookController
{
    public function __construct(
        private BookService $bookService,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json($this->bookService->findAll());
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $book = $this->bookService->findOne($id);

        if ($book === null) {
            return $this->json(['message' => 'Book not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($book);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $book = $this->bookService->create($data['title'], $data['author']);

        return $this->json($book, Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->bookService->delete($id);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
```

**Tâche** : écris l'équivalent Spring : un `@RestController` mappé sur
`/api/books`, avec les quatre routes (`list`, `show`, `create`, `delete`),
utilisant `@PathVariable`, `@RequestBody` et `ResponseEntity` avec les bons
codes de statut (`200`, `404`, `201`, `204`).

<!--correction-->

## Correction

```java
// BookController.java
package com.example.library.book;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public ResponseEntity<Iterable<Book>> list() {
        return ResponseEntity.ok(bookService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> show(@PathVariable Long id) {
        return bookService.findOptional(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Book> create(@RequestBody CreateBookRequest request) {
        Book book = bookService.create(request.title(), request.author());
        return ResponseEntity.status(HttpStatus.CREATED).body(book);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bookService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

```java
// CreateBookRequest.java
package com.example.library.book;

public record CreateBookRequest(String title, String author) {}
```

- `#[Route('/api/books')]` sur la classe devient `@RequestMapping("/api/books")`
  posé de la même façon sur la classe Spring.
- Le `{id}` de la route + le paramètre typé `int $id` devient
  `@PathVariable Long id` — la conversion de type est automatique dans les
  deux frameworks.
- Le `json_decode($this->getRequestContent(), true)` manuel de Symfony
  disparaît complètement : `@RequestBody CreateBookRequest request`
  désérialise directement le JSON entrant vers un DTO typé (record Java).
- Chaque code de statut explicite (`Response::HTTP_NOT_FOUND`,
  `Response::HTTP_CREATED`, `Response::HTTP_NO_CONTENT`) trouve son
  équivalent Spring dans `ResponseEntity` (`.notFound()`, `.status(CREATED)`,
  `.noContent()`).
