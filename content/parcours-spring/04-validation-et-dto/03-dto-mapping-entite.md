---
title: "DTO et mapping vers l'entité"
type: lesson
---

## Pourquoi ne jamais exposer directement une entité

Renvoyer ou accepter directement une entité JPA en entrée/sortie de
contrôleur pose deux problèmes : exposer des champs internes (mot de passe
haché, relations lazy qui plantent la sérialisation...) et permettre
l'**overposting** (un client envoie un champ `role: "ADMIN"` que l'entité
accepterait silencieusement).

> **Symfony → Spring.** C'est exactement le même raisonnement qui pousse à
> utiliser des **DTO** avec un `Form` Symfony ou un objet dédié plutôt que
> de binder directement une entité Doctrine sur une requête HTTP — séparer
> ce que le client peut **envoyer/voir** de ce que l'application **stocke**.

## Un DTO en Java : le `record`

Depuis Java 16, un `record` est le type idéal pour un DTO immuable : il
génère automatiquement constructeur, accesseurs, `equals`/`hashCode` et
`toString`.

```java
// Input DTO — what the client sends
public record CreateProductRequest(
        @NotBlank String name,
        @Positive double price,
        @NotNull Long categoryId
) {}

// Output DTO — what the client sees (never the raw entity)
public record ProductResponse(
        Long id,
        String name,
        double price,
        String categoryName
) {
    public static ProductResponse fromEntity(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getCategory().getName()
        );
    }
}
```

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @PostMapping
    public ProductResponse create(@Valid @RequestBody CreateProductRequest request) {
        Product product = productService.create(request);
        return ProductResponse.fromEntity(product);
    }
}
```

> 💡 **À retenir.** Un mapping manuel (`fromEntity`) reste **la bonne
> approche par défaut** sur un projet de taille raisonnable : explicite,
> facile à déboguer, sans magie ni dépendance supplémentaire. Une librairie
> de mapping (type MapStruct) ne se justifie que si le nombre de DTO/entités
> à mapper devient réellement important — n'ajoute pas cette complexité
> prématurément.

## Nuance importante avec les Forms Symfony

> **Symfony → Spring.** Un `Form` Symfony fait **plus** qu'un DTO + Bean
> Validation : il gère aussi le **rendu HTML** (des templates Twig) et la
> **transformation de données** bidirectionnelle. Sur une API REST pure
> (comme dans ce cours), l'équivalent Symfony le plus proche d'un DTO Spring
> validé n'est pas `Form`, mais plutôt un DTO simple désérialisé par le
> Serializer + validé par le composant Validator — le rendu de formulaire
> HTML n'a simplement pas d'équivalent nécessaire côté API JSON.

## À retenir

- Ne jamais exposer une entité JPA brute en entrée/sortie de contrôleur —
  même logique qu'éviter de binder directement une entité Doctrine sur une
  requête HTTP.
- Un `record` Java est le DTO idéal : immuable, concis, avec un mapping
  explicite vers/depuis l'entité.
- Sur une API REST, le DTO + Bean Validation remplace le rôle de validation
  d'un `Form` Symfony — sans le rendu HTML, qui n'a pas lieu d'être ici.
