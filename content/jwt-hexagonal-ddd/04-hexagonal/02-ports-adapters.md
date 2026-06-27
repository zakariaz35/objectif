---
title: "Ports & Adapters : l'image de l'hexagone"
type: lesson
---

> **Schéma —** Au centre, le **CŒUR** (logique métier, zéro dépendance externe) contient : un **port d'entrée** (interface UseCase) → un **service applicatif** `CreerFacture` → un **port de sortie** (interface `FactureRepository`). Côté entrée (driving), des **adapters** s'y branchent : Contrôleur HTTP, Commande CLI, Job de queue → tous appellent le port d'entrée. Côté sortie (driven), le port de sortie est implémenté par : `EloquentFactureRepository`, Adapter Mailgun. Les flèches pointent toujours **vers le centre**.

- **Port** = une **interface** (un contrat). « Voici ce dont j'ai besoin / ce que j'offre. »
- **Adapter** = une **implémentation concrète** de ce contrat (Eloquent, HTTP, Mailgun…).
- **Port d'entrée (driving)** : ce qui *déclenche* le métier (HTTP, CLI, queue).
- **Port de sortie (driven)** : ce dont le métier *a besoin* (DB, mail, API tierce).

> **L'inversion de dépendance, le vrai secret —** Normalement « métier → utilise MySQL ». Ici on **inverse** : le métier définit l'interface `FactureRepository`, et c'est l'adapter Eloquent qui **dépend de cette interface**. La flèche de dépendance pointe vers le centre. Résultat : le centre ignore totalement Eloquent.
