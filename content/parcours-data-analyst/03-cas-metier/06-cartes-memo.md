---
title: "Cartes mémo — KPI par domaine"
type: flashcards
cards:
  - q: |
      Comment calcule-t-on la **marge brute** en %, et pourquoi est-elle plus parlante que
      le seul CA ?
    a: |
      `(revenue − cost) / revenue × 100`. Elle mesure la **rentabilité** : un gros CA à
      faible marge peut rapporter moins qu'un CA modeste à forte marge.
  - q: |
      Pour le **panier moyen**, quel est le piège de granularité ?
    a: |
      Le dénominateur doit être le nombre de **commandes distinctes** (`orderId` uniques),
      pas le nombre de **lignes**. Sinon une commande multi-lignes est comptée plusieurs
      fois.
  - q: |
      Pourquoi le **turnover** RH se calcule-t-il sur l'**effectif moyen** ?
    a: |
      Parce que l'effectif varie sur la période. L'effectif moyen
      `(début + fin) / 2` évite de sur/sous-évaluer le taux par rapport à un instantané.
  - q: |
      Que mesure le **DSO** et que signifie un DSO qui augmente ?
    a: |
      Le **délai moyen de paiement** des clients (`créances / CA × jours`). Un DSO qui
      grimpe = l'argent rentre plus lentement → **trésorerie sous tension**.
  - q: |
      Un écart **budget vs réel** est positif (réel > budget). Est-ce bon ou mauvais ?
    a: |
      Ça dépend du sens : sur des **coûts**, c'est un dépassement (mauvais) ; sur des
      **revenus**, c'est une surperformance (bon). Toujours préciser revenus ou coûts.
  - q: |
      En logistique, pourquoi une **rotation de stock** très haute n'est pas que positive ?
    a: |
      Elle libère du capital, mais une rotation trop haute augmente le **risque de
      rupture**. Disponibilité, vitesse et capital sont un **arbitrage**.
---

Réflexe entretien : être capable de **donner la formule** et **le piège** de chaque KPI.
