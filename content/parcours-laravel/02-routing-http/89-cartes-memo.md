---
title: "Cartes mémo — Routing & HTTP"
type: flashcards
cards:
  - q: |
      Quelle est la différence entre `routes/web.php` et `routes/api.php` en Laravel ?
    a: |
      **`web.php`** : routes pour le navigateur. Middleware groupe `web` appliqué
      automatiquement (session, CSRF, cookies). Préfixe : aucun.

      **`api.php`** : routes API. Middleware groupe `api` (stateless, pas de session).
      Préfixe automatique `/api`. Idéal pour les apps consommées par un front SPA ou
      mobile.
  - q: |
      Qu'est-ce que le Route Model Binding et pourquoi l'utiliser ?
    a: |
      Laravel résout automatiquement le modèle Eloquent correspondant au paramètre de
      route. Si `{invoice}` est dans l'URL, Laravel exécute `Invoice::findOrFail($id)`
      et injecte l'objet directement dans le controller. Retourne 404 si introuvable.
      Évite de répéter `findOrFail()` dans chaque action.
  - q: |
      Comment un Middleware Laravel encapsule-t-il les phases avant/après du controller ?
    a: |
      Dans une seule méthode `handle(Request $request, Closure $next)`. Le code
      **avant** `$next($request)` équivaut à `kernel.request`. Le code **après**
      l'appel (sur la `$response` retournée) équivaut à `kernel.response`. C'est plus
      compact qu'un EventSubscriber Symfony qui nécessite deux méthodes séparées.
  - q: |
      Quelle est l'équivalence entre FormRequest Laravel et les outils Symfony de validation ?
    a: |
      Un `FormRequest` remplace à la fois :
      - Le composant `Form` (définition des champs)
      - Le composant `Validator` (règles de validation)
      - La méthode `authorize()` remplace `#[IsGranted]` ou un Voter pour décider si la
        requête est autorisée.
      Tout en un seul fichier, validé automatiquement avant d'atteindre le controller.
  - q: |
      Quelle est la différence entre `{{ $var }}` et `{!! $var !!}` en Blade ?
    a: |
      `{{ $var }}` : **auto-escape HTML** (équivalent `{{ var | escape }}` en Twig).
      Sûr pour afficher des données utilisateur.

      `{!! $var !!}` : **sortie brute, sans échappement**. À n'utiliser que pour du HTML
      de confiance (ex. contenu généré par un éditeur WYSIWYG que vous avez vous-même
      sanitisé).
