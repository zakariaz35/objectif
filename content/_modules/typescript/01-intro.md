---
title: "TypeScript"
type: lesson
---

# Étape 2 — TypeScript

TypeScript = JavaScript + des **types**. Dans Vue 3, il rend les composants plus sûrs et l'autocomplétion bien meilleure.

> **Objectif de l'étape —** savoir typer les données qu'on manipule dans un composant (props, état, fonctions).

## Au programme

- Types de base : `string`, `number`, `boolean`, `array`, `union`
- `interface` vs `type`
- Types des fonctions (paramètres, retour)
- Génériques (les bases) : `Ref<T>`, `Array<T>`
- `unknown` vs `any`, et pourquoi éviter `any`
- Typage utile côté Vue : `defineProps<...>()`, `ref<T>()`
- Comment on **compile** du TypeScript (le navigateur n'exécute pas le `.ts`)

> **Passerelle PHP/Python.** L'idée de « décrire le type d'une donnée » ne t'est pas étrangère : ce sont les **type hints** de Python (`def f(x: int) -> str`) vérifiés par `mypy`, ou le typage progressif de PHP (`function f(int $x): string`). TypeScript pousse cette logique partout, et un **vérificateur** relit ton code **avant** l'exécution pour attraper les erreurs de type.

> **Pourquoi se donner cette peine ?** Parce que la plupart des bugs quotidiens sont bêtes : une variable qu'on croit être un nombre et qui est un texte, un champ mal orthographié, un `undefined` inattendu. Les types les font apparaître **au moment où tu écris le code** (dans l'éditeur), pas en production. Et en bonus : l'**autocomplétion** devient bien plus précise.
