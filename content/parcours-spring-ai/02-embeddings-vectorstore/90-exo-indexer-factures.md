---
title: "Exercice — indexer une base de factures dans pgvector"
type: exercise
---

> ⏱️ **Durée conseillée : ~15 min.**

## Énoncé

Tu disposes d'un service qui, après OCR, produit pour chaque facture un
texte brut et quelques métadonnées :

```java
public record OcrResult(
        String invoiceId,
        String clientId,
        String rawText   // full text extracted by the OCR pipeline
) {}
```

Tu veux permettre, plus tard, une recherche du type « retrouve les factures
qui parlent de retard de paiement pour le client Acme ».

1. Écris une méthode `void indexInvoices(List<OcrResult> results)` qui
   transforme chaque `OcrResult` en `Document` Spring AI (texte +
   métadonnées `invoiceId` et `clientId`), puis les indexe dans le
   `VectorStore`.
2. Écris une méthode `List<Document> searchForClient(String query, String
   clientId, int topK)` qui ne retourne que les documents du client
   demandé — sans re-scanner tout et filtrer en Java après coup.
3. Quelle configuration `pgvector` (dimension, type d'index) faut-il vérifier
   avant de lancer l'indexation, et pourquoi ?

<!--correction-->

## Correction

```java
// InvoiceIndexer.java
@Service
public class InvoiceIndexer {

    private final VectorStore vectorStore;

    public InvoiceIndexer(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public void indexInvoices(List<OcrResult> results) {
        List<Document> documents = results.stream()
                .map(r -> new Document(
                        r.rawText(),
                        Map.of(
                                "invoiceId", r.invoiceId(),
                                "clientId", r.clientId()
                        )
                ))
                .toList();

        // Spring AI computes the embeddings and stores them in pgvector
        vectorStore.add(documents);
    }

    public List<Document> searchForClient(String query, String clientId, int topK) {
        SearchRequest request = SearchRequest.builder()
                .query(query)
                .topK(topK)
                .similarityThreshold(0.7)
                // Metadata filter: pushed down to the search itself,
                // not a manual filter after the fact
                .filterExpression("clientId == '" + clientId + "'")
                .build();

        return vectorStore.similaritySearch(request);
    }
}
```

**Points clés** :

- Le **filtre métadonnées** (`filterExpression`) évite de charger tous les
  documents pertinents *tous clients confondus* avant de filtrer en mémoire
  — la recherche vectorielle ET le filtre s'exécutent dans la même requête
  SQL, avec l'index `HNSW`.
- Avant de lancer `indexInvoices`, il faut vérifier que
  `spring.ai.vectorstore.pgvector.dimensions` correspond **exactement** à la
  dimension du modèle d'embedding configuré. Une divergence provoque une
  erreur SQL à l'insertion (`VECTOR(1536)` ne peut pas stocker un vecteur de
  1024 dimensions).
- En production, ne dépends pas de `initialize-schema=true` : la table
  `vector_store` (et son index) doit être créée par une **vraie migration**
  (Flyway/Liquibase), au même titre que tes migrations Doctrine.
