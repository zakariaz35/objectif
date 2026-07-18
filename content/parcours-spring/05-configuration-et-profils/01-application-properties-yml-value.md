---
title: "application.properties / application.yml et @Value"
type: lesson
---

## Le fichier de configuration central

Spring Boot lit automatiquement `src/main/resources/application.properties`
(ou `.yml`) au démarrage — sans le déclarer nulle part, c'est une convention.

```properties
# application.properties
app.tax-rate=0.20
app.name=Shop API
server.port=8081
spring.datasource.url=jdbc:postgresql://localhost:5432/shop
spring.datasource.username=shop
spring.datasource.password=secret
```

```yaml
# application.yml — equivalent, YAML syntax (often preferred for readability)
app:
  tax-rate: 0.20
  name: Shop API

server:
  port: 8081

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/shop
    username: shop
    password: secret
```

> **Symfony → Spring.** Le rôle est le même que la combinaison `.env` +
> `config/packages/*.yaml` + `parameters` Symfony : `spring.datasource.*`
> configure le framework lui-même (≈ `doctrine.yaml`), et `app.*` sont **tes**
> paramètres applicatifs (≈ la section `parameters:` d'un `services.yaml`).
> La différence principale : Spring **unifie** tout dans un seul fichier de
> propriétés (ou son équivalent YAML), là où Symfony sépare plus nettement
> `.env` (valeurs), `parameters` (déclaration) et les fichiers de bundle.

## `@Value` : injecter une propriété dans un champ

```java
// PricingConfig.java
package com.example.shop.pricing;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PricingConfig {

    @Value("${app.tax-rate}")
    private double taxRate;

    @Value("${app.name:Default Shop}")   // ":" gives a default value if the key is missing
    private String appName;

    public double getTaxRate() { return taxRate; }
}
```

> **Symfony → Spring.** `@Value("${app.tax-rate}")` correspond directement
> à `#[Autowire('%app.tax_rate%')]` (ou l'injection historique d'un
> paramètre `%app.tax_rate%` en argument de service dans `services.yaml`) —
> même idée : piocher une valeur de configuration nommée et l'injecter dans
> un champ ou un paramètre de constructeur.

```java
// Constructor injection is preferred, same reflex as for beans
@Service
public class InvoiceService {

    private final double taxRate;

    public InvoiceService(@Value("${app.tax-rate}") double taxRate) {
        this.taxRate = taxRate;
    }
}
```

> ⚠️ **Erreur fréquente — multiplier les `@Value` dispersés.** Semer des
> `@Value("${app.xxx}")` dans dix classes différentes rend la configuration
> difficile à auditer (impossible de savoir d'un coup d'œil quelles clés
> l'application utilise). Dès que la configuration dépasse deux ou trois
> valeurs isolées, regroupe-les dans une classe dédiée — voir la leçon
> suivante, `@ConfigurationProperties`.

## À retenir

- `application.properties`/`.yml` centralise la configuration Spring et
  applicative — le pendant unifié de `.env` + `parameters` + bundles Symfony.
- `@Value("${clé}")` injecte une valeur de propriété, avec une syntaxe
  `:` pour une valeur par défaut si la clé est absente.
- Au-delà de deux ou trois valeurs, préfère `@ConfigurationProperties` à une
  multitude de `@Value` dispersés.
