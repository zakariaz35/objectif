---
title: "Exercice — Corrige ce code qui ne compile pas (exception checked)"
type: exercise
---

## Énoncé

> ⏱️ **Durée conseillée : ~10 min.** Ce code ne compile pas — l'erreur vient
> spécifiquement de la gestion d'une exception checked, un piège que ton instinct PHP ne
> t'a jamais préparé à anticiper.

```java
package com.acme.reports;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class ReportLoader {

    public String loadReport(String path) {
        // Files.readString throws a CHECKED IOException
        String content = Files.readString(Path.of(path));
        return content;
    }

    public static void main(String[] args) {
        ReportLoader loader = new ReportLoader();
        System.out.println(loader.loadReport("report.txt"));
    }
}
```

Questions :
1. Pourquoi ce fichier refuse-t-il de compiler ?
2. Propose **deux** corrections possibles, avec leurs conséquences différentes pour
   l'appelant (`main`).

<!--correction-->

## Correction

Le problème : `Files.readString(...)` déclare `throws IOException`, une **exception
checked**. `loadReport()` l'appelle sans la capturer ni la déclarer dans sa propre
signature — le compilateur refuse ce code (« unreported exception IOException; must be
caught or declared to be thrown »).

**Option 1 — propager la responsabilité à l'appelant** (`throws IOException`) :

```java
public String loadReport(String path) throws IOException {
    String content = Files.readString(Path.of(path));
    return content;
}

public static void main(String[] args) throws IOException {
    // main() itself now declares "throws IOException" — acceptable for a simple entry point,
    // but "main" is a poor place to push the responsibility to in a real application.
    ReportLoader loader = new ReportLoader();
    System.out.println(loader.loadReport("report.txt"));
}
```

**Option 2 — capturer et gérer localement** (souvent préférable dans une vraie
application) :

```java
public String loadReport(String path) {
    try {
        return Files.readString(Path.of(path));
    } catch (IOException e) {
        // Convert to an unchecked exception with useful context,
        // OR return a sensible default — a real design decision, not a mechanical fix.
        throw new ReportLoadException("Could not load report: " + path, e);
    }
}

// A custom unchecked exception: callers are not forced to handle it explicitly
public class ReportLoadException extends RuntimeException {
    public ReportLoadException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

Différence pour l'appelant :

- **Option 1** : `main()` (et toute méthode appelante) doit à son tour déclarer
  `throws IOException` ou l'attraper — l'obligation checked **se propage** tout le long
  de la chaîne d'appel, potentiellement jusqu'au point d'entrée.
- **Option 2** : l'exception devient **unchecked** (`RuntimeException`) — l'appelant
  n'est **plus obligé** de la gérer explicitement (il le peut toujours, mais ce n'est pas
  imposé par le compilateur), exactement comme le comportement familier de PHP.

> En pratique, l'option 2 est souvent préférée dans les applications modernes, car elle
> évite de propager une obligation `throws` en cascade jusque dans des couches qui n'ont
> aucun moyen réel de réagir différemment à cette erreur précise.
