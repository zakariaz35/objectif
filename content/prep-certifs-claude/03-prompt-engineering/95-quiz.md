---
title: "Quiz — Prompt engineering & structured output"
type: quiz
questions:
  - prompt: |
      Un pipeline automatisé extrait des informations client depuis des emails et les
      insère directement en base de données sans intervention humaine. L'équipe actuelle
      demande dans le prompt : « Réponds uniquement en JSON avec les clés name, email,
      plan_interest et demo_requested, sans aucun autre texte ». En production, environ
      2 % des réponses cassent le parsing JSON en aval (texte parasite, champ manquant,
      type incorrect).

      Quelle est la correction structurelle attendue ?
    options:
      - "Répéter l'instruction JSON trois fois dans le prompt pour insister davantage."
      - "Ajouter output_config: {format: {type: \"json_schema\", schema: {...}}} à la requête, avec les 4 champs requis et additionalProperties: false."
      - "Ajouter 10 exemples few-shot montrant le format JSON attendu."
      - "Demander au modèle de vérifier lui-même son JSON avant de répondre, dans une instruction finale du prompt."
    answer: 1
    tags: [prompt-engineering, structured-output]
    level: intermediaire
    explanation: >
      Les 2 % d'échecs viennent du caractère probabiliste d'une instruction textuelle,
      quelle que soit sa formulation : répéter l'instruction, ajouter des exemples, ou
      demander une auto-vérification restent des optimisations de prompt qui ne
      garantissent rien. Seul output_config.format avec type "json_schema" contraint la
      génération via décodage contraint, ce qui élimine structurellement les JSON
      invalides, les champs manquants et les erreurs de type.
  - prompt: |
      Un outil `book_flight` attend `passengers: integer` avec `strict: true` déjà activé
      et un schéma incluant `additionalProperties: false` et `required: ["passengers"]`.
      L'équipe se demande si elle peut aussi garantir, via ce même mécanisme, que
      `passengers` reste toujours compris entre 1 et 9 (une règle métier de la
      compagnie).

      Quelle affirmation est correcte ?
    options:
      - "Oui : il suffit d'ajouter minimum: 1 et maximum: 9 au schéma, strict: true les fera respecter automatiquement."
      - "Non : les contraintes de valeur comme minimum/maximum ne sont pas appliquées par le décodage contraint ; il faut valider passengers côté client après réception."
      - "Non : strict: true ne fonctionne que sur les champs de type string, jamais sur les entiers."
      - "Oui, mais seulement si le modèle utilisé est Haiku, pas Opus."
    answer: 1
    tags: [prompt-engineering, structured-output]
    level: avance
    explanation: >
      Le décodage contraint garantit le type, la présence des champs requis et
      l'absence de propriétés additionnelles — mais pas les contraintes de valeur
      (minimum, maximum, minLength, maxLength, pattern). Ces contraintes doivent être
      validées côté client, éventuellement avec une boucle de retry qui renvoie l'erreur
      au modèle. Rien dans strict: true ne limite son usage aux chaînes de caractères, et
      le comportement ne dépend pas du modèle choisi.
  - prompt: |
      Une équipe migre son intégration vers `claude-opus-4-8`. Son code historique envoie
      systématiquement un message assistant préformaté (`{"role": "assistant", "content": "{"}`)
      en dernière position, pour forcer le début d'un JSON. Après la migration, ces
      appels échouent systématiquement.

      Quelle est la cause la plus probable, et la correction ?
    options:
      - "Le format JSON n'est plus supporté du tout par les modèles récents ; il faut revenir à du texte libre."
      - "Le préfill de la réponse assistant sur le dernier tour n'est plus supporté sur les modèles récents (erreur 400) ; il faut migrer vers output_config.format pour garantir le JSON sans préfill."
      - "Il manque simplement le header beta 'structured-outputs' dans la requête."
      - "Le problème vient du max_tokens, trop bas pour accepter un préfill."
    answer: 1
    tags: [prompt-engineering, structured-output]
    level: avance
    explanation: >
      Depuis Claude 4.6 (dont fait partie claude-opus-4-8), un message assistant
      préfillé sur le dernier tour est rejeté avec une erreur 400 : ce n'est plus une
      technique supportée. La migration recommandée est justement le cas d'usage
      historique du préfill pour forcer un format — remplacé par output_config.format
      (structured outputs), qui garantit le JSON sans dépendre d'un préfill. Le JSON
      reste parfaitement supporté (au contraire, mieux garanti) ; le header bêta n'est
      plus requis avec la forme actuelle de l'API ; max_tokens n'a aucun rapport avec le
      rejet d'un préfill.
  - prompt: |
      Un chatbot de support répond en respectant une règle stricte : ne jamais donner de
      conseil médical, uniquement rediriger vers un professionnel de santé. Cette règle
      est actuellement écrite dans le premier message utilisateur de chaque nouvelle
      conversation. Un audit constate qu'après une vingtaine de tours d'une conversation
      très longue, la règle semble parfois s'estomper.

      Quelle est la correction structurelle recommandée ?
    options:
      - "Répéter la règle dans chaque message utilisateur suivant, à chaque tour."
      - "Déplacer la règle dans le system prompt, qui porte l'autorité de l'opérateur et reste présent à chaque tour indépendamment de la longueur de la conversation."
      - "Réduire le nombre de tours autorisés à 5 pour éviter la dilution."
      - "Ajouter la règle en tant que description d'un outil, même si aucun outil n'est utilisé pour cette tâche."
    answer: 1
    tags: [prompt-engineering]
    level: intermediaire
    explanation: >
      Une règle métier destinée à s'appliquer à toute la conversation doit être placée
      dans le system prompt, qui porte l'autorité de l'opérateur et est envoyé à chaque
      appel, contrairement à un message utilisateur isolé du premier tour qui perd en
      priorité relative au fil d'une conversation longue. Répéter la règle à chaque tour
      côté utilisateur est une rustine coûteuse en tokens et fragile. Limiter le nombre
      de tours ne traite pas la cause du problème. Ajouter la règle à la description
      d'un outil non utilisé n'a aucun effet sur le comportement du modèle.
  - prompt: |
      Une équipe doit générer un rapport de synthèse stratégique de 5 pages pour un
      comité de direction, à partir de 40 pages de notes de réunion. Un premier essai en
      un seul appel produit un texte correct mais parfois superficiel sur certains points
      clés. L'équipe envisage un pipeline draft → auto-critique → version finale.

      Est-ce une décision structurelle justifiée dans ce contexte ?
    options:
      - "Non, un pipeline multi-pass n'est jamais justifié : cela double le coût pour la même tâche."
      - "Oui : la tâche est complexe, à fort enjeu (comité de direction), et la qualité rédactionnelle prime sur le coût/la latence d'un appel supplémentaire."
      - "Non, il suffirait d'ajouter output_config.format pour garantir la qualité du contenu."
      - "Oui, mais uniquement si le modèle utilisé est Haiku, jamais avec un modèle Opus."
    answer: 1
    tags: [prompt-engineering]
    level: intermediaire
    explanation: >
      Un pipeline multi-pass se justifie quand la tâche est complexe et à fort enjeu et
      qu'une critique intermédiaire peut réellement améliorer la qualité perçue —
      exactement le cas d'un rapport stratégique destiné à un comité de direction, où le
      coût d'un appel supplémentaire est négligeable face à l'enjeu. output_config.format
      garantit une **structure** de sortie (schéma), pas la qualité rédactionnelle ou la
      profondeur d'analyse d'un texte libre. Le choix du modèle (Opus/Haiku) n'est pas le
      facteur qui détermine la pertinence d'un pipeline multi-pass.
---

Vérifie tes réflexes sur les structured outputs, strict tool use et les choix structurels de prompt.
