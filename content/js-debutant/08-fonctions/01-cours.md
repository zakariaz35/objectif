---
title: "Fonctions"
type: lesson
---

## Donner un nom à un bout de logique

Jusqu'ici, tu écrivais tes calculs « à la suite », dans un seul flot. Ça marche pour trois lignes. Mais dès qu'un même calcul revient à plusieurs endroits — appliquer une TVA, calculer une remise, formater un montant — tu te retrouves à **copier-coller** la même formule. Et le jour où la formule change (la TVA passe de 20 % à 21 %), tu dois la corriger partout… en espérant n'en oublier aucune.

La **fonction** résout ça. C'est un **bloc de code nommé**, écrit **une fois**, que tu peux **rappeler** autant de fois que tu veux. Tu écris la logique à un seul endroit ; tu la réutilises par son nom.

```js
function direBonjour() {
  console.log("Bonjour !")
}

direBonjour()   // "Bonjour !"
direBonjour()   // "Bonjour !"  ← called again, without rewriting the code
```

Deux temps bien distincts, à ne jamais confondre :

- **déclarer** la fonction (le `function direBonjour() { ... }`) : on **décrit** ce qu'elle fait, sans l'exécuter. C'est comme écrire une recette dans un carnet.
- **appeler** la fonction (le `direBonjour()`, avec les parenthèses) : là seulement le code **s'exécute**. C'est cuisiner la recette.

> 🧠 **Rappel algo.** Une fonction, c'est de l'**abstraction** : on emballe une suite d'instructions sous un **nom** parlant, puis on raisonne avec ce nom sans se soucier du détail interne. C'est le mécanisme le plus puissant de tout l'algorithme, parce qu'il permet de **décomposer** un gros problème en petits morceaux nommés, testables et **réutilisables**. Sans fonctions, un programme n'est qu'un long ruban d'instructions impossible à relire.

## Paramètres et `return` : entrée → traitement → sortie

Une fonction sans entrée ni sortie sert peu. Sa vraie force : recevoir des **entrées** (les *paramètres*), faire un traitement, et **renvoyer** un résultat avec `return`. Vois-la comme une **machine** : quelque chose entre, quelque chose de transformé ressort.

![Une fonction : une machine entrée → sortie](assets/fonction-machine.svg)

```js
function prixTTC(ht, taux) {
  return ht * (1 + taux)
}

const prix = prixTTC(100, 0.2)   // ht = 100, taux = 0.2
console.log(prix)                // 120
```

Décortiquons ce schéma « entrée → traitement → sortie » :

- **`ht` et `taux`** sont les **paramètres** : des variables qui n'existent **que dans** la fonction, et qui reçoivent les valeurs qu'on donne à l'appel. Ici, à l'appel `prixTTC(100, 0.2)`, `ht` prend la valeur `100` et `taux` prend `0.2` — dans l'ordre, position par position. Ces valeurs qu'on passe à l'appel s'appellent les **arguments**.
- **`return`** définit la **sortie** : la valeur que la fonction « rend » à celui qui l'a appelée. Sans `return`, une fonction renvoie `undefined` (elle a fait quelque chose, mais n'a rien à rendre).
- **`const prix = prixTTC(...)`** capture cette sortie dans une variable, pour la réutiliser.

Point crucial sur `return` : **il arrête la fonction sur-le-champ.** Toute ligne écrite après un `return` exécuté ne tourne jamais. On s'en sert souvent pour traiter un cas particulier tôt et sortir :

```js
function appliquerRemise(montant, pourcentage) {
  if (pourcentage <= 0) {
    return montant          // pas de remise : on rend le montant tel quel, et on SORT
  }
  return montant * (1 - pourcentage / 100)
}

console.log(appliquerRemise(200, 10))   // 180  (10 % de remise)
console.log(appliquerRemise(200, 0))    // 200  (the first return stopped the function)
```

