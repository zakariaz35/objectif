---
title: "Exercice — DTO + Bean Validation équivalents à un Form Symfony"
type: exercise
---

## Énoncé

Voici un `FormType` Symfony pour créer un article de blog, avec ses
contraintes :

```php
<?php
// src/Form/CreateArticleType.php
namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints as Assert;

class CreateArticleType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('title', TextType::class, [
                'constraints' => [
                    new Assert\NotBlank(),
                    new Assert\Length(min: 5, max: 120),
                ],
            ])
            ->add('slug', TextType::class, [
                'constraints' => [
                    new Assert\NotBlank(),
                    new Assert\Regex(pattern: '/^[a-z0-9-]+$/'),
                ],
            ])
            ->add('authorEmail', TextType::class, [
                'constraints' => [
                    new Assert\NotBlank(),
                    new Assert\Email(),
                ],
            ])
            ->add('viewCount', null, [
                'constraints' => [
                    new Assert\PositiveOrZero(),
                ],
            ]);
    }
}
```

Et le contrôleur qui l'utilise :

```php
<?php
#[Route('/api/articles', methods: ['POST'])]
public function create(Request $request): JsonResponse
{
    $form = $this->createForm(CreateArticleType::class);
    $form->submit(json_decode($request->getContent(), true));

    if (!$form->isValid()) {
        return $this->json(['errors' => (string) $form->getErrors(true)], 400);
    }

    $data = $form->getData();
    $article = $this->articleService->create($data);

    return $this->json($article, 201);
}
```

**Tâche** : écris l'équivalent Spring :

1. Un DTO `CreateArticleRequest` (record) avec les contraintes Bean
   Validation équivalentes (`title`, `slug`, `authorEmail`, `viewCount`).
2. Le contrôleur `POST /api/articles` avec `@Valid`, renvoyant `201` et le
   bon DTO de réponse en cas de succès.
3. Un `@RestControllerAdvice` qui structure les erreurs de validation en
   `400` (map champ → message).

<!--correction-->

## Correction

```java
// CreateArticleRequest.java
package com.example.blog.article;

import jakarta.validation.constraints.*;

public record CreateArticleRequest(
        @NotBlank
        @Size(min = 5, max = 120)
        String title,

        @NotBlank
        @Pattern(regexp = "^[a-z0-9-]+$")
        String slug,

        @NotBlank
        @Email
        String authorEmail,

        @PositiveOrZero
        int viewCount
) {}
```

```java
// ArticleController.java
package com.example.blog.article;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @PostMapping
    public ResponseEntity<ArticleResponse> create(@Valid @RequestBody CreateArticleRequest request) {
        Article article = articleService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ArticleResponse.fromEntity(article));
    }
}
```

```java
// ValidationExceptionHandler.java
package com.example.blog.article;

import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ValidationExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationErrors(MethodArgumentNotValidException ex) {
        return ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value",
                        (existing, replacement) -> existing));
    }
}
```

- Chaque contrainte de `FormBuilderInterface` (`Assert\NotBlank`,
  `Assert\Length`, `Assert\Regex`, `Assert\Email`, `Assert\PositiveOrZero`)
  trouve son équivalent Bean Validation quasi terme à terme.
- Le `$form->submit(...) + $form->isValid()` manuel disparaît : `@Valid`
  déclenche la validation **avant** l'entrée dans la méthode, sans code
  explicite dans le contrôleur.
- Le `if (!$form->isValid()) { return $this->json(...) }` répété dans
  chaque action Symfony devient un **unique** `@RestControllerAdvice`,
  centralisé pour toute l'application — un gain net de duplication par
  rapport à l'approche Form-par-action.
