---
title: "À toi de jouer — étends l'analyse"
type: lesson
---

# À toi de jouer

Tu as un pipeline complet : charger → nettoyer → KPI → analyses → rapport. Maintenant, **fais-le tien**. Reprends le script de l'étape 5 dans un notebook ou un fichier `.py`, et ajoute des analyses.

## Idées d'extensions (du plus simple au plus ambitieux)

- **Prix unitaire moyen** : ajoute `df["unit_price"] = df["amount"] / df["quantity"]`, puis le prix unitaire moyen par produit.
- **Catégorie la plus rentable** : compare CA et nombre de commandes par catégorie ; laquelle a le meilleur panier moyen ?
- **Croissance mensuelle** : calcule la variation de CA entre janvier et février (en € et en %).
- **Détecter une anomalie** : repère les commandes dont le montant s'écarte fortement de la moyenne (ex. `amount > mean + 2 * std`).
- **Enrichir par une table externe** : crée un petit DataFrame `{product, supplier}` et fais un `merge` pour analyser le CA **par fournisseur**.
- **Visualiser** (si tu as `matplotlib`) :

  ```python
  revenue_by_month.plot(kind="bar", title="Revenue by month")
  ```

- **Généraliser** : transforme le script en fonctions (`load`, `clean`, `report`) pour le réutiliser sur n'importe quel fichier de ventes.

## Va plus loin sur tes propres données

> **Pas d'idée ?** Récupère un vrai CSV ouvert (ventes, transports, météo, open data d'une
> collectivité…) et applique le même pipeline : **inspecter → nettoyer → grouper →
> interpréter**. C'est exactement la démarche d'un Data-Analyst, et c'est en l'appliquant
> sur des données réelles que tout ce parcours prend son sens.

## La suite du cursus

Tu maîtrises maintenant Python et les fondations de pandas. Les prochaines briques d'un parcours Data-Analyst : **visualisation** (matplotlib / seaborn), **SQL**, **statistiques** et **dataviz / BI** (tableaux de bord). Tu as désormais le socle pour les aborder sereinement.

> **Bravo —** tu es passé(e) d'un refresher Python à une vraie analyse de bout en bout. La régularité fait le reste : refais ce projet sur d'autres jeux de données.
