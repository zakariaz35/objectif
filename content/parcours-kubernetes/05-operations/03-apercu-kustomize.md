---
title: "Aperçu : kustomize (et un mot sur Helm)"
type: lesson
---

# Aperçu : kustomize (et un mot sur Helm)

Un même manifest doit souvent varier légèrement entre environnements (3 répliques en
prod, 1 en staging ; un nom préfixé par environnement…). Copier-coller le YAML entier
pour chaque environnement devient vite ingérable. **kustomize**, intégré nativement à
`kubectl` (`kubectl apply -k`), répond à ce besoin **sans template ni langage à
apprendre** : il part d'un YAML de base et applique des **patches** déclaratifs.

## Base + overlay, le motif standard

```
kustomize/
├─ base/
│  ├─ deployment.yaml
│  └─ kustomization.yaml
└─ overlays/
   └─ staging/
      └─ kustomization.yaml
```

```yaml
# base/kustomization.yaml
resources:
  - deployment.yaml
```

```yaml
# overlays/staging/kustomization.yaml
resources:
  - ../../base
namePrefix: staging-
replicas:
  - name: web
    count: 3
```

Vérifié en conditions réelles — `kubectl kustomize` prévisualise le YAML final **sans
rien appliquer**, utile pour relire avant de pousser :

```bash
kubectl kustomize overlays/staging
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: staging-web        # namePrefix applied
spec:
  replicas: 3               # overridden by the overlay
  selector:
    matchLabels:
      app: web
  # (template omitted here for brevity)
```

```bash
kubectl apply -k overlays/staging
kubectl get deploy
# staging-web   3/3   3   3
```

Le YAML de `base/` reste **inchangé** : l'overlay ne fait qu'ajouter des transformations
par-dessus, sans dupliquer la moindre ligne du Deployment original — contrairement à un
copier-coller manuel qui diverge silencieusement avec le temps.

> **Repère —** kustomize ne fait **aucune** substitution de variables façon template
> (pas de `{{ }}`) : chaque transformation (préfixe, nombre de répliques, patch de
> champ précis) est déclarée explicitement dans le `kustomization.yaml` de l'overlay,
> ce qui reste lisible et diffable dans un historique Git.

## Et Helm ?

**Helm** répond à un besoin différent, plus ambitieux : un **gestionnaire de paquets**
pour Kubernetes, avec templating complet (boucles, conditions, valeurs par défaut) et
distribution de "charts" packagés et versionnés (installer PostgreSQL, Prometheus, un
ingress controller… en une commande). Utile dès qu'on **installe des logiciels tiers**
préconfigurés — hors du périmètre de ce parcours, mais à connaître de nom : sur un vrai
poste DevOps, `kustomize` (pour tes propres manifests, par environnement) et `helm` (pour
installer des briques tierces packagées) cohabitent naturellement, sans s'exclure.

## À retenir

- `kustomize` (intégré à `kubectl -k`) permet de dériver des variantes d'un même YAML de
  base (préfixe de nom, nombre de répliques, patchs ciblés) sans dupliquer le manifest ni
  introduire de langage de template.
- `kubectl kustomize <dir>` prévisualise le résultat sans rien appliquer ;
  `kubectl apply -k <dir>` applique directement.
- Helm répond à un besoin différent (gestionnaire de paquets, templating complet,
  distribution de charts tiers) — à connaître de nom, sans en faire l'objet de ce
  parcours.
