---
title: "Quiz — Grid et Admin"
type: quiz
questions:
  - prompt: |
      Dans une Grid Sylius, où déclare-t-on les boutons qui apparaissent **au-dessus** du tableau (ex. « Créer ») ?
    options:
      - "Dans `actions: item:`"
      - "Dans `actions: bulk:`"
      - "Dans `actions: main:`"
      - "Dans `fields: actions:`"
    answer: 2
    tags: [grid]
    level: débutant
    explanation: |
      Les actions `main` apparaissent au-dessus du tableau et concernent la liste globale (ex. « Créer un livre »). Les actions `item` apparaissent sur chaque ligne (ex. « Modifier », « Supprimer »). Les actions `bulk` s'appliquent aux lignes sélectionnées via checkbox.
  - prompt: |
      Quel type de colonne Grid faut-il utiliser pour afficher une **pastille colorée** basée sur la valeur d'un champ ?
    options:
      - "`type: string`"
      - "`type: badge`"
      - "`type: twig`"
      - "`type: html`"
    answer: 2
    tags: [grid, colonnes]
    level: débutant
    explanation: |
      `type: twig` permet de déléguer le rendu à un template Twig via l'option `template`. C'est le type le plus flexible : la variable `data` reçoit la valeur du champ. `type: badge` et `type: html` n'existent pas dans SyliusGridBundle.
  - prompt: |
      Pour surcharger le template `Order/show.html.twig` de `SyliusAdminBundle`, où placer votre fichier ?
    options:
      - "`templates/admin/Order/show.html.twig`"
      - "`templates/bundles/SyliusAdminBundle/Order/show.html.twig`"
      - "`templates/sylius/admin/Order/show.html.twig`"
      - "`templates/override/SyliusAdminBundle/Order/show.html.twig`"
    answer: 1
    tags: [admin, templates]
    level: débutant
    explanation: |
      La convention Symfony pour surcharger les templates d'un Bundle est `templates/bundles/<BundleName>/<chemin>`. Pour `SyliusAdminBundle`, le dossier cible est `templates/bundles/SyliusAdminBundle/Order/show.html.twig`.
  - prompt: |
      Dans un template Twig qui surcharge `@SyliusAdmin/Product/_form.html.twig`, comment inclure le contenu **original** du bloc `content` sans récursion ?
    options:
      - "`{% include '@SyliusAdmin/Product/_form.html.twig' %}`"
      - "`{{ parent() }}` dans le bloc, après `{% extends '@!SyliusAdmin/Product/_form.html.twig' %}`"
      - "`{% use '@SyliusAdmin/Product/_form.html.twig' with content as original_content %}`"
      - "C'est impossible : on doit tout réécrire"
    answer: 1
    tags: [admin, templates, twig]
    level: intermédiaire
    explanation: |
      La syntaxe `@!BundleName/` (avec `!`) force Twig à chercher le template dans le Bundle d'origine, pas dans votre dossier de surcharge. On peut donc `{% extends '@!SyliusAdmin/Product/_form.html.twig' %}` et appeler `{{ parent() }}` dans les blocs pour combiner l'original et vos ajouts.
  - prompt: |
      Quel service PHP est injecté dans un listener d'événement de menu pour construire l'arbre de navigation Admin ?
    options:
      - "`Sylius\\Bundle\\AdminBundle\\Menu\\AdminMenuBuilder`"
      - "`Knp\\Menu\\FactoryInterface`"
      - "L'événement lui-même via `$event->getMenu()` (type `Knp\\Menu\\ItemInterface`)"
      - "`Symfony\\Component\\Routing\\RouterInterface`"
    answer: 2
    tags: [admin, menu, knpmenu]
    level: avancé
    explanation: |
      Dans le listener de `sylius.menu.admin.main`, on récupère le menu via `$event->getMenu()` qui retourne un `Knp\Menu\ItemInterface`. On appelle `addChild()` dessus pour ajouter des entrées. `KnpMenu` est la bibliothèque de menu utilisée par Sylius Admin. Pas besoin d'injecter le `FactoryInterface` séparément si on travaille sur l'arbre existant.
---

Cinq questions pour valider la maîtrise de SyliusGridBundle et des personnalisations de l'interface Admin.
