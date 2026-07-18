---
title: "Exercice — erreur custom et parsing sécurisé"
type: exercise
exercise:
  language: js
  starter: |
    // A custom, OPERATIONAL error: the input data is invalid (expected to
    // happen sometimes — a bad amount coming from a form or an import file).
    class ParseError extends Error {
      constructor(message, input) {
        super(message)
        // TODO: set this.name to "ParseError" (shows up in stack traces)
        // TODO: store the raw offending input on this.input
      }
    }

    // 1) Parses a JSON text expected to decode to a finite number.
    //    - If `text` is not even a string: throw a TypeError (a PROGRAMMER
    //      error: the caller misused this function — never silently ignore this).
    //    - If JSON.parse fails, OR the result is not a finite number:
    //      throw new ParseError("Invalid amount: " + text, text)
    //      (an OPERATIONAL error: bad data, expected to happen sometimes).
    function parseAmount(text) {
      // TODO
      return null
    }

    // 2) SAFE version: catches ONLY ParseError (operational) and falls back.
    //    Any OTHER error type (like the TypeError above) must be RE-THROWN,
    //    never swallowed — it signals a bug in the CALLING code.
    function parseAmountSafe(text, fallback = 0) {
      // TODO
      return null
    }

    // 3) Sums the valid amounts of an array of texts; invalid ones count as 0.
    function totalValidAmounts(texts) {
      // TODO: reuse parseAmountSafe
      return null
    }

    // (Optionnel) essaie :
    // console.log(parseAmount("42"))
    // console.log(parseAmountSafe("abc", 0))
  tests:
    - name: "ParseError porte le bon name et stocke l'entree fautive"
      code: |
        const err = new ParseError("Invalid amount: xyz", "xyz")
        assert(err instanceof Error, "ParseError must extend the native Error class")
        assertEqual(err.name, "ParseError", "err.name must be set for readable stack traces")
        assertEqual(err.input, "xyz", "the raw offending input must be stored on err.input")
    - name: "parseAmount decode un JSON numerique valide"
      code: |
        assertEqual(parseAmount("42"), 42, "'42' decodes to the number 42")
        assertEqual(parseAmount("3.14"), 3.14, "'3.14' decodes to the number 3.14")
    - name: "parseAmount leve une ParseError sur un JSON syntaxiquement invalide"
      code: |
        let thrown = null
        try {
          parseAmount("abc")
        } catch (e) {
          thrown = e
        }
        assert(thrown instanceof ParseError, "invalid JSON syntax must raise a ParseError, not crash silently")
        assertEqual(thrown.input, "abc", "the original offending text must be kept on the error")
    - name: "parseAmount leve une ParseError si le JSON est valide mais n'est pas un nombre"
      code: |
        let thrown = null
        try {
          parseAmount('"hello"') // valid JSON, but decodes to a STRING, not a number
        } catch (e) {
          thrown = e
        }
        console.log("caught:", thrown && thrown.name, thrown && thrown.message)
        assert(thrown instanceof ParseError, "a valid JSON that is not a finite number must still raise a ParseError")
    - name: "parseAmountSafe retombe sur la valeur de repli pour une donnee invalide"
      code: |
        assertEqual(parseAmountSafe("abc", 0), 0, "invalid data (ParseError) falls back to 0")
        assertEqual(parseAmountSafe("42", 0), 42, "valid data is returned unchanged")
    - name: "parseAmountSafe NE DOIT PAS avaler une erreur de programmeur"
      code: |
        let thrown = null
        try {
          parseAmountSafe(123, 0) // 123 is a NUMBER, not a string: misuse of the function
        } catch (e) {
          thrown = e
        }
        assert(thrown !== null, "a non-ParseError (here a TypeError) must be RE-THROWN, never swallowed")
        assert(!(thrown instanceof ParseError), "this must be the ORIGINAL programmer error, not a ParseError")
    - name: "totalValidAmounts ignore les valeurs invalides (comptees comme 0)"
      code: |
        const result = totalValidAmounts(["10", "abc", "20"])
        console.log("total:", result)
        assertEqual(result, 30, "10 + 0 (invalid 'abc') + 20 = 30")
