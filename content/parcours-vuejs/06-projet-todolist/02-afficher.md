---
title: "Étape 1 — Afficher les tâches"
type: lesson
---

# Étape 1 — Afficher la liste

On part d'un tableau réactif de tâches et on l'affiche avec **`v-for`**. Chaque tâche a un
`id` (pour la `key`), un `texte` et un booléen `fait`.

> **Pourquoi commencer par afficher ?** Parce que tout le reste (ajouter, cocher, filtrer)
> ne fait que **modifier l'état** — et l'affichage suivra tout seul. Poser d'abord « quelles
> données, affichées comment » fixe la source de vérité ; les interactions viendront la
> faire évoluer.

```vue
<script setup>
import { ref } from 'vue'

const taches = ref([
  { id: 1, texte: 'Apprendre Vue', fait: false },
  { id: 2, texte: 'Construire une todo-list', fait: false },
])
</script>

<template>
  <h3>Mes tâches</h3>
  <ul>
    <li v-for="tache in taches" :key="tache.id">{{ tache.texte }}</li>
  </ul>
</template>
```

> **Pourquoi la `:key` ?** Quand la liste change (ajout, suppression, tri), Vue doit savoir
> **quel élément est lequel** pour ne remuer que ce qui a bougé, pas tout redessiner. La
> `key` (un identifiant **stable et unique**, jamais l'index du tableau) lui donne ce
> repère. C'est une optimisation *et* une source de bugs si on l'oublie — prends l'habitude.

> **Passerelle — templates serveur.** `v-for` est le pendant du `{% for tache in taches %}`
> de Twig ou du `{{ range .Taches }}`… : boucler sur une collection pour générer du HTML.
> Différence : côté Vue, si `taches` change **après** le premier rendu, la liste se met à
> jour toute seule — pas de nouvelle requête serveur.

> **Clique « Tester »** puis essaie : ajoute une tâche à la main dans le tableau
> (`{ id: 3, texte: '…', fait: false }`), change un texte — l'affichage suit immédiatement.

## À retenir

- **`v-for="item in liste"`** boucle sur une collection pour générer des éléments (comme un
  `for` de template serveur, mais réactif).
- Toujours une **`:key`** unique et stable (l'`id`, pas l'index) : elle aide Vue à suivre
  chaque élément efficacement.
- On pose d'abord **l'état** (les données) ; l'affichage n'en est que le reflet.
