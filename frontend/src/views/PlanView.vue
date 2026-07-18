<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'

const { t, locale } = useI18n()

const etat = ref(null)
const jalons = ref([])
const loading = ref(true)
const error = ref(null)
const seeding = ref(false)

async function load() {
  loading.value = true
  try {
    ;[etat.value, jalons.value] = await Promise.all([api.getEtat(), api.listJalons()])
  } catch (e) {
    error.value = t('plan.loadError')
  } finally {
    loading.value = false
  }
}
onMounted(load)

// --- Jalons ------------------------------------------------------------------
async function seedPlan() {
  seeding.value = true
  try {
    await api.seedPlan()
    await load()
  } finally {
    seeding.value = false
  }
}
async function setStatut(jalon, statut) {
  await api.updateJalon(jalon.id, { statut })
  await load()
}
const newJalon = ref(null)
function blankJalon() {
  return { titre: '', date_cible: '', front: 'les-deux', critere_mesurable: '' }
}
async function addJalon() {
  await api.createJalon(newJalon.value)
  newJalon.value = null
  await load()
}
async function removeJalon(j) {
  if (!confirm(t('plan.confirmDeleteJalon'))) return
  await api.deleteJalon(j.id)
  await load()
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString(locale.value, { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}
function ecartLabel(j) {
  if (j.statut !== 'a_venir') return ''
  return j.ecart_jours >= 0
    ? t('plan.dansXJours', { n: j.ecart_jours })
    : t('plan.retardXJours', { n: Math.abs(j.ecart_jours) })
}

// --- Revue du dimanche ---------------------------------------------------------
const revueForm = ref({ demontrable: '', heures_etudes_estimees: 0, blocages: '', humeur: 3 })
const revueSaved = ref(false)
const derniereRevue = computed(() => etat.value?.revues_hebdo?.[0] || null)
async function saveRevue() {
  await api.upsertRevue(revueForm.value)
  revueSaved.value = true
  setTimeout(() => (revueSaved.value = false), 2500)
  await load()
}

// --- Semaine courante ----------------------------------------------------------
const sem = computed(() => etat.value?.candidatures?.semaine_courante || {})
const regle = computed(() => etat.value?.regle_2_jours || {})
const funnel = computed(() => {
  const p = etat.value?.candidatures?.par_statut || {}
  const n = (s) => p[s] || 0
  return {
    envoyees: n('envoyee') + n('relancee') + n('entretien') + n('test_technique') + n('offre') + n('refus') + n('sans_reponse'),
    entretiens: n('entretien') + n('test_technique'),
    offres: n('offre'),
  }
})

// --- Assistant IA ----------------------------------------------------------------
const curlCmd = computed(() => {
  const token = localStorage.getItem('client_token')
  return `curl -H "X-Client-Token: ${token}" http://localhost:8000/api/suivi/etat`
})
const curlCopied = ref(false)
async function copyCurl() {
  await navigator.clipboard.writeText(curlCmd.value)
  curlCopied.value = true
  setTimeout(() => (curlCopied.value = false), 2000)
}
</script>

<template>
  <main class="plan">
    <h1>🎯 {{ $t('plan.title') }}</h1>
    <p class="intro">{{ $t('plan.intro') }}</p>

    <div v-if="loading" class="muted">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="err">{{ error }}</div>

    <template v-else>
      <!-- 1. Alertes -->
      <section v-if="etat.alertes.length" class="alertes">
        <p v-for="(a, i) in etat.alertes" :key="i" class="alerte">⚠️ {{ a }}</p>
      </section>

      <!-- 2. Jalons -->
      <section class="block">
        <div class="block-head">
          <h2>🚩 {{ $t('plan.jalonsTitle') }}</h2>
          <button v-if="!jalons.length" class="btn-primary" :disabled="seeding" @click="seedPlan">
            {{ seeding ? $t('common.loading') : $t('plan.seed') }}
          </button>
          <button v-else class="btn-ghost" @click="newJalon = newJalon ? null : blankJalon()">＋ {{ $t('plan.addJalon') }}</button>
        </div>

        <form v-if="newJalon" class="jalon-form" @submit.prevent="addJalon">
          <input v-model="newJalon.titre" required maxlength="200" :placeholder="$t('plan.jalonTitre')" />
          <input v-model="newJalon.date_cible" required type="date" />
          <select v-model="newJalon.front">
            <option value="recherche">{{ $t('plan.front.recherche') }}</option>
            <option value="etudes">{{ $t('plan.front.etudes') }}</option>
            <option value="les-deux">{{ $t('plan.front.les-deux') }}</option>
          </select>
          <input v-model="newJalon.critere_mesurable" maxlength="2000" :placeholder="$t('plan.jalonCritere')" class="grow" />
          <button type="submit" class="btn-primary">{{ $t('plan.save') }}</button>
        </form>

        <ol class="jalons">
          <li v-for="j in jalons" :key="j.id" class="jalon" :class="['st-' + j.statut, { late: j.statut === 'a_venir' && j.ecart_jours < 0 }]">
            <div class="j-main">
              <div class="j-head">
                <span class="j-front" :title="$t('plan.front.' + j.front)">{{ j.front === 'recherche' ? '🧲' : j.front === 'etudes' ? '📚' : '🧲📚' }}</span>
                <b>{{ j.titre }}</b>
                <span class="j-date">{{ fmtDate(j.date_cible) }}</span>
                <span v-if="ecartLabel(j)" class="j-ecart" :class="{ bad: j.ecart_jours < 0 }">{{ ecartLabel(j) }}</span>
                <span v-if="j.statut !== 'a_venir'" class="j-statut">{{ $t('plan.statut.' + j.statut) }}<template v-if="j.fait_le"> · {{ fmtDate(j.fait_le) }}</template></span>
              </div>
              <p v-if="j.critere_mesurable" class="j-critere">{{ j.critere_mesurable }}</p>
            </div>
            <div class="j-actions">
              <button v-if="j.statut !== 'fait'" class="mini ok" :title="$t('plan.statut.fait')" @click="setStatut(j, 'fait')">✓</button>
              <button v-if="j.statut === 'a_venir'" class="mini" :title="$t('plan.statut.reporte')" @click="setStatut(j, 'reporte')">⏩</button>
              <button v-if="j.statut === 'a_venir'" class="mini ko" :title="$t('plan.statut.rate')" @click="setStatut(j, 'rate')">✗</button>
              <button v-if="j.statut !== 'a_venir'" class="mini" :title="$t('plan.statut.a_venir')" @click="setStatut(j, 'a_venir')">↺</button>
              <button class="mini ko" :title="$t('atelier.delete')" @click="removeJalon(j)">🗑</button>
            </div>
          </li>
        </ol>
      </section>

      <!-- 3. Semaine courante -->
      <section class="block">
        <h2>📆 {{ $t('plan.semaineTitle') }}</h2>
        <div class="tiles">
          <RouterLink to="/candidatures" class="tile" :class="{ warn: sem.candidatures < sem.objectif_candidatures }">
            <span class="v">{{ sem.candidatures }}/{{ sem.objectif_candidatures }}</span>
            <span class="k">{{ $t('plan.tuileCandidatures') }}</span>
          </RouterLink>
          <RouterLink to="/candidatures" class="tile" :class="{ warn: sem.contacts_reseau < sem.objectif_contacts }">
            <span class="v">{{ sem.contacts_reseau }}/{{ sem.objectif_contacts }}</span>
            <span class="k">{{ $t('plan.tuileContacts') }}</span>
          </RouterLink>
          <div class="tile" :class="regle.respectee ? 'good' : 'bad'">
            <span class="v">{{ regle.respectee ? '✓' : '✗' }}</span>
            <span class="k">{{ $t('plan.tuileRegle2j') }}</span>
          </div>
          <RouterLink v-if="etat.candidatures.relances_dues.length" to="/candidatures" class="tile bad">
            <span class="v">{{ etat.candidatures.relances_dues.length }}</span>
            <span class="k">{{ $t('plan.tuileRelances') }}</span>
          </RouterLink>
        </div>
        <div class="funnel">
          <span>{{ $t('plan.funnel', funnel) }}</span>
        </div>
      </section>

      <!-- 4. Revue du dimanche -->
      <section class="block">
        <h2>📝 {{ $t('plan.revueTitle') }}</h2>
        <p v-if="derniereRevue" class="hint">
          {{ $t('plan.derniereRevue', { semaine: fmtDate(derniereRevue.semaine), heures: derniereRevue.heures_etudes_estimees, humeur: derniereRevue.humeur ?? '—' }) }}
          <template v-if="derniereRevue.demontrable"> — « {{ derniereRevue.demontrable }} »</template>
        </p>
        <form class="revue-form" @submit.prevent="saveRevue">
          <label class="field grow">
            <span>{{ $t('plan.revueDemontrable') }}</span>
            <input v-model="revueForm.demontrable" maxlength="2000" />
          </label>
          <label class="field">
            <span>{{ $t('plan.revueHeures') }}</span>
            <input v-model.number="revueForm.heures_etudes_estimees" type="number" min="0" max="120" />
          </label>
          <label class="field">
            <span>{{ $t('plan.revueHumeur') }}</span>
            <select v-model.number="revueForm.humeur">
              <option v-for="n in 5" :key="n" :value="n">{{ '★'.repeat(n) }}</option>
            </select>
          </label>
          <label class="field grow">
            <span>{{ $t('plan.revueBlocages') }}</span>
            <input v-model="revueForm.blocages" maxlength="2000" />
          </label>
          <button type="submit" class="btn-primary">{{ revueSaved ? '✓' : $t('plan.revueSave') }}</button>
        </form>
      </section>

      <!-- 5. Études -->
      <section class="block">
        <h2>📚 {{ $t('plan.etudesTitle') }}</h2>
        <div class="tiles">
          <RouterLink v-if="etat.etudes.parcours_aws" to="/f/parcours-aws" class="tile">
            <span class="v">{{ etat.etudes.parcours_aws.pct }}%</span>
            <span class="k">{{ $t('plan.tuileAws', { done: etat.etudes.parcours_aws.lecons_completees, total: etat.etudes.parcours_aws.lecons_total }) }}</span>
          </RouterLink>
          <RouterLink to="/tableau-de-bord" class="tile">
            <span class="v">{{ etat.etudes.certifications.filter((c) => c.status === 'pret').length }}/{{ etat.etudes.certifications.length }}</span>
            <span class="k">{{ $t('plan.tuileCertifs') }}</span>
          </RouterLink>
          <RouterLink to="/reviser" class="tile" :class="{ warn: etat.etudes.cartes_srs.en_retard }">
            <span class="v">{{ etat.etudes.cartes_srs.en_retard + etat.etudes.cartes_srs.dues_aujourdhui }}</span>
            <span class="k">{{ $t('plan.tuileSrs') }}</span>
          </RouterLink>
          <div class="tile">
            <span class="v">{{ etat.etudes.dernier_niveau_cefr || '—' }}</span>
            <span class="k">{{ $t('plan.tuileCefr') }}</span>
          </div>
        </div>
      </section>

      <!-- 6. Assistant IA -->
      <section class="block ia">
        <h2>🤖 {{ $t('plan.iaTitle') }}</h2>
        <p class="hint">{{ $t('plan.iaHint') }}</p>
        <div class="curl">
          <code>{{ curlCmd }}</code>
          <button class="btn-ghost" @click="copyCurl">{{ curlCopied ? '✓' : $t('plan.iaCopy') }}</button>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.plan { max-width: 880px; margin: 0 auto; padding: 32px 24px 80px; }
h1 { margin: 0 0 6px; }
.intro { color: var(--muted); margin: 0 0 20px; }
.muted { color: var(--muted); }
.err { color: var(--bad); }
.alertes { margin-bottom: 20px; }
.alerte {
  margin: 6px 0; padding: 10px 14px; border-radius: 10px; font-size: 14px;
  background: color-mix(in srgb, var(--bad) 12%, var(--panel)); border: 1px solid var(--bad);
}
.block { margin: 26px 0; }
.block-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.block h2 { font-size: 18px; margin: 0 0 12px; }
.hint { color: var(--muted); font-size: 13px; margin: 0 0 12px; }
.btn-primary {
  font: inherit; font-size: 13px; cursor: pointer; border: 1px solid var(--accent);
  border-radius: 20px; padding: 5px 16px; background: var(--accent); color: var(--accent-contrast);
}
.btn-ghost {
  font: inherit; font-size: 13px; cursor: pointer; border: 1px solid var(--border);
  border-radius: 20px; padding: 4px 14px; background: var(--panel2); color: inherit;
}
.btn-ghost:hover { border-color: var(--accent); }
input, select {
  font: inherit; color: inherit; background: var(--panel2);
  border: 1px solid var(--border); border-radius: 8px; padding: 7px 10px;
}
input:focus, select:focus { outline: none; border-color: var(--accent); }
.jalon-form { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; }
.grow { flex: 1; min-width: 180px; }
.jalons { list-style: none; margin: 0; padding: 0; border-inline-start: 2px solid var(--border); }
.jalon {
  display: flex; justify-content: space-between; gap: 12px;
  padding: 10px 0 10px 16px; margin-inline-start: 0;
}
.jalon + .jalon { border-top: 1px dashed var(--border); }
.jalon.late { border-inline-start: 3px solid var(--bad); margin-inline-start: -2px; }
.jalon.st-fait { opacity: 0.65; }
.j-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; font-size: 15px; }
.j-date { color: var(--accent2); font-size: 13px; white-space: nowrap; }
.j-ecart { font-size: 12px; color: var(--muted); background: var(--panel2); padding: 1px 8px; border-radius: 10px; }
.j-ecart.bad { color: #fff; background: var(--bad); }
.j-statut { font-size: 12px; color: var(--good); }
.st-rate .j-statut { color: var(--bad); }
.st-reporte .j-statut { color: var(--warn); }
.j-critere { color: var(--muted); font-size: 13px; margin: 4px 0 0; }
.j-actions { display: flex; gap: 6px; align-items: flex-start; flex: 0 0 auto; }
.mini {
  font: inherit; font-size: 13px; cursor: pointer; border: 1px solid var(--border);
  border-radius: 8px; background: var(--panel2); color: inherit; padding: 2px 8px;
}
.mini.ok:hover { border-color: var(--good); color: var(--good); }
.mini.ko:hover { border-color: var(--bad); color: var(--bad); }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.tile {
  display: flex; flex-direction: column; gap: 4px; padding: 14px 16px;
  border: 1px solid var(--border); border-radius: 12px; background: var(--panel);
  color: inherit; text-decoration: none;
}
.tile .v { font-size: 24px; font-weight: 800; }
.tile .k { font-size: 12px; color: var(--muted); }
.tile.good { border-color: var(--good); }
.tile.warn { border-color: var(--warn); }
.tile.bad { border-color: var(--bad); }
a.tile:hover { border-color: var(--accent); }
.funnel { margin-top: 12px; font-size: 14px; color: var(--muted); }
.revue-form { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field span { font-size: 12px; color: var(--muted); }
.ia .curl {
  display: flex; gap: 10px; align-items: center;
  background: var(--code, var(--panel2)); border: 1px solid var(--border);
  border-radius: 10px; padding: 10px 14px;
}
.ia code { font-size: 12px; overflow-x: auto; white-space: nowrap; flex: 1; direction: ltr; }
</style>
