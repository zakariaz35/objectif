---
title: "Étape 2 — Ajouter une tâche"
type: lesson
---

# Étape 2 — Ajouter une tâche

Un champ lié en **`v-model`**, un formulaire dont on intercepte l'envoi
(**`@submit.prevent`**), et on **pousse** la nouvelle tâche dans le tableau. On applique
directement le flux vu en intro : *clic → on modifie l'état → Vue re-rend*.

```vue
<script setup>
import { ref } from 'vue'

const taches = ref([{ id: 1, texte: 'Apprendre Vue', fait: false }])
const nouvelleTache = ref('')
let prochainId = 2

function ajouterTache() {
  const texte = nouvelleTache.value.trim()
  if (!texte) return
  taches.value.push({ id: prochainId++, texte, fait: false })
  nouvelleTache.value = ''
}
</script>

<template>
  <h3>Mes tâches</h3>
  <form @submit.prevent="ajouterTache">
    <input v-model="nouvelleTache" placeholder="Nouvelle tâche…" />
    <button>Ajouter</button>
  </form>
  <ul>
    <li v-for="t in taches" :key="t.id">{{ t.texte }}</li>
  </ul>
</template>
```

> **Pourquoi `@submit.prevent` ?** Un `<form>` HTML, par défaut, **recharge la page** à
> l'envoi (héritage du web serveur, où soumettre = envoyer une requête). Le modifieur
> `.prevent` appelle `event.preventDefault()` pour nous : on garde la SPA vivante et on gère
> l'ajout en JavaScript. C'est aussi ce qui permet de valider avec **Entrée** *ou* le bouton.

> **Pourquoi `.trim()` et le `if (!texte) return` ?** Petite hygiène de saisie : on refuse
> une tâche vide ou faite uniquement d'espaces. Valider les entrées est un réflexe qui vient
> du back-end — il vaut autant côté front.

> **Teste** : tape une tâche, valide (Entrée ou « Ajouter »). Le champ se vide après ajout,
> et une saisie vide est ignorée. Observe que tu n'as **jamais** touché au DOM : tu as juste
> `push` dans `taches`, et la liste s'est mise à jour.

## À retenir

- **`v-model`** lie le champ à un `ref` (`nouvelleTache`) dans les deux sens : l'input le
  reflète, la frappe le met à jour.
- **`@submit.prevent`** intercepte l'envoi du formulaire sans recharger la page.
- On **modifie l'état** (`taches.value.push(...)`) — l'affichage suit. On valide la saisie
  (`.trim()`, refus du vide) avant d'ajouter.
