---
title: "Quiz — Configuration & structure d'un projet réel"
type: quiz
questions:
  - prompt: |
      Que permet `ConfigModule.forRoot({ isGlobal: true })` ?
    options:
      - |
        De rendre `ConfigService` disponible dans toute l'application, sans
        réimporter `ConfigModule` module par module.
      - "De valider automatiquement toutes les variables d'environnement, sans schéma."
      - "De désactiver totalement les fichiers `.env` au profit d'une base de données."
    answer: 0
    tags: ["configmodule", "isglobal"]
    level: debutant
    explanation: |
      `isGlobal: true` évite de réimporter `ConfigModule` dans chaque
      feature module — un comportement analogue à l'accès global aux
      `parameters` Symfony.
  - prompt: |
      À quoi correspond, côté Symfony, `ConfigService.get('JWT_SECRET')` ?
    options:
      - "À `$this->getParameter('jwt_secret')` ou `%env(JWT_SECRET)%`."
      - "À une requête SQL directe sur la table de configuration."
      - "À un appel réseau vers un serveur de configuration distant."
    answer: 0
    tags: ["configservice", "symfony", "passerelle"]
    level: debutant
    explanation: |
      Les deux mécanismes lisent une variable d'environnement/paramètre
      centralisé, sans disséminer `process.env`/`getenv()` dans tout le
      code.
  - prompt: |
      Pourquoi valider les variables d'environnement AU DÉMARRAGE (avec un
      `validationSchema`) plutôt que de laisser l'application démarrer
      « quand même » ?
    options:
      - |
        Pour qu'une configuration invalide fasse échouer le démarrage
        immédiatement (visible en CI/CD), plutôt qu'un plantage
        imprévisible en pleine production.
      - "Pour améliorer les performances de l'application au runtime."
      - "Ce n'est jamais recommandé : mieux vaut ignorer les erreurs de config."
    answer: 0
    tags: ["validation-env", "bonnes-pratiques"]
    level: intermediaire
    explanation: |
      Un échec de démarrage immédiat, visible en CI/CD ou au premier
      lancement local, est largement préférable à un plantage aléatoire
      en production sur la première requête concernée.
  - prompt: |
      À quoi sert `registerAs('database', () => ({...}))` ?
    options:
      - |
        À regrouper une section de configuration par domaine, en un objet
        typé et injectable, plutôt que des clés dispersées un peu partout.
      - "À déclarer une nouvelle route HTTP."
      - "À enregistrer une migration TypeORM."
    answer: 0
    tags: ["registeras", "config-typee"]
    level: intermediaire
    explanation: |
      `registerAs` namespace une configuration (ex. toute la config base
      de données) en un seul objet typé, plutôt que d'éparpiller des
      `configService.get('CLE_BRUTE')` dans tout le projet.
  - prompt: |
      Quel est le meilleur découpage pour un vrai projet NestJS d'agence ?
    options:
      - |
        Un dossier par domaine métier (`products/`, `orders/`...),
        regroupant contrôleur, service, entité et tests du domaine.
      - "Un dossier `controllers/`, un dossier `services/`, un dossier `entities/`, séparés à la racine."
      - "Un seul fichier `app.ts` contenant tout le code de l'application."
    answer: 0
    tags: ["architecture", "feature-modules"]
    level: avance
    explanation: |
      Le découpage par domaine (feature modules) garde tout ce qui
      concerne une fonctionnalité au même endroit — bien plus navigable à
      l'échelle qu'un découpage par couche technique.
  - prompt: |
      Quand un provider mérite-t-il de migrer vers le dossier `common/` ?
    options:
      - |
        Dès sa création, « par précaution », au cas où il resservirait un jour.
      - |
        Seulement une fois qu'il est réellement utilisé par plusieurs
        modules — pas avant.
      - "Jamais : `common/` ne doit contenir que de la documentation."
    answer: 1
    tags: ["common", "erreur-frequente"]
    level: intermediaire
    explanation: |
      Un déplacement prématuré vers `common/` (avant un besoin réel de
      réutilisation) est une forme d'over-engineering : attends le
      deuxième usage confirmé avant de généraliser.
  - prompt: |
      Que ne faut-il JAMAIS committer dans un fichier `.env` versionné ?
    options:
      - "Des noms de variables sans valeur, comme documentation."
      - "Un vrai secret de production (mot de passe, clé JWT réelle)."
      - "Les deux propositions précédentes sont acceptables à committer."
    answer: 1
    tags: ["env", "secrets", "securite"]
    level: debutant
    explanation: |
      Un `.env.example` documentant les clés attendues (sans vraies
      valeurs) peut être committé sans risque ; un vrai secret, jamais —
      la même règle qu'en Symfony (`.env` versionné factice,
      `.env.local` ignoré par Git).
---

Sept questions pour vérifier la configuration globale/typée avec
`@nestjs/config`, la validation d'environnement au démarrage, et
l'organisation d'un vrai projet NestJS par domaine métier.
