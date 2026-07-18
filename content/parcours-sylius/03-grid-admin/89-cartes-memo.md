---
title: "Cartes mémo — Grid et Admin"
type: flashcards
cards:
  - q: |
      Quels sont les quatre blocs principaux d'une déclaration Grid Sylius ?
    a: |
      1. **`driver`** : source de données (ex. `doctrine/orm` + classe entité)
      2. **`fields`** : colonnes affichées (type, label, sortable)
      3. **`filters`** : formulaire de filtrage (string, select, date…)
      4. **`actions`** : boutons de la liste (`main` = au-dessus, `item` = par ligne)
  - q: |
      Comment afficher une colonne avec un rendu HTML entièrement custom dans une Grid Sylius ?
    a: |
      Utiliser le type de colonne `twig` avec l'option `template` :
      ```yaml
      status:
          type: twig
          options:
              template: 'admin/grid/status.html.twig'
      ```
      Dans le template, la variable `data` contient la valeur du champ.
  - q: |
      Comment surcharger le template `Product/_form.html.twig` de l'Admin Sylius sans le réécrire entièrement ?
    a: |
      Créer `templates/bundles/SyliusAdminBundle/Product/_form.html.twig` et utiliser `{% extends '@!SyliusAdmin/Product/_form.html.twig' %}`. Le `!` force Twig à charger l'original du bundle, pas votre surcharge, évitant la récursion infinie.
  - q: |
      Quel événement Symfony permet d'ajouter des entrées dans le menu principal de l'Admin Sylius ?
    a: |
      `sylius.menu.admin.main` — c'est un événement KnpMenu (`MenuBuilderEvent`). On récupère le menu via `$event->getMenu()` et on ajoute des enfants avec `->addChild('slug', ['route' => '...'])->setLabel('...')`.
  - q: |
      Quelle est la différence entre les actions `main` et `item` dans une Grid Sylius ?
    a: |
      Les actions **`main`** apparaissent au-dessus du tableau (ex. bouton « Créer »). Les actions **`item`** apparaissent sur chaque ligne (ex. boutons « Modifier », « Supprimer »). Les deux acceptent des types prédéfinis (`create`, `update`, `delete`) ou des types `links` personnalisés.
  - q: |
      En quoi la personnalisation de l'Admin Sylius diffère-t-elle de SonataAdmin ?
    a: |
      SonataAdmin centralise liste + formulaire + show dans **une classe PHP** (`AdminInterface`). Sylius sépare : la **Grid YAML** pour la liste, le **FormType Symfony** pour le formulaire, les **templates Twig** pour l'affichage. C'est plus léger mais moins centralisé — pas de classe unique à maintenir.
---

Six cartes pour ancrer Grid et Admin avant les quizzes et les modules suivants.
