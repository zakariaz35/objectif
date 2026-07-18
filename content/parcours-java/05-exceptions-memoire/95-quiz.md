---
title: "Quiz — Exceptions & gestion mémoire"
type: quiz
questions:
  - prompt: |
      Que se passe-t-il si une méthode appelle une méthode qui déclare `throws
      IOException` (checked) sans l'attraper ni déclarer elle-même `throws IOException` ?
    options:
      - |
        Une exception est levée uniquement à l'exécution, comme en PHP
      - |
        Le code ne compile pas : c'est une erreur détectée par le compilateur
      - |
        Rien, la JVM ignore silencieusement les checked exceptions non gérées
    answer: 1
    tags: [exceptions-checked, compilation]
    level: intermediaire
    explanation: |
      Une exception checked doit obligatoirement être capturée ou déclarée via "throws"
      dans la signature. L'omettre empêche la compilation — une différence radicale avec
      PHP, où toute exception non gérée ne casse qu'à l'exécution.
  - prompt: |
      Une `RuntimeException` (comme NullPointerException) doit-elle être déclarée avec
      `throws` dans la signature d'une méthode ?
    options:
      - |
        Oui, toujours, comme les checked exceptions
      - |
        Non : c'est une exception unchecked, aucune déclaration n'est requise
      - |
        Seulement si elle est levée dans une boucle
    answer: 1
    tags: [exceptions-unchecked, runtimeexception]
    level: debutant
    explanation: |
      RuntimeException et ses sous-classes sont des exceptions UNCHECKED : aucune
      obligation de déclaration ni de capture, exactement comme le comportement familier
      de toute exception PHP.
  - prompt: |
      Que garantit `try (FileReader reader = new FileReader("data.txt")) { ... }` ?
    options:
      - |
        Rien de particulier, il faut quand même fermer reader manuellement
      - |
        reader.close() est appelé automatiquement, même en cas d'exception dans le bloc
      - |
        Le fichier est automatiquement recréé s'il n'existe pas
    answer: 1
    tags: [try-with-resources]
    level: debutant
    explanation: |
      try-with-resources garantit la fermeture automatique de toute ressource
      AutoCloseable déclarée dans les parenthèses, quelle que soit l'issue du bloc
      (succès, exception, ou return anticipé).
  - prompt: |
      Que fait réellement `System.gc()` ?
    options:
      - |
        Force immédiatement le ramasse-miettes à libérer toute la mémoire inutilisée
      - |
        Envoie une simple suggestion à la JVM, sans aucune garantie d'exécution
      - |
        Lève une exception si la mémoire est saturée
    answer: 1
    tags: [garbage-collector, memoire]
    level: intermediaire
    explanation: |
      System.gc() n'est qu'une suggestion à la JVM ; elle peut totalement l'ignorer. Il
      n'existe aucun moyen de forcer une libération immédiate et garantie de la mémoire
      en Java, contrairement au comptage de références plus immédiat de PHP.
  - prompt: |
      Pourquoi une collection statique qui grossit sans limite est-elle une fuite
      mémoire classique en Java ?
    options:
      - |
        Parce que les champs static sont toujours recréés à chaque requête
      - |
        Parce qu'un champ static vit pendant toute la durée de vie de l'application et reste toujours atteignable
      - |
        Parce que Java interdit les collections statiques par défaut
    answer: 1
    tags: [fuites-memoire, static]
    level: avance
    explanation: |
      Un champ static reste atteignable (donc jamais éligible au GC) pendant toute la
      durée de vie de l'application — qui, côté Java, tourne souvent en continu pendant
      des semaines, contrairement à PHP-FPM qui repart d'une mémoire vierge à chaque
      requête.
  - prompt: |
      Quelle affirmation décrit le mieux `OutOfMemoryError` ?
    options:
      - |
        C'est une Exception checked qu'il faut systématiquement attraper et gérer
      - |
        C'est une Error fatale, qu'on cherche généralement pas à rattraper
      - |
        C'est levée uniquement lors de la compilation
    answer: 1
    tags: [garbage-collector, error]
    level: intermediaire
    explanation: |
      OutOfMemoryError hérite de Error, pas d'Exception : c'est un échec fatal de la JVM
      elle-même, signe que l'application est dans un état trop dégradé pour continuer
      sereinement. On ne cherche généralement pas à l'attraper.
---
