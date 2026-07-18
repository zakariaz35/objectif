---
title: "pgvector en pratique"
type: lesson
---

## Pourquoi pgvector, et pas une base vectorielle dédiée

Tu es déjà à l'aise avec Postgres (Doctrine côté Symfony). **pgvector** est
une **extension** Postgres qui ajoute un type de colonne `vector` et des
opérateurs de distance — pas besoin d'introduire une base de données
supplémentaire (Pinecone, Weaviate...) juste pour héberger des embeddings sur
un projet de taille raisonnable.

> **Passerelle.** C'est le même raisonnement que sur tes projets de recherche
> documentaire actuels : avant de sortir l'artillerie lourde (moteur de
> recherche dédié), regarde si ta base relationnelle existante peut déjà
> couvrir le besoin. pgvector permet de garder **une seule base** pour tes
> données métier et tes vecteurs.

## Démarrer Postgres avec pgvector

```yaml
# docker-compose.yml
services:
  postgres:
    image: pgvector/pgvector:pg16   # Postgres 16 + pgvector pre-installed
    environment:
      POSTGRES_DB: ragdemo
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    ports:
      - "5432:5432"
```

```sql
-- Run once per database (Spring AI can also do it for you in dev, see below)
CREATE EXTENSION IF NOT EXISTS vector;
```

## Dépendance et configuration

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-vector-store-pgvector</artifactId>
</dependency>
```

```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ragdemo
spring.datasource.username=app
spring.datasource.password=app

spring.ai.vectorstore.pgvector.dimensions=1536
spring.ai.vectorstore.pgvector.distance-type=COSINE_DISTANCE
spring.ai.vectorstore.pgvector.index-type=HNSW
# Dev only — creates the table/extension automatically. Use a real
# migration (Flyway/Liquibase) in production, exactly like for your
# Doctrine migrations.
spring.ai.vectorstore.pgvector.initialize-schema=true
```

Le starter autoconfigure un bean `PgVectorStore` (implémentation de
`VectorStore`) : le code de la leçon précédente fonctionne **sans
modification** — tu changes uniquement le fournisseur.

## Ce que Spring AI crée sous le capot

```sql
-- Simplified view of the table Spring AI manages for you
CREATE TABLE vector_store (
    id UUID PRIMARY KEY,
    content TEXT,
    metadata JSONB,
    embedding VECTOR(1536)
);

-- The kind of query similaritySearch(...) runs behind the scenes
SELECT content, metadata, 1 - (embedding <=> :query_embedding) AS similarity
FROM vector_store
ORDER BY embedding <=> :query_embedding
LIMIT 5;
```

L'opérateur `<=>` est fourni par pgvector : il calcule la **distance
cosinus** directement en SQL, avec un index (`HNSW`) qui évite un scan
complet de la table sur de gros volumes.

> ⚠️ **Erreur fréquente — changer de modèle d'embedding sans migrer la
> colonne.** `dimensions=1536` doit correspondre **exactement** à la taille
> des vecteurs produits par ton `EmbeddingModel`. Passer d'un modèle à
> `1536` dimensions à un autre à `1024` sans réindexer casse tout, avec une
> erreur SQL à l'insertion — traite ça comme une **migration de schéma**
> incontournable, pas un détail de configuration.

## À retenir

- **pgvector** ajoute un type `vector` + des opérateurs de distance à
  Postgres — pas de base supplémentaire à opérer pour un projet raisonnable.
- Le starter `spring-ai-starter-vector-store-pgvector` autoconfigure un
  `PgVectorStore` ; ton code métier (`vectorStore.add`/`similaritySearch`)
  ne change pas par rapport à un autre `VectorStore`.
- `dimensions` doit correspondre exactement au modèle d'embedding utilisé —
  un changement de modèle impose une réindexation complète.
