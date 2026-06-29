---
title: "Quiz — Modules, exceptions & gestion d'erreurs"
type: quiz
questions:
  - prompt: |
      Quand le bloc finally s'exécute-t-il ?
    options:
      - |
        Seulement si une exception a été levée
      - |
        Seulement si aucune exception n'a été levée
      - |
        Toujours, qu'une exception ait été levée ou non
    answer: 2
    explanation: |
      finally s'exécute dans tous les cas — c'est sa raison d'être : garantir un nettoyage (fermer un fichier, libérer une ressource) quel que soit le déroulement. Le bloc else, lui, ne s'exécute QUE si aucune exception n'a eu lieu.
  - prompt: |
      Comment créer une exception métier personnalisée ?
    options:
      - |
        En héritant de la classe Exception : class MonErreur(Exception): ...
      - |
        En appelant raise "message"
      - |
        En retournant False depuis la fonction
    answer: 0
    explanation: |
      Hériter d'Exception (ou d'une sous-classe adaptée) donne un type d'erreur nommé, qu'on peut lever avec raise et attraper spécifiquement avec except MonErreur.
  - prompt: |
      À quoi sert raise NouvelleErreur(...) from exc ?
    options:
      - |
        À ignorer silencieusement exc
      - |
        À lever une nouvelle exception tout en conservant l'exception d'origine comme cause
      - |
        À convertir exc en avertissement
    answer: 1
    explanation: |
      Le chaînage from exc préserve le contexte : la trace montre l'enchaînement et exc reste accessible via __cause__. On gagne en lisibilité métier sans perdre l'erreur technique d'origine.
---
