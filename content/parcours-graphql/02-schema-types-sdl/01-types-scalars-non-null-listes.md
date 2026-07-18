---
title: "Types objets, scalars, non-null et listes"
type: lesson
---

## Le SDL : le langage du contrat

Le **SDL** (*Schema Definition Language*) est le langage dédié dans lequel
s'écrit un schéma GraphQL. C'est **indépendant de tout langage de
programmation** — le même SDL décrit un schéma que le serveur soit écrit en
Node, en PHP, en Go ou en Java. Un type objet se déclare avec `type`, et
chaque champ précise son propre type :

```graphql
type Book {
  id: ID!
  title: String!
  publishedYear: Int
  rating: Float
  isAvailable: Boolean!
}
```

## Les scalars : le bas de l'échelle

Un **scalar** est un type qui ne se décompose plus en sous-champs — c'est une
feuille de l'arbre de la requête. GraphQL en fournit cinq **par défaut** :

| Scalar | Rôle |
|---|---|
| `Int` | entier signé 32 bits |
| `Float` | nombre à virgule flottante |
| `String` | chaîne de caractères UTF-8 |
| `Boolean` | `true` / `false` |
| `ID` | identifiant unique, sérialisé comme une `String`, mais sémantiquement distinct (indique « ceci identifie une entité ») |

> **Passerelle.** `ID` n'est pas un type « magique » côté transport — c'est
> juste une `String` avec une intention sémantique claire (comme documenter
> qu'un champ SQL `VARCHAR` est en réalité une clé primaire). Ne cherche pas
> d'entier caché derrière : `ID` reste une chaîne, même pour un id numérique.

### Scalars personnalisés

Le SDL de base ne fournit **aucun** scalar pour les dates, le JSON brut, etc.
On les déclare soi-même :

```graphql
scalar DateTime

type Book {
  id: ID!
  title: String!
  publishedAt: DateTime
}
```

Déclarer `scalar DateTime` dans le SDL ne suffit pas : il faut aussi fournir,
côté serveur, la **logique de sérialisation/validation** associée (comment
transformer une valeur JS `Date` en chaîne ISO envoyée au client, et
inversement). Le module 3 montre comment NestJS s'en charge nativement pour
les dates, sans écrire ce scalar à la main.

## Non-null (`!`) : un contrat, pas un détail

Par défaut, **tout champ GraphQL est nullable** — il peut valoir `null`.
Ajouter un `!` après un type déclare que ce champ **ne peut jamais être
`null`** : c'est un engagement fort du serveur envers le client.

```graphql
type Book {
  title: String!   # GUARANTEE: always a string, never null
  rating: Float     # Float OR null: may not be rated yet
}
```

> ⚠️ **Erreur fréquente — mettre `!` « par réflexe », partout.** Un `!` n'est
> pas juste une déclaration de type : c'est un **contrat d'exécution**. Si un
> resolver renvoie `null` pour un champ marqué `!`, GraphQL considère ça
> comme une **erreur d'exécution** — pas juste une valeur manquante. Cette
> erreur peut alors se propager vers le PARENT du champ (voir encadré
> ci-dessous), potentiellement au-delà de ce que tu imaginais. Réserve `!`
> aux champs dont tu es **certain** qu'ils seront toujours renseignés.

> 💡 **À retenir — la propagation du null.** Si un champ non-null (`!`)
> échoue et renvoie `null`, GraphQL ne s'arrête pas là : il **remonte** au
> champ parent le plus proche qui, lui, est **nullable**, et le met à `null`
> à sa place — potentiellement en cascade. On détaille ce mécanisme en
> profondeur au module 5 (gestion des erreurs) ; retiens pour l'instant qu'un
> `!` mal choisi peut faire disparaître bien plus de données que prévu en cas
> d'erreur.

## Les listes : `[T]` et ses quatre variantes

Une liste s'écrit entre crochets. Combinée au `!`, elle offre **quatre**
combinaisons de nullabilité, souvent mal comprises :

```graphql
type Book {
  tagsA: [String]     # list MAY be null, and MAY contain nulls
  tagsB: [String]!    # list can NOT be null, but its items can
  tagsC: [String!]    # list MAY be null, but its items can NOT
  tagsD: [String!]!   # NEITHER the list NOR its items can be null
}
```

| Écriture | La liste peut être `null` ? | Un item peut être `null` ? |
|---|---|---|
| `[String]` | oui | oui |
| `[String]!` | non | oui |
| `[String!]` | oui | non |
| `[String!]!` | non | non |

> **Réflexe à prendre.** Le `!` **collé au type** (`String!`) contraint les
> **éléments** de la liste. Le `!` **après le crochet fermant** (`[...]!`)
> contraint la **liste elle-même**. En pratique, `[String!]!` (« une liste
> qui existe toujours, pleine d'éléments qui existent toujours ») est le
> choix le plus fréquent et le plus sûr pour une collection classique — une
> liste vide `[]` reste parfaitement valide, ce n'est PAS la même chose
> qu'une liste `null`.

## À retenir

- Le SDL décrit le schéma indépendamment de tout langage serveur.
- 5 scalars natifs (`Int`, `Float`, `String`, `Boolean`, `ID`) ; les scalars
  personnalisés (`DateTime`...) demandent une sérialisation dédiée côté
  serveur.
- `!` est un **contrat d'exécution** : un champ non-null qui échoue déclenche
  une erreur qui peut se propager au parent — pas juste « ce champ est
  requis dans le type système ».
- Une liste a **deux** niveaux de nullabilité indépendants : la liste
  elle-même, et ses éléments — `[String!]!` est le choix le plus courant.
