---
title: "Quiz — Configuration & profils"
type: quiz
questions:
  - prompt: |
      Quel fichier Spring Boot lit-il automatiquement au démarrage, sans
      déclaration explicite, pour sa configuration ?
    options:
      - "`config.json` à la racine du projet."
      - "`src/main/resources/application.properties` (ou `.yml`)."
      - "`.env` à la racine du projet, comme Symfony."
    answer: 1
    tags: ["application-properties"]
    level: debutant
    explanation: |
      Spring Boot charge `application.properties`/`.yml` par convention —
      l'équivalent unifié de `.env` + `config/packages/*.yaml` + paramètres
      Symfony.
  - prompt: |
      À quoi correspond `@Value(\"${app.tax-rate}\")` posé sur un champ ?
    options:
      - "Une injection de bean par type, comme un `@Autowired` classique."
      - |
        L'injection d'une valeur de configuration nommée, l'équivalent
        d'`#[Autowire('%app.tax_rate%')]` en Symfony.
      - "Une contrainte de validation Bean Validation."
    answer: 1
    tags: ["value", "injection-configuration"]
    level: debutant
    explanation: |
      `@Value` pioche une propriété de configuration par sa clé — le
      pendant de l'injection d'un paramètre Symfony nommé.
  - prompt: |
      Pourquoi préférer `@ConfigurationProperties` à une multitude de
      `@Value` dispersés dans plusieurs classes ?
    options:
      - |
        Pour regrouper une famille de clés liées dans une classe unique,
        typée et éventuellement validable — plus proche d'une classe
        `Configuration` de bundle Symfony qu'un paramètre isolé.
      - "`@Value` est en réalité obsolète et interdit depuis Spring Boot 3."
      - "Il n'y a aucune différence fonctionnelle entre les deux approches."
    answer: 0
    tags: ["configurationproperties", "bonnes-pratiques"]
    level: intermediaire
    explanation: |
      `@ConfigurationProperties` regroupe, type et peut valider une famille
      de propriétés liées — plus rigoureux qu'un `@Value` isolé qui disperse
      la configuration dans le code.
  - prompt: |
      Quel type Java est nativement supporté par le *constructor binding*
      de `@ConfigurationProperties` depuis Spring Boot 3, sans setters ?
    options:
      - "Uniquement une classe avec un constructeur vide et des setters."
      - "Un `record`."
      - "Uniquement une interface."
    answer: 1
    tags: ["record", "constructor-binding"]
    level: intermediaire
    explanation: |
      Le *constructor binding* de Spring Boot 3 fonctionne nativement avec
      les `record` — pas besoin de setters ni de constructeur vide.
  - prompt: |
      Comment active-t-on le profil `prod` au démarrage d'une application
      Spring Boot ?
    options:
      - "Avec `--spring.profiles.active=prod` ou la variable `SPRING_PROFILES_ACTIVE=prod`."
      - "En renommant le fichier `application.properties` en `application.prod`."
      - "Il n'existe aucun mécanisme de profil natif en Spring Boot : il faut tout coder à la main."
    answer: 0
    tags: ["profils", "spring-profiles-active"]
    level: debutant
    explanation: |
      L'activation d'un profil se fait par argument de ligne de commande ou
      variable d'environnement — le pendant de `APP_ENV=prod` en Symfony.
  - prompt: |
      Un bean est annoté `@Profile(\"dev\")`. Que se passe-t-il si
      l'application démarre avec `spring.profiles.active=prod` ?
    options:
      - "Le bean est créé quand même, `@Profile` n'affectant que les logs."
      - "Le bean N'EST PAS créé : il n'existe que dans le profil `dev`."
      - "Une exception est levée au démarrage."
    answer: 1
    tags: ["profile", "beans-conditionnels"]
    level: intermediaire
    explanation: |
      `@Profile` conditionne l'existence même du bean selon le profil actif
      — équivalent à un service défini uniquement dans
      `config/services_dev.yaml`.
  - prompt: |
      Entre un fichier `application.properties` versionné et une variable
      d'environnement définie au déploiement, laquelle l'emporte pour une
      même clé de configuration ?
    options:
      - "Le fichier `application.properties` versionné, toujours prioritaire."
      - |
        La variable d'environnement : elle prime toujours sur les fichiers
        de propriétés, exactement comme un `.env.local` non commité
        surcharge `.env` en Symfony.
      - "Aucune des deux : Spring Boot exige que la configuration soit identique partout."
    answer: 1
    tags: ["variables-environnement", "priorite"]
    level: avance
    explanation: |
      Les variables d'environnement (et arguments de ligne de commande)
      priment toujours sur les fichiers `application*.properties` — c'est
      ce qui permet de ne jamais committer de secret.
---

Sept questions sur `application.properties`/`.yml`, `@Value` vs
`@ConfigurationProperties`, les profils et la priorité des variables
d'environnement.