> **Passerelle PHP/Python.** Tu connais déjà ce concept ! En PHP c'est `function prixTTC($ht, $taux) { return ...; }`, en Python c'est `def prix_ttc(ht, taux): return ...`. Le mot-clé change (`function` vs `def`), la logique est **identique** : des paramètres entrent, un `return` sort. *Nuance data :* si tu penses SQL, une fonction JS ressemble à une **fonction stockée** ou à une colonne calculée réutilisable — un calcul nommé qu'on rappelle par son nom au lieu de le réécrire.

## Les fonctions fléchées `=>` : la version courte

Tu as déjà croisé cette syntaxe au module Tableaux (`ventes.map((m) => m * 1.2)`). C'est une **fonction fléchée** (*arrow function*) : une écriture plus courte, née pour les petites fonctions qu'on passe en argument (comme à `map`, `filter`, `forEach`).

```js
// These two functions do EXACTLY the same thing:

function doubler(x) {
  return x * 2
}

const doublerFleche = (x) => x * 2

console.log(doubler(5))        // 10
console.log(doublerFleche(5))  // 10
```

Comment lire la version fléchée `(x) => x * 2` :

- avant la flèche `=>` : les **paramètres**, entre parenthèses ;
- après la flèche : le **corps**. Si c'est une seule expression, sa valeur est **automatiquement renvoyée** — pas besoin d'écrire `return`. C'est ce qu'on appelle le *return implicite*.

Si le corps a plusieurs lignes, on remet des accolades **et** le `return` redevient obligatoire :

```js
const prixTTC = (ht, taux) => {
  const ttc = ht * (1 + taux)
  return ttc                    // accolades → return explicite obligatoire
}
```

> **Passerelle PHP/Python.** La fonction fléchée, c'est le cousin de la **fonction anonyme / lambda**. En Python : `doubler = lambda x: x * 2`. En PHP : `$doubler = fn($x) => $x * 2` (l'*arrow function* de PHP 7.4+, dont JS s'est même inspiré côté syntaxe). Même usage : une mini-fonction jetable, souvent passée à une autre fonction. *Quand choisir ?* Nomme une fonction classique (`function`) pour la logique importante et réutilisée ; réserve la fléchée aux petits traitements passés en argument.

## Portée (scope) : où vit une variable ?

Voici une notion qui évite énormément de bugs. Une variable déclarée **dans** une fonction n'existe **que** dans cette fonction. On dit qu'elle est **locale** : elle naît quand la fonction démarre, meurt quand la fonction se termine, et le reste du programme ne la voit pas.

```js
function calculerTva(montant) {
  const taux = 0.2                 // `taux` is LOCAL to calculerTva
  return montant * taux
}

console.log(calculerTva(100))      // 20
console.log(taux)                  // ❌ ReferenceError : taux n'existe pas ici
```

*Pourquoi* cette règle, qui semble contraignante ? Parce qu'elle est une **protection**. Chaque fonction travaille dans sa propre bulle : ses variables internes ne peuvent pas écraser par accident celles d'une autre fonction. Imagine 50 fonctions utilisant chacune une variable `i` ou `total` : si elles partageaient toutes le même espace, ce serait le chaos. La portée locale garantit qu'une fonction est une **boîte étanche** — c'est ce qui rend le code prévisible.

Une variable déclarée **en dehors** de toute fonction est **globale** : visible partout. On en use avec parcimonie (une globale modifiable par tout le monde redevient une source de bugs).

```mermaid
flowchart TD
  subgraph GLOBAL["Portée globale"]
    G["const TVA_TAUX = 0.2<br/>(visible partout)"]
    subgraph FN["fonction calculerTva()"]
      L["const taux = 0.2<br/>montant<br/>(visibles SEULEMENT ici)"]
    end
  end
  L -. "peut lire" .-> G
  G -. "ne voit PAS" .-> L
```

Retiens la règle du sens de vue : l'**intérieur** d'une fonction peut lire ce qui est **au-dessus** (le global), mais l'extérieur ne peut **pas** voir ce qui est **à l'intérieur**.

## La pile d'appels : quand une fonction en appelle une autre

Une fonction peut en appeler une autre. Comment la machine s'y retrouve-t-elle ? Grâce à la **pile d'appels** (*call stack*). À chaque appel, la machine **empile** une fiche (« cadre ») décrivant l'appel en cours ; quand la fonction se termine, sa fiche est **retirée** et on reprend là où on s'était arrêté.

