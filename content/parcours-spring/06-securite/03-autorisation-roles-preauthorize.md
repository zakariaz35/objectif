---
title: "Autorisation par rôles : @PreAuthorize et hasRole"
type: lesson
---

## Autorisation au niveau des routes

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(auth -> auth
        .requestMatchers("/api/admin/**").hasRole("ADMIN")
        .requestMatchers("/api/orders/**").hasAnyRole("ADMIN", "SUPPORT")
        .anyRequest().authenticated()
    );
    return http.build();
}
```

> **Symfony → Spring.** Équivalent à `access_control` dans `security.yaml` :
> une règle par motif d'URL, associée à un rôle requis.

## Autorisation au niveau des méthodes : `@PreAuthorize`

Pour des règles plus fines que le simple motif d'URL, `@EnableMethodSecurity`
active des annotations directement sur les **méthodes** de service ou de
contrôleur.

```java
@Configuration
@EnableMethodSecurity   // enables @PreAuthorize / @PostAuthorize / @Secured
public class MethodSecurityConfig {}
```

```java
@Service
public class ProductService {

    @PreAuthorize("hasRole('ADMIN')")
    public void delete(Long productId) {
        productRepository.deleteById(productId);
    }
}
```

> **Symfony → Spring.** `@PreAuthorize("hasRole('ADMIN')")` est **quasiment
> l'équivalent littéral** de l'attribut Symfony `#[IsGranted('ROLE_ADMIN')]`
> posé sur une action de contrôleur — l'un des ponts les plus directs de
> tout ce cours : même idée, syntaxe presque calquée.

## Autorisation conditionnelle : appeler un bean depuis l'expression

Quand la règle dépend des **données** (ex. « seul le propriétaire de la
commande peut la modifier »), `@PreAuthorize` peut appeler une méthode d'un
bean, via `@` :

```java
@Component("orderSecurity")
public class OrderSecurity {

    private final OrderRepository orderRepository;

    public OrderSecurity(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public boolean isOwner(Long orderId, String username) {
        return orderRepository.findById(orderId)
                .map(order -> order.getCustomerEmail().equals(username))
                .orElse(false);
    }
}
```

```java
@Service
public class OrderService {

    @PreAuthorize("hasRole('ADMIN') or @orderSecurity.isOwner(#orderId, authentication.name)")
    public Order cancel(Long orderId) {
        // ...
        return order;
    }
}
```

> **Symfony → Spring.** Cette logique conditionnelle est **exactement** le
> rôle d'un **Voter** Symfony (`VoterInterface::voteOnAttribute`) : une
> classe dédiée qui décide, au cas par cas et à partir des données, si
> l'utilisateur a le droit d'agir. `@orderSecurity.isOwner(...)` appelé
> depuis `@PreAuthorize` correspond terme à terme à `#[IsGranted('EDIT',
> subject: 'order')]` évalué par un `OrderVoter` dédié.

| Symfony | Spring | Rôle |
|---|---|---|
| `#[IsGranted('ROLE_ADMIN')]` | `@PreAuthorize("hasRole('ADMIN')")` | Contrôle par rôle simple |
| `#[IsGranted('EDIT', subject: 'order')]` + Voter | `@PreAuthorize("@orderSecurity.isOwner(...)")` | Contrôle métier conditionnel |
| `access_control` (`security.yaml`) | `authorizeHttpRequests` | Contrôle au niveau des routes |

> ⚠️ **Erreur fréquente — mélanger les niveaux.** Le contrôle par route
> (`authorizeHttpRequests`) protège l'**accès général** à un chemin ; le
> contrôle par méthode (`@PreAuthorize`) protège une **action métier**
> précise, souvent avec une logique conditionnelle. Les deux sont
> complémentaires — ne compte pas sur l'un pour remplacer l'autre, comme tu
> ne remplacerais pas un Voter par un simple `access_control` en Symfony.

## À retenir

- `hasRole`/`hasAnyRole` en `authorizeHttpRequests` = `access_control` par
  motif d'URL.
- `@PreAuthorize` (avec `@EnableMethodSecurity`) = `#[IsGranted(...)]` sur une
  méthode — un des ponts les plus directs Symfony ↔ Spring.
- Une expression `@PreAuthorize` appelant un bean dédié = un Voter Symfony :
  même logique, juste une syntaxe différente.
