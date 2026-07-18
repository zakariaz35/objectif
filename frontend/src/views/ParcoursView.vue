<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'

const props = defineProps({ slug: { type: String, required: true } })
const { t, locale } = useI18n()

const data = ref(null)
const loading = ref(true)
const error = ref(null)
const importing = ref(null) // slug de la formation en cours d'import

// Statut manuel des jalons externes, persisté localement : 'todo' | 'wip' | 'done'.
const jalonStatus = ref({})
const lsKey = (i) => `parcours:${props.slug}:${i}`

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
    error.value = t('parcours.notFound')
  } finally {
    loading.value = false
  }
}
async function importFormation(e) {
  importing.value = e.ref
  try {
    await api.importFormation(e.ref)
    await load() // recharge : la formation passe en "importée" + progression active
  } catch (err) {
    error.value = t('parcours.importError', { ref: e.ref })
  } finally {
    importing.value = null
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

// Projection : semaines restantes + date de fin estimée (si heures/semaine défini).
const forecast = computed(() => {
  const hps = data.value?.heures_par_semaine
  if (!hps || remainingH.value <= 0) return null
  const weeks = Math.ceil(remainingH.value / hps)
  const end = new Date(Date.now() + weeks * 7 * 86400000)
  return { weeks, end: end.toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric' }) }
})

// Feuille de route épinglée sur l'accueil (un seul parcours à la fois).
const pinned = ref(false)
function syncPinned() {
  pinned.value = localStorage.getItem('feuille_de_route') === props.slug
}
function togglePin() {
  if (pinned.value) localStorage.removeItem('feuille_de_route')
  else localStorage.setItem('feuille_de_route', props.slug)
  syncPinned()
}
onMounted(syncPinned)
watch(() => props.slug, syncPinned)
</script>

<template>
  <main class="parcours">
    <router-link to="/explorer" class="back">{{ $t('parcours.back') }}</router-link>

    <div v-if="loading" class="muted">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="err">{{ error }}</div>
    <template v-else>
      <div class="title-row">
        <h1>🧭 {{ data.title }}</h1>
        <div class="title-actions">
          <button class="pin" :class="{ active: pinned }" @click="togglePin">
            {{ pinned ? '📌 ' + $t('parcours.pinned') : $t('parcours.pin') }}
          </button>
          <router-link :to="`/atelier-parcours/${slug}`" class="link">{{ $t('parcours.editLink') }}</router-link>
        </div>
      </div>
      <p v-if="data.objectif" class="objectif">{{ data.objectif }}</p>

      <div class="overview">
        <div class="bar"><div class="fill" :style="{ width: percent + '%' }"></div></div>
        <div class="stats">
          <b>{{ percent }}%</b> · {{ $t('parcours.statsRest', { done: Math.round(doneH), remaining: remainingH, total: totalH }) }}
          <template v-if="forecast">
            · {{ $t('parcours.forecast', { hps: data.heures_par_semaine, weeks: forecast.weeks, date: forecast.end }) }}
          </template>
        </div>
      </div>

      <ol class="timeline">
        <li v-for="e in data.etapes" :key="e.index" class="step">
          <span class="num">{{ e.index }}</span>
          <div class="body">
            <div class="head">
              <h3>{{ e.titre }}</h3>
              <span class="dur">{{ $t('parcours.hours', { h: e.duree_h }) }}</span>
            </div>
            <p v-if="e.note" class="note">{{ e.note }}</p>

            <div v-if="e.type === 'formation'">
              <template v-if="e.formation_exists">
                <div class="bar sm"><div class="fill" :style="{ width: (e.progress || 0) + '%' }"></div></div>
                <div class="row">
                  <span class="small">{{ e.progress || 0 }}%</span>
                  <router-link :to="`/f/${e.ref}`" class="link">{{ $t('parcours.openCourse') }}</router-link>
                </div>
              </template>
              <div v-else class="row">
                <button class="import-btn" :disabled="importing === e.ref" @click="importFormation(e)">
                  {{ importing === e.ref ? $t('parcours.importing') : $t('parcours.import') }}
                </button>
                <span class="small">{{ $t('parcours.notImported') }}</span>
              </div>
            </div>

            <div v-else class="row">
              <button class="status" :class="jalonStatus[e.index]" @click="cycle(e)">
                {{ $t('parcours.status.' + jalonStatus[e.index]) }}
              </button>
              <a v-if="e.url" :href="e.url" target="_blank" rel="noopener" class="link">{{ $t('parcours.openExternal') }}</a>
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
.title-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.title-actions { display: flex; align-items: center; gap: 12px; }
.pin {
  font: inherit; font-size: 13px; cursor: pointer; border: 1px solid var(--border);
  border-radius: 20px; padding: 4px 14px; background: var(--panel2); color: var(--muted);
}
.pin:hover { border-color: var(--accent); color: inherit; }
.pin.active { border-color: var(--accent); color: var(--accent); font-weight: 600; }
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
.import-btn {
  font: inherit; font-size: 13px; cursor: pointer;
  border: 1px solid var(--accent); border-radius: 20px; padding: 4px 14px;
  background: var(--accent); color: var(--accent-contrast);
}
.import-btn:disabled { opacity: 0.6; cursor: default; }
</style>
