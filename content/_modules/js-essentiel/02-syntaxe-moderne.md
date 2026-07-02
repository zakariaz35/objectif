---
title: "Syntaxe moderne (ES)"
type: lesson
---

# Syntaxe moderne

Le JavaScript qu'on écrit tous les jours dans un projet moderne (Vue, mais aussi n'importe quel projet front). On ne fait pas le tour du langage : on cible ce qui **revient sans arrêt**.

> **Passerelle PHP/Python.** Beaucoup de ces briques ont un équivalent que tu connais déjà : le « décompactage » ressemble au `list($a, $b) = ...` de PHP ou au `a, b = tuple` de Python ; le *spread* `...` rappelle l'opérateur `*args` / `**kwargs` de Python. On s'appuie sur ces réflexes.

## `let` / `const`

`const` par défaut (la **liaison** ne change pas), `let` seulement si la valeur doit évoluer. On oublie `var` (sa portée « fuit » hors des blocs, source de bugs).

```js
const VAT = 0.2          // ne sera pas réaffecté
let total = 0            // va changer

total = total + 100
console.log(total)       // 100
```

> **Pourquoi `const` par défaut ?** Parce qu'une variable qui ne change **pas** est plus facile à lire : en la voyant, on sait qu'elle vaudra la même chose partout. On ne bascule sur `let` que là où le changement est **voulu** — le lecteur repère alors tout de suite les valeurs mouvantes. Note : `const` fige la *liaison*, pas le *contenu* d'un objet ou d'un tableau (on peut toujours `push` dans un tableau `const`).

## Fonctions fléchées

Plus courtes, et surtout elles **ne créent pas leur propre `this`** — très pratique dans les *callbacks* (les fonctions qu'on passe à `map`, `filter`, etc.).

```js
const double = (x) => x * 2
const squares = [1, 2, 3].map((n) => n * n)   // [1, 4, 9]

console.log(double(21))   // 42
console.log(squares)      // [1, 4, 9]
```

Une fonction fléchée sur une seule expression **renvoie** cette expression sans écrire `return` (c'est le *return implicite*). Dès qu'il y a des accolades `{ }`, le `return` redevient obligatoire.

## Template literals

Des chaînes entre **accents graves** `` ` `` où l'on insère des variables avec `${...}` — fini les concaténations `+` à rallonge.

```js
const name = 'Hassane'
const hour = new Date().getHours()
const msg = `Bonjour ${name}, il est ${hour}h`
console.log(msg)   // Bonjour Hassane, il est 14h (selon l'heure)
```

## Destructuration

**Extraire** en une ligne plusieurs valeurs d'un objet ou d'un tableau, dans des variables nommées.

```js
const user = { id: 1, name: 'Ada', role: 'admin' }
const { name, role } = user         // deux champs extraits d'un coup
console.log(name, role)             // Ada admin

const [first, second] = [10, 20]    // idem pour un tableau (par position)
console.log(first, second)          // 10 20
```

> **Passerelle PHP/Python.** C'est exactement le `list($name, $role) = ...` de PHP ou le `first, second = [10, 20]` de Python. Même idée : ranger d'un coup plusieurs valeurs dans des variables lisibles.

## Spread / rest `...`

Les trois petits points `...` **étalent** le contenu d'un tableau ou d'un objet — génial pour copier ou fusionner sans toucher à l'original.

```js
const a = [1, 2], b = [3, 4]
const all = [...a, ...b]                 // [1, 2, 3, 4] : fusion
const copy = { ...user, role: 'user' }   // copie de user + on écrase un champ
console.log(all)    // [1, 2, 3, 4]
console.log(copy)   // { id: 1, name: 'Ada', role: 'user' }
```

> **Pourquoi copier plutôt que modifier ?** Les frameworks modernes (Vue, React) détectent le changement quand on remplace une valeur par une **nouvelle**. Modifier l'original « sur place » passe souvent inaperçu. D'où le réflexe : on crée une copie avec `...` puis on change ce qu'il faut.

## Optional chaining `?.` et nullish `??`

Deux garde-fous contre les valeurs manquantes (`null` / `undefined`), très fréquents avec des données venant d'une API.

```js
const user = { name: 'Ada' }                 // pas d'adresse ici
const city = user.address?.city              // undefined au lieu d'une erreur
const page = null ?? 1                        // 1 si null/undefined…
const kept = 0 ?? 1                           // …mais 0 est conservé → 0
console.log(city, page, kept)                 // undefined 1 0
```

- `?.` : « lis cette propriété **si** le parent existe, sinon renvoie `undefined` sans planter ».
- `??` : « prends la valeur de gauche **sauf si** elle est `null`/`undefined`, alors prends celle de droite ». Contrairement à `||`, il **ne** remplace **pas** `0` ni `''` (qui sont des valeurs légitimes).

> **À retenir —** `const` par défaut, fonctions fléchées, destructuration et spread reviennent dans **chaque** fichier d'un projet moderne. `?.` et `??` sécurisent les données incertaines. Le reste s'apprend au besoin — inutile de tout mémoriser d'un coup.
