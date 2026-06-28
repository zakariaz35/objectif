---
title: "Checklist d'un bon dashboard"
type: lesson
---

# La revue avant livraison

Avant de publier, passe ton rapport au crible. Cette checklist condense tout le parcours : données, modèle, calculs, visuels, partage. C'est aussi un excellent support pour parler de ton travail **en entretien**.

## Données (module 2)

- [ ] Les **types** de colonnes sont corrects (`order_date` en Date, `amount` en décimal).
- [ ] Doublons supprimés, totaux parasites retirés, texte normalisé (Trim, casse).
- [ ] Le nettoyage est **dans Power Query** (pas bricolé dans les visuels), donc rejoué au rafraîchissement.

## Modèle (module 3)

- [ ] Schéma en **étoile** : fait au centre, dimensions autour.
- [ ] Relations **1-\*** dans le bon sens (dimension → fait).
- [ ] Une **table de dates** dédiée, continue, **marquée comme table de dates**.
- [ ] Granularité du fait connue et adaptée au besoin.

## Calculs (module 4)

- [ ] Indicateurs en **mesures** (pas en colonnes calculées inutiles).
- [ ] Mesures **nommées** clairement et **décomposées** (réutilisables).
- [ ] `DIVIDE` pour tous les ratios (pas de `/` nu).
- [ ] Les variations (MoM, YoY, YTD) reposent bien sur la table de dates.

## Visuels & message (modules 1 & 5)

- [ ] Chaque visuel répond à **une** question ; le bon type selon le message.
- [ ] **Pas** d'axe tronqué sur des barres, **pas** de camembert illisible, **pas** de 3D.
- [ ] Titres **parlants** (le message, pas l'axe).
- [ ] KPI en haut, détail en bas ; mise en page alignée, couleurs sobres.
- [ ] Slicers utiles, interactivité testée, drill-down si pertinent.
- [ ] ≈ 5-7 visuels max par page.

## Partage (module 5)

- [ ] Publié dans le bon **workspace**, permissions définies.
- [ ] **Rafraîchissement planifié** configuré.
- [ ] Relu sur un autre écran / mobile pour vérifier la lisibilité.

> **À retenir —** Un bon dashboard n'est pas le plus joli : c'est celui dont les **données sont propres**, le **modèle sain**, les **mesures justes**, le **message clair** et le **partage maîtrisé**. Garde cette checklist sous la main.
