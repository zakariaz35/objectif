---
title: "Snow Family : quand la migration passe par la poste"
type: lesson
---

# Transférer des données quand le réseau n'est plus la meilleure option

Migrer plusieurs téraoctets (voire pétaoctets) de données vers AWS via une connexion réseau classique peut prendre des **semaines**, voire des mois — et parfois, la connectivité disponible sur site est tout simplement trop faible ou inexistante. La **Snow Family** propose des appareils physiques qu'AWS **expédie chez toi**, que tu remplis sur place, puis que tu **renvoies par transporteur** pour un import direct dans AWS.

## Le repère de décision : le réseau ou la poste ?

```mermaid
flowchart TD
    Q{"Combien de temps prendrait<br/>le transfert via le réseau disponible ?"}
    Q -->|"Quelques heures/jours,<br/>bande passante suffisante"| Net["Transfert réseau classique<br/>(DataSync, Transfer Family...)"]
    Q -->|"Plusieurs semaines, voire mois<br/>(gros volume, réseau limité<br/>ou site déconnecté)"| Snow["Snow Family"]
```

> **Règle de pouce à retenir** — au-delà d'un volume de données qui prendrait environ **plus d'une semaine** à transférer avec la bande passante réellement disponible sur site, le transport physique devient plus rapide **et** souvent moins cher qu'une saturation prolongée du lien réseau.

## Les trois appareils

| Appareil | Volumétrie (ordre de grandeur) | Particularité |
|---|---|---|
| **AWS Snowcone** | Quelques To (le plus petit, portable) | Le plus compact ; peut aussi faire tourner du **calcul en périphérie** (edge computing) ; peut renvoyer les données soit physiquement, soit via **DataSync** sur le réseau si la connectivité redevient suffisante |
| **AWS Snowball Edge** | Dizaines de To par appareil (empilable — plusieurs appareils pour un plus gros volume) | Existe en variante **Storage Optimized** (volumétrie maximale) et **Compute Optimized** (avec option GPU, pour du traitement/inférence ML en périphérie, déconnecté) |
| **AWS Snowmobile** | Échelle de l'**exaoctet** — un conteneur de transport entier | Réservé aux migrations les plus massives (data centers entiers), cas d'usage rare mais à connaître pour l'existence du service |

> 🎯 **Piège d'examen —** un scénario qui décrit un site **totalement déconnecté ou avec un lien réseau très limité**, devant migrer un **très gros volume** de données vers AWS en un temps raisonnable, élimine les solutions réseau classiques (DataSync, Transfer Family, câble internet) → la réponse attendue est un appareil **Snow Family**, dimensionné selon le volume (Snowcone pour un petit volume ou du edge computing léger, Snowball Edge pour un volume moyen/gros ou du calcul en périphérie, Snowmobile pour une migration à l'échelle d'un data center entier).

## À retenir

- Snow Family = migration **physique** par transport, pertinente quand le transfert réseau prendrait trop de temps (ordre de grandeur : plus d'une semaine).
- Snowcone (petit, portable, edge computing léger) < Snowball Edge (dizaines de To, option Compute/GPU) < Snowmobile (échelle de l'exaoctet, data center entier).
- Snowcone peut aussi renvoyer les données via le réseau (DataSync) si la connectivité redevient suffisante entre-temps.
