---
title: "Quiz — DTO & validation"
type: quiz
questions:
  - prompt: |
      Pourquoi un DTO NestJS doit-il être une `class`, et non une
      `interface` ou un `type` ?
    options:
      - |
        Parce qu'une interface/type est effacé à la compilation : elle ne
        peut porter aucun décorateur de validation lu au runtime.
      - "Par pure convention de style, sans réelle contrainte technique."
      - "Parce que `@Body()` refuse de fonctionner avec un type non-class."
    answer: 0
    tags: ["dto", "class-vs-interface"]
    level: debutant
    explanation: |
      Une interface/type TypeScript n'existe plus du tout après compilation
      (erased). Or class-validator a besoin de vraies propriétés de classe
      pour y attacher ses décorateurs, lus via reflect-metadata au runtime.
  - prompt: |
      Quel est le rôle de `class-transformer` (`plainToInstance`) dans le
      pipeline de validation ?
    options:
      - |
        Transformer un objet JSON brut (issu du body de la requête) en une
        vraie instance de la classe DTO.
      - "Compresser le corps de la réponse HTTP."
      - "Générer automatiquement la documentation Swagger."
    answer: 0
    tags: ["class-transformer", "dto"]
    level: debutant
    explanation: |
      `plainToInstance` construit une véritable instance de la classe DTO à
      partir d'un objet littéral — le pendant du denormalizer/handleRequest
      d'un formulaire Symfony.
  - prompt: |
      Quel décorateur `class-validator` correspond le plus directement à
      `#[Assert\Email]` en Symfony ?
    options:
      - "`@IsEmail()`"
      - "`@IsString()`"
      - "`@Matches(/email/)`"
    answer: 0
    tags: ["class-validator", "symfony"]
    level: debutant
    explanation: |
      `@IsEmail()` vérifie le format d'une adresse email, exactement comme
      la contrainte `#[Assert\Email]` du composant Validator Symfony.
  - prompt: |
      Sur un tableau d'objets imbriqués dans un DTO, quels DEUX
      décorateurs vont toujours par paire ?
    options:
      - "`@IsOptional()` et `@IsString()`"
      - "`@ValidateNested({ each: true })` et `@Type(() => Classe)`"
      - "`@Min()` et `@Max()`"
    answer: 1
    tags: ["class-validator", "nested", "erreur-frequente"]
    level: intermediaire
    explanation: |
      `@ValidateNested({ each: true })` déclenche la validation de chaque
      élément du tableau, mais `class-transformer` a besoin de
      `@Type(() => Classe)` pour savoir QUELLE classe instancier pour
      chaque élément — les deux sont indissociables.
  - prompt: |
      À quoi sert l'option `whitelist: true` d'une `ValidationPipe` ?
    options:
      - |
        Elle supprime silencieusement toute propriété du body qui n'est
        PAS déclarée dans le DTO.
      - "Elle autorise n'importe quelle propriété supplémentaire sans restriction."
      - "Elle active la validation asynchrone des contraintes."
    answer: 0
    tags: ["validationpipe", "whitelist"]
    level: intermediaire
    explanation: |
      `whitelist: true` retire silencieusement les propriétés non
      déclarées dans le DTO. Combinée à `forbidNonWhitelisted: true`, elle
      va plus loin en rejetant carrément la requête si une propriété en
      trop est présente.
  - prompt: |
      Pourquoi `whitelist`/`forbidNonWhitelisted` sont-ils importants pour
      la sécurité ?
    options:
      - |
        Ils protègent contre le « mass assignment » : un client ne peut
        pas injecter des champs non prévus (ex. `isAdmin: true`) qui
        fuiteraient jusqu'à la couche de persistance.
      - "Ils accélèrent uniquement les performances de sérialisation JSON."
      - "Ils n'ont aucun rapport avec la sécurité, seulement avec le typage."
    answer: 0
    tags: ["securite", "mass-assignment"]
    level: avance
    explanation: |
      Sans ces options, des propriétés non déclarées dans le DTO
      traversent la validation sans erreur — un risque réel si le DTO est
      ensuite utilisé directement pour construire une entité persistée.
  - prompt: |
      Où déclare-t-on, en pratique, la `ValidationPipe` pour qu'elle
      s'applique à TOUTES les routes actuelles et futures de l'application ?
    options:
      - |
        Une seule fois, via `app.useGlobalPipes(new ValidationPipe({...}))`
        dans `main.ts`.
      - "En la répétant avec `@UsePipes` sur chaque contrôleur, un par un."
      - "Il n'existe aucun moyen de l'appliquer globalement."
    answer: 0
    tags: ["validationpipe", "global"]
    level: intermediaire
    explanation: |
      `app.useGlobalPipes(...)` dans `main.ts` protège toute l'application
      en une seule déclaration ; `@UsePipes` local reste réservé aux cas où
      une route a un besoin de validation vraiment différent.
---

Sept questions pour vérifier pourquoi un DTO est une classe, le rôle de
class-transformer, les contraintes class-validator les plus courantes, et
la configuration de la ValidationPipe (whitelist, sécurité, portée globale).
