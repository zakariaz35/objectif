---
title: "Cartes mémo — Prompt engineering & structured output"
type: flashcards
cards:
  - q: |
      Pourquoi demander « réponds uniquement en JSON » dans le prompt ne **garantit** pas
      un JSON valide, même bien formulé ?
    a: |
      Parce que c'est un mécanisme purement probabiliste : le modèle peut toujours
      produire un JSON syntaxiquement invalide, omettre un champ, ou mélanger les types.
      Seul `output_config: {format: {type: "json_schema", schema}}` garantit la
      conformité via un décodage contraint côté serveur.
  - q: |
      Quelles sont les deux exigences structurelles d'un schéma pour que `strict: true`
      fonctionne pleinement sur un outil ?
    a: |
      `additionalProperties: false` sur chaque objet du schéma, et une liste `required`
      explicite des champs obligatoires.
  - q: |
      Le schéma d'un outil impose `minimum: 18` sur un champ `age`, et le modèle renvoie
      `age: 15` (un entier valide, mais hors contrainte). `strict: true` aurait-il dû
      empêcher cette valeur ?
    a: |
      **Non.** Les contraintes numériques/longueur (`minimum`, `maximum`, `minLength`,
      `maxLength`, `pattern`) ne sont pas appliquées par le décodage contraint : il faut
      les valider **côté client** après réception, comme toute règle métier.
  - q: |
      Une règle métier persistante (« ne jamais révéler le prix interne ») est placée
      dans le message utilisateur du premier tour d'une longue conversation. Quel est le
      risque, et la correction structurelle ?
    a: |
      Le message utilisateur n'a pas la même autorité persistante qu'une instruction
      système et peut se diluer sur une conversation longue. La correction : déplacer la
      règle dans le **system prompt**, présent à chaque tour avec l'autorité de
      l'opérateur.
  - q: |
      Que se passe-t-il si on envoie un préfill de réponse assistant sur le dernier tour
      à un modèle récent comme `claude-opus-4-8` ?
    a: |
      La requête est **rejetée avec une erreur 400** : le préfill sur le dernier tour
      n'est plus supporté depuis Claude 4.6. La technique est remplacée par les
      structured outputs pour le format, ou une instruction système pour éliminer un
      préambule.
  - q: |
      Un pipeline draft → critique → version finale est proposé pour extraire 3 champs
      simples d'un court texte. Est-ce justifié ?
    a: |
      **Non.** Le multi-pass se justifie pour des tâches complexes à fort enjeu où la
      qualité prime sur le coût. Une extraction simple et déterministe est déjà couverte
      par un appel unique avec un schéma structuré — un pipeline multi-pass n'ajoute que
      du coût et de la latence sans bénéfice.
---

Lis, réfléchis, révèle, auto-évalue.
