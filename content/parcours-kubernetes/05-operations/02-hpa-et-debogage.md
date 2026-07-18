---
title: "Autoscaling (HPA) et le réflexe de débogage kubectl"
type: lesson
---

# Autoscaling (HPA) et le réflexe de débogage kubectl

Deux compétences opérationnelles à connaître par cœur : faire scaler automatiquement un
Deployment selon sa charge réelle (le **HorizontalPodAutoscaler**), et savoir où
regarder quand quelque chose ne va pas.

## HPA : scaler sur une métrique réelle, pas une intuition

Le HPA a besoin de **metrics-server** (composant qui expose l'usage CPU/mémoire réel des
Pods via l'API `metrics.k8s.io`) pour fonctionner :

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cpu-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cpu-app
  minReplicas: 1
  maxReplicas: 4
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50   # scale up once average CPU exceeds 50% of requests
```

> **Repère —** le pourcentage cible se calcule **par rapport à `requests.cpu`**, pas par
> rapport à une capacité absolue. Un Deployment sans `requests.cpu` défini ne peut tout
> simplement pas être piloté par un HPA sur la métrique CPU — première cause d'un HPA
> qui reste bloqué sur `<unknown>`.

Vérifié en conditions réelles, sur un Deployment avec `requests.cpu: 100m` soumis à une
charge artificielle :

```bash
kubectl get hpa
```

```
NAME      REFERENCE            TARGETS         MINPODS   MAXPODS   REPLICAS
cpu-app   Deployment/cpu-app   cpu: <unknown>/50%   1     4         0
# ... a few seconds later, once metrics-server has scraped a first data point ...
cpu-app   Deployment/cpu-app   cpu: 201%/50%        1     4         4
```

`kubectl describe hpa` retrace la décision, avec les avertissements initiaux (le temps
que metrics-server ait ses premières données) puis l'action réelle :

```
Events:
  Warning  FailedGetResourceMetric   no metrics returned from resource metrics API
  Normal   SuccessfulRescale         New size: 4; reason: cpu resource utilization (percentage of request) above target
```

> **Piège classique** — juste après la création d'un HPA (ou d'un nouveau Deployment),
> `<unknown>` dans la colonne `TARGETS` est **normal** pendant quelques dizaines de
> secondes : metrics-server a besoin d'un premier cycle de scrape. Ce n'est une
> anomalie que si `<unknown>` persiste plusieurs minutes — dans ce cas, vérifier que
> `metrics-server` tourne (`kubectl get pods -n kube-system`) et que le Deployment a
> bien des `requests.cpu` définies.

## Le réflexe de débogage, dans l'ordre

Face à un Pod qui ne se comporte pas comme prévu, un ordre de vérification qui évite de
tourner en rond :

```bash
# 1. Overall state: Running? Ready? How many restarts?
kubectl get pods

# 2. Context: why is this Pod in this state? (Events section at the bottom)
kubectl describe pod <name>

# 3. Logs of the CURRENT container
kubectl logs <name>

# 4. Logs of the PREVIOUS container (after a restart, the cause is often there)
kubectl logs <name> --previous

# 5. Investigate live, inside the container
kubectl exec -it <name> -- sh

# 6. Chronological overview of everything happening in the namespace
kubectl get events --sort-by='.lastTimestamp'
```

Vérifié en conditions réelles, sur un conteneur qui échoue au démarrage :

```bash
kubectl logs crash-demo
```

```
starting up
fatal: cannot connect to database
```

```bash
kubectl logs crash-demo --previous
```

```
starting up
fatal: cannot connect to database
```

Les deux commandes montrent souvent le **même** message (le conteneur logge toujours la
même erreur avant de crasher), mais `--previous` devient indispensable dès que le
conteneur **actuel** n'a encore rien loggé — juste redémarré, sans le temps d'écrire quoi
que ce soit.

> **Repère —** `kubectl logs` sans `--previous` peut afficher une sortie **vide** ou
> trompeuse juste après un redémarrage (le nouveau conteneur vient de (re)démarrer, il
> n'a rien loggé encore) — toujours penser à `--previous` face à un `RESTARTS > 0`.

## À retenir

- Un HPA a besoin de `requests.cpu` (ou mémoire) définies sur le Deployment cible et de
  `metrics-server` actif — sans les deux, la cible reste `<unknown>` indéfiniment.
- `<unknown>` juste après la création d'un HPA est normal pendant quelques dizaines de
  secondes (premier scrape de metrics-server) ; persistant, c'est une vraie anomalie à
  investiguer.
- L'ordre de débogage qui évite de tourner en rond : `get pods` → `describe pod`
  (Events) → `logs` → `logs --previous` → `exec` → `get events --sort-by`.
- `kubectl logs --previous` est indispensable dès qu'un conteneur redémarre — le
  conteneur **actuel** peut n'avoir encore rien loggé.
