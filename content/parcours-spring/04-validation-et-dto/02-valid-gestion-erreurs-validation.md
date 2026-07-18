---
title: "@Valid et la gestion des erreurs de validation"
type: lesson
---

## `@Valid` dans un contrôleur : la validation automatique

```java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @PostMapping
    public User create(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }
}
```

Poser `@Valid` **avant** `@RequestBody` déclenche la validation Bean
Validation **avant** l'exécution du corps de la méthode. Si une contrainte
échoue, Spring lève automatiquement une `MethodArgumentNotValidException` et
la méthode `create` **n'est jamais appelée**.

> **Symfony → Spring.** En Symfony, tu appelles le validateur **toi-même** :

```php
$errors = $validator->validate($dto);
if (count($errors) > 0) {
    return $this->json(['errors' => (string) $errors], 400);
}
```

> `@Valid` fait la même chose, mais de façon **automatique et déclarative** :
> tu n'écris jamais l'appel au validateur, Spring l'intercepte avant d'entrer
> dans la méthode.

> ⚠️ **Erreur fréquente — oublier `@Valid`.** Sans lui, les annotations
> `@NotBlank`/`@Email`/... sur le DTO sont **silencieusement ignorées** — le
> DTO est bindé depuis le JSON, mais **jamais validé**. C'est une erreur
> facile à ne pas remarquer en développement (les données de test sont
> souvent valides).

## Personnaliser la réponse d'erreur

Par défaut, Spring Boot renvoie une réponse `400 Bad Request` générique.
Pour un format d'erreur exploitable côté client (liste des champs en
erreur), un gestionnaire global reprend la main :

```java
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
                        FieldError::getDefaultMessage,
                        (existing, replacement) -> existing));
    }
}
```

Réponse produite pour une requête invalide :

```json
{
  "email": "Must be a valid email address",
  "password": "Password must be at least 8 characters"
}
```

> **Symfony → Spring.** Ce gestionnaire centralisé remplace le
> `if (count($errors) > 0) { return $this->json(...) }` répété dans chaque
> action Symfony — même bénéfice qu'un `@RestControllerAdvice` pour les
> exceptions métier vu au module précédent : un seul point de traduction
> pour toute l'application.

## À retenir

- `@Valid` avant `@RequestBody` déclenche la validation **automatiquement**,
  avant l'exécution de la méthode — remplace l'appel manuel au `Validator`
  Symfony.
- Sans `@Valid`, les contraintes du DTO sont posées mais **jamais
  vérifiées** — piège silencieux à surveiller.
- Un `@RestControllerAdvice` sur `MethodArgumentNotValidException` structure
  la réponse d'erreur, une seule fois pour toute l'application.
