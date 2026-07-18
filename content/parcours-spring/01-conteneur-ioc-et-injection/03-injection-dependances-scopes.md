---
title: "Injection de dépendances : constructeur, @Autowired, scopes"
type: lesson
---

## Injection par constructeur : le seul réflexe à avoir

Spring propose trois façons d'injecter une dépendance : par **constructeur**,
par **champ** (`@Autowired` sur une propriété) ou par **setter**. En
pratique, une seule est recommandée.

```java
// ProductService.java
package com.example.shop.product;

import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    // Constructor injection: Spring resolves ProductRepository automatically.
    // With a single constructor, @Autowired is even optional.
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
}
```

> **Symfony → Spring.** C'est **le même mécanisme** que l'autowiring Symfony :
> un constructeur avec des paramètres **typés**, résolus automatiquement par
> le conteneur — aucune configuration XML/YAML nécessaire dans le cas
> standard. La règle « privilégie le constructeur » est d'ailleurs identique
> dans les deux mondes.

```java
// ❌ Field injection — works, but avoid it
@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
}
```

> ⚠️ **Erreur fréquente — l'injection par champ.** Elle « marche », mais rend
> la classe **impossible à instancier proprement en test** sans réflexion ou
> sans démarrer tout le contexte Spring, et masque les dépendances réelles
> (elles ne sont plus visibles dans la signature). L'injection par
> constructeur rend aussi les champs `final` — immuables, comme un
> `private readonly` PHP.

## Plusieurs implémentations : `@Qualifier` et `@Primary`

Quand plusieurs beans implémentent la même interface, Spring ne sait pas
lequel choisir — sauf indication.

```java
public interface NotificationSender {
    void send(String message);
}

@Service
public class EmailNotificationSender implements NotificationSender { /* ... */ }

@Service
@Primary   // used by default when no @Qualifier is specified
public class SlackNotificationSender implements NotificationSender { /* ... */ }
```

```java
@Service
public class OrderService {

    private final NotificationSender sender;

    public OrderService(@Qualifier("emailNotificationSender") NotificationSender sender) {
        this.sender = sender;   // explicitly picks the email implementation
    }
}
```

> **Symfony → Spring.** L'équivalent Symfony le plus direct : plusieurs
> services implémentant la même interface, résolus par **alias** (l'un
> devient l'implémentation par défaut via `#[AsAlias]` ou la configuration
> `default_index_method`), ou injectés explicitement par leur **id de
> service** plutôt que par le type. `@Primary` ≈ l'alias par défaut,
> `@Qualifier` ≈ cibler un service précis par son nom.

## Les scopes de bean

| Scope Spring | Comportement | Équivalent Symfony |
|---|---|---|
| `singleton` *(défaut)* | Une seule instance pour toute l'application | `shared: true` *(défaut)* |
| `prototype` | Une nouvelle instance à **chaque** injection | `shared: false` |
| `request` | Une instance par requête HTTP | Service *request-scoped* |
| `session` | Une instance par session HTTP | (rare en Symfony, via session) |

```java
@Service
@Scope("prototype")
public class ReportBuilder {
    // A fresh instance every time this bean is injected.
}
```

> **Réflexe à prendre.** Comme en Symfony, le **singleton est le scope par
> défaut et le bon choix dans l'immense majorité des cas** — un bean sans
> état mutable partagé n'a aucune raison d'être recréé. Réserve
> `prototype`/`request` aux cas où un état **doit** être propre à chaque
> utilisation (ex. un builder mutable, un contexte par requête).

## À retenir

- **Injection par constructeur toujours** — mêmes bénéfices qu'en Symfony :
  dépendances explicites, champs `final`, testabilité.
- `@Qualifier` cible une implémentation précise ; `@Primary` désigne
  l'implémentation par défaut quand plusieurs beans correspondent au même
  type.
- Le scope par défaut est `singleton` (comme `shared: true` en Symfony) —
  n'y déroge qu'avec une vraie raison.
