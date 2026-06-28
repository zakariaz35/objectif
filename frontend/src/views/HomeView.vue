<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../lib/api'

const router = useRouter()
const formations = ref([])
const loading = ref(true)
const error = ref(null)

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

// Docs (FORMAT / README) chargées à la première ouverture du panneau.
const docs = ref({}) // { format: html, readme: html }
const docLoading = ref({})
async function loadDoc(name) {
  if (docs.value[name] || docLoading.value[name]) return
  docLoading.value = { ...docLoading.value, [name]: true }
  try {
    docs.value = { ...docs.value, [name]: await api.getDoc(name) }
  } catch (e) {
    docs.value = { ...docs.value, [name]: '<p>Impossible de charger ce document.</p>' }
  } finally {
    docLoading.value = { ...docLoading.value, [name]: false }
  }
}

onMounted(load)
</script>

<template>
  <main class="home">
    <h1>Mes formations</h1>

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
    <div v-else class="grid">
      <article
        v-for="f in formations"
        :key="f.slug"
        class="card"
        @click="router.push(`/f/${f.slug}`)"
      >
        <h3>{{ f.title }}</h3>
        <p class="desc">{{ f.description }}</p>
        <span class="badge">{{ f.modules_count }} module(s)</span>
      </article>
    </div>

    <section class="docs">
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
  color: #aee0ff;
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
  color: #d7e0f0;
  font-size: 13px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 28px;
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
