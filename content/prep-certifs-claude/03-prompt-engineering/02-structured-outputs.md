---
title: "Structured outputs — le point structurel de l'examen"
type: lesson
---

# Garantir un schéma, pas l'espérer

C'est **le** concept charnière du domaine 3. Face à un scénario qui demande « comment garantir que la sortie est un JSON valide, conforme à un schéma », il y a une bonne réponse **structurelle** et un piège récurrent : demander gentiment du JSON dans le prompt.

## Le piège : demander du JSON dans le prompt

```text
Respond only in JSON, with the keys "name", "email", "plan_interest" and
"demo_requested". Do not include anything other than the JSON.
```

Même avec un prompt soigné, cette approche **ne garantit rien** : le modèle peut produire un JSON syntaxiquement invalide, omettre un champ requis, mélanger les types (`"demo_requested": "true"` au lieu de `true`), ou ajouter du texte avant/après le JSON. C'est un problème *probabiliste* qu'aucune formulation de prompt ne résout à 100 %.

## La solution structurelle : `output_config.format`

Les **structured outputs** contraignent la génération du modèle via un **décodage contraint** (le modèle ne peut physiquement produire que des tokens conformes au schéma) — ce n'est plus une question de formulation, c'est une garantie du serveur.

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": (
                "Extract the key information from this email: John Smith "
                "(john@example.com) is interested in our Enterprise plan and "
                "wants to schedule a demo for next Tuesday at 2pm."
            ),
        }
    ],
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "email": {"type": "string"},
                    "plan_interest": {"type": "string"},
                    "demo_requested": {"type": "boolean"},
                },
                "required": ["name", "email", "plan_interest", "demo_requested"],
                "additionalProperties": False,
            },
        }
    },
)
print(response.content[0].text)  # Valid JSON matching the schema, guaranteed
```

> Historique : ce paramètre remplace l'ancien `output_format` bêta — les deux fonctionnent encore pendant une période de transition, mais `output_config.format` est la forme actuelle à connaître pour l'examen.

## Demander du JSON vs structured outputs

| | Demander du JSON dans le prompt | `output_config.format` (structured outputs) |
|---|---|---|
| **Garantie de validité JSON** | Non — dépend du modèle, de la longueur, du contenu | Oui — décodage contraint par grammaire |
| **Champs requis respectés** | Non garanti | Garanti |
| **Types corrects** | Non garanti (`"2"` au lieu de `2`) | Garanti |
| **Retries nécessaires** | Souvent (parser, valider, redemander) | Non, pour la conformité au schéma |
| **Coût** | Prompt plus long si on ajoute des exemples/rappels | Un paramètre d'API, sans gonfler le prompt |

> 🎯 **Piège d'examen —** un scénario propose d'**améliorer le prompt** (ajouter des exemples few-shot, répéter « réponds STRICTEMENT en JSON », ajouter un rappel en fin de message) pour fiabiliser un format de sortie critique pour un pipeline automatisé. Toutes ces réponses restent des optimisations de **prompt**, donc probabilistes. La réponse structurelle attendue est `output_config.format` avec `type: "json_schema"` — le seul mécanisme qui **garantit** la conformité, indépendamment de la qualité du prompt.

## Aide des SDKs : schémas natifs

Les SDKs offrent des raccourcis pour éviter d'écrire le JSON Schema à la main — par exemple des modèles Pydantic en Python via `client.messages.parse()` :

```python
from pydantic import BaseModel
from anthropic import Anthropic

class ContactInfo(BaseModel):
    name: str
    email: str
    plan_interest: str
    demo_requested: bool

client = Anthropic()
response = client.messages.parse(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Extract the key information from this email: ..."}],
    output_format=ContactInfo,
)
print(response.parsed_output)
```

`client.messages.parse()` traduit `output_format` en `output_config.format` en interne — c'est un raccourci du SDK Python, pas un paramètre d'API différent.

## À retenir

- Demander du JSON dans le prompt = probabiliste, jamais garanti.
- `output_config: {format: {type: "json_schema", schema}}` = garantie structurelle via décodage contraint.
- Sur un scénario « comment garantir le schéma », la bonne réponse est toujours un **paramètre d'API**, jamais une amélioration de prompt.
