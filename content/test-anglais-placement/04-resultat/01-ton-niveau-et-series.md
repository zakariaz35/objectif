---
title: Ton niveau & séries recommandées
type: lesson
---

> 🎯 **Ton niveau est calculé automatiquement.** Une fois les trois quiz passés, retrouve ton
> niveau estimé, ton **niveau global** et ta progression dans le temps sur
> **[📊 Mes résultats](/f/test-anglais-placement/resultats)**. Le calcul manuel ci-dessous
> reste utile pour comprendre le barème.

## 1. Calcule ton score

Additionne tes trois scores :

| Quiz | Score |
|---|---|
| Grammaire | … / 14 |
| Vocabulaire | … / 10 |
| Compréhension | … / 6 |
| **Total** | **… / 30** |

## 2. Ton niveau estimé (CEFR)

| Score /30 | Niveau | Ce que ça veut dire |
|---|---|---|
| 0 – 11 | **A2** | Élémentaire : tu tiens une conversation simple, présent/passé de base. |
| 12 – 17 | **B1** | Intermédiaire : tu suis un récit clair, tu gères les temps courants. |
| 18 – 23 | **B2** | Intermédiaire supérieur : tu comprends l'implicite, les nuances, les temps composés. |
| 24 – 27 | **C1** | Avancé : idiomes, structures complexes, registre soutenu. |
| 28 – 30 | **C1+ / C2** | Quasi natif à l'écrit. |

> Repère utile : pour un francophone qui fait **Duolingo** régulièrement et se situe
> « B1/B2 », un score de **16–22** est très cohérent. La distinction B1 vs B2 se joue
> surtout sur la **compréhension** (questions 4-6) et la grammaire C1 (questions 13-14).

## 3. La série faite pour toi

Choisis selon ton niveau. Le but : une série **un cran au-dessus** de ton confort,
pas dix crans (sinon tu décroches).

| Niveau | À regarder en priorité | Pourquoi |
|---|---|---|
| **A2** | *Extra English*, *Friends*, *Modern Family* | Débit clair, anglais américain, vocabulaire du quotidien, épisodes courts. |
| **B1** | *Brooklyn Nine-Nine*, *The Good Place*, *One Piece* (Netflix, live-action) | Humour, phrases nettes, contextes concrets. *One Piece* est dans ta bibliothèque. |
| **B2** | *Stranger Things*, *Ted Lasso*, **Game of Thrones** | Dialogues plus riches, implicite. **GoT est dans ta bibliothèque** — et tu as déjà les sous-titres bilingues. |
| **C1** | *Better Call Saul*, *Succession*, **The Legend of Vox Machina** | Débit rapide, idiomes, argot. *Vox Machina* (dans ta bibliothèque) est très idiomatique. |
| **C1+** | *The Wire*, **Outlander** | Accents difficiles (écossais pour *Outlander*, dans ta bibliothèque). Écoute exigeante. |

## 4. La méthode (avec `convert-tv`)

Tu as déjà l'outil pour transformer une série en support d'apprentissage :

1. **Sous-titres bilingues** — `convert-tv subs "episode.mp4"` → un `.srt` où l'anglais
   apparaît avec le français dessous. Idéal pour un **1er visionnage**.
2. **Vocabulaire** — `convert-tv learn "episode.mp4" --vocab` → un `.tsv` importable dans
   **Anki** (mot, fréquence, phrase-exemple, timecode, traduction). Révise avant/après.
3. **Paires de phrases** — `convert-tv learn "episode.mp4" --pairs` → phrases EN↔FR
   alignées pour du *shadowing* (répéter à voix haute).
4. **Progression** : 1er visionnage sous-titres **EN+FR** → 2e visionnage **EN seul** →
   3e visionnage **sans sous-titres**. Passe à la série du niveau supérieur quand le
   « EN seul » devient confortable.

> Astuce : commence par un épisode que tu **connais déjà** dans ta langue — le contexte
> connu libère ton attention pour la langue.
