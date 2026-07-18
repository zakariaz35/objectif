---
title: "Scrum vs Kanban vs SAFe : une comparaison honnête"
type: lesson
---

## Trois choses de nature différente, pas trois concurrents équivalents

Une confusion très fréquente, y compris chez des seniors expérimentés : traiter Scrum,
Kanban et SAFe comme trois options interchangeables du même menu « agile ». En réalité,
ils ne répondent pas à la même question.

| | Scrum | Kanban | SAFe |
|---|---|---|---|
| Nature | Un cadre (framework) à l'échelle d'**une** équipe | Une méthode de gestion de **flux**, applicable à toute activité | Un cadre de **mise à l'échelle** (scaling), pour coordonner plusieurs équipes/trains |
| Unité de temps | Le Sprint (durée fixe, ≤ 1 mois) | Pas d'itération imposée — flux continu | Le Program Increment (généralement 4-6 Sprints), au-dessus des Sprints des équipes |
| Rôles prescrits | 3 (Product Owner, Scrum Master, Developers) | Aucun rôle prescrit par le Kanban lui-même | De nombreux rôles supplémentaires (Release Train Engineer, Product Management, System Architect...) |
| Ce qu'il régule | Le contenu et le rythme d'un Sprint | Le travail en cours (WIP), pour fluidifier le flux | La coordination et la planification de plusieurs équipes sur un même produit/portefeuille |
| Publié par | Schwaber & Sutherland, Creative Commons | Pas un standard unique déposé (issu du Lean/Toyota, popularisé par David J. Anderson) | Scaled Agile, Inc. (framework commercial, propriétaire) |

## Scrum vs Kanban : pas un contre l'autre, souvent l'un avec l'autre

Scrum.org publie d'ailleurs un guide officiel : **« The Kanban Guide for Scrum Teams »** (*Kanban
Kanban*), signe que ces deux approches ne s'excluent pas : une Scrum Team peut très bien
visualiser son Sprint Backlog sous forme de tableau Kanban (colonnes, limites de travail en
cours) tout en respectant à la lettre les 5 événements et les 3 rôles du Scrum Guide. Ce
qui distingue fondamentalement les deux : Scrum impose un rythme fixe par Sprint, Kanban
optimise un flux continu sans notion d'itération obligatoire.

**Repère utile en entretien** : « Kanban, c'est de Scrum sans les timeboxes » est une
approximation trompeuse — Kanban a sa propre logique (limiter le travail en cours pour
réduire les temps de cycle), pas seulement « Scrum en moins strict ».

## SAFe : une réponse à un problème que le Scrum Guide ne traite pas

Le Scrum Guide est explicite sur son périmètre :

> « La Scrum Team doit être suffisamment petite pour rester réactive... Si les Scrum Teams
> deviennent trop grandes, elles devraient envisager de se réorganiser en plusieurs Scrum
> Teams cohérentes, chacune axée sur le même produit. »

Le Guide **ne dit rien de plus** sur la coordination entre plusieurs Scrum Teams : pas de
mécanisme de synchronisation inter-équipes prescrit. Scrum.org propose sa propre réponse
minimale à ce problème avec **Nexus** (un framework léger de mise à l'échelle, distinct du
Scrum Guide), tandis que **SAFe** propose une réponse beaucoup plus large et prescriptive
(rôles, cadences, niveaux organisationnels supplémentaires), pensée pour de grandes
organisations avec plusieurs dizaines d'équipes.

Un point de vue honnête, à assumer en entretien sans caricature : SAFe résout un vrai
problème (la coordination à grande échelle), mais son niveau de prescription — souvent
critiqué comme allant à l'encontre de l'esprit « volontairement incomplet » de Scrum —
en fait un choix structurant, pas neutre. Le choisir sans discussion, par réflexe
organisationnel, mérite d'être questionné autant que le rejeter par principe.

## À retenir

- Scrum, Kanban et SAFe **ne répondent pas à la même question** : une équipe, un flux, une
  organisation à grande échelle.
- Scrum et Kanban se combinent souvent (Scrum.org publie lui-même *The Kanban Guide for Scrum Teams*) — ce
  n'est pas un choix binaire.
- SAFe répond à un vrai besoin (coordonner de nombreuses équipes) que le Scrum Guide laisse
  volontairement ouvert — mais au prix d'une prescription bien plus lourde, à évaluer
  honnêtement plutôt qu'à adopter ou rejeter par réflexe.
