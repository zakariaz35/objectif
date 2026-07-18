---
title: "Quiz — TCA & Backend"
type: quiz
questions:
  - prompt: |
      Un éditeur se plaint que le bouton « Ajouter un élément » sur une page ne
      propose pas le CType « Appel à l'action » que tu as créé. Quelle est la
      cause la plus probable ?
    options:
      - "Le CType n'est pas encore traduit dans les fichiers XLF."
      - "Le CType doit être activé dans les droits du groupe backend de l'éditeur (Explicit allow sur les CTypes)."
      - "Le CType n'existe que dans tt_content version legacy, pas TYPO3 12."
      - "Il manque un fichier de migration SQL pour le nouveau CType."
    answer: 1
    tags: [tca, backend, permissions]
    level: intermediaire
    explanation: >
      En TYPO3, les CTypes disponibles pour un utilisateur non-admin sont filtrés par
      les permissions du groupe backend (section "Explicit allow/deny" sur les
      éléments de contenu). Même si le TCA est correctement défini, un éditeur sans
      permission sur ce CType ne le verra pas dans la liste. Les traductions XLF
      n'empêchent pas le CType d'apparaître.
  - prompt: |
      Tu ajoutes un champ `tx_acme_subtitle` à la table `pages`. Dans quel fichier
      dois-tu déclarer ce champ en TYPO3 12 ?
    options:
      - "Configuration/TCA/pages.php (fichier complet du TCA de pages)"
      - "Configuration/TCA/Overrides/pages.php (override uniquement)"
      - "ext_tables.php de ton extension"
      - "Configuration/TypoScript/setup.typoscript"
    answer: 1
    tags: [tca, overrides, pages]
    level: debutant
    explanation: >
      `pages` est une table core. Pour l'étendre, on utilise obligatoirement
      `Configuration/TCA/Overrides/pages.php` dans son extension. Créer un fichier
      `Configuration/TCA/pages.php` remplacerait entièrement le TCA de pages (désastreux).
      `ext_tables.php` est la méthode dépréciée depuis TYPO3 9. TypoScript ne gère pas les
      définitions TCA.
  - prompt: |
      Qu'est-ce que le champ `sortby` dans la section `ctrl` d'un TCA ?
    options:
      - "Un champ qui contient le nom du champ PHP utilisé pour trier les résultats dans les repositories Extbase."
      - "Un champ numérique qui stocke la position manuelle (drag-and-drop) des enregistrements dans le backend."
      - "Un mot-clé TypoScript pour trier les CONTENT objects."
      - "La colonne SQL sur laquelle l'index est créé automatiquement par TYPO3."
    answer: 1
    tags: [tca, ctrl, backend]
    level: intermediaire
    explanation: >
      `sortby` dans `ctrl` désigne le **nom du champ** (ex. `sorting`) qui stocke la
      position numérique de chaque enregistrement. TYPO3 met à jour ce champ
      automatiquement quand l'éditeur réordonne les enregistrements par drag-and-drop
      dans le backend. Dans les repositories Extbase, les enregistrements sont récupérés
      dans cet ordre par défaut si `defaultOrderings` n'est pas surchargé.
  - prompt: |
      Quel est le rôle du champ `delete` dans la section `ctrl` d'un TCA
      (ex. `'delete' => 'deleted'`) ?
    options:
      - "Il permet à l'éditeur de supprimer définitivement un enregistrement en BDD."
      - "Il active la suppression douce (soft delete) : l'enregistrement n'est pas supprimé de la BDD mais marqué deleted=1 et filtré automatiquement."
      - "Il désactive le bouton de suppression dans le backend pour les non-admins."
      - "Il configure le cron de nettoyage automatique de la table."
    answer: 1
    tags: [tca, ctrl, soft-delete]
    level: debutant
    explanation: >
      `'delete' => 'deleted'` active la **suppression douce** : quand un éditeur
      supprime un enregistrement, TYPO3 ne fait qu'écrire `deleted = 1`. L'enregistrement
      reste en BDD mais est filtré de toutes les requêtes (frontend et backend).
      Cela permet la restauration et évite les références brisées. TYPO3 applique ce
      filtre automatiquement — pas besoin de `WHERE deleted = 0` dans tes repositories
      Extbase.
---

Vérifie ta compréhension du TCA avant d'attaquer Extbase.
