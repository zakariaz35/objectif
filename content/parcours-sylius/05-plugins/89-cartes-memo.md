---
title: "Cartes mémo — Plugins et Override"
type: flashcards
cards:
  - q: |
      Quelle valeur de `"type"` dans `composer.json` distingue un plugin Sylius d'un simple bundle Symfony ?
    a: |
      `"type": "sylius-plugin"` — c'est la valeur attendue par les outils Sylius (Composer plugins, Sylius installer). Un bundle Symfony standard utilise `"symfony-bundle"`. Cette différence permet au système d'extension de Sylius de traiter le package correctement lors de l'installation.
  - q: |
      Quelle classe PHP doit étendre la classe principale d'un plugin Sylius pour bénéficier du mécanisme d'override automatique ?
    a: |
      `Sylius\Bundle\ResourceBundle\AbstractResourceBundle`. La méthode `getModelNamespace()` indique à Sylius le namespace des modèles du plugin, ce qui active le mécanisme de surcharge via `sylius_<bundle>: resources: <resource>: classes: model:`.
  - q: |
      Quel est le pattern recommandé pour ajouter un champ custom à l'entité `Product` de Sylius ?
    a: |
      1. Créer un **Trait PHP** avec le champ et ses accesseurs.
      2. Créer une entité `App\Entity\Product\Product` qui **étend** `Sylius\Component\Core\Model\Product` et use le Trait.
      3. Déclarer l'override dans `sylius_product.yaml` : `classes: model: App\Entity\Product\Product`.
      4. Générer et exécuter la migration Doctrine.
  - q: |
      Comment ajouter un champ à un FormType Sylius existant sans le copier-coller ?
    a: |
      Créer une `AbstractTypeExtension` Symfony avec `getExtendedTypes()` retournant la classe du FormType Sylius cible (ex. `ProductType::class`). C'est exactement le même mécanisme que pour n'importe quel FormType Symfony — pas de convention Sylius supplémentaire.
  - q: |
      Quelle est la syntaxe Twig pour étendre un template Sylius Admin sans créer de récursion infinie ?
    a: |
      ```twig
      {% extends '@!SyliusAdmin/Product/_form.html.twig' %}
      ```
      Le `!` force Twig à charger le template depuis le Bundle d'origine (pas depuis votre dossier de surcharge). Sans `!`, Twig cherche votre surcharge → qui étend votre surcharge → boucle infinie.
  - q: |
      Quel est le principal piège à éviter lors du déploiement d'un plugin Sylius dans un contexte agence ?
    a: |
      Inclure des **migrations Doctrine** dans le plugin lui-même. Les migrations doivent toutes résider dans le dossier `migrations/` de l'application finale. Un plugin avec ses propres migrations crée des conflits avec les autres plugins et l'application hôte lors des migrations.
---

Six cartes pour solidifier les patterns d'extension et d'override avant l'exercice pratique.
