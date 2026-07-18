---
title: "Quiz — Embeddings & bases vectorielles"
type: quiz
questions:
  - prompt: |
      Qu'est-ce qu'un embedding, au sens où Spring AI l'utilise ?
    options:
      - "Un vecteur de nombres qui capture le sens d'un texte, tel que deux textes proches en sens ont des vecteurs proches."
      - "Une compression sans perte du texte original, réversible à l'identique."
      - "Un identifiant unique généré aléatoirement pour chaque document."
    answer: 0
    tags: ["embeddings", "concept"]
    level: debutant
    explanation: |
      Un embedding projette un texte dans un espace vectoriel où la
      proximité géométrique reflète la proximité de sens — c'est ce qui
      permet une recherche "sémantique" plutôt qu'une recherche par mot-clé.
  - prompt: |
      Que mesure la similarité cosinus entre deux vecteurs d'embedding ?
    options:
      - "Le nombre de mots identiques entre les deux textes d'origine."
      - "L'angle entre les deux vecteurs — plus il est petit, plus les textes sont proches en sens."
      - "La longueur en caractères des deux textes comparés."
    answer: 1
    tags: ["embeddings", "similarite-cosinus"]
    level: debutant
    explanation: |
      La similarité cosinus est basée sur l'angle entre deux vecteurs, pas
      sur leur contenu textuel brut. Un angle proche de zéro (cosinus proche
      de 1) signifie des textes sémantiquement très proches.
  - prompt: |
      Pourquoi un projet Spring AI utilisant Claude pour le chat a-t-il
      souvent besoin d'un AUTRE fournisseur pour les embeddings ?
    options:
      - "Parce que Claude ne propose pas d'API d'embeddings — c'est un modèle de chat, pas d'embedding."
      - "Parce que Spring AI interdit d'utiliser Anthropic pour les embeddings, par choix de design."
      - "Ce n'est pas vrai : Claude propose nativement des embeddings, identiques à ceux d'OpenAI."
    answer: 0
    tags: ["embeddings", "anthropic", "abstraction"]
    level: intermediaire
    explanation: |
      Anthropic ne propose pas d'API d'embeddings dédiée. En pratique, on
      combine souvent Claude (chat) avec un autre fournisseur (OpenAI,
      VoyageAI, ou un modèle local via Ollama) pour les embeddings — un
      fournisseur par capacité, dans l'esprit de l'abstraction Spring AI.
  - prompt: |
      Que se passe-t-il si l'on change de modèle d'embedding en cours de
      route, sans réindexer la base vectorielle existante ?
    options:
      - "Rien : tous les modèles d'embedding produisent des vecteurs interopérables."
      - "Les nouveaux vecteurs et les anciens ne sont plus comparables entre eux — il faut réindexer entièrement."
      - "Spring AI convertit automatiquement les anciens vecteurs vers le nouveau format."
    answer: 1
    tags: ["embeddings", "migration"]
    level: intermediaire
    explanation: |
      Deux modèles d'embedding différents produisent des espaces vectoriels
      différents, même sur un texte identique. Changer de modèle impose donc
      une réindexation complète — comme une migration de schéma incontournable.
  - prompt: |
      Pourquoi pgvector est-il un choix pertinent pour un dev déjà à l'aise
      avec Postgres/Doctrine ?
    options:
      - "Parce qu'il faut de toute façon migrer vers une base NoSQL pour stocker des vecteurs."
      - "Parce que c'est une extension Postgres : pas de base de données supplémentaire à opérer pour un projet de taille raisonnable."
      - "Parce que pgvector est plus rapide que toute base vectorielle dédiée, dans tous les cas."
    answer: 1
    tags: ["pgvector", "architecture"]
    level: intermediaire
    explanation: |
      pgvector ajoute un type de colonne et des opérateurs de distance à
      Postgres. Pour un projet qui n'a pas des besoins extrêmes de volume,
      ça évite d'introduire et d'opérer une base vectorielle dédiée en plus.
  - prompt: |
      Dans la configuration `spring.ai.vectorstore.pgvector.dimensions=1536`,
      à quoi ce nombre doit-il correspondre EXACTEMENT ?
    options:
      - "Au nombre maximum de documents que la table peut contenir."
      - "À la dimension des vecteurs produits par le modèle d'embedding utilisé."
      - "Au nombre de résultats renvoyés par une recherche (topK)."
    answer: 1
    tags: ["pgvector", "configuration"]
    level: intermediaire
    explanation: |
      La colonne `embedding` est typée `VECTOR(N)` : N doit être strictement
      la dimension produite par le modèle d'embedding configuré, sous peine
      d'erreur SQL à l'insertion en cas de désaccord.
---

Six questions pour vérifier les notions d'embedding, de similarité cosinus,
le choix multi-fournisseur (Claude pour le chat, un autre pour les
embeddings) et les points de vigilance pratiques de pgvector.
