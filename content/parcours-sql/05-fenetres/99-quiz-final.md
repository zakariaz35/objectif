---
title: "Quiz final — SQL pour l'analyste"
type: quiz
questions:
  - prompt: "Quel est l'ordre logique d'exécution d'une requête ?"
    options:
      - "SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY"
      - "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY"
      - "FROM → GROUP BY → WHERE → SELECT → HAVING → ORDER BY"
    answer: 1
    explanation: >-
      On lit d'abord les données (`FROM`), on filtre les lignes (`WHERE`), on groupe
      (`GROUP BY`), on filtre les groupes (`HAVING`), on projette (`SELECT`) puis on trie
      (`ORDER BY`). C'est pour ça qu'un alias du `SELECT` n'est pas toujours utilisable
      dans le `WHERE`.
  - prompt: "Pour tester l'absence de valeur, on écrit…"
    options:
      - "WHERE region = NULL"
      - "WHERE region IS NULL"
      - "WHERE region == NULL"
    answer: 1
    explanation: >-
      Toute comparaison avec `NULL` renvoie `NULL` (ni vrai ni faux). On utilise
      `IS NULL` / `IS NOT NULL`.
  - prompt: "`WHERE` et `HAVING` : quelle différence ?"
    options:
      - "Aucune, ce sont des synonymes"
      - "`WHERE` filtre les lignes avant le GROUP BY ; `HAVING` filtre les groupes après agrégation"
      - "`HAVING` filtre les lignes, `WHERE` filtre les groupes"
    answer: 1
    explanation: >-
      `WHERE` agit sur les lignes en entrée (avant agrégation), `HAVING` sur les agrégats
      (après `GROUP BY`). `SUM(amount) > 1000` va donc dans `HAVING`.
  - prompt: "Tu veux garder TOUS les clients, même ceux sans commande. Tu utilises…"
    options:
      - "INNER JOIN"
      - "LEFT JOIN, en gardant les NULL côté orders"
      - "INNER JOIN avec WHERE order_id IS NULL"
    answer: 1
    explanation: >-
      Le `LEFT JOIN` conserve toutes les lignes de gauche ; les clients sans commande ont
      les colonnes `orders` à `NULL`. Filtrer `WHERE o.order_id IS NULL` isole justement
      ceux sans commande.
  - prompt: "Dans un LEFT JOIN, où placer un filtre sur la table de DROITE pour ne pas perdre les lignes de gauche ?"
    options:
      - "Dans le WHERE"
      - "Dans la clause ON de la jointure"
      - "Dans le HAVING"
    answer: 1
    explanation: >-
      Une condition sur la table de droite mise dans le `WHERE` élimine les lignes où elle
      est `NULL`, ce qui annule l'effet du LEFT JOIN. Place-la dans le `ON`.
  - prompt: "Quelle est la principale différence entre GROUP BY et une fonction fenêtre (OVER) ?"
    options:
      - "Aucune, OVER est juste une autre syntaxe de GROUP BY"
      - "GROUP BY réduit à une ligne par groupe ; OVER garde toutes les lignes en ajoutant la valeur agrégée"
      - "OVER ne fonctionne qu'avec COUNT"
    answer: 1
    explanation: >-
      `GROUP BY` **réduit** (une ligne par groupe), la fonction fenêtre **enrichit** :
      autant de lignes en sortie qu'en entrée, avec la valeur agrégée ajoutée par ligne.
  - prompt: "Pour un « top 3 par catégorie », quelle approche est correcte ?"
    options:
      - "WHERE ROW_NUMBER() OVER (...) <= 3"
      - "ROW_NUMBER() dans une CTE, puis WHERE rn <= 3 dans la requête externe"
      - "GROUP BY category LIMIT 3"
    answer: 1
    explanation: >-
      On ne peut pas filtrer une fonction fenêtre dans le `WHERE` (elle est calculée
      après). On la calcule dans une CTE (ou sous-requête) puis on filtre `rn <= 3`.
      `LIMIT 3` ne donnerait que 3 lignes au total, pas 3 par catégorie.
  - prompt: "Pourquoi préférer NOT EXISTS à NOT IN avec une sous-requête ?"
    options:
      - "NOT EXISTS est toujours plus rapide"
      - "Si la sous-requête peut renvoyer un NULL, NOT IN ne renvoie aucune ligne ; NOT EXISTS reste correct"
      - "NOT IN n'existe pas en SQL standard"
    answer: 1
    explanation: >-
      Un `NULL` dans la liste rend `NOT IN` toujours `NULL` (donc faux), et la requête ne
      renvoie rien. `NOT EXISTS` n'a pas ce piège.
  - prompt: "Que renvoie `WHERE region = NULL` quand des lignes ont bien region = NULL ?"
    options:
      - "Toutes les lignes où region est NULL"
      - "Aucune ligne — il faut écrire WHERE region IS NULL"
      - "Une erreur de syntaxe"
    answer: 1
    explanation: >-
      Comparer quoi que ce soit à `NULL` avec `=` renvoie `NULL` (ni vrai ni faux), jamais
      `TRUE`. Le moteur filtre uniquement les conditions qui valent `TRUE` : la requête ne
      renvoie donc aucune ligne. La seule syntaxe correcte est `IS NULL`.
  - prompt: "Tu joins orders (1 ligne par commande) à tags (N tags par client). Que risques-tu en faisant SUM(o.amount) après cette jointure ?"
    options:
      - "Rien, SQL déduplique automatiquement"
      - "Un résultat gonflé : chaque amount est compté autant de fois qu'il y a de tags pour le client"
      - "Une erreur : SUM n'est pas autorisé après un JOIN"
    answer: 1
    explanation: >-
      Le fan-out de la jointure 1-N duplique les lignes de gauche. Un `SUM(amount)` additionne
      alors le montant autant de fois qu'il y a de correspondances côté tags. La correction :
      agréger la table « N » dans une CTE/sous-requête avant de joindre.
  - prompt: "COALESCE(a, b, c) renvoie…"
    options:
      - "La somme de a, b et c"
      - "Le premier argument non-NULL parmi a, b, c"
      - "NULL si l'un des arguments est NULL"
    answer: 1
    explanation: >-
      `COALESCE` parcourt ses arguments de gauche à droite et renvoie le premier non-NULL.
      C'est l'outil standard pour remplacer les valeurs manquantes par un défaut
      (`COALESCE(region, 'Inconnue')`).
  - prompt: "Un cumul (running total) avec SUM(amount) OVER (ORDER BY order_date) diffère d'un SUM(amount) GROUP BY parce que…"
    options:
      - "Il ne fonctionne que sur des colonnes de type DATE"
      - "Il renvoie une ligne cumulée par groupe, pas par ligne individuelle"
      - "Il conserve toutes les lignes et ajoute le cumul sur chacune, sans réduire"
    answer: 2
    explanation: >-
      La fonction fenêtre ne réduit pas : autant de lignes en sortie qu'en entrée, chacune
      enrichie du cumul calculé jusqu'à elle-même. Un `GROUP BY` réduirait à une ligne
      par date, perdant le détail commande par commande.
---

Dernière étape : vérifie tes réflexes d'analyste sur l'ensemble du parcours
(interrogation, agrégation, jointures, sous-requêtes/CTE, fenêtres).

> **Suite du cursus —** ce parcours est une brique du cursus
> **parcours-data-analyst** (le hub) ; l'étape suivante côté restitution est
> **parcours-powerbi**.
