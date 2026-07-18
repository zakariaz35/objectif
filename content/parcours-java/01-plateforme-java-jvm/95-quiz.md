---
title: "Quiz — La plateforme Java & la JVM"
type: quiz
questions:
  - prompt: |
      Que produit exactement la commande `javac HelloWorld.java` ?
    options:
      - |
        Du code machine natif directement exécutable par le processeur
      - |
        Un fichier bytecode (.class) exécutable par la JVM
      - |
        Rien : javac ne fait qu'analyser la syntaxe sans rien produire
    answer: 1
    tags: [compilation, bytecode]
    level: debutant
    explanation: |
      javac compile le code source .java en bytecode .class, un format intermédiaire
      compris uniquement par la JVM — pas directement par le processeur. C'est la JVM qui,
      ensuite, interprète ce bytecode (et le recompile à chaud via le JIT si besoin).
  - prompt: |
      Pourquoi dit-on qu'un programme Java « chauffe » (devient plus rapide après
      quelques instants d'exécution) ?
    options:
      - |
        Parce que le disque dur devient plus rapide à force d'être sollicité
      - |
        Parce que le JIT recompile en code machine natif les portions de code les plus exécutées
      - |
        Parce que PHP fait pareil avec OPcache, c'est un mythe côté Java
    answer: 1
    tags: [jvm, jit]
    level: intermediaire
    explanation: |
      Le JIT (Just-In-Time compiler) observe le bytecode en cours d'exécution, repère les
      chemins de code les plus fréquemment empruntés (les "hot paths") et les recompile
      en code machine natif optimisé. C'est un mécanisme différent et plus poussé que le
      simple cache de bytecode d'OPcache.
  - prompt: |
      Depuis quelle version Java le JRE (Java Runtime Environment) séparé n'est-il
      officiellement plus distribué ?
    options:
      - |
        Java 8
      - |
        Java 11
      - |
        Java 21
    answer: 1
    tags: [jdk, jre, versions]
    level: intermediaire
    explanation: |
      Depuis Java 11, Oracle ne distribue plus de JRE séparé : on installe toujours un
      JDK complet, y compris pour de la simple exécution en production.
  - prompt: |
      Parmi ces versions, laquelle N'EST PAS une version LTS (Long-Term Support) ?
    options:
      - |
        Java 17
      - |
        Java 21
      - |
        Java 9
    answer: 2
    tags: [versions, lts]
    level: intermediaire
    explanation: |
      Java 9 est une "feature release" intermédiaire, supportée seulement 6 mois. Les LTS
      de référence à retenir sont 8, 11, 17 et 21 — bénéficiant d'un support de plusieurs
      années.
  - prompt: |
      En Java, où doit obligatoirement vivre la classe publique `InvoiceService` déclarée
      avec `package com.acme.billing;` ?
    options:
      - |
        N'importe où, tant que le nom du fichier correspond au nom de la classe
      - |
        Dans src/main/java/com/acme/billing/InvoiceService.java exactement
      - |
        Dans un seul fichier global contenant toutes les classes du package
    answer: 1
    tags: [packages, structure-projet]
    level: debutant
    explanation: |
      Contrairement au namespace PHP (convention PSR-4 tolérée par l'autoloader), le
      package Java doit correspondre EXACTEMENT au chemin du dossier — c'est vérifié par
      le compilateur, pas seulement à l'exécution.
  - prompt: |
      Quelle signature de méthode la JVM cherche-t-elle comme point d'entrée d'un
      programme Java ?
    options:
      - |
        public void main(String[] args)
      - |
        public static void main(String[] args)
      - |
        static main(args)
    answer: 1
    tags: [main, entry-point]
    level: debutant
    explanation: |
      La JVM exige exactement "public static void main(String[] args)" : public (appelable
      depuis l'extérieur), static (appelable sans instancier la classe), void (aucun
      retour), et un tableau de String pour les arguments de ligne de commande.
---
