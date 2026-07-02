---
title: "Quiz — Reprise JavaScript"
type: quiz
questions:
  - prompt: |
      Tu écris un fichier `script.js` et tu veux l'exécuter **hors du navigateur**, dans un terminal. Qu'utilises-tu ?
    options:
      - |
        Node.js (`node script.js`)
      - |
        La console `F12` du navigateur
      - |
        Un tableur Excel
    answer: 0
    explanation: |
      **Node.js** est le moteur JavaScript qui tourne hors du navigateur : `node script.js` exécute ton fichier dans le terminal. La console `F12`, elle, exécute du JS **dans** le navigateur. Les deux sont valables — ils diffèrent juste par l'endroit où le code tourne.
  - prompt: |
      Que fait `console.log("Total :", 245)` ?
    options:
      - |
        Il enregistre la valeur dans une base de données
      - |
        Il affiche `Total : 245` dans la console
      - |
        Il renvoie 245 à la fonction appelante
    answer: 1
    explanation: |
      `console.log(...)` **affiche** ses arguments dans la console (l'équivalent de `print(...)` en Python). Il n'enregistre rien et ne « renvoie » pas de valeur exploitable : pour renvoyer un résultat depuis une fonction, on utilise `return`.
  - prompt: |
      Dans ce code, quel sera l'ordre d'affichage ?

      ```js
      console.log("A")
      console.log("B")
      console.log("C")
      ```
    options:
      - |
        Un ordre aléatoire décidé par le moteur
      - |
        C, puis B, puis A
      - |
        A, puis B, puis C
    answer: 2
    explanation: |
      Un programme s'exécute **séquentiellement**, de haut en bas, dans l'ordre où les instructions sont écrites. Donc `A`, puis `B`, puis `C`. L'ordinateur ne réordonne rien : c'est le principe de base de tout algorithme.
---

Trois questions pour vérifier que les fondations sont bien remises en place : où tourne le code, comment on affiche, et l'ordre d'exécution.
