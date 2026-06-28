---
title: "Projet : on analyse un fichier de ventes"
type: lesson
---

# Projet fil rouge : une analyse de ventes

Place à la pratique. On enchaîne tout le parcours sur un cas réaliste de Data-Analyst : **charger un CSV de ventes → le nettoyer → calculer des KPI → conclure**. C'est le type de mission qu'on te confiera en BI.

> **Comment suivre —** chaque étape est en mode **reveal** : on pose la question, tu réfléchis (ou tu codes dans ton éditeur local), puis tu déroules la correction commentée. Python ne tourne pas encore dans la plateforme (un runner Pyodide est prévu) — mais le code est écrit pour être **copié-collé** dans un notebook ou un script `.py`.

## Le jeu de données : `sales.csv`

Un petit extrait de ventes simulées (deux mois, quelques produits) :

```
date,product,category,quantity,amount
2024-01-05,notebook,office, 2 ,39.98
2024-01-08,Lamp,home,1,34.00
2024-01-12,pen,office,10,25.00
2024-01-20,desk,home,1,149.00
2024-02-03,notebook,office,5,99.95
2024-02-10,lamp,Home,3,102.00
2024-02-15,pen,office,,12.50
2024-02-28,desk,home,1,149.00
```

> **Repère —** ce fichier est volontairement « sale » : casse incohérente (`Lamp`, `Home`), espaces parasites (` 2 `), une `quantity` manquante. C'est le quotidien : **les vraies données ne sont jamais propres**.

## Le plan

```mermaid
flowchart LR
    A[01 — charger] --> B[02 — nettoyer]
    B --> C[03 — KPI globaux]
    C --> D[04 — top produits & CA par mois]
    D --> E[05 — conclure / rapport]
    E --> F[06 — à toi de jouer]
```

1. **Charger** le CSV avec pandas et l'inspecter
2. **Nettoyer** : casse, espaces, valeur manquante, types
3. **KPI globaux** : CA total, nombre de commandes, panier moyen
4. **Top produits** et **CA par mois**
5. **Conclure** : un petit rapport texte
6. **À toi de jouer** : étendre l'analyse

C'est parti.
