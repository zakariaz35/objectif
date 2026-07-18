---
title: "Les certifications Anthropic & la logistique"
type: lesson
---

# Quatre certifications, deux angles

## Le paysage des certifications Anthropic

Anthropic distingue deux axes qu'il ne faut pas mélanger : trois **rôles** (Associate, Developer, Architect) et deux **niveaux** (Foundations, puis Professional — pour l'instant réservé au rôle Architect). Cela donne quatre certifications :

| Certification (nom exact) | Rôle | Niveau | Tarif (USD) | Angle |
|---|---|---|---|---|
| **Claude Certified Associate – Foundations** | Associate | Foundations | 99 $ | Généraliste, premiers usages de Claude : utilisation courante, pas de code requis |
| **Claude Certified Developer – Foundations (CCDV-F)** | Developer | Foundations | 125 $ | **Implémenter** : intégrer l'API, construire des outils, gérer le contexte et la fiabilité en production |
| **Claude Certified Architect – Foundations (CCA-F)** | Architect | Foundations | 125 $ | **Concevoir** : choisir entre les approches (RAG vs long contexte, agent vs workflow, quel modèle pour quel cas d'usage), poser les garde-fous d'un système |
| **Claude Certified Architect – Professional** | Architect | Professional | 175 $ | Approfondissement du niveau Foundations, sur des cas plus complexes |

Ces tarifs sont ceux affichés avant remise de partenaire ; les partenaires **Select/Preferred/Global Premier** du Claude Partner Network bénéficient d'une remise de **50 à 100 %** selon leur palier (vérifie ton palier avant de payer).

## CCDV-F vs CCA-F : mêmes domaines, angle différent

Cette formation prépare aux deux niveaux **Foundations** (CCDV-F et CCA-F), qui couvrent **les mêmes cinq domaines** — architecture agentique, configuration Claude Code, prompt engineering, outils/MCP, gestion du contexte — mais interrogent sur eux avec un **angle** différent :

| | CCDV-F (Developer) | CCA-F (Architect) |
|---|---|---|
| Question type | « Comment implémenter X avec l'API ? » (quel paramètre, quel appel, quel format) | « Quelle approche choisir pour ce système, et pourquoi ? » (quel compromis, quelle architecture) |
| Exemple sur le prompt caching | Où placer `cache_control` pour que ce breakpoint précis fonctionne | Est-ce que ce système a besoin de prompt caching, de RAG, ou des deux, compte tenu de son volume et de sa fraîcheur |
| Exemple sur les agents | Comment structurer la boucle `tool_use` → `tool_result` | Ce cas d'usage justifie-t-il un agent, ou un simple appel suffit-il |

> 🎯 **Piège d'examen —** ne pas se tromper de préparation en pensant que les deux certifications portent sur des sujets différents : elles portent sur **le même socle de connaissances techniques**, avec un déplacement de focus (le « comment faire » côté développeur, le « quoi choisir et pourquoi » côté architecte). Réviser pour l'une prépare largement à l'autre.

## Logistique de passage

- **Claude Partner Network** — adhésion **gratuite**, prérequis pour accéder aux ressources et à l'inscription aux examens. L'inscription à un examen exige une adresse **email professionnelle sur un domaine d'entreprise reconnu** par le Partner Network — une adresse personnelle (Gmail, etc.) est **exclue** et empêchera l'inscription.
- **Inscription** — via le **Partner Academy**.
- **Passage de l'examen** — via **Pearson VUE**, en ligne avec surveillance à distance ou dans un centre d'examen physique.
- **Score de réussite** — **720 / 1000**.
- **Validité** — **12 mois**.

> ⚠️ **À vérifier avant de t'inscrire** — les tarifs, modalités et plateformes d'examen évoluent. Vérifie les informations à jour directement sur **anthropic-partners.skilljar.com** et **pearsonvue.com** avant de planifier ton passage : ne te fie pas uniquement aux chiffres indiqués dans une formation ou un article, aussi récent soit-il.

## À retenir

- 4 certifications, 2 axes à ne pas confondre : 3 **rôles** (Associate, Developer, Architect) × niveau **Foundations** (les 3 rôles) ou **Professional** (Architect seulement) — Associate – Foundations (99 $), CCDV-F (125 $), CCA-F (125 $), Architect – Professional (175 $).
- CCDV-F et CCA-F partagent les **mêmes 5 domaines** ; l'angle diffère : implémenter (developer) vs concevoir/choisir (architect).
- Logistique : Claude Partner Network (gratuit, email pro sur domaine reconnu obligatoire) → Partner Academy → Pearson VUE, score 720/1000, validité 12 mois, remises partenaires 50-100 % — **à reconfirmer** sur les sites officiels avant inscription.
