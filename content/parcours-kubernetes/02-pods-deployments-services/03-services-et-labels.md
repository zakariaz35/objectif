---
title: "Services et labels : le pont (et le piège) avec Traefik"
type: lesson
---

# Services et labels : le pont (et le piège) avec Traefik

Les Pods sont **éphémères** : un rollout en crée de nouveaux, en détruit d'anciens,
chacun avec une IP différente. Rien, dans ce que tu as vu jusqu'ici, ne donne une
**adresse stable** pour joindre "l'application whoami" plutôt que "le Pod
`whoami-7c7f4944c6-8xpjb` précisément". C'est le rôle du **Service**.

## Un Service = une IP stable + un sélecteur de labels

```yaml
apiVersion: v1
kind: Service
metadata:
  name: whoami
spec:
  selector:
    app: whoami        # matches every Pod carrying this label — nothing more
  ports:
    - port: 80          # the Service's own port
      targetPort: 80    # the port to reach on each matching Pod
```

Le Service ne connaît **rien** des Pods par leur nom : il écoute en continu les Pods du
cluster et retient ceux dont les **labels correspondent** à son `selector`. Cette liste
de correspondances s'appelle les **endpoints**.

```bash
kubectl apply -f service.yaml
kubectl get svc whoami
kubectl get endpoints whoami
```

```
NAME     TYPE        CLUSTER-IP     PORT(S)
whoami   ClusterIP   10.43.221.92   80/TCP

NAME     ENDPOINTS
whoami   10.42.0.16:80,10.42.0.17:80,10.42.0.18:80
```

Trois Pods, trois endpoints : le Service répartit automatiquement le trafic entre eux
(round-robin via `kube-proxy` + DNS interne — approfondi au module 4). Vérifié en
conditions réelles, quatre appels de suite renvoient des Pods différents :

```bash
kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -- \
  curl -s http://whoami.default.svc.cluster.local
```

```
Hostname: whoami-7c7f4944c6-hqh2p
Hostname: whoami-7c7f4944c6-lqv7j
Hostname: whoami-7c7f4944c6-hqh2p
```

## Piège réel : un `selector` qui ne matche rien

Un Service dont le `selector` ne correspond à **aucun** Pod existe très bien — mais reste
silencieusement sans endpoints. Vérifié en conditions réelles :

```bash
kubectl patch service whoami -p '{"spec":{"selector":{"app":"whoamiii"}}}'   # typo
kubectl get endpoints whoami
```

```
NAME     ENDPOINTS   AGE
whoami   <none>      65s
```

Le Service **existe**, son IP **répond toujours**, mais **aucun trafic n'est routé** :
`kubectl describe svc` ne montre alors aucune erreur explicite — juste des champs vides
(`Endpoints:` sans valeur). C'est le tout premier réflexe face à un "ça ne marche pas"
réseau sur Kubernetes : `kubectl get endpoints <service>` avant de creuser plus loin.

> **Piège classique** — comparer visuellement `selector.app: whoami` et
> `template.metadata.labels.app: whoami` ne suffit pas : une faute de frappe (`whoamiii`,
> une majuscule, un espace) rend le Service muet **sans aucune erreur au niveau
> Kubernetes**, contrairement à une erreur de configuration Traefik qui logue souvent un
> avertissement explicite.

## Les trois types de Service

| `type` | Portée | Cas d'usage |
|---|---|---|
| `ClusterIP` *(défaut)* | Accessible **uniquement à l'intérieur du cluster** | Communication interne (ex. `api` → `db`) |
| `NodePort` | Ouvre un port fixe (30000-32767) sur **chaque node** du cluster | Debug rapide, ou base d'un `LoadBalancer` |
| `LoadBalancer` | Demande au fournisseur cloud (AWS, GCP…) un vrai load balancer externe | Exposition publique directe (rare : un Ingress, module 4, est presque toujours préférable) |

```bash
kubectl expose deployment whoami --type=NodePort --port=80 --target-port=80 --name=whoami-nodeport
kubectl get svc whoami-nodeport
# whoami-nodeport   NodePort   10.43.218.90   <none>   80:30080/TCP
```

`NodePort` alloue ici le port `30080` sur **tous** les nodes du cluster — c'est une
brique bas niveau, rarement exposée telle quelle en production (le module 4 introduit
l'Ingress, la vraie porte d'entrée HTTP).

## Le piège terminologique : labels Kubernetes ≠ labels Docker

Tu as posé des dizaines de labels Docker sur tes conteneurs avec Traefik :

```yaml
# Docker (Traefik) — a label is CONFIGURATION read by an external controller
labels:
  - "traefik.http.routers.blog.rule=Host(`blog.example.com`)"
```

Ces labels Docker sont un **canal de configuration** : Traefik les lit et en déduit des
routers, services, middlewares — leurs clés ont un sens précis et documenté
(`traefik.http.routers.*`).

Un label Kubernetes est **fondamentalement différent** : une simple paire clé-valeur
arbitraire, **sans aucun sens intrinsèque** pour l'API Kubernetes. `app: whoami`,
`env: prod`, `tier: backend` — Kubernetes ne les interprète jamais lui-même ; il se
contente de permettre à d'autres objets (Service, Deployment, NetworkPolicy…) de les
**sélectionner** via un `selector`.

| | Label Docker (Traefik) | Label Kubernetes |
|---|---|---|
| Rôle | Configuration lue par un outil externe (Traefik) | Métadonnée arbitraire, servant de critère de sélection |
| Qui les interprète | Traefik uniquement, avec un espace de noms de clés précis | N'importe quel objet via son `selector` (Service, NetworkPolicy, Deployment…) |
| Exemple | `traefik.http.routers.blog.rule=...` (clé porteuse de sens) | `app: blog` (clé libre, sans convention imposée) |
| Que se passe-t-il en cas d'oubli | Traefik ignore le conteneur (pas de route créée) | Le Service existe mais reste sans endpoints (silencieux) |

> **Repère —** ne cherche pas d'équivalent direct : les labels Kubernetes sont plus
> proches d'un **système de tags libres** exploité par des `selector`, alors que les
> labels Traefik forment un **langage de configuration** à la syntaxe imposée. Un
> Deployment Kubernetes peut très bien porter en plus de vrais labels Traefik si son
> Pod tourne aussi derrière un Traefik externe au cluster — les deux mécanismes
> coexistent sans jamais se marcher dessus.

## À retenir

- Un Service = une IP stable + un `selector` de labels ; les Pods matchés deviennent ses
  **endpoints**, recalculés en continu.
- Un `selector` qui ne matche aucun Pod ne provoque **aucune erreur visible** : le
  Service existe, répond, mais route vers `<none>`. Toujours vérifier
  `kubectl get endpoints <service>` en cas de panne réseau apparente.
- `ClusterIP` (interne) / `NodePort` (port fixe par node) / `LoadBalancer` (LB cloud) —
  le module 4 introduit l'Ingress, la vraie porte d'entrée HTTP en production.
- Les labels Kubernetes ne sont **pas** les labels Docker/Traefik : ce sont de simples
  paires clé-valeur de sélection, sans convention imposée par la plateforme elle-même.
