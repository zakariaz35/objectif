---
title: "Erreurs custom, --inspect et logs structurés"
type: lesson
---

## Créer ses propres classes d'erreur

Comme en PHP, `Error` peut être **étendue** pour créer des erreurs
sémantiquement précises, distinguables par leur type (`instanceof`) plutôt
que par le texte de leur message.

```js
class ValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.name = "ValidationError" // shows up in stack traces
    this.field = field            // extra context specific to this error type
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} with id ${id} was not found`)
    this.name = "NotFoundError"
    this.statusCode = 404 // convenient: maps directly to an HTTP status
  }
}

function findUser(id) {
  const user = database.get(id)
  if (!user) {
    throw new NotFoundError("User", id)
  }
  return user
}
```

```js
try {
  findUser(999)
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log(`Respond with HTTP ${err.statusCode}: ${err.message}`)
  } else {
    throw err // unexpected error type: let it propagate
  }
}
```

> **Passerelle PHP/Symfony.** Exactement l'esprit des exceptions custom
> Symfony (`class ProductNotFoundException extends \DomainException`), avec
> le même bénéfice : un `catch (NotFoundError)` cible précisément un type
> d'erreur métier, sans dépendre du texte du message (fragile, sujet à
> changer). Attacher des données contextuelles (`this.field`,
> `this.statusCode`) au moment du `throw` évite d'avoir à les reconstruire
> plus tard.

> 💡 **À retenir.** Toujours étendre la classe native `Error` (jamais un
> objet simple `{ message: "..." }`) : `Error` fournit la **stack trace**
> (`err.stack`), essentielle pour localiser l'origine réelle du problème.

## `console` : plus que `console.log`

```js
console.log("Informational message")
console.warn("Something looks off, but not fatal")
console.error("Something went wrong")     // goes to stderr, not stdout
console.table([{ id: 1, name: "Ada" }, { id: 2, name: "Bob" }]) // nice tabular view
console.time("db-query")
await runQuery()
console.timeEnd("db-query")               // prints elapsed time automatically
```

> **Passerelle PHP/Symfony.** `console.log`/`console.error` séparent stdout
> et stderr, comme `echo` vs `fwrite(STDERR, ...)` en PHP CLI — une
> distinction utile pour rediriger logs d'erreur et logs normaux séparément
> en production (`node server.js 1>access.log 2>error.log`).

## Le debugger intégré : `--inspect`

```bash
node --inspect server.js
# Then open chrome://inspect in Chrome, or attach VS Code's debugger
```

`--inspect` ouvre un port de debug **compatible Chrome DevTools** : points
d'arrêt, inspection de variables, pas-à-pas, exactement comme déboguer du
JavaScript côté navigateur — sans outil tiers à installer.

```bash
node --inspect-brk server.js   # like --inspect, but PAUSES on the very first line,
                                # useful to debug something that fails at startup
```

> **Passerelle PHP/Symfony.** L'équivalent conceptuel de Xdebug (points
> d'arrêt, inspection de variables), mais **intégré au runtime** — aucune
> extension à installer ou configurer séparément.

## Vers des logs structurés

En développement, `console.log` suffit. En production, un vrai système de
logs structurés (format JSON, niveaux de sévérité, contexte enrichi) devient
nécessaire pour l'exploitation (recherche, alerting, corrélation).

```js
// A structured log line, ready to be parsed/indexed by a log aggregator
function logError(err, context = {}) {
  console.error(JSON.stringify({
    level: "error",
    message: err.message,
    name: err.name,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    ...context,
  }))
}

logError(new NotFoundError("User", 42), { requestId: "abc-123", userId: 7 })
```

> **Passerelle PHP/Symfony.** C'est l'équivalent direct de **Monolog** : des
> niveaux de sévérité (`debug`, `info`, `warning`, `error`), un format
> structuré (souvent JSON en production), et un contexte enrichi attaché à
> chaque ligne. Côté Node, des librairies dédiées (`pino`, `winston`)
> reprennent exactement cette philosophie, avec en plus des **transports**
> (fichier, service externe) — hors périmètre de ce cours, mais bon réflexe à
> connaître : ne jamais rester sur du `console.log` brut en production.

## À retenir

- Étends **toujours** la classe native `Error` pour tes erreurs custom
  (jamais un simple objet) : tu conserves la stack trace, essentielle au
  debug.
- `instanceof MonErreurCustom` cible précisément un type d'erreur métier,
  plus robuste qu'un test sur le texte du message.
- `console.error` va sur stderr (séparé de stdout) ; `--inspect` ouvre un
  vrai debugger compatible Chrome DevTools, intégré au runtime.
- En production, préfère des **logs structurés** (JSON, niveaux, contexte) à
  du `console.log` brut — la philosophie exacte de Monolog côté Symfony.
