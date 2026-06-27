---
title: Quiz final — teste-toi
type: quiz
questions:
  - prompt: "Le payload d'un JWT est…"
    options:
      - "chiffré, donc illisible sans le secret"
      - "seulement encodé en Base64, donc lisible par tous"
      - "compressé puis hashé"
    answer: 1
    explanation: >
      Le payload n'est pas chiffré, juste encodé en Base64URL : n'importe qui
      peut le décoder et le lire. La signature protège l'intégrité (modification),
      pas la confidentialité (lecture).

  - prompt: "« Bearer » désigne…"
    options:
      - "le format du token (3 parties signées)"
      - "l'algorithme de signature"
      - "le schéma de transport HTTP dans l'en-tête Authorization"
    answer: 2
    explanation: >
      Bearer est l'enveloppe (le mécanisme de transport HTTP), pas le format du
      token. On transporte un JWT ou un token opaque via
      `Authorization: Bearer <token>`.

  - prompt: "Sanctum (mode token) émet par défaut…"
    options:
      - "des tokens opaques stockés en base (stateful)"
      - "de vrais JWT signés en RS256"
      - "des cookies de session uniquement"
    answer: 0
    explanation: >
      Sanctum émet des chaînes aléatoires opaques stockées dans
      `personal_access_tokens` et vérifiées en base : c'est stateful (révocable,
      mais lookup DB à chaque requête). Ce ne sont pas des JWT.

  - prompt: "En architecture hexagonale, les dépendances pointent…"
    options:
      - "du métier vers la base de données"
      - "dans tous les sens, peu importe"
      - "vers le centre (le métier), via des interfaces/ports"
    answer: 2
    explanation: >
      L'inversion de dépendance : le métier définit les interfaces (ports), et ce
      sont les adapters (DB, etc.) qui dépendent du centre. Le cœur ignore
      l'infrastructure.

  - prompt: "Un Value Object se caractérise par…"
    options:
      - "une identité stable dans le temps"
      - "l'absence d'identité + l'immuabilité (défini par sa valeur)"
      - "le fait d'être toujours persisté en base"
    answer: 1
    explanation: >
      Un Value Object n'a pas d'identité, est immuable, et deux VO de mêmes
      valeurs sont égaux. L'identité stable caractérise une Entity.

  - prompt: "Hexagonal et DDD, c'est…"
    options:
      - "deux choses distinctes (couches vs modélisation) souvent combinées"
      - "exactement la même chose sous deux noms"
      - "DDD est une version de Sanctum"
    answer: 0
    explanation: >
      L'hexagonal dit *où* mettre le code (couches, ports/adapters) ; le DDD dit
      *comment* modéliser le métier. On peut faire l'un sans l'autre, mais ils se
      combinent souvent.

  - prompt: "Le refresh token sert à…"
    options:
      - "être envoyé à chaque requête à la place de l'access token"
      - "obtenir un nouvel access token sans redemander le mot de passe"
      - "chiffrer le payload du JWT"
    answer: 1
    explanation: >
      Le refresh token (long, stocké en base, révocable) sert uniquement à
      renouveler l'access token court. Il n'est pas envoyé à chaque requête et ne
      chiffre rien.

  - prompt: "OAuth2 est fondamentalement un protocole de…"
    options:
      - "chiffrement de bout en bout"
      - "stockage de mots de passe"
      - "délégation d'autorisation (un tiers agit en ton nom)"
    answer: 2
    explanation: >
      OAuth2 permet à une appli tierce d'accéder à tes ressources sans connaître
      ton mot de passe. Ce n'est ni du chiffrement, ni de l'authentification (le
      login social s'appuie sur OpenID Connect par-dessus).
---

Réponds aux 8 questions puis valide pour obtenir ton score et les explications.
