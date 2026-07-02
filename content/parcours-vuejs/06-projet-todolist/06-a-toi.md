---
title: "À toi de jouer — ton propre projet"
type: lesson
---

# À toi de jouer

> ⏱️ **Durée conseillée : ~45 min à quelques heures.** Pas de correction ici : c'est **ton**
> projet. Choisis une ou deux extensions, construis, casse, répare — c'est là que
> l'apprentissage se solidifie.

Tu as une todo-list complète. Maintenant, **fais-la tienne** : ouvre ton atelier perso (le
bouton flottant **« Vue »**, en bas à droite — ton code y est **sauvegardé** entre les
sessions), pars de la version de l'étape 4, et ajoute des fonctionnalités.

## Idées d'extensions (du plus simple au plus ambitieux)

- **Tout assembler** : ajout + cocher + supprimer + filtres dans un seul composant.
- **Éditer** une tâche (double-clic → champ de saisie).
- **Vider les tâches faites** (un bouton « Nettoyer »).
- **Persister** dans le navigateur :

  ```js
  import { watch } from 'vue'
  // sauvegarder à chaque changement (effet de bord → watch, pas computed !)
  watch(taches, (v) => localStorage.setItem('taches', JSON.stringify(v)), { deep: true })
  // et au démarrage : const taches = ref(JSON.parse(localStorage.getItem('taches') || '[]'))
  ```

  > **Note —** persister est un **effet de bord** : c'est bien un `watch`, pas un `computed`
  > (souviens-toi du module 4). C'est le cas d'usage typique du `watch`.

- **Découper en composants** : `Tache.vue` (une ligne) + `App.vue` — extrais un composant
  enfant avec ses **props** (la tâche) et ses **événements** (`@supprimer`, `@basculer`).
  C'est l'arbre de composants du diagramme d'intro, en vrai.
- **Un composable** `useTaches()` qui regroupe l'état et les actions (`ajouterTache`,
  `supprimerTache`, `restantes`) — la logique extraite du module 4.

> **Pas d'idée ?** Reprends une autre appli classique : une **liste de courses**, un
> **minuteur**, un **convertisseur** de devises. L'important est de **construire** : c'est là
> que tout ce que tu as appris se met en place.
