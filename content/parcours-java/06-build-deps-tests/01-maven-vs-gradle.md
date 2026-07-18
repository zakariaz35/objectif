---
title: "Maven vs Gradle : les deux standards du build"
type: lesson
---

## Pas de `composer.json` universel : deux écosystèmes concurrents

PHP a un outil de build/dépendances quasi-unique : Composer. Java vit avec **deux**
outils majeurs, chacun largement utilisé selon les contextes — c'est une vraie
différence culturelle à intégrer d'emblée.

| | **Maven** | **Gradle** |
|---|---|---|
| Fichier de config | `pom.xml` (XML) | `build.gradle` (Groovy ou Kotlin DSL) |
| Philosophie | *convention over configuration*, très stable | plus flexible, scripts programmables |
| Terrain de prédilection | entreprise, projets Spring "classiques" | Android, projets voulant des builds rapides/incrémentaux |
| Courbe d'apprentissage | verbeux mais prévisible | plus concis mais demande de comprendre les *tasks* |

> **PHP → Java.** `composer.json` (JSON, un seul format, une seule philosophie) devient
> soit `pom.xml` (XML, Maven), soit `build.gradle` (Gradle) — **le premier choix technique
> à faire** en démarrant un projet Java, sans équivalent côté PHP où le choix ne se pose
> simplement pas.

## Maven : le cycle de vie figé

Maven impose un **cycle de vie** de phases, exécutées **dans l'ordre**, chacune
englobant les précédentes :

```mermaid
flowchart LR
  V[validate] --> C[compile] --> T[test] --> P[package] --> I[install] --> D[deploy]
```

```xml
<!-- pom.xml — minimal but complete example -->
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.acme</groupId>
    <artifactId>billing-service</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

```bash
mvn compile     # compiles src/main/java
mvn test        # compiles + runs tests in src/test/java
mvn package     # compiles + tests + produces a .jar in target/
mvn install     # package + copies the .jar into your local ~/.m2 repository
```

> **Passerelle.** `mvn package` ressemble à `composer install` suivi d'un build — sauf
> que Maven **impose** cette séquence de phases figée : impossible de "package" sans être
> passé par "compile" puis "test" avant, contrairement à la liberté totale des scripts
> Composer (`composer.json` → `scripts`).

## Gradle : des tâches (*tasks*) programmables

```gradle
// build.gradle (Groovy DSL)
plugins {
    id 'java'
}

group = 'com.acme'
version = '1.0.0'

java {
    sourceCompatibility = JavaVersion.VERSION_21
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'
}

test {
    useJUnitPlatform()
}
```

```bash
./gradlew build     # compiles, tests, and packages
./gradlew test      # runs tests only
./gradlew tasks     # lists all available tasks — Gradle is very introspectable
```

> 💡 **À retenir.** Le `./gradlew` (*Gradle Wrapper*) est l'équivalent d'un
> `composer.phar` embarqué dans le repo : un script qui télécharge et utilise la bonne
> version de Gradle **sans que Gradle soit préinstallé** sur la machine — un vrai plus
> pour la reproductibilité des builds en équipe.

## Lequel choisir en 2026 ?

> **Réflexe à prendre.** Pour ce parcours et pour rejoindre une équipe existante :
> **utilise l'outil déjà en place** — la question ne se pose presque jamais en mission
> réelle. Pour un projet neuf sans contrainte : Maven reste le choix par défaut le plus
> sûr pour du Spring Boot classique en entreprise (documentation, stabilité,
> prévisibilité) ; Gradle s'impose pour Android ou quand la vitesse de build incrémental
> est critique. La formation Spring Boot qui suit ce parcours utilise **Maven**.

## À retenir

- Java a **deux** outils de build majeurs (Maven, Gradle) — contrairement à Composer,
  seul standard PHP.
- **Maven** (`pom.xml`, XML) impose un **cycle de vie figé** de phases ordonnées :
  validate → compile → test → package → install → deploy.
- **Gradle** (`build.gradle`, Groovy/Kotlin) est plus flexible, basé sur des **tâches**
  programmables ; `./gradlew` embarque son propre wrapper, comme `composer.phar`.
- En entreprise, Maven reste le choix par défaut le plus répandu pour du Spring Boot
  classique.
