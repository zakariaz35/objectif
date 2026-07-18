---
title: "Quiz — Build, dépendances & tests"
type: quiz
questions:
  - prompt: |
      Quelle affirmation décrit correctement le cycle de vie Maven ?
    options:
      - |
        Les phases (compile, test, package...) peuvent s'exécuter dans n'importe quel ordre
      - |
        Les phases s'exécutent dans un ordre fixe : chaque phase englobe les précédentes
      - |
        Maven n'a pas de notion de phases, contrairement à Gradle
    answer: 1
    tags: [maven, cycle-de-vie]
    level: debutant
    explanation: |
      Maven impose un cycle de vie figé (validate, compile, test, package, install,
      deploy) : lancer "mvn package" exécute automatiquement compile et test avant,
      dans cet ordre précis — impossible de sauter une étape antérieure.
  - prompt: |
      Quelles coordonnées identifient une dépendance Maven ?
    options:
      - |
        vendor/package, comme Composer
      - |
        groupId:artifactId:version (GAV)
      - |
        Uniquement le nom de la classe principale
    answer: 1
    tags: [maven, dependances]
    level: debutant
    explanation: |
      Maven (et Gradle) identifient une dépendance par ses coordonnées GAV :
      groupId (organisation), artifactId (le paquet), version — un niveau de précision
      de plus que le simple vendor/package de Composer.
  - prompt: |
      Que signifie le scope Maven `provided` sur une dépendance ?
    options:
      - |
        La dépendance n'est utilisée que pour les tests
      - |
        La dépendance est nécessaire à la compilation mais fournie par l'environnement d'exécution, non embarquée
      - |
        La dépendance est fournie automatiquement par Maven Central sans version à préciser
    answer: 1
    tags: [maven, scopes]
    level: avance
    explanation: |
      Le scope "provided" signifie que le code a besoin de cette API pour compiler, mais
      qu'elle ne doit PAS être embarquée dans le livrable final : le serveur d'application
      (ex. un conteneur de servlets) la fournira lui-même à l'exécution. Il n'y a pas de
      réel équivalent dans le monde Composer.
  - prompt: |
      Pourquoi faut-il être vigilant sur les versions de dépendances avec Maven, par
      rapport à Composer ?
    options:
      - |
        Maven génère automatiquement un lockfile plus strict que composer.lock
      - |
        Maven n'a pas de lockfile natif : il faut fixer des versions exactes ou utiliser des outils dédiés
      - |
        Il n'y a aucune différence, les deux se comportent de façon identique
    answer: 1
    tags: [maven, lockfile]
    level: avance
    explanation: |
      Contrairement à Composer qui génère systématiquement un composer.lock, Maven n'a
      pas d'équivalent officiel natif : la reproductibilité des versions résolues repose
      sur la discipline (versions exactes, pas de ranges) ou des outils comme le
      maven-enforcer-plugin.
  - prompt: |
      Une classe de test JUnit 5 doit-elle hériter d'une classe parente comme TestCase
      en PHPUnit ?
    options:
      - |
        Oui, toutes les classes de test doivent étendre TestCase en Java aussi
      - |
        Non : JUnit 5 fonctionne uniquement par annotations (@Test, @BeforeEach...), sans hiérarchie imposée
      - |
        Seulement pour les tests paramétrés
    answer: 1
    tags: [junit, structure]
    level: intermediaire
    explanation: |
      JUnit 5 (Jupiter) fonctionne entièrement par annotations, sans classe parente à
      étendre — une vraie différence avec le PHPUnit historique basé sur l'héritage de
      TestCase.
  - prompt: |
      Quel est l'équivalent AssertJ de `expectException(InvalidArgumentException::class)`
      suivi de l'appel qui doit lever l'exception, en PHPUnit ?
    options:
      - |
        assertThatThrownBy(() -> code()).isInstanceOf(IllegalArgumentException.class)
      - |
        assertTrue(code() instanceof Exception)
      - |
        @ExpectedException(IllegalArgumentException.class) sur la méthode de test
    answer: 0
    tags: [assertj, exceptions]
    level: intermediaire
    explanation: |
      assertThatThrownBy(() -> ...) encapsule l'appel devant lever l'exception dans une
      lambda, puis chaîne les assertions sur cette exception (.isInstanceOf(...),
      .hasMessage(...)) — plus concis qu'un expectException() suivi de l'appel séparé.
---
