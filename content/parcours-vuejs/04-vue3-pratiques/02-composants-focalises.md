---
title: "Des composants petits et focalisés"
type: lesson
---

# Un composant = une responsabilité

Le réflexe pro : des composants **petits**, chacun avec **un seul rôle**. Un gros composant
qui fait tout devient vite illisible et impossible à réutiliser.

## Signes qu'il faut découper

- Le `<template>` dépasse l'écran.
- Le composant gère plusieurs sujets sans rapport (une liste **et** une modale **et** un formulaire).
- Tu copies-colles un bout de template d'un composant à l'autre.

## Découper proprement

```
InvoiceList.vue          ← orchestrates
├─ InvoiceRow.vue        ← displays one row
└─ StatusBadge.vue       ← displays a status
```

Chaque enfant reçoit ses **props** et **émet** ses événements ; le parent orchestre.

> **Rappel du flux —** les **props descendent**, les **événements remontent**. Un enfant
> ne modifie jamais une prop : il émet, et le parent décide.

> **Bonne pratique —** nomme les composants en **PascalCase** (`InvoiceRow`), un fichier
> par composant, et garde la logique partagée dans des **composables** (leçon suivante)
> plutôt que de la dupliquer.
