<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../lib/api'

const props = defineProps({ slug: { type: String, required: true } })

const data = ref(null)
const loading = ref(true)
const error = ref(null)

// Statut manuel des jalons externes, persisté localement : 'todo' | 'wip' | 'done'.
const jalonStatus = ref({})
const lsKey = (i) => `parcours:${props.slug}:${i}`
const STATUS_LABEL = { todo: 'À faire', wip: 'En cours', done: 'Fait' }

function loadStatuses(etapes) {
  const s = {}
  for (const e of etapes) if (e.type === 'jalon') s[e.index] = localStorage.getItem(lsKey(e.index)) || 'todo'
  jalonStatus.value = s
}
function cycle(e) {
  const order = ['todo', 'wip', 'done']
  const next = order[(order.indexOf(jalonStatus.value[e.index]) + 1) % 3]
  jalonStatus.value = { ...jalonStatus.value, [e.index]: next }
  localStorage.setItem(lsKey(e.index), next)
}

async function load() {
  loading.value = true
  error.value = null
  try {
    data.value = await api.getParcours(props.slug)
    loadStatuses(data.value.etapes)
  } catch (e) {
    error.value = 'Parcours introuvable ou API injoignable.'
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(() => props.slug, load)

// Progression pondérée par la durée (formation = % réel, jalon = tout ou rien).
function stepDoneH(e) {
  if (e.type === 'formation') return (e.duree_h * (e.progress || 0)) / 100
  return jalonStatus.value[e.index] === 'done' ? e.duree_h : 0
}
const totalH = computed(() => data.value?.total_duree_h || 0)
const doneH = computed(() => (data.value?.etapes || []).reduce((a, e) => a + stepDoneH(e), 0))
const percent = computed(() => (totalH.value ? Math.round((doneH.value / totalH.value) * 100) : 0))
const remainingH = computed(() => Math.max(0, Math.round(totalH.value - doneH.value)))
</script>

<template>
  <main class="parcours">
    <router-link to="/" class="back">← Catalogue</router-link>

    <div v-if="loading" class="muted">Chargement…</div>
    <div v-else-if="error" class="err">{{ error }}</div>
    <template v-else>
      <h1>🧭 {{ data.title }}</h1>
      <p v-if="data.objectif" class="objectif">{{ data.objectif }}</p>

      <div class="overview">
        <div class="bar"><div class="fill" :style="{ width: percent + '%' }"></div></div>
        <div class="stats">
          <b>{{ percent }}%</b> · {{ Math.round(doneH) }} h faites · {{ remainingH }} h restantes ·
          total {{ totalH }} h
        </div>
      </div>

      <ol class="timeline">
        <li v-for="e in data.etapes" :key="e.index" class="step">
          <span class="num">{{ e.index }}</span>
          <div class="body">
            <div class="head">
              <h3>{{ e.titre }}</h3>
              <span class="dur">{{ e.duree_h }} h</span>
            </div>
            <p v-if="e.note" class="note">{{ e.note }}</p>

            <div v-if="e.type === 'formation'">
              <div class="bar sm"><div class="fill" :style="{ width: (e.progress || 0) + '%' }"></div></div>
              <div class="row">
                <span class="small">{{ e.progress || 0 }}%</span>
                <router-link v-if="e.formation_exists" :to="`/f/${e.ref}`" class="link">Ouvrir le cours →</router-link>
                <span v-else class="small warn">formation absente ({{ e.ref }})</span>
              </div>
            </div>

            <div v-else class="row">
              <button class="status" :class="jalonStatus[e.index]" @click="cycle(e)">
                {{ STATUS_LABEL[jalonStatus[e.index]] }}
              </button>
              <a v-if="e.url" :href="e.url" target="_blank" rel="noopener" class="link">Ouvrir ↗</a>
            </div>
          </div>
        </li>
      </ol>
    </template>
  </main>
</template>

<style scoped>
.parcours { max-width: 820px; margin: 0 auto; padding: 32px 24px 80px; }
.back { color: var(--muted); font-size: 14px; text-decoration: none; }
.back:hover { color: var(--accent); }
h1 { margin: 12px 0 6px; }
.objectif { color: var(--muted); margin: 0 0 20px; }
.muted { color: var(--muted); }
.err { color: var(--bad); }
.overview { margin-bottom: 26px; }
.bar { height: 10px; background: var(--panel2); border-radius: 6px; overflow: hidden; }
.bar.sm { height: 6px; margin: 8px 0 4px; }
.fill { height: 100%; background: var(--accent); border-radius: 6px; transition: width 0.3s; }
.stats { font-size: 13px; color: var(--muted); margin-top: 6px; }
.timeline { list-style: none; margin: 0; padding: 0; border-left: 2px solid var(--border); }
.step { position: relative; padding: 0 0 22px 26px; }
.num {
  position: absolute; left: -15px; top: 0; width: 28px; height: 28px; border-radius: 50%;
  background: var(--panel); border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700;
}
.body { border: 1px solid var(--border); border-radius: 12px; background: var(--panel); padding: 14px 16px; }
.head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.head h3 { margin: 0; font-size: 16px; }
.dur { font-size: 12px; color: var(--accent2); background: var(--panel2); padding: 2px 8px; border-radius: 12px; white-space: nowrap; }
.note { color: var(--muted); font-size: 14px; margin: 6px 0 10px; }
.row { display: flex; align-items: center; gap: 14px; margin-top: 4px; }
.small { font-size: 13px; color: var(--muted); }
.warn { color: var(--bad); }
.link { font-size: 14px; color: var(--accent); text-decoration: none; }
.link:hover { text-decoration: underline; }
.status {
  font: inherit; font-size: 13px; cursor: pointer; border: 1px solid var(--border);
  border-radius: 20px; padding: 3px 12px; background: var(--panel2); color: var(--muted);
}
.status.wip { border-color: var(--accent2); color: var(--accent2); }
.status.done { background: var(--good); border-color: var(--good); color: #fff; }
</style>
