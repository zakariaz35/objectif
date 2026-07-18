---
title: "Cartes mémo — Configuration et état"
type: flashcards
cards:
  - q: |
      Un Secret Kubernetes chiffre-t-il sa valeur par défaut ?
    a: |
      **Non.** Un Secret est encodé en **base64** par défaut — trivialement réversible
      (`base64 -d`), pas chiffré. Il protège contre l'affichage accidentel, pas contre
      un accès avec les bonnes permissions RBAC (le chiffrement au repos d'etcd est une
      configuration séparée).
  - q: |
      Une variable injectée via `envFrom` (ConfigMap ou Secret) se met-elle à jour "à
      chaud" sur un Pod déjà démarré si la source change ?
    a: |
      **Non.** Il faut un rollout (`kubectl rollout restart`) pour qu'un Pod déjà
      démarré prenne en compte le changement. Un volume monté, en revanche, se
      met à jour après un court délai, sans redémarrage.
  - q: |
      Que signifie `VolumeBindingMode: WaitForFirstConsumer` sur une StorageClass ?
    a: |
      Le disque physique n'est provisionné qu'au moment où un **Pod** réclame
      réellement la PVC — une PVC seule, sans Pod qui la monte, reste `Pending`.
  - q: |
      Une PVC a-t-elle le même cycle de vie que le Pod qui la monte ?
    a: |
      **Non**, à l'inverse d'un `emptyDir`. Une PVC est un objet **indépendant** : la
      donnée survit à la suppression du Pod, et un nouveau Pod qui monte la même PVC
      (`claimName`) retrouve les données intactes.
  - q: |
      Pourquoi un StatefulSet crée-t-il un PVC distinct par réplique (`data-db-0`,
      `data-db-1`…), plutôt qu'un seul PVC partagé comme le ferait un Deployment ?
    a: |
      Chaque réplique d'une base de données (ou système à état) a besoin de **son
      propre** stockage individuel, préservé à travers les redémarrages — un PVC
      partagé mélangerait les données de plusieurs répliques.
  - q: |
      Un Service **headless** (`clusterIP: None`) fait-il de l'équilibrage de charge
      entre les Pods qu'il sélectionne ?
    a: |
      **Non.** Chaque nom DNS `<pod>.<service>.<namespace>.svc.cluster.local` pointe
      vers **une seule** IP fixe — utile pour cibler une réplique précise d'un
      StatefulSet (ex. le primaire d'une base de données).
  - q: |
      Un Pod affiche `STATUS: Running`, `RESTARTS: 0`, mais `READY: 0/1`, et son Service
      a des endpoints vides. Faut-il chercher du côté de `livenessProbe` ou
      `readinessProbe` ?
    a: |
      `readinessProbe` — un échec de cette probe ne redémarre **jamais** le conteneur
      (contrairement à `livenessProbe`), il retire simplement le Pod des endpoints du
      Service. Le conteneur continue de tourner, exclu du routage.
  - q: |
      À quoi sert `startupProbe`, en plus de `livenessProbe` ?
    a: |
      Elle désactive `livenessProbe`/`readinessProbe` tant qu'elle-même n'a pas réussi
      une première fois — protège un démarrage lent (migration, cache à préchauffer)
      contre un `livenessProbe` qui tuerait sinon le conteneur avant la fin normale de
      son démarrage.
---

Lis, réfléchis, révèle, auto-évalue.
