---
title: "Increment et Definition of Done"
type: lesson
---

## L'Increment : une étape concrète, cumulable

> « Un Increment est une **première étape concrète vers l'Objectif de Produit**. Chaque
> Increment s'ajoute à tous les Increments précédents et fait l'objet d'une vérification
> approfondie, ce qui garantit que tous les Increments fonctionnent ensemble. Afin de
> fournir une valeur, l'Increment doit être **utilisable**. »

> « Plusieurs Increments peuvent être créés durant un Sprint. La somme des Increments est
> présentée lors de la Sprint Review, ce qui permet de démontrer l'utilité de l'empirisme.
> Toutefois, un Increment peut être **livré aux parties prenantes avant la fin du Sprint**.
> La Sprint Review ne doit jamais être considérée comme le seul moment pour délivrer de la
> valeur. »

> « Un travail qui ne remplirait pas les conditions de la Definition of Done **ne peut pas
> être considéré comme un Increment**. »

Point clé : « Increment » n'est pas un synonyme flou de « ce qu'on a codé ce Sprint » — un
travail qui ne satisfait pas la Definition of Done n'a, par définition, jamais atteint le
statut d'Increment.

## La Definition of Done

> « La Definition of Done (Définition de Fini) est une **description formelle de l'état de
> l'Increment** lorsqu'il satisfait les mesures de qualité requises pour le produit. »
>
> « Dès qu'un élément du Product Backlog satisfait à la Definition of Done, il se
> transforme en Increment. »
>
> « La Definition of Done apporte de la transparence en permettant à chacun une
> compréhension commune du travail Fini dans le cadre de l'Increment. **Si un élément du
> Product Backlog n'est pas conforme à la Definition of Done, il ne peut pas être publié ni
> même présenté lors de la Sprint Review.** Il est alors renvoyé au Product Backlog pour
> être pris en compte ultérieurement. »

**Piège d'examen très fréquent** : un item « presque fini à 90 % » ne peut **pas** être
présenté à la Sprint Review comme s'il comptait comme un Increment partiel. Soit il
respecte intégralement la Definition of Done, soit il retourne au Product Backlog — il n'y
a pas d'état intermédiaire reconnu par le Guide.

## Qui définit et qui doit s'y conformer

> « Si la Definition of Done pour un Increment fait partie des standards de
> l'organisation, toutes les Scrum Teams doivent la suivre au minimum. Si cela ne fait pas
> partie des standards de l'organisation, la Scrum Team doit créer sa propre Definition of
> Done qui soit appropriée pour le produit. »
>
> « Les Developers sont tenus de se conformer à la Definition of Done. Si plusieurs Scrum
> Teams travaillent ensemble sur un même produit, elles doivent la définir ensemble et s'y
> conformer. »

Ordre de priorité clair : un standard organisationnel, s'il existe, s'applique comme
**plancher minimal** — la Scrum Team peut toujours l'exiger plus strict, jamais moins.

## Tableau récapitulatif des 3 engagements

| Artefact | Engagement | Ce qu'il garantit |
|---|---|---|
| Product Backlog | Objectif de Produit | La direction à long terme, un seul objectif à la fois |
| Sprint Backlog | Objectif de Sprint | La cohérence du travail du Sprint, protégée des changements de cap |
| Increment | Definition of Done | Une compréhension commune et objective du « fini » |

## Anti-pattern réel

Une équipe qui présente en Sprint Review un item « à 80 % » en disant « il ne manque que
les tests, on considère que c'est fait pour ce Sprint » — c'est précisément ce que le Guide
interdit : sans Definition of Done complète, ce n'est pas un Increment, et ça ne se présente
pas à la Sprint Review comme tel. Autre variante fréquente : une Definition of Done qui
exclut silencieusement les tests automatisés ou la revue de code « pour aller plus vite » —
ce qui dégrade la garantie de qualité que cet engagement est censé apporter.

## À retenir

- Un travail ne devient **Increment** que s'il satisfait **intégralement** la Definition of
  Done — pas d'état « presque fini ».
- La Sprint Review n'est **jamais** l'unique canal de livraison de valeur : un Increment
  peut être livré avant la fin du Sprint.
- La Definition of Done organisationnelle, si elle existe, est un **plancher minimal** ; la
  Scrum Team peut l'exiger plus stricte, jamais moins.
