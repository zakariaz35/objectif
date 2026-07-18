---
title: "Namespaces, requests/limits, et le piège de l'OOMKill"
type: lesson
---

# Namespaces, requests/limits, et le piège de l'OOMKill

Un cluster de production héberge plusieurs équipes, plusieurs environnements, parfois
plusieurs clients. Deux mécanismes structurent ce partage : les **namespaces**
(organisation logique) et les **requests/limits** (partage réel des ressources
physiques) — ce dernier étant la source d'un des pièges les plus fréquents en
production : l'**OOMKill**.

## Namespaces : organiser, pas isoler par défaut

Un namespace regroupe des objets (Pods, Services, ConfigMaps…) sous un même espace de
noms — pratique pour séparer équipes, projets ou environnements dans un seul cluster.

```bash
kubectl create namespace shop
kubectl get pods -n shop
kubectl config set-context --current --namespace=shop   # avoid typing -n shop everywhere
```

Rappel du module 4 : un namespace **n'isole pas le réseau** par défaut — cette isolation
est un choix explicite via NetworkPolicy, pas une propriété automatique du namespace.

## requests et limits : deux nombres, deux rôles différents

Chaque conteneur peut déclarer, par ressource (`cpu`, `memory`) :

- `requests` : ce que le conteneur est **garanti** d'obtenir — utilisé par le
  **scheduler** pour décider si un node a la place d'accueillir ce Pod ;
- `limits` : le **plafond** que le conteneur ne peut jamais dépasser — appliqué par le
  kubelet/runtime, pas par le scheduler.

```yaml
resources:
  requests:
    cpu: "100m"       # 0.1 CPU core, guaranteed
    memory: "128Mi"
  limits:
    cpu: "500m"       # hard ceiling: throttled beyond this
    memory: "256Mi"   # hard ceiling: OOMKilled beyond this
```

> **Repère —** dépasser une limite **CPU** entraîne un simple **throttling** (le
> conteneur est ralenti, jamais tué). Dépasser une limite **mémoire** entraîne un
> **OOMKill immédiat** : le conteneur est tué sans préavis. Les deux ressources ne se
> comportent pas du tout pareil en cas de dépassement.

## Le piège vérifié en conditions réelles : OOMKilled

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: oom-demo
spec:
  containers:
    - name: hog
      image: polinux/stress
      args: ["--vm", "1", "--vm-bytes", "100M", "--vm-hang", "0"]   # tries to allocate 100Mi
      resources:
        requests:
          memory: "10Mi"
        limits:
          memory: "20Mi"     # ...but the limit only allows 20Mi
```

```bash
kubectl apply -f oom-demo.yaml
kubectl get pod oom-demo
```

```
NAME       READY   STATUS             RESTARTS
oom-demo   0/1     CrashLoopBackOff   1 (2s ago)
```

```bash
kubectl get pod oom-demo -o jsonpath='{.status.containerStatuses[0].lastState}'
```

```json
{"terminated":{"exitCode":137,"reason":"OOMKilled", ...}}
```

`exitCode: 137` (128 + signal 9, `SIGKILL`) et `reason: OOMKilled` confirment que c'est
bien le kernel Linux (cgroups) qui a tué le processus pour dépassement mémoire — pas un
crash applicatif. `CrashLoopBackOff` s'installe ensuite : Kubernetes relance le
conteneur, qui replante immédiatement, en boucle, avec un délai croissant entre
tentatives.

> **Piège classique** — une `limits.memory` trop basse par rapport au besoin réel
> applicatif produit exactement ce symptôme : `CrashLoopBackOff` + `OOMKilled`, sans
> aucun message d'erreur applicatif exploitable (le processus est tué brutalement, il
> n'a pas le temps de logger). Face à un `CrashLoopBackOff`, **toujours** vérifier
> `lastState.terminated.reason` avant de chercher un bug côté code.

## L'autre symptôme : `Pending` par manque de ressources

Une `requests.cpu` trop haute par rapport à la capacité **disponible** du cluster
empêche simplement le scheduler de trouver un node — vérifié en conditions réelles :

```bash
kubectl describe pod too-big
```

```
Events:
  Warning  FailedScheduling  0/1 nodes are available: 1 Insufficient cpu.
```

Contrairement à l'OOMKill (le Pod démarre, puis est tué), ce symptôme bloque **avant
même le démarrage** : `STATUS: Pending`, jamais `Running`. Deux causes très différentes
pour deux moments très différents du cycle de vie d'un Pod.

## À retenir

- `requests` = ce que le **scheduler** garantit (impacte le placement) ; `limits` = le
  plafond appliqué à l'exécution (impacte le comportement en cas de dépassement).
- Dépasser une limite **CPU** => throttling (ralentissement, jamais de kill). Dépasser
  une limite **mémoire** => **OOMKill immédiat** (`exitCode: 137`), sans aucun log
  applicatif exploitable.
- `CrashLoopBackOff` + `lastState.terminated.reason: OOMKilled` doit systématiquement
  orienter vers un ajustement de `limits.memory`, pas vers une chasse au bug applicatif.
- Une `requests.cpu`/`requests.memory` trop élevée par rapport à la capacité disponible
  bloque le Pod en `Pending` **avant** son démarrage — symptôme différent, cause
  différente (capacité du cluster, pas comportement du conteneur).
