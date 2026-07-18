<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'

const router = useRouter()
const { t, locale } = useI18n()

const formations = ref([])
const parcours = ref([])
const contentFormations = ref([]) // formations disponibles dans content/ (importables)
const importing = ref(null)
const loading = ref(true)
const error = ref(null)

// --- Recherche & filtre par tags -------------------------------------------------------
const query = ref('')
const activeTags = ref([]) // tags sélectionnés (ET : la formation doit tous les porter)

const allTags = computed(() => {
  const s = new Set()
  for (const f of formations.value) for (const tag of f.tags || []) s.add(tag)
  return [...s].sort((a, b) => a.localeCompare(b, locale.value))
})

function toggleTag(tag) {
  const i = activeTags.value.indexOf(tag)
  if (i === -1) activeTags.value.push(tag)
  else activeTags.value.splice(i, 1)
}
function clearFilters() {
  query.value = ''
  activeTags.value = []
}
const hasFilters = computed(() => query.value.trim() !== '' || activeTags.value.length > 0)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return formations.value.filter((f) => {
    if (activeTags.value.length && !activeTags.value.every((tag) => (f.tags || []).includes(tag))) {
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

// Missions (kind: mission) : travaux réels — comprendre / planifier / résultat.
const missions = computed(() => filtered.value.filter((f) => f.kind === 'mission'))

// Group the catalog into "cursus" (tracks) + a trailing "others" bucket (missions excluded).
const groups = computed(() => {
  const tracks = new Map()
  const others = []
  for (const f of filtered.value) {
    if (f.kind === 'mission') continue
    if (f.track) {
      if (!tracks.has(f.track)) tracks.set(f.track, [])
      tracks.get(f.track).push(f)
    } else {
      others.push(f)
    }
  }
  const result = [...tracks.entries()].map(([name, items]) => ({ key: name, name, track: true, items }))
  if (others.length) result.push({ key: '__others__', name: null, track: false, items: others })
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
    parcours.value = await api.listParcours().catch(() => [])
    contentFormations.value = await api.listContentFormations().catch(() => [])
  } catch (e) {
    error.value = t('explorer.apiError')
  } finally {
    loading.value = false
  }
}

async function importCourse(f) {
  importing.value = f.slug
  try {
    await api.importFormation(f.slug)
    await load()
  } catch (e) {
    error.value = t('parcours.importError', { ref: f.slug })
  } finally {
    importing.value = null
  }
}

async function handleFile(file) {
  if (!file) return
  uploading.value = true
  uploadMsg.value = null
  uploadErr.value = null
  try {
    const res = await api.importZip(file)
    uploadMsg.value = t('explorer.uploadOk', {
      title: res.formation.title,
      modules: res.formation.modules,
      lessons: res.formation.lessons,
    })
    await load()
  } catch (e) {
    uploadErr.value = e.response?.data?.message || t('explorer.uploadError')
  } finally {
    uploading.value = false
  }
}
function onDrop(e) {
  dragging.value = false
  handleFile(e.dataTransfer.files[0])
}

// Docs (FORMAT / README) loaded on first panel open.
const docs = ref({})
const docLoading = ref({})
async function loadDoc(name) {
  if (docs.value[name] || docLoading.value[name]) return
  docLoading.value[name] = true
  try {
    docs.value[name] = await api.getDoc(name)
  } catch (e) {
    docs.value[name] = '<p>' + t('explorer.docLoadError') + '</p>'
  } finally {
    docLoading.value[name] = false
  }
}
function ghSlug(text) {
  return text.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-')
}
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
    <header class="hero">
      <h1>{{ $t('explorer.title') }}</h1>
      <p>{{ $t('explorer.subtitle') }}</p>
    </header>

    <section v-if="parcours.length" class="parcours-list">
      <div class="section-head">
        <h2>{{ $t('explorer.parcoursTitle') }}</h2>
        <router-link to="/atelier-parcours" class="head-link">🛠️ {{ $t('explorer.atelierLink') }}</router-link>
      </div>
      <div class="pgrid">
        <router-link v-for="p in parcours" :key="p.slug" :to="`/parcours/${p.slug}`" class="pcard">
          <h3>🧭 {{ p.title }}</h3>
          <p class="pdesc">{{ p.objectif }}</p>
          <span class="badge">{{ $t('explorer.parcoursBadge', { count: p.etapes_count, hours: p.total_duree_h }) }}</span>
        </router-link>
      </div>
    </section>

    <section v-if="missions.length" class="missions">
      <div class="section-head">
        <h2>🧰 {{ $t('explorer.missionsTitle') }}</h2>
        <span class="track-hint">{{ $t('explorer.missionsHint') }}</span>
      </div>
      <div class="pgrid">
        <article v-for="f in missions" :key="f.slug" class="card mission-card" @click="router.push(`/f/${f.slug}`)">
          <span class="mission-badge">{{ $t('explorer.missionBadge') }}</span>
          <h3>{{ f.title }}</h3>
          <p class="desc">{{ f.description }}</p>
          <span class="badge">{{ $t('explorer.modulesCount', { count: f.modules_count }) }}</span>
        </article>
      </div>
    </section>

    <section v-if="contentFormations.length" class="import-catalog">
      <h2>{{ $t('explorer.importCatalogTitle') }}</h2>
      <div class="pgrid">
        <div v-for="f in contentFormations" :key="f.slug" class="ic-card">
          <h3>{{ f.title }}</h3>
          <span v-if="f.stack" class="stack">{{ f.stack }}</span>
          <div class="ic-actions">
            <span v-if="f.imported" class="ic-done">{{ $t('explorer.imported') }}</span>
            <button v-else class="import-btn" :disabled="importing === f.slug" @click="importCourse(f)">
              {{ importing === f.slug ? $t('explorer.importing') : $t('explorer.import') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <div
      class="dropzone"
      :class="{ dragging }"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
      @click="fileInput.click()"
    >
      <input ref="fileInput" type="file" accept=".zip" hidden @change="handleFile($event.target.files[0])" />
      <p v-if="uploading">{{ $t('explorer.uploading') }}</p>
      <p v-else>{{ $t('explorer.dropHint') }}</p>
      <p class="hint">{{ $t('explorer.dropSub') }}</p>
    </div>
    <p v-if="uploadMsg" class="ok">✓ {{ uploadMsg }}</p>
    <p v-if="uploadErr" class="err">✗ {{ uploadErr }}</p>

    <div v-if="loading" class="muted">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="err">{{ error }}</div>
    <div v-else-if="formations.length === 0" class="onboarding">
      <h2>{{ $t('explorer.onboardingTitle') }}</h2>
      <p>{{ $t('explorer.onboardingIntro') }}</p>
      <pre><code>docker compose exec backend \
  php artisan formation:import /content/jwt-hexagonal-ddd</code></pre>
    </div>
    <div v-else class="catalog">
      <div class="filters">
        <input
          v-model="query"
          type="search"
          class="search"
          :placeholder="$t('explorer.searchPlaceholder')"
          :aria-label="$t('explorer.searchAria')"
        />
        <div v-if="allTags.length" class="tagbar" role="group" :aria-label="$t('explorer.searchAria')">
          <button
            v-for="tag in allTags"
            :key="tag"
            class="tag"
            :class="{ active: activeTags.includes(tag) }"
            :aria-pressed="activeTags.includes(tag)"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
        <div v-if="hasFilters" class="filter-meta">
          <span>{{ $t('explorer.resultCount', { count: filtered.length }) }}</span>
          <button class="clear" @click="clearFilters">{{ $t('explorer.clear') }}</button>
        </div>
      </div>

      <p v-if="filtered.length === 0" class="muted">{{ $t('explorer.noMatch') }}</p>

      <section v-for="g in groups" :key="g.key" class="track-section">
        <div class="track-head">
          <h2>{{ g.track ? $t('explorer.trackTitle', { name: g.name }) : $t('explorer.othersTitle') }}</h2>
          <span v-if="g.track" class="track-hint">{{ $t('explorer.recommendedOrder') }}</span>
        </div>
        <div class="grid">
          <article
            v-for="(f, i) in g.items"
            :key="f.slug"
            class="card"
            :class="{ 'card--step': g.track }"
            @click="router.push(`/f/${f.slug}`)"
          >
            <span v-if="g.track" class="step">{{ $t('explorer.step', { n: i + 1 }) }}</span>
            <span v-if="f.stack" class="stack">{{ f.stack }}</span>
            <h3>{{ f.title }}</h3>
            <p class="desc">{{ f.description }}</p>
            <span class="badge">{{ $t('explorer.modulesCount', { count: f.modules_count }) }}</span>
            <div v-if="f.tags?.length" class="card-tags">
              <button
                v-for="tag in f.tags"
                :key="tag"
                class="card-tag"
                :class="{ active: activeTags.includes(tag) }"
                @click.stop="toggleTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <section class="docs" @click="onDocClick">
      <details @toggle="$event.target.open && loadDoc('format')">
        <summary>{{ $t('explorer.docsFormat') }}</summary>
        <div v-if="docLoading.format" class="muted">{{ $t('common.loading') }}</div>
        <div v-else class="prose" v-html="docs.format"></div>
      </details>
      <details @toggle="$event.target.open && loadDoc('readme')">
        <summary>{{ $t('explorer.docsReadme') }}</summary>
        <div v-if="docLoading.readme" class="muted">{{ $t('common.loading') }}</div>
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
.hero {
  margin: 0 0 26px;
  padding: 26px 28px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--panel2), var(--panel));
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.hero h1 {
  margin: 0 0 6px;
  color: var(--heading);
  font-size: 30px;
}
.hero p {
  margin: 0;
  color: var(--muted);
  font-size: 16px;
}
.card,
.pcard,
.ic-card {
  box-shadow: var(--shadow);
}
.card:hover,
.pcard:hover {
  box-shadow: var(--shadow-lg);
}
.parcours-list {
  margin: 4px 0 28px;
}
.parcours-list h2 {
  font-size: 18px;
  margin: 0 0 12px;
}
.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.section-head h2 {
  margin: 0;
  font-size: 18px;
}
.head-link {
  font-size: 14px;
  color: var(--accent);
  text-decoration: none;
}
.head-link:hover {
  text-decoration: underline;
}
.missions {
  margin: 4px 0 28px;
}
.mission-card {
  border-color: var(--accent2);
  background: var(--panel2);
}
.mission-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent-contrast);
  background: var(--accent2);
  padding: 2px 9px;
  border-radius: 20px;
  margin-bottom: 8px;
}
.pgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.pcard {
  display: block;
  border: 1px solid var(--accent);
  border-radius: 12px;
  padding: 16px;
  background: var(--panel2);
  color: inherit;
  text-decoration: none;
  transition: transform 0.12s;
}
.pcard:hover {
  transform: translateY(-2px);
}
.pcard h3 {
  margin: 0 0 6px;
}
.pcard .pdesc {
  color: var(--muted);
  font-size: 14px;
  margin: 0 0 12px;
}
.import-catalog {
  margin: 4px 0 24px;
}
.import-catalog h2 {
  font-size: 18px;
  margin: 0 0 12px;
}
.ic-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  background: var(--panel);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ic-card h3 {
  margin: 0;
  font-size: 15px;
}
.ic-actions {
  margin-top: auto;
}
.ic-done {
  font-size: 13px;
  color: var(--good);
}
.import-btn {
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid var(--accent);
  border-radius: 20px;
  padding: 4px 14px;
  background: var(--accent);
  color: var(--accent-contrast);
}
.import-btn:disabled {
  opacity: 0.6;
  cursor: default;
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
