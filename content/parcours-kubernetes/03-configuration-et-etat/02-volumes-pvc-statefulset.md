---
title: "Volumes, PVC/StorageClass, et StatefulSet vs Deployment"
type: lesson
---

# Volumes, PVC/StorageClass, et StatefulSet vs Deployment

Un volume Docker (`docker volume create`, ou `volumes:` dans compose) survit au
conteneur qui l'utilise, sur **cette machine**. Sur un cluster multi-nodes, la question
se complique : **quel disque physique, sur quel node, avec quelle garantie ?**
Kubernetes répond avec trois couches : **PersistentVolumeClaim**, **StorageClass**, et
**PersistentVolume**.

## PVC : une demande de stockage, indépendante du Pod

Une **PersistentVolumeClaim** (PVC) est une demande abstraite ("il me faut 1Gi, en
lecture-écriture pour un seul Pod à la fois") — elle ne décrit **jamais** de disque
physique précis :

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: demo-data
spec:
  accessModes:
    - ReadWriteOnce      # mounted read-write by a single Pod at a time
  resources:
    requests:
      storage: 1Gi
```

Une **StorageClass** (`local-path`, `gp3` sur AWS EBS, etc.) décrit **comment**
provisionner le disque réel derrière la demande — le cluster en a généralement une par
défaut :

```bash
kubectl get storageclass
# NAME                   PROVISIONER             VOLUMEBINDINGMODE
# local-path (default)   rancher.io/local-path   WaitForFirstConsumer
```

`WaitForFirstConsumer` signifie que le disque n'est **provisionné qu'au moment où un Pod
utilise réellement la PVC** — pas avant. Vérifié en conditions réelles : une PVC seule
reste `Pending` jusqu'à ce qu'un Pod la réclame :

```bash
kubectl apply -f pvc.yaml
kubectl get pvc demo-data
# demo-data   Pending                                      local-path

kubectl apply -f pod-using-pvc.yaml
kubectl get pvc demo-data
# demo-data   Bound    pvc-ac844c70-...   1Gi   RWO   local-path
```

Ce couple **PVC** (ta demande) / **PersistentVolume** (le disque réellement alloué,
créé automatiquement par la StorageClass) est l'équivalent Kubernetes d'un volume nommé
Docker — sauf qu'ici, l'allocation physique peut se faire sur **n'importe quel node**
compatible, gérée par un contrôleur, pas par toi.

### La donnée survit vraiment au Pod

Vérifié en conditions réelles : écrire un fichier, supprimer le Pod, en recréer un
**autre** montant la même PVC — la donnée est toujours là.

```bash
kubectl exec volume-demo -- sh -c "echo 'written at boot' > /data/hello.txt"
kubectl delete pod volume-demo
kubectl apply -f pod-reader.yaml     # new Pod, same claimName: demo-data
kubectl logs volume-reader
# written at boot
```

> **Repère —** un volume `emptyDir` (non montré ici) est lié au **cycle de vie du
> Pod** : il disparaît avec lui. Une PVC est liée à son **propre** cycle de vie,
> indépendant de n'importe quel Pod qui la monte — exactement l'inverse.

## StatefulSet : quand un Deployment ne suffit plus

Un Deployment traite ses Pods comme **interchangeables** : identiques, sans ordre, sans
identité individuelle stable — parfait pour une API sans état. Une base de données a des
besoins différents : chaque réplique doit garder **son propre disque** et une **identité
réseau stable**, même après un redémarrage.

| | Deployment | StatefulSet |
|---|---|---|
| Nom des Pods | Suffixe aléatoire (`whoami-7c7f4944c6-8xpjb`) | Suffixe **ordinal** stable (`db-0`, `db-1`, `db-2`) |
| Stockage | Un seul volume partagé entre répliques (ou aucun) | Un **PVC par réplique**, recréé avec le **même** Pod à chaque redémarrage |
| Ordre de démarrage | Aucune garantie | Séquentiel par défaut (`db-0` prêt avant `db-1`) |
| DNS | Pas d'identité individuelle | Chaque Pod a un nom DNS stable : `db-0.db.<namespace>.svc.cluster.local` |

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
spec:
  serviceName: db          # must match a headless Service (below)
  replicas: 1
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:            # one PVC created PER replica, automatically
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 1Gi
---
apiVersion: v1
kind: Service
metadata:
  name: db
spec:
  clusterIP: None         # headless: one DNS record per Pod, no load-balancing
  selector:
    app: db
  ports:
    - port: 5432
```

Vérifié en conditions réelles :

```bash
kubectl get pvc
# NAME        STATUS   VOLUME    CAPACITY   STORAGECLASS
# data-db-0   Bound    pvc-...   1Gi        local-path
```

Le nom de la PVC (`data-db-0`) suit toujours le motif
`<volumeClaimTemplateName>-<statefulSetName>-<ordinal>` — créée automatiquement, une par
réplique. Une requête SQL réelle exécutée depuis un autre Pod, via le nom DNS stable de
la réplique, confirme la connectivité de bout en bout :

```bash
kubectl exec pg-client -- env PGPASSWORD=... psql -h db-0.db.default.svc.cluster.local -U shop -d shop -c "select 1;"
#  ?column?
# ----------
#         1
```

> **Piège classique** — un Service **headless** (`clusterIP: None`) ne fait **aucun**
> équilibrage de charge : chaque nom DNS `<pod>.<service>.<namespace>.svc.cluster.local`
> pointe vers **une seule** IP fixe, celle de ce Pod précis. C'est voulu : un client
> voulant écrire sur `db-0` spécifiquement (le primaire, dans une topologie
> primaire/répliques) doit pouvoir le cibler **sans ambiguïté** — un Service `ClusterIP`
> classique mélangerait indistinctement toutes les répliques.

## À retenir

- **PVC** = ta demande abstraite ; **StorageClass** = comment provisionner ; le disque
  réel (**PersistentVolume**) est créé automatiquement, souvent seulement au moment où
  un Pod l'utilise (`WaitForFirstConsumer`).
- Une PVC a un cycle de vie **indépendant** du Pod qui la monte — la donnée survit à la
  suppression/recréation du Pod, contrairement à un `emptyDir`.
- **StatefulSet** ≠ Deployment avec un autre nom : identité réseau stable par réplique
  (`db-0`, `db-1`…), un **PVC dédié par réplique**, démarrage séquentiel — pour tout ce
  qui a un état individuel à préserver (bases de données, files de messages).
- Un Service **headless** (`clusterIP: None`) associé à un StatefulSet donne un nom DNS
  stable **par Pod**, sans aucun équilibrage de charge — à distinguer d'un Service
  classique.
