# Réflexion & plan — Internationalisation (i18n) d'Objectif

> Deux problèmes **distincts** à ne pas mélanger : traduire **l'interface** (borné) et
> traduire **les cours** (le sujet délicat, car les cours sont du Markdown importé en base).
> Doc de cadrage — ancré dans le code réel (`FormationImporter`, `LessonController@show`,
> table `lessons` + payloads par type, `ResolvesOwner`, pattern singleton réactif `theme.js`).

---

## Partie A — Interface (FR / EN / AR)

**Mécanique.** `vue-i18n` (plutôt que maison) : pluriels, interpolation, formats date/nombre,
et surtout la gestion RTL. Locale persistée en `localStorage` (comme `client_token`/thème),
exposée au backend via un header `X-Locale` (intercepteur axios) pour localiser aussi les
messages serveur (`abort()`, validation) via `lang/{fr,en,ar}` + `__()` + `App::setLocale()`.

**Le vrai coût = extraire les chaînes** codées en dur (FR) dans tous les composants/vues vers
des catalogues `fr.json` / `en.json` / `ar.json`.

**Arabe = RTL — chantier CSS à part.** Le CSS utilise des propriétés **physiques**
(`border-left`, `margin-left:auto`, chevrons, connecteur `.step::after{left:…}`). Il faut :
`dir="rtl"` conditionnel sur `<html>`, migration vers **propriétés logiques**
(`border-inline-start`, `margin-inline`…) ou overrides `[dir=rtl]`, `dir="ltr"` forcé sur le
code/anglais imbriqué, et une police arabe. À faire **après** FR/EN.

---

## Partie B — Traduction des cours

### Contraintes non négociables (déduites du code)

1. **Le MD est rendu en HTML *à l'import*** (`FormationImporter` : `body_md → body_html`). ⇒ on
   traduit **la source Markdown puis on re-render** ; jamais le HTML (sinon on casse les balises).
2. **Identité partagée.** Progression, `quiz_attempts`, SRS (`card_reviews`) sont liés à
   `lesson_id`. Une leçon et sa traduction **doivent partager le même `lesson_id`** — finir la
   leçon en FR doit la cocher en EN. ⇒ **exclut** « une formation par langue » (slugs distincts).
3. **Payloads structurés par type**, pas seulement le corps : `quiz_questions`
   (prompt/options/explanation), `cards`, `pairs`, `cloze`. Chacun a du texte à traduire.
4. **Ne pas traduire n'importe quoi** : blocs de code / Mermaid / URLs d'assets, **et** le
   matériau en *langue cible* (une leçon `matching` EN↔FR ou `cloze` reste dans sa langue ;
   traduire l'UI en arabe n'en fait pas du EN↔AR). On traduit la **langue d'instruction**.

### Les approches (dont tes deux propositions)

| # | Approche | Pour | Contre |
|---|---|---|---|
| **1** | **Dossiers par langue** — `lang:` (source) dans `formation.yaml`, et un dossier miroir de traductions ; la **clé de jointure = le slug** (module/leçon). *(ta proposition A)* | Gère nativement les **front-matter structurés** (chaque fichier traduit a son propre `questions:`/`cards:`…) ; humain **ou** LLM remplit un dossier ; slug = identité partagée. | Duplique l'arbo ; il faut garder les slugs synchronisés. |
| **2** | **Marqueur inline** — cours + traduction dans le **même `.md`**, séparés par un marqueur perso (ex. `<!--lang:en-->`). *(ta proposition B)* | Tout au même endroit, facile à relire/synchroniser ; réutilise l'idée du marqueur `<!--correction-->` déjà en place. | Ne couvre **que le corps en prose** : les `questions:`/`cards:`/`cloze:` vivent dans le **front-matter YAML**, qu'un marqueur de corps ne découpe pas → il faudrait `questions_en:` etc. (moche). Fichiers volumineux. |
| 3 | Traduction machine **à la volée** (requête) | Zéro contenu à écrire | Coût/latence/qualité par requête, cache à gérer, risque sur le code. Écartée comme mécanisme **primaire**. |

### Recommandation : **Approche 1 (dossiers par langue) + table `*_translations`**, marqueur inline en *option*

