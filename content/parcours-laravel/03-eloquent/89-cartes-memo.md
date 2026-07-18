---
title: "Cartes mémo — Eloquent ORM"
type: flashcards
cards:
  - q: |
      Quelle est la différence fondamentale entre Active Record (Eloquent) et
      Data Mapper (Doctrine) ?
    a: |
      **Active Record** : le modèle **connaît** la base de données. `Invoice::create()`,
      `$invoice->save()`, `Invoice::where(...)` — le modèle est à la fois l'entité et
      le repository.

      **Data Mapper** : l'entité est un POPO ignorant tout de la DB. C'est
      l'`EntityManager` qui gère la persistance via `persist()` / `flush()`. Couplage
      plus faible, plus de boilerplate.
  - q: |
      Comment éviter le problème N+1 en Eloquent ? Donnez l'équivalent Doctrine.
    a: |
      **Eloquent** : `Invoice::with('client')->get()` — eager loading en 2 requêtes.

      **Doctrine** : `JOIN FETCH c IN i.client` en DQL, ou `->leftJoinWith('i.client')`
      dans le QueryBuilder.

      Le piège est le même dans les deux ORM : sans chargement explicite, chaque accès
      à une relation déclenche une requête séparée.
  - q: |
      À quoi sert `$fillable` dans un modèle Eloquent ? Quel est l'équivalent dans le
      contexte Symfony ?
    a: |
      `$fillable` est une **liste blanche** des champs pouvant être passés à
      `Model::create()` ou `fill()`. Il protège contre la sur-attribution (mass
      assignment) : un champ non listé est ignoré même s'il est dans le tableau.

      En Symfony, cette protection est gérée par le composant Security + formulaires :
      un champ non déclaré dans le Form n'atteint pas l'entité.
  - q: |
      Qu'est-ce qu'un Scope Eloquent et à quoi remplace-t-il ?
    a: |
      Un Local Scope est une méthode `scopeXxx(Builder $query): Builder` sur le modèle,
      qui ajoute des contraintes réutilisables au QueryBuilder. `Invoice::pending()` appelle
      `scopePending()`.

      Il remplace les méthodes de **Repository Symfony** (`findPending()`,
      `findByClientAndStatus()`, etc.) en évitant de créer une classe dédiée pour chaque
      requête courante.
  - q: |
      Quelle est la différence entre `Invoice::factory()->create()` et `->make()` ?
    a: |
      `create()` : persiste l'objet en base de données (INSERT). Nécessite une connexion DB.

      `make()` : instancie l'objet en mémoire sans INSERT. Utile pour les tests unitaires
      qui ne doivent pas toucher la base.
