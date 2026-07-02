---
title: "Quiz — Penser en algorithmes"
type: quiz
questions:
  - prompt: |
      Un algorithme parcourt un tableau avec **une boucle dans une boucle** (chaque élément
      est comparé à tous les autres). Si tu **doubles** la taille des données, le travail est
      multiplié par environ…
    options:
      - |
        2 (deux fois plus de données = deux fois plus de travail)
      - |
        4 (coût quadratique n² : doubler n multiplie le travail par 4)
      - |
        Rien : la taille des données n'influence pas le temps de calcul
    answer: 1
    explanation: |
      Une boucle dans une boucle sur les mêmes données fait environ `n × n = n²` opérations.
      Si `n` double, le travail passe de `n²` à `(2n)² = 4n²`, soit **×4**. C'est le coût
      **quadratique** qui « explose » sur la courbe rouge du cours. Une boucle **simple** (n)
      serait, elle, seulement doublée. D'où le réflexe : repérer les boucles imbriquées sur de
      gros volumes de données.
  - prompt: |
      La **recherche dichotomique** (couper l'intervalle en deux à chaque étape) ne fonctionne
      correctement que si…
    options:
      - |
        le tableau contient uniquement des nombres
      - |
        le tableau est **trié**
      - |
        le tableau a une taille paire
    answer: 1
    explanation: |
      La dichotomie repose sur « la cible est plus grande / plus petite que le milieu, donc
      elle est forcément dans telle moitié ». Ce raisonnement n'a de **sens** que si les
      données sont **triées** : sinon, éliminer une moitié pourrait jeter la cible. Sur des
      données non triées, on retombe sur la recherche **linéaire** (parcourir jusqu'à trouver).
  - prompt: |
      Dans la démarche recommandée du cours, quelle est la **bonne** première chose à faire
      face à un problème ?
    options:
      - |
        Ouvrir l'éditeur et écrire du code tout de suite pour gagner du temps
      - |
        Comprendre le problème, le décomposer, et décrire la méthode en pseudo-code **avant** de coder
      - |
        Choisir le langage de programmation le plus rapide
    answer: 1
    explanation: |
      L'algorithme se **pense avant** de coder. La démarche est : **comprendre → décomposer →
      pseudo-code → coder → tester**. Le pseudo-code (du français structuré) clarifie la
      logique sans se noyer dans la syntaxe ; le code ne fait ensuite que **traduire** une
      pensée déjà juste. Coder d'emblée, c'est construire sans plan — et le langage choisi
      importe peu, les mêmes motifs se traduisent partout (JS, Python, SQL).
---

Trois questions pour ancrer l'essentiel de la synthèse : le coût quadratique (n²), la
condition de la recherche dichotomique (données triées), et la démarche « penser avant coder ».
