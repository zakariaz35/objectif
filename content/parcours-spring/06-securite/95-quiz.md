---
title: "Quiz — Sécurité"
type: quiz
questions:
  - prompt: |
      À quel moment intervient la `SecurityFilterChain` par rapport au
      `DispatcherServlet` ?
    options:
      - "Après, une fois que le contrôleur a déjà répondu."
      - "Avant : elle intercepte la requête avant qu'elle n'atteigne un contrôleur."
      - "Spring Security ne s'exécute jamais dans la même requête que le contrôleur."
    answer: 1
    tags: ["filter-chain", "cycle-de-vie"]
    level: debutant
    explanation: |
      La chaîne de filtres Spring Security s'exécute avant le
      `DispatcherServlet` — exactement comme le firewall Symfony écoute
      `kernel.request`, avant que le contrôleur ne soit appelé.
  - prompt: |
      Quel est l'équivalent Spring de l'`access_control` d'un
      `security.yaml` Symfony ?
    options:
      - "`@PreAuthorize` sur chaque méthode de service."
      - "`authorizeHttpRequests(...)` dans la `SecurityFilterChain`."
      - "`@ConfigurationProperties`."
    answer: 1
    tags: ["access-control", "authorizehttprequests"]
    level: debutant
    explanation: |
      `authorizeHttpRequests` définit des règles par motif d'URL, dans
      l'ordre — le pendant exact d'`access_control`.
  - prompt: |
      Pourquoi ne faut-il JAMAIS comparer un mot de passe en clair avec
      `rawPassword.equals(storedHash)` ?
    options:
      - |
        Parce que `BCrypt` intègre un sel aléatoire : deux hachages du même
        mot de passe diffèrent — il faut utiliser `passwordEncoder.matches(...)`.
      - "Parce que Java interdit la comparaison de chaînes avec `equals`."
      - "Ce n'est pas un problème, tant que le mot de passe est stocké en base64."
    answer: 0
    tags: ["bcrypt", "erreur-frequente"]
    level: intermediaire
    explanation: |
      Le sel aléatoire de BCrypt rend deux hachages du même mot de passe
      différents ; `matches()` sait comparer correctement en tenant compte
      du sel intégré au hash stocké.
  - prompt: |
      Quel est l'équivalent Spring le plus direct de
      `#[IsGranted('ROLE_ADMIN')]` posé sur une action de contrôleur
      Symfony ?
    options:
      - "`@Transactional`"
      - "`@PreAuthorize(\"hasRole('ADMIN')\")`"
      - "`@ConfigurationPropertiesScan`"
    answer: 1
    tags: ["preauthorize", "isgranted"]
    level: debutant
    explanation: |
      `@PreAuthorize` (avec `@EnableMethodSecurity`) est l'un des ponts les
      plus littéraux de tout le cours avec `#[IsGranted(...)]`.
  - prompt: |
      Une règle d'autorisation dépend des DONNÉES (ex. « seul le
      propriétaire peut modifier sa commande »). Quel est l'équivalent
      Spring d'un Voter Symfony (`VoterInterface`) pour ce cas ?
    options:
      - |
        Une expression `@PreAuthorize` appelant un bean dédié
        (`@orderSecurity.isOwner(...)`), qui encapsule la logique métier
        conditionnelle.
      - "Il n'existe aucun équivalent : Spring ne gère que les rôles statiques."
      - "`@ConfigurationProperties` avec une liste de propriétaires autorisés."
    answer: 0
    tags: ["voter", "preauthorize-bean"]
    level: avance
    explanation: |
      Un bean appelé depuis `@PreAuthorize` reproduit exactement le rôle
      d'un Voter Symfony : une logique d'autorisation dépendant des données,
      pas seulement du rôle statique de l'utilisateur.
  - prompt: |
      Pourquoi désactive-t-on souvent la protection CSRF
      (`csrf(csrf -> csrf.disable())`) sur une API REST stateless ?
    options:
      - |
        Parce que la protection CSRF vise les attaques basées sur les
        cookies/sessions ; une API stateless authentifiée par token n'y est
        pas exposée de la même façon.
      - "Parce que CSRF est une fonctionnalité obsolète supprimée de Spring Security."
      - "Parce que désactiver CSRF est toujours sans risque, quel que soit le contexte."
    answer: 0
    tags: ["csrf", "stateless"]
    level: intermediaire
    explanation: |
      Même raisonnement qu'un firewall Symfony `stateless: true` : sans
      session/cookie porteur d'authentification, le vecteur CSRF classique
      ne s'applique plus de la même manière.
  - prompt: |
      Dans une authentification JWT côté Spring, quel composant valide le
      token et peuple le `SecurityContextHolder` à chaque requête ?
    options:
      - "Le `DispatcherServlet` directement, sans filtre dédié."
      - "Un filtre custom (`OncePerRequestFilter`) inséré dans la `SecurityFilterChain`."
      - "Le `JpaRepository` de l'entité `User`."
    answer: 1
    tags: ["jwt", "oncerequestfilter"]
    level: avance
    explanation: |
      Un filtre `OncePerRequestFilter` extrait et vérifie le token à chaque
      requête, puis peuple le contexte de sécurité — le pendant du firewall
      stateless LexikJWT en Symfony.
---

Sept questions sur la filter chain, l'autorisation par rôle et par voter, le
hachage des mots de passe et le principe du JWT.
