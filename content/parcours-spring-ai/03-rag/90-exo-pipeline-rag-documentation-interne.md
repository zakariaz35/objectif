---
title: "Exercice — conçois le pipeline RAG d'une base de contrats"
type: exercise
---

> ⏱️ **Durée conseillée : ~20 min.**

## Énoncé

Une entreprise veut interroger en langage naturel sa base de **contrats
fournisseurs** (PDF, quelques dizaines de pages chacun), multi-clients : les
questions posées par l'équipe du client A ne doivent **jamais** faire
remonter d'information issue des contrats du client B.

Conçois le pipeline complet :

1. **Ingestion** — écris la méthode qui lit un contrat PDF, le découpe en
   chunks, et l'indexe dans pgvector avec les métadonnées nécessaires pour
   respecter l'isolation entre clients.
2. **Requête** — écris le service qui répond à une question pour un client
   donné, en t'appuyant sur `QuestionAnswerAdvisor`, avec :
   - un filtre garantissant l'isolation par client,
   - un prompt système qui interdit explicitement d'halluciner,
   - une température basse.
3. Un utilisateur demande : « Quelle est la durée de préavis pour résilier
   ce contrat ? » alors qu'aucun contrat indexé n'aborde ce sujet. Que
   devrait répondre le système, et pourquoi est-ce le comportement
   attendu ?

<!--correction-->

## Correction

```java
// ContractIngestionService.java
@Service
public class ContractIngestionService {

    private final VectorStore vectorStore;

    public ContractIngestionService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public void ingestContract(String resourcePath, String clientId, String contractId) {
        TikaDocumentReader reader = new TikaDocumentReader(resourcePath);
        List<Document> chunks = new TokenTextSplitter().apply(reader.get());

        // clientId is the isolation key — every chunk carries it
        chunks.forEach(chunk -> chunk.getMetadata().putAll(Map.of(
                "clientId", clientId,
                "contractId", contractId
        )));

        vectorStore.add(chunks);
    }
}
```

```java
// ContractQaService.java
@Service
public class ContractQaService {

    private static final String SYSTEM_PROMPT = """
        You are a contract assistant. Answer ONLY using the context that
        will be provided with the question, which comes from the
        client's own contracts. If the context does not contain the
        answer, say clearly that you don't have this information —
        never invent an answer.
        """;

    private final VectorStore vectorStore;
    private final ChatModel chatModel;

    public ContractQaService(VectorStore vectorStore, ChatModel chatModel) {
        this.vectorStore = vectorStore;
        // A dedicated ChatClient is built per call to inject the
        // client-scoped filter — never share a client-agnostic advisor.
        this.chatModel = chatModel;
    }

    public String answerFor(String clientId, String question) {
        SearchRequest scopedRequest = SearchRequest.builder()
                .topK(4)
                .similarityThreshold(0.75)
                .filterExpression("clientId == '" + clientId + "'")
                .build();

        ChatClient scopedClient = ChatClient.builder(chatModel)
                .defaultAdvisors(QuestionAnswerAdvisor.builder(vectorStore)
                        .searchRequest(scopedRequest)
                        .build())
                .build();

        return scopedClient.prompt()
                .system(SYSTEM_PROMPT)
                .user(question)
                .options(AnthropicChatOptions.builder().temperature(0.1).build())
                .call()
                .content();
    }
}
```

**Réponse à la question 3** : le système devrait répondre quelque chose
comme *« Je ne trouve pas cette information dans les contrats indexés pour
ce client. »*, et **ne pas** improviser une durée de préavis plausible mais
inventée.

C'est le comportement attendu parce que :

- la recherche vectorielle ne remonte, dans ce cas, **aucun chunk** au-dessus
  du `similarityThreshold` sur le sujet du préavis ;
- le prompt système impose explicitement de ne répondre **qu'à partir** du
  contexte fourni, et de reconnaître l'absence d'information plutôt que de
  combler le vide par une hallucination ;
- l'isolation par `clientId` garantit, en plus, que même si un **autre**
  client avait un contrat mentionnant un préavis, cette information ne
  fuiterait jamais dans cette réponse.
