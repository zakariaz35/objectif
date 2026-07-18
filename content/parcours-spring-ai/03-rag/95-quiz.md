---
title: "Quiz — RAG (Retrieval-Augmented Generation)"
type: quiz
questions:
  - prompt: |
      Pourquoi un LLM interrogé directement sur la documentation interne
      d'une entreprise risque-t-il de répondre à côté ?
    options:
      - "Parce que ces documents n'ont jamais fait partie de ses données d'entraînement : il risque d'halluciner une réponse plausible mais inventée."
      - "Parce que les LLM refusent par principe de répondre aux questions internes d'entreprise."
      - "Parce que les LLM ne savent traiter que du code, jamais du texte métier."
    answer: 0
    tags: ["rag", "hallucination"]
    level: debutant
    explanation: |
      Un LLM ne connaît que ce qui était dans ses données d'entraînement,
      arrêtées à une date donnée. Sans contexte fourni, il peut produire une
      réponse grammaticalement parfaite mais factuellement inventée.
  - prompt: |
      Pour la majorité des cas d'usage métier (répondre sur une base de
      connaissance qui évolue), pourquoi préfère-t-on généralement le RAG
      au fine-tuning ?
    options:
      - "Le RAG permet de mettre à jour les données instantanément (ajouter un document au VectorStore), sans ré-entraîner le modèle."
      - "Le fine-tuning est interdit par les CGU de tous les fournisseurs de LLM."
      - "Le RAG et le fine-tuning répondent exactement au même besoin, à coût identique."
    answer: 0
    tags: ["rag", "fine-tuning"]
    level: debutant
    explanation: |
      Le fine-tuning modifie le comportement du modèle et nécessite un
      ré-entraînement coûteux et lent à chaque mise à jour des données. Le
      RAG injecte le contexte à la volée, avec une mise à jour immédiate.
  - prompt: |
      Dans la phase d'INGESTION d'un pipeline RAG, pourquoi découpe-t-on les
      documents en chunks avant de les indexer ?
    options:
      - "Parce que le VectorStore n'accepte que des documents de moins de 100 caractères."
      - "Parce qu'un document entier est souvent trop long pour constituer un contexte pertinent et précis à la recherche."
      - "Le découpage en chunks n'a aucun effet sur la pertinence de la recherche."
    answer: 1
    tags: ["rag", "chunking"]
    level: intermediaire
    explanation: |
      Un chunk de taille raisonnable permet une recherche plus précise (on
      retrouve la portion réellement pertinente) tout en gardant assez de
      contexte pour que le passage garde du sens isolément.
  - prompt: |
      À quel moment de la phase de REQUÊTE la recherche vectorielle
      intervient-elle ?
    options:
      - "Après que le LLM ait déjà généré sa réponse, pour la vérifier a posteriori."
      - "Avant l'appel au LLM : on cherche le contexte pertinent, on l'injecte dans le prompt, puis on génère la réponse."
      - "La recherche vectorielle et l'appel au LLM sont totalement indépendants et n'interagissent jamais."
    answer: 1
    tags: ["rag", "pipeline"]
    level: intermediaire
    explanation: |
      Le flux RAG suit l'ordre : question → embedding de la question →
      recherche vectorielle → contexte récupéré → prompt augmenté → LLM →
      réponse. La récupération précède toujours la génération.
  - prompt: |
      Que fait concrètement `QuestionAnswerAdvisor` pour toi ?
    options:
      - "Il remplace entièrement le modèle de langage par une simple recherche plein texte."
      - "Il automatise, autour du ChatClient, la recherche vectorielle et l'injection du contexte trouvé dans le prompt."
      - "Il entraîne un nouveau modèle à partir des documents du VectorStore."
    answer: 1
    tags: ["rag", "questionansweradvisor"]
    level: intermediaire
    explanation: |
      QuestionAnswerAdvisor encapsule exactement le pipeline de requête RAG
      (recherche + augmentation du prompt) écrit manuellement dans la leçon
      précédente, de façon transparente pour le code appelant.
  - prompt: |
      Sur un projet RAG multi-clients, pourquoi est-il indispensable
      d'ajouter un `filterExpression` (ex. `clientId == '...'`) à la
      recherche vectorielle ?
    options:
      - "Ce n'est pas indispensable : le VectorStore isole automatiquement chaque client sans configuration."
      - "Sans ce filtre, une recherche peut remonter des chunks appartenant à un autre client — une faille de sécurité comparable à un `WHERE` manquant en SQL."
      - "Le filtre sert uniquement à améliorer la vitesse de réponse, sans enjeu de sécurité."
    answer: 1
    tags: ["rag", "securite", "multi-tenant"]
    level: avance
    explanation: |
      Sans filtrage par métadonnées, la recherche vectorielle porte sur
      l'ensemble des documents indexés, tous clients confondus — un risque
      de fuite de données directement comparable à l'oubli d'une clause
      WHERE d'isolation dans une requête SQL multi-tenant.
---

Six questions pour vérifier le problème du contexte, le choix RAG vs
fine-tuning, le rôle du chunking, l'enchaînement retrieval → augmentation →
génération, et les enjeux de sécurité du filtrage multi-clients.
