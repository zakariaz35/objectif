---
title: "Étape 5 — Restituer : insights & dashboard"
type: lesson
---

# Étape 5 — Des chiffres aux insights

Un tableau de nombres n'est **pas** un livrable. La valeur d'un analyste, c'est de
**raconter** ce que disent les données et de **recommander** une action. C'est cette étape
qui impressionne en entretien.

## De la mesure à l'insight

Reprends tes résultats des étapes 3 et 4, et transforme chaque chiffre en **phrase
décidable** :

| Chiffre brut | Insight (ce qu'on en dit) |
|---|---|
| CA total = 260 € | « 260 € de CA sur le trimestre, panier moyen de 43 €. » |
| Furniture = 125 € de CA (48 %) | « Furniture pèse ~48 % du CA : notre locomotive. » |
| Stationery marge = 46 € (60,5 %) | « Mais Stationery dégage la plus grosse **marge** malgré un petit CA : produit rentable à pousser. » |
| CA mensuel 85 → 55 → 120 | « Creux de −35 % en février, fort rebond de +118 % en mars : vérifier la saisonnalité. » |
| South = 85 €, East = 19 € | « South est notre meilleure région (33 % du CA) ; East est sous-performant. » |
| Marge avec remise = 29 % vs sans = 53 % | « Les remises compressent fortement la marge : à cadrer plus strictement. » |
| 2 clients récurrents / 4 | « La moitié de nos clients reviennent, et génèrent 66 % des commandes. » |

> **La règle du « donc » —** un insight contient toujours un *donc* implicite :
> « Stationery marge le mieux **donc** on devrait augmenter sa visibilité. » Si tu ne peux
> pas finir la phrase par une action, ce n'est pas encore un insight.

## Construire le fil narratif

Un dashboard sans histoire est illisible. Voici comment enchaîner les insights pour une
présentation de 5 minutes :

1. **Situation** — « Sur le T1 2024, nous avons réalisé 260 € de CA sur 6 commandes, pour
   une marge brute de 104 € (40 %). »
2. **Tendance** — « Le CA a chuté de 35 % en février puis rebondi de 118 % en mars —
   un profil que nous devons surveiller sur un an pour confirmer une saisonnalité. »
3. **Segment clé** — « Furniture domine le CA (48 %) mais Stationery est nettement plus
   rentable (taux de marge 61 % vs 28 %) : il faut arbitrer entre volume et rentabilité. »
4. **Alerte** — « Les commandes avec remise affichent un taux de marge de 29 % contre 53 %
   sans remise. Une politique de remise plus sélective pourrait récupérer ~10 pts de marge. »
5. **Recommandation** — « Prioriser Stationery dans les actions marketing, revoir le
   barème de remises Furniture, et analyser le potentiel de croissance dans la région East. »

> **À retenir** — KPI = **cartes** en haut (le « combien »). Tendances = **courbes**.
> Comparaisons de catégories = **barres**. Détail = **tableau**. Évite le camembert au-delà
> de 3-4 parts, et bannis la 3D.

## Esquisser le dashboard Power BI

Le dashboard est le support visuel de ces insights. On le construit dans Power BI Desktop
(voir `parcours-powerbi` pour le pas-à-pas). Voici la **maquette** à viser :

```mermaid
flowchart TB
    subgraph Haut["Bandeau KPI (cartes)"]
        K1[CA total]
        K2[Panier moyen]
        K3[Marge totale]
    end
    subgraph Bas["Visuels"]
        V1[Courbe : CA par mois]
        V2[Barres : CA par catégorie]
        V3[Carte/Barres : CA par région]
        V4[Tableau : Top produits]
    end
    Haut --> Bas
```

### Le bon visuel pour la bonne question

| Question métier | Visuel Power BI | KPI / mesure DAX |
|---|---|---|
| Combien on vend ? | **Carte** | `Total Revenue` |
| Quel panier moyen ? | **Carte** | `Avg Basket` |
| Ça évolue comment ? | **Graphique en courbes** | `Revenue` par mois |
| Quelle catégorie ? | **Barres horizontales** | `Revenue` / `Margin` par catégorie |
| Où ça se vend ? | **Carte géographique** ou barres | `Revenue` par région |
| Quels top produits ? | **Tableau** trié | `Revenue` par produit |

> **À retenir** — KPI = **cartes** en haut (le « combien »). Tendances = **courbes**.
> Comparaisons de catégories = **barres**. Détail = **tableau**. Évite le camembert au-delà
> de 3-4 parts, et bannis la 3D.

## Structurer ta mini-présentation

5 slides suffisent pour un portfolio :

1. **Contexte & question** — le brief Vente/Achat (étape 1).
2. **Données & méthode** — les 2 tables, le nettoyage fait (étape 2), les outils.
3. **Résultats** — le dashboard, 2-3 KPI clés.
4. **Insights & reco** — les 2-3 phrases « donc » qui comptent.
5. **Limites & suites** — petit échantillon, pistes d'approfondissement (étape 6).

> **Pour creuser le dashboard —** mesures DAX, modèle en étoile, Power Query : tout est
> dans `parcours-powerbi`. Ce projet est précisément le cas d'usage qu'il illustre.
