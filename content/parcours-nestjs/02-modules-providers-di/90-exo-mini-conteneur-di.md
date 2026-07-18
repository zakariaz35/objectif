---
title: "Exercice — un mini conteneur d'injection de dépendances"
type: exercise
exercise:
  language: ts
  starter: |
    // Build a SIMPLIFIED dependency injection container, in pure TypeScript.
    // No NestJS import here: this is the core IDEA behind @Injectable/@Inject,
    // stripped down to its essence — a registry of "how to build X",
    // plus memoization so each token is only ever built ONCE (singleton scope).

    type Factory<T> = (container: Container) => T

    class Container {
      private factories = new Map<string, Factory<any>>()
      private instances = new Map<string, any>()

      // Register how to build the value behind `token`.
      // The factory receives the container itself, so it can resolve
      // its OWN dependencies (like a constructor being auto-wired).
      register<T>(token: string, factory: Factory<T>): void {
        // TODO
      }

      // Return the value for `token`. MUST be built only once: the
      // same instance is returned on every subsequent call (singleton).
      // Throw an Error if the token was never registered.
      resolve<T>(token: string): T {
        // TODO
        return undefined as T
      }
    }

    // (Optional) try it:
    // const container = new Container()
    // container.register("TAX_RATE", () => 0.2)
    // container.register("ProductsService", (c) => ({ taxRate: c.resolve("TAX_RATE") }))
    // console.log(container.resolve("ProductsService"))
  tests:
    - name: "resolve renvoie la valeur produite par la factory enregistrée"
      code: |
        const container = new Container()
        container.register("TAX_RATE", () => 0.2)
        const value = container.resolve("TAX_RATE")
        console.log("resolved TAX_RATE:", value)
        assertEqual(value, 0.2, "resolve must return the value produced by the registered factory")
    - name: "resolve renvoie TOUJOURS la même instance (scope singleton)"
      code: |
        const container = new Container()
        let buildCount = 0
        container.register("ProductsService", () => {
          buildCount++
          return { id: Math.random() }
        })
        const first = container.resolve("ProductsService")
        const second = container.resolve("ProductsService")
        assertEqual(first, second, "two resolve() calls must return the SAME instance")
        assertEqual(buildCount, 1, "the factory must run only ONCE, no matter how many times resolve() is called")
    - name: "une factory peut resoudre ses propres dependances via le container"
      code: |
        const container = new Container()
        container.register("TAX_RATE", () => 0.2)
        container.register("ProductsService", (c) => ({
          taxRate: c.resolve("TAX_RATE"),
          priceWithTax: (price) => price * (1 + c.resolve("TAX_RATE")),
        }))
        const service = container.resolve("ProductsService")
        console.log("service.taxRate:", service.taxRate)
        assertEqual(service.taxRate, 0.2, "a factory must be able to resolve() its own dependencies from the container")
        assertEqual(service.priceWithTax(100), 120, "the resolved dependency must be usable normally")
    - name: "resolve d'un token jamais enregistré leve une erreur explicite"
      code: |
        const container = new Container()
        let threw = false
        try {
          container.resolve("UNKNOWN_TOKEN")
        } catch (e) {
          threw = true
        }
        assert(threw, "resolve() on an unregistered token must throw an Error")
    - name: "deux containers sont totalement independants l'un de l'autre"
      code: |
        const containerA = new Container()
        const containerB = new Container()
        containerA.register("VALUE", () => "from A")
        containerB.register("VALUE", () => "from B")
        assertEqual(containerA.resolve("VALUE"), "from A", "container A must resolve its own registration")
        assertEqual(containerB.resolve("VALUE"), "from B", "container B must resolve its own registration, independently")
---

> ⏱️ **Durée conseillée : ~25 min.**

## Énoncé

L'injection de dépendances de NestJS (comme l'autowiring Symfony) repose,
au fond, sur une idée simple : un **registre** qui sait *comment construire*
chaque service, et qui ne construit **qu'une seule fois** chaque instance
(le scope singleton par défaut de Nest — et le comportement `shared: true`
par défaut de Symfony).

Implémente une classe `Container` avec deux méthodes :

1. `register(token, factory)` : mémorise **comment** construire la valeur
   associée à `token` (une fonction `factory` à appeler plus tard, pas
   tout de suite).
2. `resolve(token)` : renvoie la valeur associée à `token`. **La toute
   première fois**, elle appelle la `factory` enregistrée et **mémorise**
   le résultat. Les appels suivants renvoient **la même instance**, sans
   rappeler la factory (comme un provider Nest en `Scope.DEFAULT`). Si
   `token` n'a jamais été enregistré, `resolve` doit lever une erreur.

La `factory` reçoit le `container` lui-même en paramètre : c'est ce qui lui
permet de résoudre **ses propres dépendances**, exactement comme le
constructeur d'un service Nest/Symfony reçoit ses propres dépendances
injectées.

Réflexes utiles :

- Deux `Map` : une pour les *factories* enregistrées, une pour les
  *instances* déjà construites (le cache du singleton).
- `resolve` : si l'instance existe déjà dans le cache, la renvoyer
  directement ; sinon, vérifier que la factory existe (sinon `throw`),
  l'appeler, **stocker** le résultat, puis le renvoyer.

<!--correction-->

## Correction

```ts
type Factory<T> = (container: Container) => T

class Container {
  private factories = new Map<string, Factory<any>>()
  private instances = new Map<string, any>()

  register<T>(token: string, factory: Factory<T>): void {
    this.factories.set(token, factory)
  }

  resolve<T>(token: string): T {
    // Already built once: return the SAME instance (singleton scope).
    if (this.instances.has(token)) {
      return this.instances.get(token)
    }

    const factory = this.factories.get(token)
    if (!factory) {
      throw new Error(`No provider registered for token "${token}"`)
    }

    // Build it, passing `this` so the factory can resolve its OWN dependencies.
    const instance = factory(this)
    this.instances.set(token, instance)
    return instance
  }
}
```

- **`register`** ne fait *que* mémoriser la fonction : rien n'est construit
  tant que personne n'appelle `resolve` — exactement comme déclarer un
  `@Injectable()` ne l'instancie pas immédiatement, seulement quand il est
  demandé (injecté quelque part).
- **`resolve`** vérifie d'abord le cache (`instances`) : si la valeur existe
  déjà, elle est renvoyée telle quelle, **sans jamais rappeler la
  factory** — c'est la mécanique du scope singleton par défaut de Nest.
- Passer `this` (le container) à la `factory` permet à un provider de
  **résoudre ses propres dépendances** dynamiquement — c'est en substance
  ce que fait Nest quand il construit le constructeur d'un service en
  résolvant, un par un, chaque paramètre typé.

> Le vrai conteneur de Nest ajoute de nombreux détails (résolution par
> **type** plutôt que par chaîne, `reflect-metadata`, scopes multiples,
> détection des dépendances circulaires...) — mais le cœur du mécanisme,
> celui que tu viens d'écrire, est rigoureusement le même : un registre de
> *comment construire*, plus un cache pour ne construire qu'une fois.
