---
title: "À toi de jouer — ton projet portfolio"
type: lesson
---

# À toi de jouer

Tu as un projet complet : brief, dataset nettoyé, KPI, jointure, marge, dashboard. C'est
**déjà** un livrable de portfolio. Maintenant, **fais-le tien** et étoffe-le pour qu'il te
distingue en entretien.

## Questions ouvertes à explorer

Du plus simple au plus ambitieux. Chaque piste = une analyse de plus à montrer, et tu peux
réutiliser tes fonctions TS des étapes 3-4 ou les rejouer en SQL/pandas.

- **Saisonnalité** : `monthlyRevenue` montre un creux en février. Sur un an de données,
  y a-t-il un motif récurrent ? (groupe par mois sur plusieurs années)
- **Clients récurrents** : combien de clients ont passé plus d'une commande ? Quelle part
  du CA font les clients fidèles ? (group by `customer_id`, compte les commandes)
- **Effet des remises sur la marge** : les commandes avec `discount > 0` rapportent-elles
  encore une marge correcte ? Compare la marge moyenne avec et sans remise.
- **CA par région** : quelle région performe le mieux ? (group by `region`, comme par
  catégorie)
- **Segmentation produits** : croise CA et marge — repère les produits « forts CA / faible
  marge » vs « petit CA / forte marge » (comme Stationery). Une matrice à 4 cases.
- **Aller plus loin** : ajoute des colonnes (canal de vente, vendeur), ou un budget mensuel
  à comparer au réalisé (écart au budget — un grand classique en BI).

## Checklist : ce projet sur ton CV & GitHub

- [ ] **README** clair : le contexte (Vente/Achat), la question, les outils, une capture
      du dashboard.
- [ ] **Données** : le dataset (ou un échantillon) versionné dans le repo.
- [ ] **Code** : le notebook de nettoyage/analyse (pandas) et/ou les requêtes SQL,
      commentés.
- [ ] **Dashboard** : le fichier Power BI (`.pbix`) + des captures dans le README.
- [ ] **Insights** : 3 phrases « donc » dans le README — ce que tu recommanderais.
- [ ] **Reproductible** : quelqu'un peut cloner et relancer ton analyse.
- [ ] Sur le **CV** : une ligne « Projet d'analyse des ventes — Python/SQL/Power BI :
      nettoyage, KPI de CA & marge, dashboard et recommandations. »

> **À retenir** — Un recruteur ne lit pas ton code en premier : il regarde ton **README**
> et ton **dashboard**, et il écoute ton **histoire**. Soigne la restitution autant que
> l'analyse.

> **Pas d'inspiration ?** Refais ce projet avec un **autre dataset** public (ventes
> e-commerce, locations de vélos, films) : la méthode est identique, et un second projet
> prouve que tu sais reproduire la démarche. Reviens au hub `parcours-data-analyst` pour
> situer cette brique dans ton parcours global.
