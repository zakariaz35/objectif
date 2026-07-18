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
      Ex. : produit A — CA 100 k€, marge 5 % = **5 k€**. Produit B — CA 30 k€, marge
      40 % = **12 k€**. B rapporte plus malgré un CA bien inférieur.
  - q: |
      Pour le **panier moyen**, quel est le piège de granularité ?
    a: |
      Le dénominateur doit être le nombre de **commandes distinctes** (`orderId` uniques),
      pas le nombre de **lignes**. Sinon une commande multi-lignes est comptée plusieurs
      fois. Ex. : 3 lignes, 2 orderId distincts, CA = 150 € → panier = **75 €**
      (et non 50 €).
  - q: |
      Pourquoi le **turnover** RH se calcule-t-il sur l'**effectif moyen** ?
    a: |
      Parce que l'effectif varie sur la période. L'effectif moyen
      `(début + fin) / 2` évite de sur/sous-évaluer le taux par rapport à un instantané.
      Ex. : 190 → 210 salariés, 24 départs → effectif moyen = 200 → turnover = **12 %**.
  - q: |
      Que mesure le **DSO** et que signifie un DSO qui augmente ?
    a: |
      Le **délai moyen de paiement** des clients (`créances / CA × jours`). Un DSO qui
      grimpe = l'argent rentre plus lentement → **trésorerie sous tension**.
      Ex. : créances 45 k€, CA trimestriel 300 k€ → DSO = `45/300 × 90 = **13,5 j**`.
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
  - q: |
      Donne la formule de la **rotation de stock** (inventory turnover) et interprète une
      rotation de 6× annuelle.
    a: |
      `turnover = coût des ventes (COGS) / stock moyen` (stock moyen = (début + fin) / 2).
      Rotation **6×** = le stock se renouvelle 6 fois par an, soit ~toutes les 2 mois.
      C'est généralement sain : le capital ne dort pas trop longtemps en entrepôt.
  - q: |
      Comment suit-on la **saisonnalité** des ventes sans se faire piéger par l'effet de
      saison dans la comparaison mensuelle ?
    a: |
      On utilise la comparaison **YoY** (Year-over-Year) : même mois N-1. Elle neutralise
      l'effet de saison. Le **MoM** (Month-over-Month) est utile pour détecter une
      rupture, mais une hausse en décembre est attendue — comparer à décembre N-1.
---

Réflexe entretien : être capable de **donner la formule** et **le piège** de chaque KPI.
