---
title: "Services & injection de dépendances"
type: lesson
---

# Étape 2 — Services & injection de dépendances

Les composants affichent ; les **services** portent la logique métier et les données partagées. Angular les fournit aux composants via l'**injection de dépendances**.

> **Objectif de l'étape —** extraire la logique d'un composant vers un service, et le récupérer par injection plutôt que de l'instancier soi-même.

## Au programme

- Le service : décorateur `@Injectable`
- `providedIn: 'root'` et la portée des fournisseurs
- Injecter un service dans un composant (constructeur, `inject()`)
- Pourquoi la DI : testabilité, découplage, instance partagée

> **Rappel —** les classes de service Angular ne s'exécutent pas dans le bac à sable (réservé JS/TS pur). Les exercices interactifs porteront sur de la **logique TypeScript** ; les exemples de service seront présentés en **mode correction**.

*(Contenu détaillé à venir — squelette de l'étape.)*