```js
function double(x) {
  return x * 2
}

function calculer(a, b) {
  return double(a) + b     // calculer appelle double
}

function main() {
  return calculer(5, 3)    // main appelle calculer
}

console.log(main())        // 13
```

![La pile d'appels (call stack)](assets/pile-appels.svg)

Déroulons le film : `main()` démarre → il appelle `calculer()` (qui s'empile par-dessus) → `calculer` appelle `double()` (encore par-dessus). À ce moment précis, la pile contient les trois. Puis `double` finit **en premier** (il est au sommet), rend `10`, sa fiche disparaît ; `calculer` reprend, calcule `10 + 3 = 13`, rend et disparaît ; `main` reprend et rend `13`.

C'est le principe **LIFO** (*Last In, First Out*) : le **dernier** appelé est le **premier** terminé, comme une pile d'assiettes où on retire toujours celle du dessus.

> **Pourquoi tu vas rencontrer ce mot.** Quand une erreur survient, la console t'affiche la **stack trace** : la photo de cette pile au moment du crash. La lire, c'est retracer « qui a appelé qui » jusqu'au point de casse. On y revient en détail au module *Erreurs & débogage* — mais tu sais désormais ce qu'est cette pile.

## Décomposer un problème en petites fonctions

Tout se rejoint ici. Une grosse tâche (« calculer le total facturé d'un panier avec remise et TVA ») fait peur d'un bloc. Découpée en **petites fonctions à responsabilité unique**, elle devient une suite d'étapes simples, chacune testable à part.

```js
const appliquerRemise = (montant, pct) => montant * (1 - pct / 100)
const prixTTC = (ht) => ht * 1.2

function totalFacture(prixHt, remisePct) {
  const remise = appliquerRemise(prixHt, remisePct)   // step 1: discount
  return prixTTC(remise)                              // step 2: VAT
}

console.log(totalFacture(100, 10))   // 108  → (100 - 10 %) = 90, puis × 1.2 = 108
```

*Pourquoi* est-ce mieux qu'un seul gros calcul `prixHt * (1 - remisePct/100) * 1.2` ? Parce que chaque bout porte un **nom qui explique l'intention**, se **teste isolément** (« ma remise est-elle correcte ? »), et se **réutilise** ailleurs (`prixTTC` resservira pour d'autres calculs). Le jour où la TVA change, tu corriges **un seul** endroit. C'est exactement l'esprit du module Tableaux, où on avait découpé `ventesAuDessus` / `ajouterTva` / `totalGrossesTtc`.

## Les fermetures (*closures*) : une fonction avec mémoire

### L'analogie du sac à dos

Imagine qu'une petite fonction part en voyage loin de la grande fonction qui l'a créée. Avant de partir, elle emballe dans un **sac à dos invisible** toutes les variables qu'elle a vues naître autour d'elle. Même quand la grande fonction a terminé son travail et « fermé ses portes », la petite fonction garde son sac à dos — et peut continuer à lire et modifier ces variables.

C'est une **fermeture** (*closure*) : une fonction intérieure qui se souvient de l'environnement dans lequel elle a été créée.

### Exemple progressif

**Étape 1 — le problème sans closure : une variable globale fragile**

```js
let count = 0    // global variable: anyone can accidentally modify it

function increment() {
  count = count + 1
  return count
}

console.log(increment())   // 1
console.log(increment())   // 2
count = 999                // ⚠️ any code anywhere can corrupt the counter
```

**Étape 2 — la solution : protéger l'état avec une closure**

```js
function createCounter() {
  let count = 0   // private variable, "packed in the backpack"

  return function () {
    count = count + 1    // the inner function reads AND writes count
    return count
  }
}

const counter = createCounter()   // createCounter is done, but count lives on
console.log(counter())            // 1
console.log(counter())            // 2
console.log(counter())            // 3
// count is inaccessible from outside — it is protected in the closure
```

Déroulons ce qui se passe :
1. `createCounter()` s'exécute, crée `count = 0`, puis **retourne** la fonction intérieure sans l'appeler.
2. `createCounter` se termine. Normalement `count` disparaîtrait… mais la fonction intérieure la tient dans son sac à dos.
3. Chaque appel à `counter()` lit et modifie **le même** `count` — il persiste entre les appels.

**Étape 3 — une fabrique de fonctions**

Une closure mémorise aussi les **paramètres** de la fonction extérieure. C'est ce qui permet de fabriquer des fonctions « personnalisées » à la volée :

```js
function createGreeting(prefix) {
  // prefix is captured in the closure — it's in the backpack
  return (name) => prefix + ", " + name + "!"
}

const sayHello = createGreeting("Hello")
const sayHi    = createGreeting("Hi")

console.log(sayHello("Ada"))    // "Hello, Ada!"
console.log(sayHi("Bob"))       // "Hi, Bob!"
console.log(sayHello("Carol"))  // "Hello, Carol!" — prefix is still "Hello"
```

Chaque appel à `createGreeting` crée une **nouvelle closure** avec son propre `prefix`. `sayHello` et `sayHi` ont chacune leur sac à dos distinct — elles sont indépendantes.

```mermaid
flowchart TD
  FN["createGreeting('Hello')"]
  FN --> ENV["Environnement capturé<br/>(le sac à dos)<br/>prefix = 'Hello'"]
  ENV --> INNER["Fonction interne<br/>(name) => prefix + ', ' + name + '!'"]
  INNER -->|"sayHello('Ada')"| RES["'Hello, Ada!'"]
  INNER -->|"sayHello('Carol')"| RES2["'Hello, Carol!'"]
```

> **Pourquoi les closures sont partout.** Elles permettent de garder un état privé sans variable globale, de créer des fonctions personnalisées à la volée, et de « mémoriser » un contexte d'exécution. Dès que tu passes une fonction en argument (dans `map`, `filter`, `forEach`…), tu crées souvent une closure sans le savoir.

## La récursion : une fonction qui s'appelle elle-même

### L'analogie des miroirs face à face

Regarde deux miroirs se faire face : tu vois un couloir d'images de plus en plus petites. La récursion, c'est la même idée — une fonction qui contient un appel à elle-même, créant des niveaux imbriqués. Sauf qu'on définit **quand s'arrêter** : sans condition d'arrêt, les miroirs reflètent à l'infini et le programme plante.

Toute fonction récursive a **deux parties obligatoires** :
1. **Le cas de base** (*base case*) : la condition d'arrêt. Sans elle, récursion infinie → `RangeError`.
2. **L'appel récursif** : la fonction se rappelle avec un paramètre **plus proche** du cas de base.

### Exemple progressif : compter à rebours

**Étape 1 — rappel avec une boucle**

```js
// Iterative countdown using a loop
for (let i = 3; i >= 1; i--) {
  console.log(i)
}
// 3, 2, 1
```

**Étape 2 — même logique, version récursive**

```js
function countdown(n) {
  if (n <= 0) return        // base case: stop when n reaches 0
  console.log(n)
  countdown(n - 1)          // recursive call: n gets 1 closer to the base case
}

countdown(3)
// 3
// 2
// 1
```

Retourne au schéma de la **pile d'appels** vu plus haut dans ce module. Chaque appel récursif s'empile jusqu'au cas de base, puis la pile se dépile :

```mermaid
flowchart TD
  A["countdown(3)<br/>affiche 3, appelle countdown(2)"]
  A --> B["countdown(2)<br/>affiche 2, appelle countdown(1)"]
  B --> C["countdown(1)<br/>affiche 1, appelle countdown(0)"]
  C --> D["countdown(0)<br/>n ≤ 0 → return<br/>(cas de base : on remonte)"]
```

**Étape 3 — un calcul récursif : somme de 1 à n**

```js
// Iterative version — a loop accumulator
function sumLoop(n) {
  let total = 0
  for (let i = 1; i <= n; i++) {
    total += i
  }
  return total
}

// Recursive version — reads like a mathematical definition
function sumRecursive(n) {
  if (n <= 0) return 0              // base case: sum of nothing is 0
  return n + sumRecursive(n - 1)   // sum(5) = 5 + sum(4) = 5 + 4 + ... + 1 + 0
}

console.log(sumLoop(5))       // 15
console.log(sumRecursive(5))  // 15 — same result
```

Lis l'appel récursif comme une définition : « la somme de 1 à n, c'est n **plus** la somme de 1 à (n−1) ». La récursion traduit directement cette définition en code.

> ⚠️ **Erreur fréquente — oublier le cas de base.** Sans condition d'arrêt, la fonction s'appelle indéfiniment jusqu'à saturer la pile d'appels : `RangeError: Maximum call stack size exceeded`. C'est l'équivalent de la boucle infinie pour la récursion — toujours vérifier que chaque branche converge vers le cas de base.

> **Quand préférer la récursion à une boucle ?** Pour les structures **naturellement imbriquées** : parcourir un arbre de fichiers, un menu hiérarchique, un organigramme. Pour des listes simples, la boucle est souvent plus claire et plus rapide. La récursion brille quand le problème se *définit lui-même en termes d'un sous-problème plus petit*.

## Exercice mental : que va afficher ce code ?

**Extrait 1**
```js
function makeMultiplier(factor) {
  return (x) => x * factor
}

const triple = makeMultiplier(3)
const double = makeMultiplier(2)

console.log(triple(5))   // ?
console.log(double(5))   // ?
```
<details><summary>Réponse</summary>

`15` puis `10` — `makeMultiplier` retourne une closure qui capture `factor` dans son sac à dos. `triple` a capturé `factor = 3`, `double` a capturé `factor = 2`. Chaque closure a son propre environnement indépendant.

</details>

**Extrait 2**
```js
function countdown(n) {
  if (n <= 0) return
  console.log(n)
  countdown(n - 1)
}

countdown(4)
```
<details><summary>Réponse</summary>

4 lignes : `4`, `3`, `2`, `1`. À chaque appel récursif `n` diminue de 1. Quand `n` atteint `0`, le cas de base `return` stoppe la récursion et la pile se dépile.

</details>

**Extrait 3**
```js
function factorial(n) {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

console.log(factorial(4))   // ?
```
<details><summary>Réponse</summary>

`24` — la récursion déroule ainsi : `factorial(4)` = 4 × `factorial(3)` = 4 × 3 × `factorial(2)` = 4 × 3 × 2 × `factorial(1)` = 4 × 3 × 2 × 1 = `24`.

</details>

## À retenir

- Une **fonction** = un bloc de code **nommé**, écrit une fois, **rappelé** autant qu'on veut. On **déclare** (on décrit) puis on **appelle** (on exécute, avec les parenthèses `()`).
- Modèle mental : une **machine entrée → sortie**. Les **paramètres** sont les entrées ; `return` définit la **sortie** et **arrête** la fonction aussitôt.
- La **fonction fléchée** `(x) => x * 2` est la version courte (return implicite si une seule expression) ≈ **lambda** Python / *arrow* PHP ; idéale pour les mini-fonctions passées à `map`/`filter`.
- La **portée** rend chaque fonction étanche : ses variables sont **locales** (invisibles dehors) — c'est une protection contre les collisions, pas une contrainte gratuite.
- Quand une fonction en appelle une autre, la **pile d'appels** empile/dépile les cadres (**LIFO**) ; c'est ce que montre une *stack trace* lors d'une erreur.
- **Décomposer** un problème en petites fonctions à responsabilité unique = code lisible, testable, réutilisable — le cœur de l'abstraction.
- Une **fermeture** (*closure*) : une fonction intérieure qui « capture » les variables de son environnement de création dans un sac à dos invisible — elles restent accessibles même après la fin de la fonction extérieure. Utile pour protéger un état privé et fabriquer des fonctions personnalisées.
- La **récursion** : une fonction qui s'appelle elle-même. Deux parties obligatoires : le **cas de base** (condition d'arrêt) et l'**appel récursif** (vers un cas plus petit). Sans cas de base → `RangeError: Maximum call stack size exceeded`.
