---
title: "@ConfigurationProperties : configuration typée"
type: lesson
---

## Regrouper une configuration dans une classe typée

```yaml
# application.yml
app:
  tax-rate: 0.20
  name: Shop API
  mailer:
    from: no-reply@shop.example
    max-retries: 3
```

```java
// AppProperties.java
package com.example.shop.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        double taxRate,
        String name,
        Mailer mailer
) {
    public record Mailer(String from, int maxRetries) {}
}
```

```java
// ShopApplication.java
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan   // enables detection of @ConfigurationProperties classes
public class ShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }
}
```

```java
// Usage: injected like any other bean, fully typed
@Service
public class InvoiceService {

    private final AppProperties appProperties;

    public InvoiceService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public double priceWithTax(double price) {
        return price * (1 + appProperties.taxRate());
    }
}
```

Spring Boot 3 lie automatiquement `app.tax-rate` → `taxRate`, `app.mailer.from`
→ `mailer.from`... — la conversion *kebab-case* → *camelCase* est native, y
compris pour un `record` (constructor binding).

> **Symfony → Spring.** L'équivalent Symfony le plus rigoureux n'est pas
> `%app.tax_rate%` isolé, mais la **classe `Configuration`** d'un bundle
> (`ConfigurationInterface` + `getConfigTreeBuilder()`) : un arbre de
> configuration **typé et validé**, décrivant précisément la forme attendue
> — exactement ce que fait `@ConfigurationProperties` en regroupant et
> typant plusieurs clés liées, plutôt que de piocher des `%paramètres%`
> isolés un peu partout comme le ferait un simple `@Value`.

> 💡 **À retenir.** `@ConfigurationProperties` sur un `record` combine trois
> avantages en une fois : configuration **groupée** (une classe par domaine
> de config), **typée** (le compilateur garantit les types), et **validable**
> (ajoute `@Validated` + des contraintes Bean Validation sur les champs pour
> refuser un démarrage avec une configuration incohérente).

## À retenir

- `@ConfigurationProperties(prefix = "...")` regroupe une famille de clés
  dans une classe typée — le pendant d'une classe `Configuration` de bundle
  Symfony (arbre de config typé et validé), plus rigoureux qu'un `@Value`
  isolé.
- Un `record` fonctionne nativement avec le *constructor binding* de Spring
  Boot 3 — pas besoin de setters.
- `@ConfigurationPropertiesScan` (ou l'enregistrement explicite du bean) est
  nécessaire pour que la classe soit détectée.
