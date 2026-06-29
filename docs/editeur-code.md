# Éditeur de code (CodeMirror) — bundle local vendored

> **TL;DR** — Les éditeurs de la plateforme (bac à sable JS, bac à sable Python,
> exercices) utilisent **CodeMirror 6** (coloration syntaxique + numéros de lignes).
> CodeMirror n'est **pas** une dépendance npm bundlée par Vite : il est livré en **bundle
> UMD auto-suffisant** servi depuis notre propre origine (`public/vendor/codemirror.js`),
> chargé via une balise `<script>`. Si ce fichier manque, l'éditeur **retombe sur un
> `<textarea>`** (l'édition n'est jamais cassée).

---

## 1. Vue d'ensemble

Un seul composant, `frontend/src/components/CodeEditor.vue`, est l'éditeur partagé par :

| Utilisé par | Langage |
|---|---|
| `components/ScratchPad.vue` (bac à sable ⌗) | `js` |
| `components/PythonPlayground.vue` (bac à sable 🐍) | `python` |
| `components/ExercisePlayer.vue` (exercices) | `js` / `ts` / `python` (selon l'exo) |

> Le **playground Vue** (`components/VuePlayground.vue`) n'utilise PAS ce composant : il
> embarque son propre éditeur via `@vue/repl`.

API du composant :

```vue
<CodeEditor v-model="code" language="python" />
```

- `v-model` (string) : le code édité.
- `language` : `js` | `ts` | `tsx` | `jsx` | `python` | `vue`.

Fonctionnalités : coloration syntaxique (thème calé sur les **variables CSS** de l'app, donc
compatible les 4 thèmes), numéros de lignes, indentation `Tab`, auto-indent, paires de
crochets, undo/redo.

---

## 2. Pourquoi un bundle « vendored » et pas une dépendance npm ?

C'est le point non-évident. **Vite `^8.1.0`** (un *major* très récent, embarqué dans ce
projet) **ne résout pas les imports bare des paquets granulaires `@codemirror/*`** sur son
serveur de dev (`Failed to resolve import "@codemirror/view"`), alors même que :

- les paquets sont présents dans `node_modules` et **Node les importe sans souci** ;
- le champ `exports` est standard et **identique entre versions** (ce n'est pas une
  régression de packaging CodeMirror) ;
- vider le cache `.vite`, rebuild de l'image, volume `node_modules` neuf → échec identique ;
- même en forçant `optimizeDeps.include` (les deps étaient alors bien pré-bundlées), la
  résolution **échouait quand même**.

Conclusion : bug/instabilité **côté résolveur Vite 8**, pas côté CodeMirror.

**Le contournement** : on **bundle CodeMirror nous-mêmes** (le *bundler* de Vite, lui,
résout très bien ces paquets — c'est uniquement le serveur de dev qui bloque) en un seul
fichier **UMD**, qu'on **sert depuis notre origine** et qu'on charge par balise `<script>`.
Le serveur de dev Vite n'intervient alors jamais dans cette résolution.

Bénéfices : **aucun CDN au runtime**, **hors-ligne OK**, **un seul `@codemirror/state`**
(un seul bundle ⇒ pas d'erreur « Unrecognized extension value »), infra Vite intouchée.

> Alternative écartée : charger CodeMirror depuis `esm.sh` au runtime (marche aussi, mais
> dépendance CDN + réseau au 1ᵉʳ chargement). Le bundle local a été préféré.

---

## 3. Comment ça charge (runtime)

`CodeEditor.vue` :

1. au montage, injecte `<script src="/vendor/codemirror.js">` (une seule fois, mis en cache
   dans `cmPromise`) ; le bundle UMD définit `window.CMBundle` avec tous les symboles ;
2. construit l'`EditorView` CodeMirror avec un thème basé sur les variables CSS
   (`--code`, `--code-txt`, `--border`, `--accent`, `--muted`…) et une coloration utilisant
   `--accent`/`--accent2` (donc lisible sur les 4 thèmes) ;
3. **si le `<script>` échoue** (fichier absent / réseau) → `failed = true` → rend un
   `<textarea>` de secours (même `v-model`). L'édition reste donc toujours possible.

---

## 4. Régénérer le bundle

Le bundle est un **artefact versionné** (`frontend/public/vendor/codemirror.js`). Si on
change la liste des fonctionnalités CodeMirror, on le régénère :

```bash
# dans le conteneur frontend (les devDeps @codemirror y sont installées)
docker compose exec frontend npm run build:cm
```

- **Entrée** : `frontend/cm-entry.js` — ré-exporte exactement les symboles dont
  `CodeEditor.vue` a besoin (EditorView, EditorState, langs, highlight, etc.). Pour exposer
  un nouveau symbole, l'ajouter ici.
- **Config** : `frontend/vite.cm.config.js` — build Vite en mode *lib* **UMD**
  (`name: 'CMBundle'`), `publicDir: false` (sinon Vite recopie `public/` dans l'outDir),
  sortie `public/vendor/codemirror.js`.
- **Script** : `build:cm` dans `frontend/package.json`.
- Les paquets `@codemirror/*` + `@lezer/highlight` sont en **`devDependencies`** : requis
  **seulement** pour régénérer le bundle, jamais au runtime. (L'image Docker les installe au
  build, donc `npm run build:cm` est reproductible.)

Après régénération : **commiter** le `public/vendor/codemirror.js` mis à jour.

---

## 5. Ajouter un langage

1. `npm i -D @codemirror/lang-<x>` (dans le conteneur) + l'ajouter aux `devDependencies`.
2. Ré-exporter sa fonction dans `cm-entry.js` (`export { x } from '@codemirror/lang-x'`).
3. Gérer le cas dans `langExt()` de `CodeEditor.vue`.
4. `npm run build:cm` puis commiter le bundle.

---

## 6. Limites & prod

- **Poids** : ~513 Ko (≈183 Ko gzip) chargés au 1ᵉʳ ouverture d'un éditeur, puis cache.
- **Prod** : `public/` est copié à la racine du build → `/vendor/codemirror.js` servi par
  notre propre serveur. **Aucune autorisation CSP externe** nécessaire pour l'éditeur
  (contrairement à Pyodide et au sandbox JS qui, eux, utilisent des CDN — cf.
  `docs/pyodide-runner-plan.md`).
- **Le « vrai » fix** (revenir à une dépendance npm bundlée classique) viendra d'un
  downgrade Vite 8→7 ou d'un patch Vite ; d'ici là, le bundle vendored fait le job.

---

## 7. Fichiers concernés

| Fichier | Rôle |
|---|---|
| `frontend/src/components/CodeEditor.vue` | Composant éditeur (chargement `<script>`, thème, fallback textarea). |
| `frontend/public/vendor/codemirror.js` | **Bundle UMD vendored** (artefact versionné). |
| `frontend/cm-entry.js` | Entrée de build : symboles ré-exportés. |
| `frontend/vite.cm.config.js` | Config du build du bundle (`npm run build:cm`). |
| `frontend/package.json` | Script `build:cm` + devDeps `@codemirror/*`, `@lezer/highlight`. |
| `frontend/e2e/helpers/codemirror.js` | Helpers E2E (saisie dans CodeMirror / fallback). |
