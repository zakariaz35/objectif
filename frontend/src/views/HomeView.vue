<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../lib/api'

const router = useRouter()
const formations = ref([])
const loading = ref(true)
const error = ref(null)

// --- Recherche & filtre par tags (catalogue) -------------------------------------------
const query = ref('')
const activeTags = ref([]) // tags sélectionnés (ET : la formation doit tous les porter)

// Tags distincts présents dans le catalogue, triés (fr).
const allTags = computed(() => {
  const s = new Set()
  for (const f of formations.value) for (const t of f.tags || []) s.add(t)
  return [...s].sort((a, b) => a.localeCompare(b, 'fr'))
})

function toggleTag(t) {
  const i = activeTags.value.indexOf(t)
  if (i === -1) activeTags.value.push(t)
  else activeTags.value.splice(i, 1)
}

function clearFilters() {
  query.value = ''
  activeTags.value = []
}

const hasFilters = computed(() => query.value.trim() !== '' || activeTags.value.length > 0)

// Liste filtrée : tags (ET) puis recherche plein-texte sur titre/description/stack/track/tags.
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return formations.value.filter((f) => {
    if (activeTags.value.length && !activeTags.value.every((t) => (f.tags || []).includes(t))) {
      return false
    }
    if (!q) return true
    const hay = [f.title, f.description, f.stack, f.track, ...(f.tags || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

// Group the catalog into "cursus" (tracks) + a trailing "Autres formations".
// The API already returns formations sorted by position, so within a track the
// arrival order is the recommended order (step number = index + 1), and the first
// track encountered is the one with the lowest position.
const groups = computed(() => {
  const tracks = new Map()
  const others = []
  for (const f of filtered.value) {
    if (f.track) {
      if (!tracks.has(f.track)) tracks.set(f.track, [])
      tracks.get(f.track).push(f)
    } else {
      others.push(f)
    }
  }
  const result = [...tracks.entries()].map(([name, items]) => ({
    key: name,
    title: `Cursus ${name}`,
    track: true,
    items,
  }))
  if (others.length) {
    result.push({ key: '__others__', title: 'Autres formations', track: false, items: others })
  }
  return result
})

const uploading = ref(false)
const uploadMsg = ref(null)
const uploadErr = ref(null)
const dragging = ref(false)
const fileInput = ref(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    formations.value = await api.listFormations()
  } catch (e) {
    error.value = "Impossible de joindre l'API. Le backend est-il démarré ?"
  } finally {
    loading.value = false
  }
}

async function handleFile(file) {
  if (!file) return
  uploading.value = true
  uploadMsg.value = null
  uploadErr.value = null
  try {
    const res = await api.importZip(file)
    uploadMsg.value = `« ${res.formation.title} » importée (${res.formation.modules} modules, ${res.formation.lessons} leçons).`
    await load()
  } catch (e) {
    uploadErr.value = e.response?.data?.message || "Échec de l'import."
  } finally {
    uploading.value = false
  }
}

function onDrop(e) {
  dragging.value = false
  handleFile(e.dataTransfer.files[0])
}

// Docs (FORMAT / README) loaded on first panel open.
const docs = ref({}) // { format: html, readme: html }
const docLoading = ref({})
async function loadDoc(name) {
  if (docs.value[name] || docLoading.value[name]) return
  docLoading.value[name] = true
  try {
    docs.value[name] = await api.getDoc(name)
  } catch (e) {
    docs.value[name] = '<p>Impossible de charger ce document.</p>'
  } finally {
    docLoading.value[name] = false
  }
}

// GitHub-style slug (keeps accented letters) to link anchor ↔ heading.
function ghSlug(text) {
  return text.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-')
}

// Table-of-contents links (#anchor) point to headings without ids: intercept the
// click and scroll to the matching heading inside the panel (without scrolling the page).
function onDocClick(e) {
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  e.preventDefault()
  const target = decodeURIComponent(a.getAttribute('href').slice(1))
  const prose = a.closest('.prose')
  if (!prose) return
  for (const h of prose.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
    if (ghSlug(h.textContent) === target) {
      h.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
  }
}

onMounted(load)
</script>

<template>
  <main class="home">
    <h1>Mes formations</h1>

    <router-link to="/parcours/ai-augmented-developer" class="parcours-banner">
      🧭 Mon parcours : <b>AI-Augmented Developer</b> — voir la roadmap →
    </router-link>

    <div
      class="dropzone"
      :class="{ dragging }"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
      @click="fileInput.click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".zip"
        hidden
        @change="handleFile($event.target.files[0])"
      />
      <p v-if="uploading">⏳ Import en cours…</p>
      <p v-else>📦 Glisse un <b>.zip</b> de formation ici, ou clique pour choisir un fichier.</p>
      <p class="hint">Markdown + front-matter · dossiers = modules · <code>&lt;!--correction--&gt;</code> sépare énoncé et correction.</p>
    </div>
    <p v-if="uploadMsg" class="ok">✓ {{ uploadMsg }}</p>
    <p v-if="uploadErr" class="err">✗ {{ uploadErr }}</p>

    <div v-if="loading" class="muted">Chargement…</div>
    <div v-else-if="error" class="err">{{ error }}</div>
    <div v-else-if="formations.length === 0" class="onboarding">
      <h2>👋 Bienvenue — aucune formation pour l'instant</h2>
      <p>Cette plateforme lit des formations écrites en <b>Markdown</b>. Pour commencer :</p>
      <ol>
        <li>
          <b>Structure</b> un dossier : un <code>formation.yaml</code> à la racine, un
          sous-dossier par module, un <code>.md</code> par leçon. Types de leçon :
          <code>lesson</code>, <code>flashcards</code>, <code>quiz</code>, <code>exercise</code>.
        </li>
        <li><b>Zippe</b> ce dossier.</li>
        <li><b>Dépose</b> le <code>.zip</code> dans la zone ci-dessus (ou clique pour le choisir).</li>
      </ol>
      <p class="hint">
        Format détaillé : voir <code>content/FORMAT.md</code> dans le dépôt.
      </p>
      <div class="example">
        <b>Juste essayer ?</b> Une formation d'exemple (« JWT, Bearer, Hexagonal &amp; DDD »)
        est fournie. Charge-la en une commande :
        <pre><code>docker compose exec backend \
  php artisan formation:import /content/jwt-hexagonal-ddd</code></pre>
        puis recharge cette page.
      </div>
    </div>
    <div v-else class="catalog">
      <div class="filters">
        <input
          v-model="query"
          type="search"
          class="search"
          placeholder="🔍 Rechercher une formation…"
          aria-label="Rechercher une formation"
        />
        <div v-if="allTags.length" class="tagbar" role="group" aria-label="Filtrer par tag">
          <button
            v-for="t in allTags"
            :key="t"
            class="tag"
            :class="{ active: activeTags.includes(t) }"
            :aria-pressed="activeTags.includes(t)"
            @click="toggleTag(t)"
          >
            {{ t }}
          </button>
        </div>
        <div v-if="hasFilters" class="filter-meta">
          <span>{{ filtered.length }} formation(s)</span>
          <button class="clear" @click="clearFilters">✕ Réinitialiser</button>
        </div>
      </div>

      <p v-if="filtered.length === 0" class="muted">Aucune formation ne correspond aux filtres.</p>

      <section v-for="g in groups" :key="g.key" class="track-section">
        <div class="track-head">
          <h2>{{ g.title }}</h2>
          <span v-if="g.track" class="track-hint">Ordre conseillé</span>
        </div>
        <div class="grid">
          <article
            v-for="(f, i) in g.items"
            :key="f.slug"
            class="card"
            :class="{ 'card--step': g.track }"
            @click="router.push(`/f/${f.slug}`)"
          >
            <span v-if="g.track" class="step">Étape {{ i + 1 }}</span>
            <span v-if="f.stack" class="stack">{{ f.stack }}</span>
            <h3>{{ f.title }}</h3>
            <p class="desc">{{ f.description }}</p>
            <span class="badge">{{ f.modules_count }} module(s)</span>
            <div v-if="f.tags?.length" class="card-tags">
              <button
                v-for="t in f.tags"
                :key="t"
                class="card-tag"
                :class="{ active: activeTags.includes(t) }"
                @click.stop="toggleTag(t)"
              >
                {{ t }}
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <section class="docs" @click="onDocClick">
      <details @toggle="$event.target.open && loadDoc('format')">
        <summary>📐 Format d'une formation (arborescence du ZIP)</summary>
        <div v-if="docLoading.format" class="muted">Chargement…</div>
        <div v-else class="prose" v-html="docs.format"></div>
      </details>
      <details @toggle="$event.target.open && loadDoc('readme')">
        <summary>📖 À propos du projet (README)</summary>
        <div v-if="docLoading.readme" class="muted">Chargement…</div>
        <div v-else class="prose" v-html="docs.readme"></div>
      </details>
    </section>
  </main>
</template>

<style scoped>
.home {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}
h1 {
  margin: 8px 0 24px;
}
.parcours-banner {
  display: block;
  margin: 0 0 20px;
  padding: 12px 16px;
  border: 1px solid var(--accent);
  border-radius: 12px;
  background: var(--panel2);
  color: inherit;
  text-decoration: none;
  font-size: 15px;
}
.parcours-banner:hover {
  background: var(--panel);
}
.dropzone {
  border: 2px dashed var(--border);
  border-radius: 14px;
  padding: 28px;
  text-align: center;
  background: var(--panel);
  transition: border-color 0.15s, background 0.15s;
}
.dropzone:hover,
.dropzone.dragging {
  border-color: var(--accent);
  background: var(--panel2);
}
.dropzone .hint {
  color: var(--muted);
  font-size: 13px;
  margin: 8px 0 0;
}
.ok {
  color: var(--good);
}
.err {
  color: var(--bad);
}
.muted {
  color: var(--muted);
  margin-top: 24px;
}
.onboarding {
  margin-top: 28px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--panel);
  padding: 22px 24px;
}
.onboarding h2 {
  margin: 0 0 12px;
  font-size: 20px;
}
.onboarding ol {
  margin: 12px 0;
  padding-left: 22px;
}
.onboarding li {
  margin: 8px 0;
}
.onboarding code {
  background: var(--code);
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 13px;
  color: var(--code-inline);
}
.onboarding .hint {
  color: var(--muted);
  font-size: 14px;
}
.onboarding .example {
  margin-top: 16px;
  border-left: 3px solid var(--accent2);
  background: var(--panel2);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
}
.onboarding pre {
  background: var(--code);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  overflow-x: auto;
  margin: 10px 0;
}
.onboarding pre code {
  background: none;
  padding: 0;
  color: var(--code-txt);
  font-size: 13px;
}
.catalog {
  margin-top: 28px;
}
.filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}
.search {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 14px;
  font-size: 15px;
  color: inherit;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: border-color 0.15s;
}
.search:focus {
  outline: none;
  border-color: var(--accent);
}
.tagbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag {
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--muted);
  transition: all 0.12s;
}
.tag:hover {
  border-color: var(--accent);
  color: inherit;
}
.tag.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-contrast);
  font-weight: 600;
}
.filter-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--muted);
}
.clear {
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  background: none;
  border: none;
  color: var(--accent);
  padding: 0;
}
.clear:hover {
  text-decoration: underline;
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}
.card-tag {
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--panel2);
  color: var(--muted);
  transition: all 0.12s;
}
.card-tag:hover {
  border-color: var(--accent);
  color: inherit;
}
.card-tag.active {
  background: var(--accent2);
  border-color: var(--accent2);
  color: var(--accent-contrast);
}
.track-section {
  margin-top: 32px;
}
.track-section:first-child {
  margin-top: 0;
}
.track-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
  margin-bottom: 4px;
}
.track-head h2 {
  margin: 0;
  font-size: 18px;
}
.track-hint {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
.card--step {
  position: relative;
}
.step {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-contrast);
  background: var(--accent2);
  padding: 2px 9px;
  border-radius: 20px;
  margin: 0 6px 8px 0;
}
.card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px;
  background: var(--panel);
  cursor: pointer;
  transition: transform 0.12s, border-color 0.12s;
}
.card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}
.card h3 {
  margin: 0 0 8px;
}
.card .desc {
  color: var(--muted);
  font-size: 14px;
  margin: 0 0 14px;
  min-height: 40px;
}
.badge {
  font-size: 12px;
  background: var(--panel2);
  color: var(--accent2);
  padding: 3px 10px;
  border-radius: 20px;
}
.stack {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent-contrast);
  background: var(--accent);
  padding: 2px 9px;
  border-radius: 20px;
  margin-bottom: 8px;
}
.docs {
  margin-top: 40px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}
.docs details {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--panel);
  margin: 10px 0;
  overflow: hidden;
}
.docs summary {
  cursor: pointer;
  padding: 14px 18px;
  font-weight: 600;
  list-style: none;
}
.docs summary::-webkit-details-marker {
  display: none;
}
.docs details[open] summary {
  border-bottom: 1px solid var(--border);
}
.docs .prose,
.docs .muted {
  padding: 4px 18px 18px;
}
.docs .prose {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
