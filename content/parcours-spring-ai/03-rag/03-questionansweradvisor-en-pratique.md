---
title: "QuestionAnswerAdvisor : le RAG prêt à l'emploi"
type: lesson
---

## Les advisors : des « middlewares » autour du ChatClient

Un **advisor** Spring AI s'intercale autour d'un appel `ChatClient`, pour en
modifier la requête et/ou la réponse — sans toucher au code métier qui
appelle `.prompt().user(...)`.

> **Passerelle.** L'idée est la même qu'un `EventSubscriber` Symfony ou un
> middleware de client HTTP : du code générique qui s'exécute **autour**
> d'un appel, de façon transparente pour l'appelant.

Le pipeline de requête RAG écrit à la main dans la leçon précédente (chercher
le contexte, l'injecter dans le prompt) est **exactement** ce que fait le
`QuestionAnswerAdvisor`, tout prêt.

## Brancher le RAG en une ligne

```java
@Service
public class RagQueryService {

    private final ChatClient chatClient;

    public RagQueryService(VectorStore vectorStore, ChatModel chatModel) {
        this.chatClient = ChatClient.builder(chatModel)
                // Every call through this client is automatically
                // preceded by: embed the question, search the store,
                // inject the retrieved context into the prompt.
                .defaultAdvisors(QuestionAnswerAdvisor.builder(vectorStore)
                        .searchRequest(SearchRequest.builder()
                                .topK(4)
                                .similarityThreshold(0.75)
                                .build())
                        .build())
                .build();
    }

    public String answer(String question) {
        // No manual retrieval code here anymore — the advisor does it
        return chatClient.prompt()
                .user(question)
                .call()
                .content();
    }
}
```

Le code métier redevient aussi simple qu'un appel `ChatClient` classique : le
`QuestionAnswerAdvisor` fait la recherche vectorielle et l'augmentation du
prompt **avant** l'appel au modèle, de façon transparente.

## Filtrer par métadonnées : une recherche par tenant/type

Sur un projet multi-clients (comme tes pipelines d'extraction documentaire),
il ne faut jamais laisser une question fuiter sur les documents d'un autre
client — le filtre s'applique **dans** la recherche vectorielle, pas après.

```java
SearchRequest scopedRequest = SearchRequest.builder()
        .topK(4)
        .similarityThreshold(0.75)
        .filterExpression("clientId == '" + currentClientId + "'")
        .build();

ChatClient scopedClient = ChatClient.builder(chatModel)
        .defaultAdvisors(QuestionAnswerAdvisor.builder(vectorStore)
                .searchRequest(scopedRequest)
                .build())
        .build();
```

> ⚠️ **Erreur fréquente — oublier le filtre de portée (tenant, client,
> visibilité).** Sans `filterExpression`, une recherche RAG peut ramener des
> chunks appartenant à **n'importe quel** document indexé, y compris ceux
> d'un autre client. C'est une faille de sécurité au même titre qu'oublier un
> `WHERE client_id = ?` sur une requête SQL.

## Que se passe-t-il si rien de pertinent n'est trouvé ?

Si aucun chunk ne dépasse le `similarityThreshold`, le contexte injecté est
vide (ou quasi vide) — le modèle peut alors être tenté d'**halluciner** une
réponse plausible plutôt que d'admettre qu'il ne sait pas.

> **Réflexe à prendre.** Rends ce cas explicite dans le prompt système :
> « Si le contexte ne contient pas la réponse, dis-le clairement plutôt que
> d'inventer. » C'est une instruction simple, mais elle réduit nettement le
> risque d'hallucination — le même réflexe que valider qu'une requête SQL a
> retourné des lignes avant d'afficher un résultat.

## À retenir

- Un **advisor** encapsule un comportement transversal autour du
  `ChatClient` — ici, la recherche vectorielle + l'augmentation du prompt.
- `QuestionAnswerAdvisor` transforme le pipeline RAG « fait main » en une
  ligne de configuration au moment de construire le `ChatClient`.
- Toujours scoper la recherche avec un `filterExpression` sur un projet
  multi-clients : sans ça, un RAG peut fuiter des données entre clients.
- Instruis explicitement le modèle à admettre qu'il ne sait pas quand le
  contexte récupéré ne contient pas la réponse.
