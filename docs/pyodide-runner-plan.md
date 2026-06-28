# Plan — Runner Python (Pyodide) pour la plateforme « objectif »

> **But.** Rendre le **Python exécutable dans le navigateur**, comme l'est déjà JS/TS,
> pour : (1) un **playground Python** (bouton « Tester » sur les blocs ` ```python ` +
> bac à sable flottant), et (2) des **exercices interactifs `language: python`**
> (éditeur + tests verts/rouges), notamment pour `parcours-python` et la partie
> pandas de `parcours-data-analyst`.
>
> **Statut : Lot 1 IMPLÉMENTÉ** (playground Python). Le bouton « Tester » sur les blocs
> ` ```python ` et le bac à sable Python (FAB 🐍) exécutent du Python dans le navigateur
> via Pyodide (`frontend/src/lib/pyodideWorker.js`, `runPython.js`, `pythonPlayground.js`,
> `components/PythonPlayground.vue`, registre `playgrounds.js`). `import pandas/numpy`
> fonctionne (auto-chargé). Lots 2-4 (pandas piloté, exercices Python à tests, migration
> de contenu) restent à faire — voir §5.

---

## 1. Rappel de l'architecture actuelle (ce sur quoi on se greffe)

Deux chemins d'exécution **distincts** coexistent côté front (`frontend/src`) :

| Chemin | Fichiers | Rôle | Worker |
|---|---|---|---|
| **Playground** | `lib/runJs.js`, `lib/scratch.js`, `lib/vuePlayground.js`, `lib/playgrounds.js`, `components/ScratchPad.vue`, `components/VuePlayground.vue` | Bouton « Tester » d'un bloc de code + bac à sable flottant. Exécute un snippet, capture la console. | Module Web Worker créé à la volée (Blob URL). |
| **Exercices** | `components/ExercisePlayer.vue` | Éditeur + suite de tests (`assert`, `assertEqual`), feedback vert/rouge, marque la leçon complétée. | Worker **inline** propre au composant (`WORKER_SRC`). |

Le **registre** est le point d'extension documenté (`lib/playgrounds.js`) :

```js
// déjà en place
registerPlayground(['js', 'javascript', 'ts', 'typescript'], openScratch)
registerPlayground(['vue'], openVuePlayground)
```

`views/LessonView.vue#decorateCodeBlocks()` lit le langage du bloc (`language-xxx`),
appelle `playgroundFor(lang)` et n'ajoute le bouton « Tester » que si un runner est
enregistré. **La détection de langage est donc déjà générique** — ajouter `python`
au registre suffit pour le bouton « Tester ».

La transpilation (`lib/transpile.js`) ne concerne **que** des langages compilables en
JS (Sucrase : ts/jsx/tsx). Python **ne passe pas par là** : c'est un moteur séparé.

> **Conséquence clé.** Le playground se branche en **1 ligne** dans le registre. Les
> exercices, eux, demandent une **branche d'exécution dédiée** dans `ExercisePlayer.vue`
> (son worker actuel est du JS pur via `new Function`).

---

## 2. Choix techniques

### 2.1 Pyodide, chargé dans un Web Worker, en lazy

- **Pyodide** = CPython compilé en WebAssembly (~6–10 Mo pour le cœur ; pandas/numpy
  ajoutent ~10–15 Mo). On le charge **depuis un CDN** (`cdn.jsdelivr.net/pyodide`),
  comme le reste de l'app charge déjà des paquets via `esm.sh`.
- **Dans un Worker** (jamais sur le thread principal) : l'init et l'exécution sont
  bloquantes ; on protège ainsi l'UI et on peut tuer le worker en cas de boucle infinie.
- **Lazy + singleton** : on ne télécharge Pyodide qu'au **premier** run Python, puis on
  **réutilise** l'instance (l'init coûte 1–3 s). Un worker Pyodide **persistant** est
  préférable au worker jetable du JS (qu'on recrée à chaque run) — sinon on rechargerait
  des dizaines de Mo à chaque exécution.

### 2.2 Version épinglée

Épingler une version précise de Pyodide (reproductibilité, le `full/` du CDN doit
correspondre) :

```js
const PYODIDE_VERSION = 'v0.28.3' // exemple — vérifier la dernière stable au moment de coder
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`
```

### 2.3 Paquets (pandas) à la demande

- Le cœur Pyodide suffit pour `parcours-python` modules 1–3 (types, collections,
  fonctions, `csv`).
- **pandas / numpy** ne sont chargés **que si nécessaire** (`pyodide.loadPackage([...])`),
  déclenché par : un flag dans le front-matter de l'exercice (`exercise.packages: [pandas]`),
  **ou** une détection naïve (`/\bimport\s+pandas\b/` dans le code). Préférer le **flag
  explicite** (déterministe, pas de faux positifs).

### 2.4 Timeout / boucle infinie

Deux stratégies, par ordre de simplicité :

1. **Terminate + recreate (recommandé au départ).** Comme le JS : un `setTimeout`
   (ex. 10 s, Python est plus lent à démarrer que JS) ; au dépassement, `worker.terminate()`
   puis on recrée un worker au prochain run (on **réinitialise** donc Pyodide — coûteux mais
   rare). Simple, aucun en-tête spécial requis.
2. **Interrupt buffer (optimisation ultérieure).** `pyodide.setInterruptBuffer(sab)` avec
   un `SharedArrayBuffer` permet d'interrompre **sans** détruire l'instance. **Mais** SAB
   exige l'**isolation cross-origin** (en-têtes `COOP: same-origin` + `COEP: require-corp`),
   ce qui complique le chargement CDN. À **ne pas** faire en v1.

### 2.5 En-têtes / CSP

- **Dev (Vite)** : pas de CSP, le CDN jsdelivr fonctionne directement. Rien à faire.
- **Prod** : si une CSP est ajoutée un jour, autoriser `cdn.jsdelivr.net` en
  `script-src`/`connect-src`/`worker-src` (Pyodide fait du `fetch` de fichiers `.wasm`/
  `.whl`). Documenter, ne pas bloquer la v1.
- **Pas de SharedArrayBuffer en v1** → pas besoin de COOP/COEP. (À retenir si on passe à
  la stratégie 2.4-2.)

---

## 3. Travail à faire — fichiers

### 3.1 Nouveau — `frontend/src/lib/pyodideWorker.js` (source du worker, en chaîne)

Sur le modèle de `WORKER_SRC` dans `ExercisePlayer.vue` (worker en **string** → Blob),
mais **classic worker** (`importScripts`) pour charger Pyodide depuis le CDN.
Responsabilités :

- `importScripts(PYODIDE_CDN + 'pyodide.js')` puis `loadPyodide({ indexURL: PYODIDE_CDN })`
  **une seule fois** (mis en cache dans le scope du worker).
- Sur message `{ type: 'load', packages }` → `await pyodide.loadPackage(packages)` (pandas…).
- Sur message `{ type: 'run', code }` → exécuter en **capturant stdout/stderr**
  (`pyodide.setStdout`/`setStderr`, ou rediriger `sys.stdout` vers un buffer JS), renvoyer
  `{ logs, error }`.
- Sur message `{ type: 'test', userCode, tests }` → voir §3.4 (helpers `assert`/`assert_equal`).

Esquisse (volontairement minimale) :

```js
// pyodideWorker.js — chargé comme classic worker via Blob URL
const PYODIDE_VERSION = 'v0.28.3'
const BASE = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`

let pyodideReady = null
function ensurePyodide() {
  if (!pyodideReady) {
    // eslint-disable-next-line no-undef
    importScripts(BASE + 'pyodide.js')
    // eslint-disable-next-line no-undef
    pyodideReady = loadPyodide({ indexURL: BASE })
  }
  return pyodideReady
}

self.onmessage = async (e) => {
  const { id, type, code, packages } = e.data
  try {
    const py = await ensurePyodide()
    if (packages && packages.length) await py.loadPackage(packages)

    const logs = []
    py.setStdout({ batched: (s) => logs.push(s) })
    py.setStderr({ batched: (s) => logs.push(s) })

    if (type === 'run') {
      await py.runPythonAsync(code)
      self.postMessage({ id, logs, error: null })
    }
    // type 'test' : voir §3.4
  } catch (err) {
    self.postMessage({ id, logs: [], error: String((err && err.message) || err) })
  }
}
```

> Détail à soigner : `runPythonAsync` (et non `runPython`) pour gérer `await`/coroutines
> et le chargement implicite de paquets. Penser à un `id` de message pour corréler
> requêtes/réponses (le worker étant persistant et réutilisé).

### 3.2 Nouveau — `frontend/src/lib/runPython.js` (façade côté thread principal)

Pendant JS de `runJs.js`. Gère le **worker persistant**, le timeout (terminate+recreate),
la sérialisation des messages. API symétrique à `runCode` :

```js
export async function runPython(code, { packages = [], timeoutMs = 10000 } = {})
  // → { logs: string[], error: string|null }
```

- Garde un worker singleton ; le recrée si `null` (premier appel ou après timeout).
- `setTimeout` → si dépassé : `worker.terminate()`, `worker = null`, résoudre avec
  `{ logs: [], error: 'Temps dépassé…' }` (même message FR que le JS).

### 3.3 Nouveau — `frontend/src/lib/pythonPlayground.js` + intégration registre

Sur le modèle exact de `scratch.js`/`vuePlayground.js` :

```js
import { reactive } from 'vue'
const KEY = 'scratch_python'
const DEFAULT = `# Ton atelier Python (sauvegardé automatiquement).\nprint("Bonjour 👋")\n`
export const pyPlay = reactive({ open: false, code: '', persist: false })
export function openPythonPlayground(code) { /* idem openScratch */ }
export function savePythonPlayground() { /* idem */ }
export function closePythonPlayground() { /* idem */ }
```

Puis **une ligne** dans `lib/playgrounds.js` (le point d'extension) :

```js
import { openPythonPlayground } from './pythonPlayground'
registerPlayground(['python', 'py'], openPythonPlayground)
```

→ Le bouton « Tester » apparaît **automatiquement** sur tous les blocs ` ```python `
des leçons (via `LessonView.decorateCodeBlocks`), **sans toucher** LessonView.

### 3.4 Nouveau — `frontend/src/components/PythonPlayground.vue`

Copie/adaptation de `ScratchPad.vue` : un éditeur (`textarea`), un bouton « Lancer »,
un panneau « Sortie (console) ». Appelle `runPython(pyPlay.code, { packages })` et affiche
`logs`/`error`. Monté dans `App.vue` à côté de `ScratchPad`/`VuePlayground`, et un bouton
flottant (FAB) « Python » optionnel (cf. `App.vue` ligne ~56).

### 3.5 Modifié — `frontend/src/components/ExercisePlayer.vue` (exercices Python)

C'est la partie la plus délicate. Aujourd'hui `run()` :
1. transpile TS→JS via `toJs` si `language ∈ {ts,tsx,jsx}` ;
2. exécute `userCode` + `tests` dans le worker JS (`new Function`, helpers `assert`/`assertEqual`).

Ajout d'une **branche** `language === 'python'` qui délègue à un **runner de tests Python**
(via le worker Pyodide, `type: 'test'`). Le worker Python doit reproduire la **sémantique
en deux phases** déjà en place pour le JS :

- **Phase 1** : exécuter `userCode` seul, capturer stdout → panneau « Sortie ».
- **Phase 2** : pour chaque test, exécuter `userCode` **puis** le code du test dans un
  scope où sont injectés des helpers Python équivalents :

```python
def assert_(cond, msg="Assertion échouée"):
    if not cond: raise AssertionError(msg)

def assert_equal(actual, expected, msg="assert_equal"):
    if actual != expected:
        raise AssertionError(f"{msg} — attendu {expected!r}, obtenu {actual!r}")
```

> **Décision d'API d'exercice.** Garder le **même contrat d'authoring** que le JS pour ne
> pas dérouter : dans les `tests[].code` Python, on utilise `assert_equal(got, expected, msg)`
> et `assert_(cond, msg)` (on ne peut pas nommer une fonction `assert`, mot-clé Python ;
> documenter ce léger écart dans `content/FORMAT.md`). `print(...)` joue le rôle du
> `console.log` (sortie sous le test). Chaque test s'exécute dans son **propre namespace**
> (`dict` passé à `exec`) pour éviter les collisions, en répliquant l'isolement actuel.

Le composant gère déjà l'état UI (results, logs, allPass → `emit('completed')`) : **rien à
changer côté template/affichage**, seulement la source des résultats.

### 3.6 Modifié — `content/FORMAT.md`

Documenter le nouveau langage exécutable :
- Bloc ` ```python ` → bouton « Tester » (playground).
- `exercise.language: python` + helpers `assert_`, `assert_equal`, `print`.
- `exercise.packages: [pandas]` (optionnel) pour charger pandas/numpy.
- Mentionner le **temps de premier chargement** (Pyodide se télécharge au 1er run) et le
  poids accru si `pandas`.

### 3.7 Modifié (doc) — `README.md`

Une ligne dans la Roadmap / section « Étendre » : Python exécutable via Pyodide
(playground + exercices), pandas à la demande.

---

## 4. Impact sur le contenu existant

- `parcours-python` : les exercices sont aujourd'hui en **reveal** (énoncé + correction).
  Une fois le runner livré, on pourra **convertir** les exercices de logique pure
  (modules 1–3) en `language: python` interactifs, et certains exercices pandas du
  module 4/projet en `language: python` + `packages: [pandas]`. **Migration progressive**,
  non bloquante.
- `parcours-data-analyst` : les exercices interactifs restent en `ts` (volontairement,
  ils tournent déjà). On pourra **doubler** certains en variante Python/pandas une fois le
  runner en place, pour rapprocher du quotidien d'un analyste.

> Aucune formation n'a besoin d'être réécrite pour livrer le runner : il **ajoute** une
> capacité. Les exercices reveal restent valides.

---

## 5. Découpage en lots (incrémental, testable à chaque étape)

1. **Lot 1 — Playground Python (lecture seule de valeur immédiate).**
   `pyodideWorker.js` + `runPython.js` + `pythonPlayground.js` + `PythonPlayground.vue`
   + 1 ligne registre + montage `App.vue`. ⇒ bouton « Tester » fonctionnel sur les blocs
   ` ```python `. Pas de pandas encore.
2. **Lot 2 — pandas à la demande.** `loadPackage(['pandas'])` piloté par
   `exercise.packages` / FAB option. Vérifier `import pandas as pd` dans le playground.
3. **Lot 3 — Exercices Python.** Branche `language === 'python'` dans `ExercisePlayer.vue`
   + mode `test` du worker + helpers `assert_`/`assert_equal` + maj `FORMAT.md`.
4. **Lot 4 — Migration de contenu.** Convertir des exercices reveal de `parcours-python`
   en interactifs ; ajouter des variantes pandas dans `parcours-data-analyst`.

Chaque lot est livrable seul. Lot 1 apporte déjà la valeur la plus visible.

---

## 6. Points de vigilance (résumé)

- **Poids/latence** : 1er run = téléchargement Pyodide (afficher un état « Chargement de
  Python… » dans l'UI). pandas alourdit nettement → ne charger que si demandé.
- **Worker persistant** (≠ JS jetable) pour ne pas recharger le WASM à chaque run ;
  le recréer uniquement après un timeout.
- **`runPythonAsync`** (pas `runPython`) pour `await` et chargement implicite.
- **Helpers Python** : `assert_` (pas `assert`, mot réservé) ; documenter l'écart.
- **Isolement des tests** : un `dict`/namespace par test, comme l'isolement JS actuel.
- **CSP/headers** : autoriser `cdn.jsdelivr.net` si une CSP prod est ajoutée ;
  **éviter** SharedArrayBuffer en v1 (pas de COOP/COEP requis).
- **Pas de sur-ingénierie** : réutiliser les patterns existants (Blob worker, reactive
  store de playground, contrat d'exercice) plutôt que d'inventer une nouvelle abstraction.

---

## 7. Tableau récapitulatif des fichiers

| Action | Fichier | Contenu |
|---|---|---|
| Ajouter | `frontend/src/lib/pyodideWorker.js` | Source worker (string) : load Pyodide, run, test, capture stdout. |
| Ajouter | `frontend/src/lib/runPython.js` | Façade : worker persistant, timeout terminate+recreate. |
| Ajouter | `frontend/src/lib/pythonPlayground.js` | Store reactive du playground Python (modèle `scratch.js`). |
| Ajouter | `frontend/src/components/PythonPlayground.vue` | Modale éditeur + sortie (modèle `ScratchPad.vue`). |
| Modifier | `frontend/src/lib/playgrounds.js` | `registerPlayground(['python','py'], openPythonPlayground)`. |
| Modifier | `frontend/src/App.vue` | Monter `<PythonPlayground/>` + FAB optionnel. |
| Modifier | `frontend/src/components/ExercisePlayer.vue` | Branche `language === 'python'` → runner Pyodide (mode test). |
| Modifier | `content/FORMAT.md` | Documenter `python` (playground + exercices + `packages`). |
| Modifier | `README.md` | Roadmap : Python exécutable (Pyodide). |
