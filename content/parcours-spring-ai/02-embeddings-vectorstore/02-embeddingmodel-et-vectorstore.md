---
title: "EmbeddingModel et VectorStore"
type: lesson
---

## Deux abstractions, comme pour le chat

Spring AI applique exactement le même principe d'abstraction vu au module 1
aux embeddings : une interface `EmbeddingModel` pour **produire** des
vecteurs, une interface `VectorStore` pour les **stocker et rechercher**,
chacune avec plusieurs implémentations interchangeables.

```java
@Service
public class EmbeddingDemo {

    private final EmbeddingModel embeddingModel;

    public EmbeddingDemo(EmbeddingModel embeddingModel) {
        this.embeddingModel = embeddingModel;
    }

    public float[] vectorFor(String text) {
        // Turns a piece of text into a vector of floats
        return embeddingModel.embed(text);
    }
}
```

> ⚠️ **Erreur fréquente — attendre un starter d'embeddings chez Anthropic.**
> Contrairement à OpenAI, **Claude n'expose pas d'API d'embeddings** : c'est
> un modèle de *chat*, pas d'embedding. En pratique, un projet Spring AI qui
> utilise Claude pour le chat combine souvent un **autre** fournisseur pour
> les embeddings (OpenAI, VoyageAI, ou un modèle local via Ollama comme
> `nomic-embed-text`). C'est exactement la logique de l'abstraction
> multi-modèles : **un fournisseur par capacité**, pas un fournisseur unique
> imposé partout.

## `Document` : l'unité stockée dans le VectorStore

Un `Document` Spring AI, ce n'est pas une entité JPA : c'est un conteneur
simple — texte + métadonnées — que le `VectorStore` va embarquer et indexer.

```java
import org.springframework.ai.document.Document;

Document doc = new Document(
        "Invoice #4521 — Client: Acme Corp — Amount: 1 240,00 EUR — Due: 2026-08-01",
        Map.of("type", "invoice", "clientId", "acme-corp", "invoiceId", "4521")
);
```

Les **métadonnées** (`Map<String, Object>`) sont ce qui te permettra plus
tard de filtrer une recherche (« uniquement les factures du client X »).

## `VectorStore` : indexer, puis rechercher

```java
@Service
public class DocumentIndexer {

    private final VectorStore vectorStore;

    public DocumentIndexer(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public void index(List<Document> documents) {
        // Spring AI computes the embeddings internally and stores them
        vectorStore.add(documents);
    }

    public List<Document> findRelevant(String query, int topK) {
        SearchRequest request = SearchRequest.builder()
                .query(query)
                .topK(topK)
                .similarityThreshold(0.7)   // discard weak matches
                .build();
        return vectorStore.similaritySearch(request);
    }
}
```

Remarque : `vectorStore.add(...)` calcule lui-même les embeddings via
l'`EmbeddingModel` configuré — tu n'as **pas** besoin d'appeler
`embeddingModel.embed(...)` toi-même avant d'indexer.

> **Réflexe à prendre.** Traite `VectorStore` comme un `Repository` Spring
> Data : tu l'injectes, tu appelles `add(...)`/`similaritySearch(...)`, et tu
> ne gères la persistance sous-jacente (SQL, index) toi-même que si tu as un
> vrai besoin de contrôle fin.

## Fournisseurs de VectorStore disponibles

| VectorStore | Cas d'usage |
|---|---|
| `SimpleVectorStore` | en mémoire, pour prototyper — rien n'est persistant |
| `PgVectorStore` | Postgres + extension `pgvector` — le choix naturel si tu es déjà sur Postgres |
| `Chroma`, `Milvus`, `Qdrant`, `Weaviate`... | bases vectorielles dédiées, pour des volumes/besoins plus poussés |

La leçon suivante se concentre sur **pgvector** — le choix le plus naturel
pour toi puisque tu es déjà familier de Postgres côté Doctrine/Symfony.

## À retenir

- `EmbeddingModel` produit des vecteurs, `VectorStore` les stocke et les
  recherche — deux abstractions interchangeables, comme `ChatModel`.
- **Claude n'a pas d'API d'embeddings** : combine un fournisseur de chat
  (Anthropic) avec un fournisseur d'embeddings différent si besoin.
- `vectorStore.add(documents)` calcule les embeddings pour toi ;
  `similaritySearch(SearchRequest)` fait la recherche par proximité.
