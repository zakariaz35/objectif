---
title: "Le problème : un LLM sans contexte à jour"
type: lesson
---

## Un LLM ne connaît ni tes données, ni l'actualité

Un modèle comme Claude a été entraîné sur un instantané du monde, arrêté à
une certaine date (son *knowledge cutoff*). Il ne connaît :

- ni tes **documents internes** (contrats, procédures, factures, tickets
  passés) — ils n'ont jamais fait partie de son entraînement ;
- ni ce qui s'est passé **après** sa date de coupure ;
- ni les changements que tu fais **après-coup** dans tes données.

Interroge-le directement sur « la politique de remboursement de notre
entreprise » et il **hallucinera** une réponse plausible — un texte
grammaticalement parfait, mais inventé.

> **Ce que tu vis déjà.** Tes pipelines OCR extraient du texte à partir de
> documents (factures, contrats). Ce texte extrait est une donnée **privée**,
> à jour, que le modèle ne connaît évidemment pas nativement. Le RAG est la
> réponse structurée à ce problème : **injecter** ce texte pertinent dans le
> prompt, au bon moment, plutôt que d'espérer que le modèle « le sache ».

## Deux façons de donner du contexte à un modèle : fine-tuning vs RAG

| | Fine-tuning | RAG |
|---|---|---|
| Principe | Ré-entraîner (partiellement) le modèle sur tes données | Injecter le contexte pertinent **dans le prompt**, à chaque requête |
| Mise à jour des données | Il faut ré-entraîner (lent, coûteux) | Ajouter un document au VectorStore — immédiat |
| Traçabilité | Difficile de savoir "d'où" vient une affirmation | Facile : on sait quels documents ont été injectés |
| Coût de mise en place | Élevé | Relativement faible (embeddings + stockage vectoriel) |

> **Réflexe à prendre.** Pour la très grande majorité des cas d'usage
> métier — répondre sur de la documentation interne, des contrats, une base
> de connaissance — c'est le **RAG** qu'il faut regarder en premier, pas le
> fine-tuning. Le fine-tuning répond à un besoin différent : changer le
> **style**/comportement du modèle, pas lui donner accès à des faits
> changeants.

## Le principe du RAG en une phrase

> **RAG = Retrieval-Augmented Generation.** Avant de demander une réponse au
> LLM, on va **chercher** (retrieval) les informations pertinentes dans une
> base documentaire, et on les **ajoute au prompt** (augmentation) — le LLM
> génère alors sa réponse en s'appuyant sur ce contexte fourni, pas sur sa
> seule mémoire d'entraînement.

Les modules précédents t'ont déjà donné toutes les briques : les
**embeddings** pour représenter le sens d'un texte, le **VectorStore**
(pgvector) pour stocker et rechercher. Le RAG assemble ces briques en un
pipeline complet — c'est l'objet des deux prochaines leçons.

## À retenir

- Un LLM ne connaît ni tes données privées, ni ce qui s'est passé après sa
  date d'entraînement : sans contexte, il **hallucine** des réponses
  plausibles mais fausses.
- **RAG** > fine-tuning pour la grande majorité des cas d'usage métier :
  moins coûteux, mise à jour immédiate, traçable.
- RAG = **chercher** le contexte pertinent, puis **l'ajouter au prompt**
  avant de générer la réponse — les briques (embeddings, VectorStore) sont
  déjà connues, le pipeline complet est la prochaine étape.
