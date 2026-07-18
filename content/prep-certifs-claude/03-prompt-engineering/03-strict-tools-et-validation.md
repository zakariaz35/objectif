---
title: "strict: true sur les outils & boucles de validation"
type: lesson
---

# Garantir les paramètres d'un outil, pas seulement le format de réponse

Les structured outputs (leçon précédente) garantissent le **texte de réponse**. Pour garantir les **paramètres passés à un outil** (`tool_use`), le mécanisme équivalent est `strict: true` sur la définition de l'outil.

## `strict: true` : décodage contraint pour les paramètres d'outil

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[{"role": "user", "content": "What's the weather like in San Francisco?"}],
    tools=[
        {
            "name": "get_weather",
            "description": "Get the current weather in a given location",
            "strict": True,  # Enable grammar-constrained sampling on the input
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"},
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
                "additionalProperties": False,
            },
        }
    ],
)
```

Sans `strict: true`, un outil qui attend `passengers: int` peut recevoir `"2"` (chaîne) ou `"two"` (texte) — un type incompatible qui casse silencieusement l'appel de fonction côté serveur. Avec `strict: true`, l'input du bloc `tool_use` respecte **toujours** le schéma : type correct, champs requis présents, et le nom de l'outil est garanti valide (parmi ceux fournis).

## Deux exigences structurelles du schéma en mode strict

Pour que `strict: true` fonctionne, le schéma doit respecter deux contraintes :

- **`additionalProperties: false`** — sur chaque objet du schéma, sinon la contrainte de grammaire ne peut pas être complètement déterminée.
- **`required`** — lister explicitement les champs obligatoires.

> 🎯 **Piège d'examen —** un scénario présente un outil avec `strict: true` mais un schéma **sans** `additionalProperties: false` ni `required` explicite, et demande pourquoi la validation semble incomplète. La réponse structurelle : ces deux clés sont des **prérequis** du mode strict, pas des options facultatives — un schéma qui les omet ne bénéficie pas des mêmes garanties.

## Ce que le décodage contraint ne couvre pas : les contraintes numériques/longueur

Les structured outputs et `strict: true` reposent sur un **sous-ensemble** de JSON Schema. Des contraintes comme `minimum`, `maximum`, `minLength`, `maxLength` ou `pattern` ne sont **pas** appliquées par le décodage contraint lui-même : certains SDKs les retirent automatiquement du schéma envoyé au modèle (en reportant l'information dans la description) et valident la réponse côté client contre le schéma **original**, avec toutes ses contraintes.

> 🎯 **Piège d'examen —** un scénario décrit un champ `age` avec `minimum: 18` dans le schéma, et le modèle renvoie techniquement un JSON valide (un entier) mais avec `age: 15`. La question posée est : est-ce que `output_config.format` ou `strict: true` auraient dû empêcher cette valeur ? Réponse : **non** — ces contraintes numériques ne sont pas garanties par le décodage contraint, il faut les **valider côté client** après réception, exactement comme n'importe quelle règle métier qui dépasse la forme structurelle du JSON (type, champs requis).

## Boucle de validation / retry

Même avec des structured outputs, une boucle de validation côté client reste utile pour les règles que le schéma ne couvre pas (contraintes numériques, cohérence métier entre plusieurs champs, vérification contre une source de vérité externe) :

```python
def extract_with_retry(client, prompt: str, schema: dict, max_attempts: int = 3):
    messages = [{"role": "user", "content": prompt}]
    for attempt in range(max_attempts):
        response = client.messages.create(
            model="claude-opus-4-8",
            max_tokens=1024,
            messages=messages,
            output_config={"format": {"type": "json_schema", "schema": schema}},
        )
        import json
        data = json.loads(response.content[0].text)

        error = validate_business_rules(data)  # your own validation function
        if error is None:
            return data

        # Feed the validation error back so the model can correct itself
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": f"Validation error: {error}. Please correct."})

    raise RuntimeError("Validation failed after max attempts")
```

> 🎯 **Piège d'examen —** un scénario oppose « ajouter encore plus de contraintes dans le prompt pour forcer une règle métier complexe (ex. cohérence entre deux champs) » à « valider côté client et redemander avec l'erreur ». La seconde option est la réponse structurelle : elle ne dépend pas de la capacité du modèle à respecter une règle purement textuelle, elle **vérifie** effectivement le résultat et ne boucle que si nécessaire.

## À retenir

- `strict: true` garantit les paramètres d'un outil (type, requis, nom) via décodage contraint — exige `additionalProperties: false` et `required`.
- Les contraintes de valeur (min/max/longueur/pattern) ne sont **pas** garanties par le décodage contraint : validation côté client obligatoire.
- Boucle de validation/retry : valider effectivement le résultat, redemander avec l'erreur précise — plus fiable qu'empiler des contraintes dans le prompt.
