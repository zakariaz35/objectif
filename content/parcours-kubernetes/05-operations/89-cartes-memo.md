---
title: "Cartes mémo — Opérations"
type: flashcards
cards:
  - q: |
      Quelle différence de rôle entre `requests` et `limits` sur un conteneur ?
    a: |
      `requests` est utilisé par le **scheduler** pour décider si un node a la place
      d'accueillir le Pod (ressource garantie). `limits` est le plafond appliqué à
      l'exécution — dépassé, il déclenche throttling (CPU) ou kill (mémoire).
  - q: |
      Dépasser une limite CPU et dépasser une limite mémoire ont-ils la même
      conséquence ?
    a: |
      **Non.** Dépasser `limits.cpu` entraîne un simple **throttling** (ralentissement,
      jamais de kill). Dépasser `limits.memory` entraîne un **OOMKill immédiat**
      (`exitCode: 137`) — le processus est tué sans préavis.
  - q: |
      Un Pod est en `CrashLoopBackOff`. Quel champ vérifier en premier pour savoir si
      c'est un OOMKill ?
    a: |
      `kubectl get pod <name> -o jsonpath='{.status.containerStatuses[0].lastState}'` —
      un `reason: OOMKilled` (`exitCode: 137`) pointe directement vers une
      `limits.memory` trop basse, sans perdre de temps à chercher un bug applicatif.
  - q: |
      Un Pod reste bloqué en `Pending` sans jamais démarrer. Quelle cause est la plus
      probable si `kubectl describe pod` montre `Insufficient cpu` ?
    a: |
      Sa `requests.cpu` dépasse ce qui reste disponible sur les nodes du cluster — le
      scheduler ne trouve **aucun** node capable de l'accueillir, avant même la
      moindre tentative de démarrage.
  - q: |
      Pourquoi un HPA reste-t-il bloqué sur `<unknown>` si le Deployment cible n'a pas
      de `requests.cpu` défini ?
    a: |
      Le pourcentage cible du HPA se calcule **par rapport aux `requests`** — sans
      valeur de référence, il n'y a rien à comparer à la métrique observée. C'est la
      cause la plus fréquente d'un HPA qui ne scale jamais.
  - q: |
      Face à un Pod qui redémarre en boucle, pourquoi `kubectl logs --previous` est-il
      souvent plus utile que `kubectl logs` seul ?
    a: |
      Le conteneur **actuel** peut venir de redémarrer et n'avoir encore rien loggé.
      `--previous` récupère les logs du conteneur **précédent**, celui qui a
      effectivement crashé — souvent là où se trouve la vraie cause.
  - q: |
      Que fait `kustomize` que ne fait pas un simple copier-coller de YAML entre
      environnements ?
    a: |
      Il dérive des variantes (préfixe de nom, nombre de répliques, patchs ciblés) à
      partir d'un YAML de **base unique**, sans dupliquer le manifest — évitant que les
      copies divergent silencieusement au fil du temps.
---

Lis, réfléchis, révèle, auto-évalue.
