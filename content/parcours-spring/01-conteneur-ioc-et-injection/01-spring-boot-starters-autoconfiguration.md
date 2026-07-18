---
title: "Spring Boot, les starters et l'autoconfiguration"
type: lesson
---

## Spring vs Spring Boot

**Spring** (le framework) est une boîte à outils immense : conteneur IoC, MVC,
accès aux données, sécurité... **Spring Boot** ne réinvente rien de tout ça —
il apporte des **conventions**, des **starters** et une **autoconfiguration**
qui font qu'un projet démarre en quelques minutes, sans XML et sans configurer
chaque brique à la main.

> **Symfony → Spring.** C'est exactement le rôle de **Symfony Flex** : quand tu
> fais `composer require symfony/orm-pack`, Flex ajoute la dépendance **et**
> dépose une recette (`config/packages/doctrine.yaml`) qui active tout de
> suite l'ORM avec des réglages par défaut sensés. Spring Boot fait la même
> chose côté Java, mais **sans fichier de recette séparé** : c'est
> l'autoconfiguration elle-même (du code Java conditionnel) qui détecte la
> présence d'une dépendance sur le classpath et active les bons beans.

## Les starters : des bundles de dépendances cohérents

Un *starter* est un artefact Maven/Gradle qui ne contient (presque) pas de
code : il tire une combinaison de dépendances compatibles entre elles.

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

| Starter | Ce qu'il apporte |
|---|---|
| `spring-boot-starter-web` | MVC, Tomcat embarqué, Jackson (JSON) |
| `spring-boot-starter-data-jpa` | Hibernate, Spring Data JPA, HikariCP |
| `spring-boot-starter-validation` | Bean Validation (Hibernate Validator) |
| `spring-boot-starter-security` | Spring Security |
| `spring-boot-starter-test` | JUnit 5, Mockito, AssertJ, MockMvc |

> **Symfony → Spring.** Un starter, c'est le pendant d'un pack Symfony
> (`orm-pack`, `security-bundle`, `validator`, `test-pack`) : une ligne dans
> `composer.json` qui tire plusieurs paquets **et** leur configuration par
> défaut, plutôt qu'un assemblage manuel bundle par bundle.

## `@SpringBootApplication` et le point d'entrée

```java
// src/main/java/com/example/shop/ShopApplication.java
package com.example.shop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ShopApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }
}
```

`@SpringBootApplication` est un raccourci pour **trois** annotations :

| Annotation combinée | Rôle |
|---|---|
| `@Configuration` | Cette classe peut déclarer des beans (`@Bean`) |
| `@EnableAutoConfiguration` | Active l'autoconfiguration selon le classpath |
| `@ComponentScan` | Scanne ce package **et ses sous-packages** pour trouver les composants |

`SpringApplication.run(...)` démarre le conteneur IoC (l'`ApplicationContext`),
lance l'autoconfiguration, puis — si `spring-boot-starter-web` est présent —
démarre un serveur Tomcat embarqué sur le port `8080`.

> **Réflexe à prendre.** `@ComponentScan` scanne le package de la classe
> annotée **et ses descendants**. Place toujours ta classe `*Application`
> à la **racine** de ton arborescence (`com.example.shop`, pas
> `com.example.shop.utils`), sinon des composants ne seront jamais détectés
> — c'est l'équivalent de mal configurer le `resource:` d'un `services.yaml`
> et d'oublier tout un sous-dossier de `src/`.

## Structure minimale d'un projet

```
shop/
├─ pom.xml                                  (≈ composer.json)
├─ src/main/java/com/example/shop/
│  ├─ ShopApplication.java                  (point d'entrée)
│  ├─ product/
│  │  ├─ Product.java
│  │  ├─ ProductController.java
│  │  └─ ProductService.java
│  └─ order/
│     └─ ...
└─ src/main/resources/
   └─ application.properties                (≈ .env + config/packages/*.yaml)
```

> **Symfony → Spring.** Il n'y a pas d'équivalent strict de `bin/console` ou
> de `config/bundles.php` : pas de fichier listant les bundles actifs. La
> présence d'une dépendance sur le classpath **suffit** à déclencher son
> autoconfiguration — c'est plus proche de « tout ce qui est installé est
> actif », version Symfony Flex sans le fichier de recette visible.

## À retenir

- **Spring Boot** = Spring + conventions + autoconfiguration, pas un nouveau
  framework — le pendant côté Java de ce que Symfony Flex apporte à Symfony.
- Un **starter** regroupe des dépendances compatibles, comme un pack Symfony.
- `@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` +
  `@ComponentScan` — place-la à la racine du package pour que le scan couvre
  toute l'application.
