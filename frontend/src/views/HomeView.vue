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
    <div v-else-if="formations.length === 0" class="muted">
      Aucune formation pour l'instant — importe ton premier ZIP ci-dessus.
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
</style>
