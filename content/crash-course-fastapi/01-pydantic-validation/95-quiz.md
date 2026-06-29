---
title: "Quiz — Pydantic v2 — validation croisée"
type: quiz
questions:
  - prompt: |
      À quoi sert extra="forbid" sur ConfigDict ?
    options:
      - |
        À forcer les valeurs par défaut
      - |
        À refuser les champs inconnus dans le payload JSON
      - |
        À interdire les types numériques
    answer: 1
    explanation: |
      Sans cette config, Pydantic ignore silencieusement les champs non déclarés. Avec extra="forbid", un payload {"siret":"...", "foo":"bar"} retourne une 422 (extra_forbidden) sur foo. C'est une protection contre les fautes de frappe côté client et les tentatives de mass-assignment.
  - prompt: |
      Pourquoi mode="after" dans @model_validator ?
    options:
      - |
        Pour que le validator s'exécute après le commit DB
      - |
        Pour qu'il s'exécute après la validation des champs individuels
      - |
        C'est l'équivalent de @post_init
    answer: 1
    explanation: |
      Pydantic propose deux modes : "before" reçoit le dict brut (avant typage), "after" reçoit l'instance déjà validée par champ. Pour une contrainte croisée (XOR siret/siren), on a besoin des champs déjà parsés/typés → "after".
  - prompt: |
      Le retour -> Self du validator, c'est obligatoire ?
    options:
      - |
        Oui — le validator after doit retourner l'instance (potentiellement modifiée)
      - |
        Non, on peut renvoyer None
      - |
        Non, seul bool est attendu
    answer: 0
    explanation: |
      Le mode after peut modifier l'instance (assigner un champ calculé, normaliser une valeur). Pydantic prend la valeur retournée comme résultat final → si tu oublies return self, le modèle devient None. Mypy strict (utilisé sur ce projet) le détecte via l'annotation de retour.
  - prompt: |
      Pourquoi la règle XOR siren/siret ne peut-elle PAS être un field_validator ?
    options:
      - |
        Parce qu'un field_validator ne peut pas lever d'exception
      - |
        Parce que lors de la validation de siren, la valeur de siret n'est pas encore connue
      - |
        Parce que field_validator ne supporte pas les str | None
    answer: 1
    explanation: |
      Un field_validator ne voit que la valeur du champ qu'il valide. La règle XOR a besoin des DEUX champs simultanément → il faut un model_validator(mode="after"), qui s'exécute une fois tous les champs remplis.
---
