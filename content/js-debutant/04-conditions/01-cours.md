---
title: "Conditions"
type: lesson
---

## Prendre une décision dans un programme

Jusqu'ici, nos programmes s'exécutaient tout droit, de haut en bas. Mais un vrai programme doit **décider** : appliquer une remise *si* le panier dépasse 50 €, afficher « majeur » *si* l'âge ≥ 18, ranger une vente dans une catégorie *selon* son montant… C'est le rôle des **conditions**.

> 🧠 **Rappel algo.** On appelle ça le **branchement** (ou structure de décision). Le programme évalue une condition (un booléen : vrai/faux) et **choisit un chemin** selon le résultat. C'est le deuxième pilier de l'algorithmique, après la séquence : *séquence* (faire dans l'ordre) puis *branchement* (choisir), et bientôt les boucles (répéter).

## Le `if` / `else`

La brique de base : `if` (si) exécute un bloc **quand la condition est vraie** ; `else` (sinon) exécute l'autre bloc.

```js
const age = 20

if (age >= 18) {
  console.log("Majeur")
} else {
  console.log("Mineur")
}
```

Anatomie :

- la **condition** est entre parenthèses `( … )` et doit s'évaluer en booléen ;
- le **bloc** à exécuter est entre accolades `{ … }` ;
- `else` est **optionnel** : parfois on ne veut agir que « si vrai ».

```mermaid
flowchart TD
  START(["Début"]) --> COND{"age >= 18 ?"}
  COND -->|"vrai (true)"| A["Afficher « Majeur »"]
  COND -->|"faux (false)"| B["Afficher « Mineur »"]
  A --> END(["Suite du programme"])
  B --> END
```

Ce schéma en losange (le test) avec deux flèches (vrai/faux) est le **flowchart** classique d'un branchement. Garde cette image en tête : une condition, c'est un aiguillage.

## Plusieurs cas : `else if`

Pour enchaîner plusieurs tests, on utilise `else if`. Le programme évalue les conditions **dans l'ordre** et s'arrête à la **première vraie**.

```js
const note = 14

if (note >= 16) {
  console.log("Très bien")
} else if (note >= 14) {
  console.log("Bien")
} else if (note >= 12) {
  console.log("Assez bien")
} else {
  console.log("Passable ou insuffisant")
}
// Displays "Bien" : 16 is false, 14 is true → we stop here
```

```mermaid
flowchart TD
  N["note = 14"] --> C1{"note >= 16 ?"}
  C1 -->|"vrai"| R1["« Très bien »"]
  C1 -->|"faux"| C2{"note >= 14 ?"}
  C2 -->|"vrai"| R2["« Bien »"]
  C2 -->|"faux"| C3{"note >= 12 ?"}
  C3 -->|"vrai"| R3["« Assez bien »"]
  C3 -->|"faux"| R4["« Passable… »"]
```

> **Attention à l'ordre !** Comme on s'arrête à la première condition vraie, il faut trier du **plus restrictif au plus large**. Si tu testais `note >= 12` en premier, une note de 18 tomberait dans « Assez bien » — jamais dans « Très bien ». L'ordre des `else if` fait partie de la logique.

## Le `switch` : comparer une valeur à des cas

Quand on compare **une même variable** à plusieurs valeurs **précises**, le `switch` est souvent plus lisible qu'une longue chaîne de `else if`.

```js
const jour = "samedi"

switch (jour) {
  case "samedi":
  case "dimanche":
    console.log("Week-end")
    break
  case "vendredi":
    console.log("Bientôt le week-end")
    break
  default:
    console.log("Jour de semaine")
}
```

Points importants :

- chaque `case` se compare avec `===` (égalité stricte) ;
- **`break`** stoppe le `switch` : sans lui, l'exécution « déborde » sur le `case` suivant (piège classique !). Ici on l'exploite volontairement : `"samedi"` et `"dimanche"` partagent le même bloc ;
- `default` est le « sinon » (optionnel mais recommandé).

> **Passerelle SQL / Excel.** Le `switch` (et la cascade de `else if`) sont l'équivalent du `CASE WHEN … THEN … ELSE … END` en SQL, ou de la fonction `SI(condition; alors; sinon)` d'Excel — que tu imbriquais peut-être avec `SI(...; SI(...; ...))`. Même logique de décision, écrite plus lisiblement.

## L'opérateur de comparaison : toujours `===`

Quand tu écris une condition, tu compares presque toujours deux valeurs. JavaScript offre **deux** opérateurs d'égalité — et choisir le mauvais est l'une des erreurs les plus fréquentes chez les débutants.

- `===` (égalité **stricte**) : compare valeur **et** type, sans conversion. C'est celui qu'on utilise.
- `==` (égalité **lâche**) : convertit les types automatiquement avant de comparer. Source de bugs silencieux.

**Exemple progressif — partons d'un cas simple :**

Étape 1 : deux nombres, tout va bien.

```js
const age = 18
if (age === 18) {
  console.log("exactly 18")   // runs as expected
}
```

Étape 2 : et si l'âge vient d'un formulaire (donc une *chaîne*) ?

```js
const userInput = "18"   // a string, as received from a form

// ⚠️ == : converts "18" to 18 before comparing — seems to work, hides a type mismatch
if (userInput == 18) {
  console.log("adult (==)")   // runs — but for the wrong reason
}

// ✅ === : no conversion — string ≠ number, so false
if (userInput === 18) {
  console.log("adult (===)")  // does NOT run
}

// ✅ Correct approach: convert explicitly, then compare
if (Number(userInput) === 18) {
  console.log("adult (explicit)")  // runs, and the intent is crystal clear
}
```

Étape 3 : les surprises de `==` quand les valeurs changent.

```js
console.log(0 == false)    // true  ← very surprising: 0 and false both become 0
console.log("" == false)   // true  ← empty string and false both become 0
console.log(null == 0)     // false ← null is special, it only equals undefined with ==
```

> ⚠️ **Erreur fréquente.** Utiliser `==` dans un `if` peut « sembler marcher » parce que la coercition convertit les types dans le bon sens la plupart du temps. Mais dès que les valeurs changent un peu (`null`, `0`, `""`…), les surprises arrivent. Utilise **toujours `===`** dans tes conditions. Le `switch`, lui, utilise déjà `===` en interne — c'est l'une de ses qualités.

## Truthy / falsy : le grand piège de reprise

En JavaScript, une condition n'a **pas besoin** d'être un vrai booléen : **n'importe quelle valeur** est convertie en `true` ou `false` quand on la teste. On parle de valeurs **truthy** (« considérées vraies ») et **falsy** (« considérées fausses »).

**Retiens la liste des falsy** — il n'y en a que peu, tout le reste est truthy :

```mermaid
flowchart LR
  V["Une valeur<br/>dans un if(...)"] --> Q{"Est-elle falsy ?"}
  Q -->|"OUI → traitée comme false"| F["false · 0 · '' (chaîne vide)<br/>null · undefined · NaN"]
  Q -->|"NON → traitée comme true"| T["TOUT le reste :<br/>nombres ≠ 0, texte non vide,<br/>[] (tableau vide),<br/>{} (objet vide)…"]
```

```js
if (0)          console.log("jamais")      // 0 est falsy
if ("")         console.log("jamais")      // empty string: falsy
if (null)       console.log("jamais")      // falsy
if (undefined)  console.log("jamais")      // falsy
if (NaN)        console.log("jamais")      // NaN (Not a Number) : falsy

if ("bonjour")  console.log("ça oui")      // texte non vide : truthy
if (42)         console.log("ça oui")      // nombre non nul : truthy
if ([])         console.log("SURPRISE")    // tableau VIDE : truthy !
if ({})         console.log("SURPRISE")    // objet VIDE : truthy !
```

> **Le double piège à mémoriser.** Beaucoup pensent qu'un tableau vide `[]` ou un objet vide `{}` sont « faux/vides » donc falsy. **Faux !** En JS, `[]` et `{}` sont **truthy**. Pour tester si un tableau est vide, on regarde sa **longueur** : `if (liste.length === 0)`, pas `if (!liste)`.

> **Passerelle.** En SQL, `NULL` a une logique à part (trois états : vrai/faux/inconnu). En JS, le raisonnement est différent : chaque valeur bascule en vrai/faux via cette liste de falsy. Note que `0` est falsy — donc `if (montant)` serait faux pour un montant de `0 €`, ce qui n'est pas toujours voulu. Sois explicite : `if (montant > 0)`.

## Écrire des conditions lisibles

Une condition est juste une **expression booléenne** (module précédent). On peut la combiner avec `&&`, `||`, `!` :

```js
const montant = 120
const clientFidele = true

if (montant > 100 && clientFidele) {
  console.log("Remise fidélité appliquée")
}
```

Astuce lisibilité : nomme les conditions complexes dans une variable.

```js
const eligibleRemise = montant > 100 && clientFidele
if (eligibleRemise) {
  console.log("Remise appliquée")
}
```

> 🧠 **Rappel algo.** Décomposer une décision en sous-conditions nommées, c'est comme découper un calcul en cellules intermédiaires dans un tableur : plus lisible, plus facile à déboguer, et l'intention devient évidente à la relecture.

## Exercice mental : que va afficher ce code ?

Lis chaque extrait et devine la sortie **avant** de révéler la réponse.

**Extrait 1**
```js
const value = "0"

if (value) {
  console.log("truthy")
} else {
  console.log("falsy")
}
```
<details><summary>Réponse</summary>

`"truthy"` — la chaîne `"0"` est **non vide**, donc truthy. Seule la chaîne vide `""` est falsy. Le contenu de la chaîne (`"0"`, `"false"`, `"null"`…) ne change rien : dès qu'elle a au moins un caractère, elle est truthy.

</details>

**Extrait 2**
```js
const items = []

if (items) {
  console.log("truthy")
} else {
  console.log("falsy")
}
```
<details><summary>Réponse</summary>

`"truthy"` — un **tableau vide** `[]` est truthy en JavaScript. C'est le double piège de la leçon. Pour tester qu'un tableau est vide, utilise `items.length === 0`, jamais `!items`.

</details>

**Extrait 3**
```js
const score = 14

if (score >= 16) {
  console.log("very good")
} else if (score >= 14) {
  console.log("good")
} else if (score >= 12) {
  console.log("fairly good")
} else {
  console.log("insufficient")
}
```
<details><summary>Réponse</summary>

`"good"` — le premier test `score >= 16` est faux (14 < 16), le second `score >= 14` est vrai : on affiche `"good"` et la cascade s'arrête immédiatement. Les tests suivants ne sont même pas évalués.

</details>

## À retenir

- Une **condition** réalise un **branchement** : le programme choisit un chemin selon un booléen.
- `if / else` pour deux cas ; `else if` pour enchaîner — l'**ordre compte** (du plus restrictif au plus large).
- `switch` compare **une valeur** à des `case` précis (avec `===`) ; n'oublie pas les **`break`**.
- **Truthy / falsy** : les falsy sont `false`, `0`, `""`, `null`, `undefined`, `NaN`. **Tout le reste est truthy**, y compris `[]` et `{}` !
- Pour tester un tableau vide : `liste.length === 0`, pas `!liste`.
- Nomme les conditions complexes dans une variable pour les rendre lisibles.