C'est la seule qui encaisse proprement les **payloads structurés** et l'**identité partagée**.
Le marqueur inline (ton B) reste utile comme **sucre d'écriture pour les leçons 100 % prose** :
l'importer le découperait vers les **mêmes** tables — donc les deux approches convergent en base.

**Contenu / convention de dossier**
```
content/<slug>/
├─ formation.yaml           # + lang: fr   (langue source, défaut)
├─ 01-module/01-lecon.md    # SOURCE (fr)
└─ _i18n/                   # ignoré par le scan de modules (préfixe _)
   ├─ en/01-module/01-lecon.md   # même slug ⇒ même leçon
   └─ ar/01-module/01-lecon.md
```
- **Clé de jointure = le slug** (`<module-slug>/<lesson-slug>`), pas le nom de fichier. Si les
  noms diffèrent, un `slug:` explicite en front-matter relie source et traduction.
- Fichier de traduction manquant → **fallback sur la source** + petit badge « non traduit ».

**Modèle de données** (rendu HTML régénéré à l'import depuis le MD traduit)
- `formation_translations(formation_id, locale, title, description)`
- `module_translations(module_id, locale, title)`
- `lesson_translations(lesson_id, locale, title, body_html, correction_html, payload json)`
  où `payload` porte la version localisée des champs structurés (options/explication de quiz,
  `cards`, `cloze.parts`…), **selon les règles par type** ci-dessous.
- clé unique `(entity_id, locale)`.

**Règles par type** (ce qui se traduit)

| Type | On traduit | On NE traduit PAS |
|---|---|---|
| `lesson`/prose | corps, correction | code, Mermaid, assets |
| `quiz` | prompt, options, explication | (sauf quiz de langue → langue cible figée) |
| `matching` | rien (déjà bilingue) | les paires |
| `cloze` | l'intro/consigne | le texte à trous + réponses |
| flashcards | q/a (si prose) | vocabulaire cible |

**Pipeline d'import (modifié)**
- `FormationImporter` : importe la **source** (comme aujourd'hui) puis lit `_i18n/<locale>/…`
  et **upsert** les lignes `*_translations` en **matchant par slug** (donc même `lesson_id`).
  Masquer/rétablir code & Mermaid avant traduction n'est nécessaire que pour la **génération**.
- `_i18n/` est ignoré par le scan de modules (comme `_modules/`).

**Génération assistée LLM** (bootstrap, puis relecture humaine)
- Commande `php artisan formation:translate <slug> --to=en,ar` : lit la source MD, **masque**
  les fences de code / Mermaid / URLs, traduit la prose + les champs structurés selon les
  règles par type, réécrit les fichiers `_i18n/<locale>/…`. La relecture se fait sur des `.md`.

**Service (API)**
- `LessonController@show` (et `FormationController`) : locale via header `X-Locale` (ou `?locale=`)
  → renvoyer les champs de `*_translations` si présents, **fallback source** sinon (+ flag
  `translated: false`).

### Ordre de mise en œuvre
1. **Partie A — UI FR/EN** (vue-i18n + extraction) — débloque les non-francophones, borné.
2. **Contenu FR/EN** : migrations `*_translations` + import `_i18n/` + `show` localisé + fallback.
3. **Commande `formation:translate`** (LLM + masquage) pour bootstrapper les traductions.
4. **RTL / arabe** : UI (propriétés logiques) puis contenu — chantier dédié.

### Fichiers à toucher (indicatif)
- **Backend** : `database/migrations/*` (`*_translations`) ; `FormationImporter` (lecture `_i18n/`,
  upsert) ; `LessonController`/`FormationController` (locale + fallback) ; `lang/{fr,en,ar}` ;
  middleware/`App::setLocale` depuis `X-Locale` ; commande `formation:translate`.
- **Frontend** : `vue-i18n` + `lib/i18n.js` (locale + persistance) ; catalogues `locales/*.json` ;
  extraction des chaînes dans **toutes** les vues/composants ; sélecteur de langue dans `App.vue` ;
  `X-Locale` dans l'intercepteur `lib/api.js` ; audit CSS RTL (phase 4).
- **Doc** : `content/FORMAT.md` (`lang:`, dossier `_i18n/`, marqueur inline optionnel).
