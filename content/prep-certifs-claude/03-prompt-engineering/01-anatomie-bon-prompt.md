---
title: "Anatomie d'un bon prompt"
type: lesson
---

# Rôle, contexte, contraintes, exemples

Ce module pèse **20 % de l'examen**. Il porte moins sur « l'art du prompt » que sur des choix **structurels** : où placer une instruction (system vs user), quand les exemples few-shot aident vraiment, et — surtout — comment **garantir** un format de sortie plutôt que de l'espérer (leçons suivantes).

## Les quatre composants

| Composant | Rôle | Où le placer |
|---|---|---|
| **Rôle** | Cadre le comportement général (« tu es un reviewer de code Symfony senior ») | Système, en tête |
| **Contexte** | Les informations nécessaires à la tâche — ni plus, ni moins | Système ou message utilisateur, selon la stabilité de l'info |
| **Contraintes** | Ce que la réponse doit/ne doit pas faire (format, longueur, ton) | Système (contraintes stables) ou utilisateur (contraintes ponctuelles) |
| **Exemples few-shot** | Illustrent le format/style attendu par l'exemple plutôt que la description | Système ou début du message utilisateur |

> 🎯 **Piège d'examen —** ajouter du contexte « au cas où » (documentation entière d'un projet, historique complet non filtré) n'améliore pas la qualité de la réponse : au-delà d'un certain volume, un contexte non pertinent peut **distraire** le modèle de l'information réellement utile à la tâche (bruit de contexte). La bonne pratique structurelle est de ne fournir que le contexte **pertinent à la tâche demandée**, quitte à le récupérer dynamiquement (outil, recherche) plutôt que de tout charger par précaution.

## Few-shot : quand ça aide, quand ça n'apporte rien

Les exemples few-shot aident quand :
- le **format de sortie est ambigu** à décrire en langage naturel (structure inhabituelle, style précis à imiter) ;
- la tâche a des **cas limites** qu'il est plus rapide de montrer que d'énumérer.

Les exemples few-shot n'apportent rien (voire nuisent) quand :
- la tâche est déjà **bien spécifiée** par ailleurs (schéma de sortie strict, description claire) — coût en tokens sans bénéfice ;
- ils risquent de faire **sur-généraliser** sur les spécificités de l'exemple donné plutôt que sur la règle réelle.

> 🎯 **Piège d'examen —** un scénario propose d'ajouter 5 exemples few-shot à un prompt d'extraction qui utilise déjà un schéma de sortie strict (`output_config.format`, voir leçon suivante). C'est redondant : le schéma garantit déjà la forme de la sortie ; les exemples n'ajoutent de la valeur que pour orienter le **contenu** (ex. le style de résumé attendu), pas sa structure.

## System prompt vs message utilisateur

Le **system prompt** porte l'autorité de l'**opérateur** (celui qui déploie l'application) : il définit le rôle, les règles métier persistantes, les contraintes qui doivent s'appliquer à **tous** les tours de la conversation. Le **message utilisateur** porte la requête du tour courant.

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    system=(
        "You are a support assistant for Acme Corp. "
        "Never reveal internal pricing formulas. "
        "Always answer in the customer's language."
    ),
    messages=[{"role": "user", "content": "How much does the Pro plan cost?"}],
)
print(response.content[0].text)
```

> 🎯 **Piège d'examen —** un scénario décrit une règle métier persistante (« ne jamais révéler la formule de tarification interne ») placée dans le **message utilisateur** du premier tour d'une conversation longue. Le risque structurel : cette règle n'a pas le même statut d'autorité qu'une instruction système, et elle peut se retrouver diluée après plusieurs tours d'une conversation longue. La correction structurelle est de déplacer cette règle dans le **system prompt**, qui porte l'autorité de l'opérateur et reste présente à chaque tour, quelle que soit la longueur de la conversation.

## À retenir

- Quatre composants : rôle, contexte (pertinent, pas exhaustif), contraintes, exemples few-shot (utiles pour l'ambiguïté de forme, redondants si un schéma structuré existe déjà).
- Un contexte non pertinent distrait le modèle : fournir ce qui est utile à la tâche, pas tout par précaution.
- Règle métier persistante → system prompt (autorité opérateur, présent à chaque tour) ; requête ponctuelle → message utilisateur.
