---
title: "Exercice — traduire une configuration Symfony en configuration Spring"
type: exercise
---

## Énoncé

Voici la configuration d'un projet Symfony :

```bash
# .env
APP_ENV=dev
APP_TAX_RATE=0.20
MAILER_DSN=smtp://localhost:1025
MAILER_MAX_RETRIES=3
```

```bash
# .env.local (not committed, overrides in prod)
MAILER_DSN=smtp://smtp.sendgrid.net:587
```

```yaml
# config/services.yaml
parameters:
    app.tax_rate: '%env(float:APP_TAX_RATE)%'
    app.mailer_dsn: '%env(MAILER_DSN)%'
    app.mailer_max_retries: '%env(int:MAILER_MAX_RETRIES)%'

services:
    App\Billing\InvoiceCalculator:
        arguments:
            $taxRate: '%app.tax_rate%'
```

```yaml
# config/packages/dev/monolog.yaml
monolog:
    handlers:
        main:
            level: debug
```

```yaml
# config/packages/prod/monolog.yaml
monolog:
    handlers:
        main:
            level: warning
```

**Tâche** : écris l'équivalent Spring Boot :

1. Un `application.yml` avec les clés `app.tax-rate`, `app.mailer.dsn`,
   `app.mailer.max-retries`.
2. Une classe `AppProperties` (`@ConfigurationProperties(prefix = "app")`),
   sous forme de `record`, avec un sous-objet `Mailer`.
3. `application-dev.yml` / `application-prod.yml` pour le niveau de log
   (`DEBUG` en dev, `WARN` en prod).
4. Explique en une phrase comment surcharger `app.mailer.dsn` en prod sans
   toucher au fichier versionné.

<!--correction-->

## Correction

```yaml
# application.yml
app:
  tax-rate: 0.20
  mailer:
    dsn: smtp://localhost:1025
    max-retries: 3
```

```java
// AppProperties.java
package com.example.shop.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        double taxRate,
        Mailer mailer
) {
    public record Mailer(String dsn, int maxRetries) {}
}
```

```yaml
# application-dev.yml
logging:
  level:
    com.example.shop: DEBUG
```

```yaml
# application-prod.yml
logging:
  level:
    com.example.shop: WARN
```

**Surcharge en production** : définir la variable d'environnement
`APP_MAILER_DSN` (Spring la lie automatiquement à `app.mailer.dsn` via le
*relaxed binding*) au déploiement — exactement comme `.env.local` (non
commité) surcharge `.env` en Symfony, sans jamais modifier le fichier
versionné.

```bash
export APP_MAILER_DSN=smtp://smtp.sendgrid.net:587
java -jar shop.jar --spring.profiles.active=prod
```

- Chaque `%env(...)%` Symfony devient une clé `application.yml` liée dans
  `AppProperties` — la conversion de type (`float:APP_TAX_RATE` →
  `double`) est gérée par le *constructor binding* de Spring Boot, pas par un
  cast explicite dans le YAML.
- Le paramètre unique `$taxRate: '%app.tax_rate%'` injecté dans un seul
  service Symfony devient une classe `AppProperties` **partagée**,
  injectable dans n'importe quel bean — plus proche d'une classe
  `Configuration` de bundle que d'un paramètre isolé.
- `config/packages/dev/monolog.yaml` vs `config/packages/prod/monolog.yaml`
  devient `application-dev.properties` vs `application-prod.properties` —
  même principe de surcharge par profil/environnement.
