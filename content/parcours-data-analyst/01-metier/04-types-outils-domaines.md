---
title: "Types de données, outils et domaines"
type: lesson
---

# Types de données, outils, domaines

## Les types de données qu'on manipule

| Type | Exemple | Piège fréquent |
|---|---|---|
| Numérique | `amount = 120.50` | virgule vs point décimal |
| Texte / catégorie | `category = 'Office'` | espaces, casse, fautes |
| Date / heure | `order_date = 2024-01-15` | format `JJ/MM/AAAA` mal interprété |
| Booléen | `is_returned = true` | stocké en `0/1` ou `Oui/Non` |
| Identifiant | `order_id = 1` | numérique ≠ à sommer ! |

> **Repère —** un identifiant numérique (`order_id`, code client) ne se **somme jamais**.
> C'est une dimension déguisée en nombre.

## Les outils du marché et où chacun sert

```mermaid
flowchart LR
    Sources["Bases SQL\nFichiers / API"] --> SQL["SQL\nextraire / agréger"]
    Sources --> Excel["Excel\nexplorer / TCD"]
    SQL --> BI["Power BI\nmodéliser / dashboard"]
    Excel --> BI
    SQL --> Py["Python / pandas\nautomatiser / data avancée"]
```

- **Excel** : exploration rapide, petits volumes, TCD, prototypes. Incontournable, demandé
  partout.
- **SQL** : extraire et agréger depuis la base. La compétence socle du métier.
- **Power BI** (ou Tableau) : modéliser, créer des **dashboards** interactifs partagés.
- **Python / pandas** : automatiser, traiter de gros volumes, aller vers le ML. Voir le
  parcours **`parcours-python`** (la jambe pandas) dans le catalogue.

## Panorama des domaines

Le même savoir-faire s'applique partout — seuls les KPI changent :

- **Vente / Achat** : chiffre d'affaires, marge, panier moyen, saisonnalité.
- **Logistique** : taux de rupture, délai de livraison, rotation de stock.
- **RH** : turnover, absentéisme, masse salariale.
- **Finance** : DSO (délai de paiement), budget vs réel, trésorerie.

> **À retenir —** tu apprends une **méthode** (filtrer/grouper/agréger/comparer), pas un
> domaine. Choisis-en un pour ton portfolio (ici : Vente/Achat) afin de parler « métier »
> en entretien.
