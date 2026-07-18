---
title: "Quiz — Spring Boot & le conteneur IoC"
type: quiz
questions:
  - prompt: |
      Quel est le rôle principal d'un *starter* Spring Boot
      (ex. `spring-boot-starter-web`) ?
    options:
      - |
        Regrouper un ensemble de dépendances compatibles entre elles et
        déclencher leur autoconfiguration.
      - "Générer automatiquement le code source des contrôleurs."
      - "Remplacer complètement Maven ou Gradle."
    answer: 0
    tags: ["starter", "autoconfiguration"]
    level: debutant
    explanation: |
      Un starter est avant tout un agrégat de dépendances cohérentes ; c'est
      la présence de ces dépendances sur le classpath qui déclenche
      l'autoconfiguration correspondante — le pendant d'un pack Symfony Flex.
  - prompt: |
      Que regroupe l'annotation `@SpringBootApplication` ?
    options:
      - "`@Bean`, `@Autowired` et `@Qualifier`."
      - "`@Configuration`, `@EnableAutoConfiguration` et `@ComponentScan`."
      - "`@RestController`, `@Service` et `@Repository`."
    answer: 1
    tags: ["spring-boot-application", "component-scan"]
    level: debutant
    explanation: |
      `@SpringBootApplication` combine ces trois annotations : la classe
      peut déclarer des beans, l'autoconfiguration s'active selon le
      classpath, et le scan de composants couvre le package courant et ses
      sous-packages.
  - prompt: |
      Une classe Java sans `@Component`, `@Service` ni `@Repository`
      peut-elle être injectée comme dépendance dans un autre bean ?
    options:
      - |
        Oui, comme en Symfony où toute classe de `src/` devient service par
        défaut.
      - |
        Non : sans stéréotype, Spring ne connaît pas cette classe et lève
        `NoSuchBeanDefinitionException` si on tente de l'injecter.
      - "Oui, mais uniquement si elle a un constructeur sans argument."
    answer: 1
    tags: ["component", "erreur-frequente"]
    level: debutant
    explanation: |
      Contrairement à l'autoconfiguration Symfony (`resource: '../src/'` qui
      transforme toute classe en service), Spring exige une annotation de
      stéréotype explicite pour qu'une classe devienne un bean.
  - prompt: |
      Pourquoi préférer l'injection par constructeur à l'injection par
      champ (`@Autowired` sur une propriété) ?
    options:
      - |
        Champs `final` (immuabilité), dépendances explicites dans la
        signature, et testabilité sans démarrer le contexte Spring.
      - "L'injection par champ est en réalité interdite depuis Spring Boot 3."
      - "Il n'y a aucune différence pratique entre les deux approches."
    answer: 0
    tags: ["injection", "constructeur", "bonnes-pratiques"]
    level: intermediaire
    explanation: |
      L'injection par constructeur rend les dépendances visibles, permet des
      champs `final`, et autorise l'instanciation directe (avec des mocks) en
      test unitaire — sans nécessiter de réflexion ni de contexte Spring.
  - prompt: |
      Deux beans implémentent la même interface `NotificationSender`.
      Comment forcer Spring à en injecter un précis, sans dépendre de
      l'ordre de déclaration ?
    options:
      - "Avec `@Qualifier(\"nomDuBean\")` sur le point d'injection, ou `@Primary` sur le bean par défaut."
      - "En renommant la classe pour qu'elle soit alphabétiquement première."
      - "C'est impossible : Spring choisit toujours arbitrairement."
    answer: 0
    tags: ["qualifier", "primary"]
    level: intermediaire
    explanation: |
      `@Qualifier` cible explicitement un bean par son nom ; `@Primary`
      désigne l'implémentation utilisée par défaut quand aucun `@Qualifier`
      n'est précisé — équivalent à un alias de service par défaut en
      Symfony.
  - prompt: |
      Quel est le scope PAR DÉFAUT d'un bean Spring ?
    options:
      - "`prototype` : une nouvelle instance à chaque injection."
      - "`singleton` : une seule instance pour toute l'application."
      - "`request` : une instance par requête HTTP."
    answer: 1
    tags: ["scope", "singleton"]
    level: debutant
    explanation: |
      Sauf indication contraire (`@Scope("prototype")`...), un bean Spring
      est un singleton — même comportement par défaut (`shared: true`) que
      les services Symfony.
  - prompt: |
      À quoi sert concrètement `@Repository`, au-delà d'être un
      `@Component` sémantiquement nommé ?
    options:
      - |
        Il traduit automatiquement les exceptions bas niveau (JDBC,
        Hibernate) en `DataAccessException` Spring uniformes.
      - "Il rend le bean automatiquement transactionnel sur toutes ses méthodes."
      - "Il désactive le cache de second niveau d'Hibernate pour ce bean."
    answer: 0
    tags: ["repository", "exceptions"]
    level: avance
    explanation: |
      `@Repository` active la traduction d'exceptions Spring — un détail
      souvent oublié qui distingue réellement cette annotation d'un simple
      `@Component`, contrairement à `@Service` qui est purement sémantique.
---

Sept questions pour vérifier l'autoconfiguration Spring Boot, les
stéréotypes de bean, l'injection par constructeur et les scopes — avec le
pont permanent vers l'autowiring Symfony.