---

> ⏱️ **Durée conseillée : ~20 min.**

## Énoncé

Cet exercice combine les deux leçons du module : une **erreur custom** bien
typée, et la règle « ne jamais avaler une erreur qui n'est pas la tienne ».

1. `ParseError` : complète le constructeur pour fixer `this.name` et stocker
   l'entrée fautive sur `this.input`.
2. `parseAmount(text)` : décode un JSON censé représenter un nombre.
   - Si `text` n'est **même pas une chaîne** : lève un `TypeError` (erreur de
     **programmeur** — mauvais usage de la fonction par l'appelant).
   - Si le JSON est syntaxiquement invalide, **ou** si le résultat n'est pas
     un nombre fini : lève une `ParseError` (erreur **opérationnelle** —
     donnée externe invalide, à laquelle il faut s'attendre).
3. `parseAmountSafe(text, fallback)` : attrape **uniquement** `ParseError` et
   renvoie `fallback` ; toute **autre** erreur (comme le `TypeError`
   ci-dessus) doit être **relancée**, jamais masquée.
4. `totalValidAmounts(texts)` : additionne, les invalides comptant pour `0`.

Réflexes utiles :

- `JSON.parse(text)` lève déjà un `SyntaxError` natif si le texte n'est pas
  du JSON valide — capture-le et transforme-le en `ParseError` (avec un
  message et un contexte propres à ton domaine).
- `Number.isFinite(n)` exclut `NaN`, `Infinity`, `-Infinity` en plus de
  vérifier que c'est bien un nombre.
- `err instanceof ParseError` est la bonne façon de décider quoi attraper —
  jamais un test sur le texte du message.

<!--correction-->

## Correction

```js
class ParseError extends Error {
  constructor(message, input) {
    super(message)
    this.name = "ParseError"
    this.input = input
  }
}

function parseAmount(text) {
  if (typeof text !== "string") {
    // Programmer error: the CALLER misused this function. Never disguise this as data.
    throw new TypeError("parseAmount expects a string, got " + typeof text)
  }

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch (e) {
    throw new ParseError("Invalid amount: " + text, text)
  }

  if (typeof parsed !== "number" || !Number.isFinite(parsed)) {
    throw new ParseError("Invalid amount: " + text, text)
  }

  return parsed
}

function parseAmountSafe(text, fallback = 0) {
  try {
    return parseAmount(text)
  } catch (err) {
    if (err instanceof ParseError) {
      return fallback // operational error: an acceptable fallback strategy
    }
    throw err // programmer error: NEVER swallow it, let it surface
  }
}

function totalValidAmounts(texts) {
  return texts.reduce((total, text) => total + parseAmountSafe(text, 0), 0)
}
```

- **`ParseError`** étend `Error` (donc conserve `err.stack`), fixe un `name`
  explicite pour des traces lisibles, et attache l'entrée fautive
  (`this.input`) — exactement le patron de la leçon « Erreurs custom ».
- **`parseAmount`** distingue nettement les **deux familles** de la première
  leçon du module : un mauvais **type** d'argument est un bug de l'appelant
  (`TypeError`, à ne jamais dissimuler) ; un JSON invalide ou non numérique
  est une donnée externe imparfaite, **attendue**, donc une `ParseError`
  dédiée.
- **`parseAmountSafe`** est le cœur pédagogique de l'exercice : son `catch`
  vérifie `instanceof ParseError` **avant** de retomber sur `fallback` — tout
  le reste (ici un `TypeError`) est **relancé**, jamais avalé. C'est ce qui
  évite qu'un bug de programmation (appeler la fonction avec un nombre au
  lieu d'un texte) ne soit masqué en silence par une valeur de repli
  trompeuse.
- **`totalValidAmounts`** délègue toute la robustesse à `parseAmountSafe` :
  elle-même reste simple, un `reduce` classique.

> Dans une vraie application, `ParseError` porterait aussi souvent un
> `statusCode` (ex. `400 Bad Request`) pour être directement traduite en
> réponse HTTP par un middleware de gestion d'erreurs centralisé — la suite
> logique de ce que ce module vient de couvrir.
