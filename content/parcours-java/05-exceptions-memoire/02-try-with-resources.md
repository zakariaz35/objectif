---
title: "try-with-resources : fermer proprement"
type: lesson
---

## Le problème : fermer une ressource, toujours, même en cas d'erreur

Un fichier ouvert, une connexion réseau, un flux (`Stream` d'I/O — à ne pas confondre
avec les Streams de collections du module 4) doivent être **fermés** après usage, y
compris si une exception survient en cours de route. En PHP, ce besoin se couvre avec un
`finally` explicite, ou en comptant sur le ramasse-miettes et `__destruct()` (mais son
moment d'exécution n'est pas garanti immédiatement).

```java
// The verbose, manual way — DON'T write this in modern Java:
FileReader reader = null;
try {
    reader = new FileReader("data.txt");
    // ... use reader ...
} finally {
    if (reader != null) {
        reader.close();   // must close manually, even on exception — easy to forget
    }
}
```

## `try-with-resources` : la fermeture automatique et garantie

Java 7 a introduit une syntaxe dédiée : toute ressource qui implémente l'interface
`AutoCloseable` peut être déclarée **dans les parenthèses du `try`**, et sera fermée
**automatiquement**, dans tous les cas — succès, exception, ou `return` anticipé.

```java
try (FileReader reader = new FileReader("data.txt")) {
    // ... use reader ...
    // reader.close() is called AUTOMATICALLY when this block ends,
    // whether it ends normally or via an exception.
} catch (IOException e) {
    System.out.println("Failed to read: " + e.getMessage());
}
```

> **PHP → Java.** C'est l'équivalent structuré d'un `try { ... } finally { $handle->close();
> }` PHP — mais porté par le langage lui-même, sans avoir à écrire le `finally` à la main
> ni à vérifier que la ressource n'est pas `null` avant de la fermer.

```java
// Multiple resources: closed in REVERSE order of declaration
try (FileReader reader = new FileReader("input.txt");
     FileWriter writer = new FileWriter("output.txt")) {
    // both reader and writer are guaranteed to be closed at the end
}
```

## Rendre sa propre classe compatible avec `try-with-resources`

```java
public class DatabaseConnection implements AutoCloseable {

    public DatabaseConnection() {
        System.out.println("Connection opened");
    }

    public void query(String sql) {
        System.out.println("Running: " + sql);
    }

    @Override
    public void close() {
        // Called automatically at the end of the try block
        System.out.println("Connection closed");
    }
}

try (DatabaseConnection connection = new DatabaseConnection()) {
    connection.query("SELECT * FROM users");
}
// Output:
// Connection opened
// Running: SELECT * FROM users
// Connection closed
```

> 💡 **À retenir.** Implémenter `AutoCloseable` (une seule méthode, `close()`) sur tes
> propres classes qui détiennent une ressource externe (connexion, fichier, socket) te
> fait bénéficier gratuitement du `try-with-resources` partout où cette classe est
> utilisée — pas besoin de documenter « pense à fermer » dans un commentaire, le
> compilateur/l'IDE le rappellera si le développeur oublie le `try (...)`.

## À retenir

- `try-with-resources` ferme automatiquement toute ressource `AutoCloseable`, **dans
  tous les cas** — succès, exception, ou retour anticipé.
- Les ressources multiples se ferment dans l'**ordre inverse** de leur déclaration.
- Implémente `AutoCloseable` sur tes propres classes détenant une ressource externe pour
  en bénéficier partout, sans `finally` manuel.
- C'est l'équivalent structuré et sûr d'un `try/finally` PHP explicite — porté par la
  syntaxe du langage plutôt que codé à la main à chaque fois.
