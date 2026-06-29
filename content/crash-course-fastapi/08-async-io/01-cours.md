---
title: "async & I/O"
type: lesson
---

## `def` ou `async def` ?

FastAPI accepte les deux pour une route. La règle pratique :

- **`async def`** quand tu fais de l'**I/O asynchrone** (`await` sur une lib async : httpx, asyncpg, aioredis…). La coroutine s'exécute dans la **boucle d'événements** ;
- **`def`** (synchrone) quand ta route appelle du code **bloquant** (driver BDD synchrone, calcul lourd). FastAPI l'exécute alors dans un **threadpool**, pour **ne pas bloquer** la boucle.

> Piège classique : utiliser `async def` puis appeler dedans une lib **bloquante** (ex. `requests.get`, `time.sleep`). Cela **bloque la boucle** et tue la concurrence. Avec `async def`, **n'appelle que de l'I/O `await`-able**.

```python
import asyncio
import httpx
from fastapi import FastAPI

app = FastAPI()


# BON : I/O réseau non bloquante, on attend (await) sans figer la boucle.
@app.get("/agreger")
async def agreger() -> dict[str, int]:
    async with httpx.AsyncClient() as client:
        # Les deux requêtes partent en concurrence.
        r1, r2 = await asyncio.gather(
            client.get("https://example.com/a"),
            client.get("https://example.com/b"),
        )
    return {"a": r1.status_code, "b": r2.status_code}
```

## La concurrence ≠ le parallélisme

`asyncio` permet de **superposer des attentes I/O** : pendant qu'une requête réseau attend, la boucle traite **autre chose**. Ce n'est **pas** du calcul parallèle (un seul thread porte la boucle). Pour du **CPU intensif**, on délègue (threadpool, *process pool*, tâche de fond).

## Sandbox : sentir l'`async` en pur Python

Pyodide exécute du Python **asynchrone** (la sandbox utilise `runPythonAsync`). Compare une exécution **séquentielle** et une exécution **concurrente** avec `asyncio.gather` — c'est exactement le gain qu'apporte `async def` côté FastAPI sur de l'I/O.

## Bac à sable

> Augmente les durées et ajoute une 3e tâche dans `gather` : le temps concurrent reste celui de la plus longue, pas la somme.

```python
import asyncio
import time


async def tache(nom: str, duree: float) -> str:
    # 'await asyncio.sleep' simule une I/O non bloquante (réseau, BDD async).
    await asyncio.sleep(duree)
    return f"{nom} terminée en {duree}s"


async def sequentiel() -> None:
    debut = time.perf_counter()
    await tache("A", 0.3)
    await tache("B", 0.3)
    print(f"Séquentiel : {time.perf_counter() - debut:.2f}s (0.3 + 0.3)")


async def concurrent() -> None:
    debut = time.perf_counter()
    # gather lance les deux "I/O" en concurrence : on attend le plus long.
    resultats = await asyncio.gather(tache("A", 0.3), tache("B", 0.3))
    print(f"Concurrent : {time.perf_counter() - debut:.2f}s ->", resultats)


# Pyodide exécute déjà dans une boucle d'événements (runPythonAsync) :
# on peut donc 'await' directement, sans asyncio.run().
await sequentiel()
await concurrent()
```
