---
title: "À toi de jouer — ton propre projet"
type: lesson
---

# À toi de jouer

Tu as une todo-list complète. Maintenant, **fais-la tienne** : ouvre ton atelier perso
(le bouton flottant **« Vue »**, en bas à droite — ton code y est **sauvegardé** entre
les sessions), pars de la version de l'étape 4, et ajoute des fonctionnalités.

## Idées d'extensions (du plus simple au plus ambitieux)

- **Tout assembler** : ajout + cocher + supprimer + filtres dans un seul composant.
- **Éditer** une tâche (double-clic → champ de saisie).
- **Vider les tâches faites** (un bouton « Nettoyer »).
- **Persister** dans le navigateur :

  ```js
  import { watch } from 'vue'
  // save on every change
  watch(tasks, (v) => localStorage.setItem('tasks', JSON.stringify(v)), { deep: true })
  // and on startup: const tasks = ref(JSON.parse(localStorage.getItem('tasks') || '[]'))
  ```

- **Découper en composants** : `TodoItem.vue` (une ligne) + `TodoApp.vue` — extrais un
  composant enfant avec ses props et ses événements.
- **Un composable** `useTodos()` qui regroupe l'état et les actions (`addTask`,
  `removeTask`, `remaining`).

> **Pas d'idée ?** Reprends une autre app classique : une **liste de courses**, un **minuteur**,
> un **convertisseur** de devises. L'important est de **construire** : c'est là que tout
> ce que tu as appris se met en place.
