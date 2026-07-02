---
title: "Composant SFC & <script setup>"
type: lesson
---

# Le composant Single-File (SFC)

Tu as déjà écrit du JavaScript et du TypeScript. La question qui reste : **où** met-on ce
code quand on construit une interface ? Réponse de Vue : dans un **composant**, une brique
autonome qui regroupe *sa* logique, *son* affichage et *son* style. Et tout ça tient dans
**un seul fichier `.vue`** — un *Single-File Component* (SFC).

> **Pourquoi un « composant » plutôt qu'une grosse page ?** Parce qu'une interface, c'est
> beaucoup de morceaux répétés (un bouton, une ligne de tableau, une carte produit). Les
> isoler en composants, c'est comme écrire une **fonction** au lieu de copier-coller : on
> nomme un bout d'UI, on le teste, on le réutilise. Un composant est à l'écran ce qu'une
> fonction est au code.

## Les trois blocs d'un `.vue`

Un fichier `.vue` a **trois sections**, chacune avec un rôle net :

![Anatomie d'un composant Vue (SFC)](assets/sfc-anatomie.svg)

```vue
<script setup>
import { ref } from 'vue'

const message = ref('Bonjour')
</script>

<template>
  <h1>{{ message }}</h1>
</template>

<style scoped>
h1 { color: teal; }
</style>
```

- **`<script setup>`** : la logique (Composition API). Tout ce que tu y déclares est
  **automatiquement disponible** dans le template — pas besoin de le « ré-exporter ».
- **`<template>`** : le HTML, avec l'interpolation `{{ }}` et les directives (`v-if`,
  `v-for`, `@click`…).
- **`<style scoped>`** : du CSS **limité à ce composant** (pas de fuite vers les autres).

> **Passerelle — PHP/Twig vs Vue.** Si tu as fait du Twig (Symfony) ou du Blade (Laravel),
> tu connais déjà l'idée de « template » : un HTML troué de `{{ variable }}` que le
> **serveur** remplit puis envoie au navigateur. Vue fait la même interpolation `{{ }}`,
> mais **côté client** : le navigateur garde le composant vivant et **re-remplit les trous
> tout seul** dès qu'une donnée change, sans nouvel aller-retour serveur. C'est toute la
> différence entre le rendu serveur (une page figée par requête) et une SPA (une page qui
> se met à jour en direct).

> **Passerelle — React/Angular.** Le SFC est l'équivalent Vue du composant React (`.jsx`)
> ou Angular (`.ts` + `.html` + `.css`). Là où React mélange logique et markup dans le JSX
> et où Angular éclate le composant en trois fichiers, Vue **regroupe les trois dans un
> seul fichier** mais **avec des blocs séparés** : structure, présentation et comportement
> restent distincts, sans être éparpillés.

## Interpolation et liaisons

Dans le template, on relie les données à l'affichage de trois façons très courantes :

```vue
<template>
  <p>{{ message }}</p>                    <!-- texte : interpolation -->
  <img :src="url" />                      <!-- v-bind : attribut dynamique -->
  <button @click="incrementer">+1</button> <!-- v-on : écouter un événement -->
</template>
```

- `{{ ... }}` **affiche** une valeur (comme `echo` en PHP, `print` en Python).
- `:` est le raccourci de **`v-bind`** : « la valeur de cet attribut vient d'une variable ».
- `@` est le raccourci de **`v-on`** : « quand cet événement arrive, exécute ceci ».

Retiens ces deux symboles, tu les verras partout : **`:` pour lier une donnée**,
**`@` pour écouter un événement**.

## À retenir

- Un **composant** est une brique d'UI réutilisable — l'équivalent visuel d'une fonction.
- Un fichier **`.vue` (SFC)** regroupe **trois blocs** : `<script setup>` (logique),
  `<template>` (affichage), `<style scoped>` (style limité au composant).
- **`<script setup>`** est la forme moderne : ce qu'on y déclare est directement utilisable
  dans le template, sans `export`/`return`.
- Dans le template : **`{{ }}`** affiche, **`:`** (`v-bind`) lie une donnée à un attribut,
  **`@`** (`v-on`) écoute un événement.
