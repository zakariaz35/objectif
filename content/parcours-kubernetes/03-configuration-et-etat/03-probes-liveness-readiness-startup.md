---
title: "Probes : liveness, readiness, startup — et le piège du Service muet"
type: lesson
---

# Probes : liveness, readiness, startup — et le piège du Service muet

`docker compose` propose un `healthcheck:` unique, assez basique. Kubernetes distingue
**trois probes** différentes, avec des **conséquences très différentes** en cas
d'échec. Confondre `liveness` et `readiness` est l'un des pièges les plus fréquents et
les plus silencieux du débogage Kubernetes.

## Les trois probes, et ce qu'elles déclenchent

| Probe | Question posée | Échec => |
|---|---|---|
| `startupProbe` | "L'appli a-t-elle fini de démarrer ?" | Bloque les autres probes tant qu'elle échoue ; si elle échoue trop longtemps, le conteneur est **redémarré** |
| `livenessProbe` | "L'appli est-elle encore vivante (pas bloquée) ?" | Le conteneur est **redémarré** (kubelet le tue et le relance) |
| `readinessProbe` | "L'appli peut-elle **actuellement** servir du trafic ?" | Le Pod est **retiré des endpoints du Service** — **jamais redémarré** |

C'est cette dernière ligne qui surprend le plus : un échec de `readinessProbe` ne
redémarre **rien**. Le conteneur continue de tourner, potentiellement indéfiniment,
simplement **exclu du routage**.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: probe-demo
  labels:
    app: probe-demo
spec:
  containers:
    - name: web
      image: my-app:latest
      readinessProbe:
        exec:
          command: ["sh", "-c", "test -f /tmp/ready"]
        periodSeconds: 3
        failureThreshold: 1
      livenessProbe:
        httpGet:
          path: /
          port: 8080
        periodSeconds: 5
```

## Le piège vérifié en conditions réelles

Un conteneur démarre correctement (le processus tourne, répond sur le port HTTP — donc
la `livenessProbe` réussirait), mais son fichier `/tmp/ready` n'existe pas encore : la
`readinessProbe` échoue.

```bash
kubectl get pod probe-demo
```

```
NAME         READY   STATUS    RESTARTS   AGE
probe-demo   0/1     Running   0          6s
```

`STATUS: Running`, **0 restart** — le conteneur est en parfaite santé du point de vue de
`livenessProbe`. Mais `READY: 0/1` : ce Pod ne reçoit **aucun trafic**.

```bash
kubectl get endpoints probe-demo
```

```
NAME         ENDPOINTS   AGE
probe-demo               6s
```

Le Service associé a des endpoints **vides** — exactement le même symptôme qu'un
`selector` mal orthographié (module 2), mais pour une raison totalement différente. Dès
que la condition de readiness redevient vraie :

```bash
kubectl exec probe-demo -- touch /tmp/ready
kubectl get pod probe-demo
# probe-demo   1/1     Running   0   21s
kubectl get endpoints probe-demo
# probe-demo   10.42.0.28:8080   21s
```

L'endpoint réapparaît automatiquement, sans aucune intervention sur le Pod lui-même —
juste la boucle de reconciliation du Service qui réagit au changement d'état de
readiness.

> **Piège classique** — face à un Service dont les endpoints sont vides, deux causes
> possibles à distinguer : (1) `selector` qui ne matche aucun label (module 2), (2)
> `readinessProbe` qui échoue sur des Pods pourtant bien matchés. `kubectl get pods`
> (colonne `READY`) et `kubectl describe pod` (section `Conditions` → `Ready: False`)
> tranchent immédiatement entre les deux.

## Pourquoi startup, en plus de liveness

Une application avec un démarrage lent (migration de base au boot, cache à
préchauffer…) poserait un dilemme sans `startupProbe` : un `livenessProbe` trop strict
tuerait le conteneur **avant** qu'il ait fini de démarrer normalement. `startupProbe`
résout ça en **désactivant** `livenessProbe`/`readinessProbe` tant qu'elle n'a pas
elle-même réussi une première fois :

```yaml
      startupProbe:
        httpGet:
          path: /health
          port: 8080
        failureThreshold: 30    # up to 30 x periodSeconds to boot
        periodSeconds: 2
      livenessProbe:
        httpGet:
          path: /health
          port: 8080
        periodSeconds: 10        # only takes over once startupProbe has succeeded once
```

## À retenir

- `livenessProbe` échoue => **redémarrage** du conteneur. `readinessProbe` échoue =>
  **retrait des endpoints du Service**, **sans redémarrage**. Les confondre mène à
  déboguer le mauvais symptôme.
- Un Pod peut être `Running`, 0 restart, et pourtant **totalement injoignable** via son
  Service — c'est le signe d'une `readinessProbe` en échec, pas d'un crash.
- `startupProbe` protège un démarrage lent en désactivant les deux autres probes jusqu'à
  son premier succès — sans elle, un `livenessProbe` trop impatient tuerait un
  conteneur qui démarre normalement, juste lentement.
- Deux causes distinctes mènent à des endpoints vides (`selector` erroné vs readiness en
  échec) : `kubectl get pods` (colonne READY) permet de trancher en un coup d'œil.
