---
title: "Quiz éclair — Services & DI"
type: quiz
questions:
  - prompt: |
      Que garantit `@Injectable({ providedIn: 'root' })` ?
    options:
      - "Une nouvelle instance du service à chaque injection"
      - "Une seule instance partagée (singleton) dans toute l'application, tree-shakable"
      - "Que le service ne peut être injecté que dans le composant racine"
      - "Que le service est rechargé à chaque navigation"
    answer: 1
    explanation: >
      `providedIn: 'root'` enregistre un **singleton** global, partagé par tous les
      composants qui l'injectent, et **tree-shakable** (éliminé du bundle si jamais
      utilisé).
  - prompt: |
      Comment Angular sait-il quel service injecter dans `constructor(private c: CartService) {}` ?
    options:
      - "Grâce au nom du paramètre"
      - "Grâce au type du paramètre (CartService)"
      - "Grâce à l'ordre des paramètres"
      - "Il faut le préciser dans le décorateur @Component"
    answer: 1
    explanation: >
      C'est le **type** déclaré (`CartService`) qui sert de jeton à l'injecteur. Le nom du
      paramètre n'a aucune importance.
  - prompt: |
      Quel est un avantage de `inject(CartService)` par rapport au constructeur ?
    options:
      - "Il crée une nouvelle instance à chaque appel"
      - "Il peut être utilisé dans des fonctions hors classe (gardes, intercepteurs)"
      - "Il évite d'avoir à enregistrer le service"
      - "Il rend le service automatiquement public"
    answer: 1
    explanation: >
      `inject()` fonctionne dans tout **contexte d'injection**, y compris des fonctions
      (gardes de route, intercepteurs), et reste plus concis quand il y a plusieurs
      dépendances.
  - prompt: |
      En test, pourquoi la DI facilite-t-elle le remplacement d'un service ?
    options:
      - "Parce que le composant instancie lui-même ses dépendances"
      - "Parce qu'on peut fournir un faux via `{ provide: X, useValue: fake }`"
      - "Parce que les services ne sont pas testables autrement"
      - "Parce que `providedIn: 'root'` désactive le service en test"
    answer: 1
    explanation: >
      Le composant **reçoit** sa dépendance au lieu de la créer. On peut donc enregistrer
      un faux avec `{ provide: CartService, useValue: fake }` : le composant l'utilise sans
      voir la différence, ce qui rend le test rapide et déterministe.
  - prompt: |
      Pour une simple fonction de formatage de date, pure et sans état, que faire ?
    options:
      - "Toujours en faire un service injectable"
      - "Une fonction exportée suffit ; pas besoin de service"
      - "La déclarer dans chaque composant qui l'utilise"
      - "L'injecter via le constructeur du composant racine"
    answer: 1
    explanation: >
      La DI sert ce qu'on veut **partager** ou **substituer** (HTTP, stockage, état). Pour
      un utilitaire pur et sans état, une fonction exportée est plus simple et suffisante.
---

Cinq questions sur les services et l'injection de dépendances.
