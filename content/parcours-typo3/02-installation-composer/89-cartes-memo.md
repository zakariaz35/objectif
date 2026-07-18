---
title: "Cartes mémo — Installation & configuration"
type: flashcards
cards:
  - q: |
      Quelle commande Composer crée un nouveau projet TYPO3 12.4 ?
    a: |
      ```bash
      composer create-project typo3/cms-base-distribution:^12.4 my-project
      ```
      Cela installe le core + les extensions système dans `vendor/` et génère la
      structure `public/`, `config/`, `var/`.
  - q: |
      Après avoir fait `composer require` d'une nouvelle extension TYPO3, quelles
      commandes CLI dois-tu lancer ?
    a: |
      ```bash
      vendor/bin/typo3 extension:setup   # active + crée les tables SQL
      vendor/bin/typo3 cache:flush       # vide le cache compilé
      ```
      Sans `extension:setup`, les nouvelles tables ne sont pas créées et l'extension
      reste inactive même si Composer l'a téléchargée.
  - q: |
      À quoi sert `TYPO3_CONTEXT` et comment créer un sous-contexte ?
    a: |
      `TYPO3_CONTEXT` définit l'environnement d'exécution. Les valeurs standards sont
      `Development`, `Production`, `Testing`. Un **sous-contexte** s'écrit avec un `/` :
      `Production/Staging` est un sous-contexte de `Production` — il hérite du
      comportement Production mais peut avoir ses propres overrides dans
      `additional.php` via `$context->isProduction()`.
  - q: |
      Quel fichier ne faut-il JAMAIS committer dans Git et pourquoi ?
    a: |
      `config/system/settings.php` (ex-`LocalConfiguration.php`) — il contient
      l'`encryptionKey` (utilisée pour signer les sessions et tokens CSRF) et les
      credentials BDD saisis lors de l'installation. Le committer exposerait ces
      secrets dans l'historique Git.
  - q: |
      Quel est le rôle de `config/system/additional.php` par rapport à `settings.php` ?
    a: |
      `settings.php` est **généré** par l'Install Tool (ne pas modifier à la main).
      `additional.php` est un **override manuel**, versionnable, qui est chargé
      **après** `settings.php` et peut écraser toute valeur de `TYPO3_CONF_VARS`. C'est
      là qu'on lit les variables d'environnement pour les credentials et la config
      spécifique à chaque serveur.
---

Lis, réfléchis, révèle, auto-évalue.
