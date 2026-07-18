---
title: "Profils : dev, prod et variables d'environnement"
type: lesson
---

## Un fichier de propriétés par environnement

```
src/main/resources/
├─ application.properties           # commun à tous les environnements
├─ application-dev.properties       # surcharge en profil "dev"
└─ application-prod.properties      # surcharge en profil "prod"
```

```properties
# application-dev.properties
spring.jpa.show-sql=true
logging.level.com.example.shop=DEBUG
```

```properties
# application-prod.properties
spring.jpa.show-sql=false
logging.level.com.example.shop=WARN
```

Le profil actif s'active via une propriété ou une variable d'environnement :

```bash
# Explicit activation
java -jar shop.jar --spring.profiles.active=prod

# Or via environment variable
export SPRING_PROFILES_ACTIVE=prod
java -jar shop.jar
```

> **Symfony → Spring.** C'est le pendant de `config/packages/dev/*.yaml` /
> `config/packages/prod/*.yaml` surchargeant `config/packages/*.yaml`, avec
> `APP_ENV=prod` jouant le rôle de `SPRING_PROFILES_ACTIVE=prod`.

## `@Profile` sur un bean

```java
@Configuration
public class MailerConfig {

    @Bean
    @Profile("dev")
    public MailSender devMailSender() {
        return new ConsoleMailSender();   // logs emails instead of sending them
    }

    @Bean
    @Profile("prod")
    public MailSender prodMailSender() {
        return new SmtpMailSender();      // sends real emails
    }
}
```

> **Symfony → Spring.** Équivalent au découpage de services par
> environnement dans `config/services_dev.yaml`/`config/services_prod.yaml`,
> ou à un service défini conditionnellement selon `%kernel.environment%`.

## Variables d'environnement : la surcharge ultime

Spring Boot applique un ordre de priorité : les **variables d'environnement**
et les **arguments de ligne de commande** l'emportent toujours sur les
fichiers `application*.properties`.

```bash
# Overrides app.tax-rate from application.properties, no code change needed
export APP_TAX_RATE=0.19
```

Spring convertit automatiquement `APP_TAX_RATE` (format shell) vers
`app.tax-rate` (format propriété) — la liaison dite *relaxed binding*.

> **Symfony → Spring.** Exactement le rôle de `.env.local` (non commité) ou
> d'une vraie variable d'environnement système surchargeant `%env(APP_TAX_RATE)%`
> — même hiérarchie de priorité : l'environnement réel l'emporte toujours
> sur les fichiers versionnés.

> ⚠️ **Réflexe à prendre — jamais de secret dans `application.properties`
> commité.** Les mots de passe de base de données, clés d'API, secrets JWT
> ne doivent **jamais** figurer dans un fichier versionné — utilise des
> variables d'environnement (ou un vault) injectées au déploiement, comme
> tu ne commiterais jamais `.env.local` en Symfony.

## À retenir

- `application-<profil>.properties` surcharge `application.properties` selon
  `spring.profiles.active` — le pendant de `config/packages/<env>/`.
- `@Profile("dev")`/`@Profile("prod")` active un bean seulement dans
  l'environnement ciblé.
- Les **variables d'environnement** priment toujours sur les fichiers de
  propriétés — jamais de secret en dur dans un fichier versionné.
