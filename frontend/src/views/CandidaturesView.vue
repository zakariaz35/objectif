<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'

const { t, locale } = useI18n()

const STATUTS = ['a_envoyer', 'envoyee', 'relancee', 'entretien', 'test_technique', 'offre', 'refus', 'sans_reponse']
const CANAUX = ['linkedin', 'malt', 'himalayas', 'lemon.io', 'reseau', 'direct', 'autre']

const items = ref([])
const compteurs = ref(null)
const loading = ref(true)
const error = ref(null)
const tab = ref('candidature') // candidature | contact
const filtreStatut = ref('')

async function load() {
  loading.value = true
  try {
    const res = await api.listCandidatures({})
    items.value = res.data
    compteurs.value = res.compteurs
  } catch (e) {
    error.value = t('cand.loadError')
  } finally {
    loading.value = false
  }
}
onMounted(load)

const visibles = computed(() =>
  items.value.filter(
    (c) => c.type === tab.value && (!filtreStatut.value || c.statut === filtreStatut.value),
  ),
)
const relances = computed(() => items.value.filter((c) => c.relance_due))

// --- Création -------------------------------------------------------------------
const form = ref(null)
function blankForm() {
  return { type: tab.value, poste: '', entreprise: '', canal: 'linkedin', url: '', statut: 'a_envoyer', notes: '' }
}
async function add() {
  await api.createCandidature(form.value)
  form.value = null
  await load()
}
async function setStatut(c, statut) {
  await api.updateCandidature(c.id, { statut })
  await load()
}
async function remove(c) {
  if (!confirm(t('cand.confirmDelete'))) return
  await api.deleteCandidature(c.id)
  await load()
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString(locale.value, { day: 'numeric', month: 'short' }) : ''
}
</script>

<template>
  <main class="cand">
    <RouterLink to="/plan" class="back">← {{ $t('cand.backPlan') }}</RouterLink>
    <h1>🧲 {{ $t('cand.title') }}</h1>

    <div v-if="loading" class="muted">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="err">{{ error }}</div>

    <template v-else>
      <!-- Compteurs de la semaine -->
      <div class="tiles">
        <div class="tile" :class="{ warn: compteurs.semaine.candidatures < compteurs.semaine.objectif_candidatures }">
          <span class="v">{{ compteurs.semaine.candidatures }}/{{ compteurs.semaine.objectif_candidatures }}</span>
          <span class="k">{{ $t('cand.tuileSemaine') }}</span>
        </div>
        <div class="tile" :class="{ warn: compteurs.semaine.contacts < compteurs.semaine.objectif_contacts }">
          <span class="v">{{ compteurs.semaine.contacts }}/{{ compteurs.semaine.objectif_contacts }}</span>
          <span class="k">{{ $t('cand.tuileContacts') }}</span>
        </div>
        <div class="tile" :class="{ bad: compteurs.relances_dues > 0 }">
          <span class="v">{{ compteurs.relances_dues }}</span>
          <span class="k">{{ $t('cand.tuileRelances') }}</span>
        </div>
      </div>

      <!-- Relances dues -->
      <div v-if="relances.length" class="relances">
        <p v-for="c in relances" :key="'r' + c.id" class="alerte">
          ⏰ {{ $t('cand.relanceDue', { poste: c.poste, entreprise: c.entreprise || '—', date: fmtDate(c.relance_due_le) }) }}
          <button class="mini" @click="setStatut(c, 'relancee')">{{ $t('cand.marquerRelancee') }}</button>
        </p>
      </div>

      <!-- Onglets + filtre + ajout -->
      <div class="toolbar">
        <div class="tabs">
          <button class="tab" :class="{ active: tab === 'candidature' }" @click="tab = 'candidature'">
            {{ $t('cand.tabCandidatures') }}
          </button>
          <button class="tab" :class="{ active: tab === 'contact' }" @click="tab = 'contact'">
            {{ $t('cand.tabContacts') }}
          </button>
        </div>
        <select v-model="filtreStatut">
          <option value="">{{ $t('cand.tousStatuts') }}</option>
          <option v-for="s in STATUTS" :key="s" :value="s">{{ $t('cand.statut.' + s) }}</option>
        </select>
        <button class="btn-primary" @click="form = form ? null : blankForm()">＋ {{ $t('cand.add') }}</button>
      </div>

      <form v-if="form" class="add-form" @submit.prevent="add">
        <select v-model="form.type">
          <option value="candidature">{{ $t('cand.tabCandidatures') }}</option>
          <option value="contact">{{ $t('cand.tabContacts') }}</option>
        </select>
        <input v-model="form.poste" required maxlength="200" :placeholder="$t('cand.poste')" class="grow" />
        <input v-model="form.entreprise" maxlength="200" :placeholder="$t('cand.entreprise')" />
        <select v-model="form.canal">
          <option v-for="c in CANAUX" :key="c" :value="c">{{ c }}</option>
        </select>
        <input v-model="form.url" type="url" maxlength="500" placeholder="URL" class="grow" />
        <select v-model="form.statut">
          <option v-for="s in STATUTS" :key="s" :value="s">{{ $t('cand.statut.' + s) }}</option>
        </select>
        <button type="submit" class="btn-primary">{{ $t('plan.save') }}</button>
      </form>

      <!-- Liste -->
      <p v-if="!visibles.length" class="muted empty">{{ $t('cand.aucune') }}</p>
      <ul class="liste">
        <li v-for="c in visibles" :key="c.id" class="item" :class="{ due: c.relance_due }">
          <div class="i-main">
            <div class="i-head">
              <b>{{ c.poste }}</b>
              <span v-if="c.entreprise" class="i-ent">{{ c.entreprise }}</span>
              <span v-if="c.canal" class="i-canal">{{ c.canal }}</span>
              <a v-if="c.url" :href="c.url" target="_blank" rel="noopener" class="i-lien">🔗</a>
              <span v-if="c.date_envoi" class="i-date">{{ $t('cand.envoyeeLe', { date: fmtDate(c.date_envoi) }) }}</span>
              <span v-if="c.relance_due" class="i-relance">⏰ {{ $t('cand.relanceCourte') }}</span>
            </div>
            <p v-if="c.notes" class="i-notes">{{ c.notes }}</p>
          </div>
          <div class="i-actions">
            <select :value="c.statut" @change="setStatut(c, $event.target.value)">
              <option v-for="s in STATUTS" :key="s" :value="s">{{ $t('cand.statut.' + s) }}</option>
            </select>
            <button class="mini ko" :title="$t('atelier.delete')" @click="remove(c)">🗑</button>
          </div>
        </li>
      </ul>
    </template>
  </main>
</template>

<style scoped>
.cand { max-width: 880px; margin: 0 auto; padding: 32px 24px 80px; }
.back { color: var(--muted); font-size: 14px; text-decoration: none; }
.back:hover { color: var(--accent); }
h1 { margin: 10px 0 20px; }
.muted { color: var(--muted); }
.err { color: var(--bad); }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 18px; }
.tile {
  display: flex; flex-direction: column; gap: 4px; padding: 14px 16px;
  border: 1px solid var(--border); border-radius: 12px; background: var(--panel);
}
.tile .v { font-size: 24px; font-weight: 800; }
.tile .k { font-size: 12px; color: var(--muted); }
.tile.warn { border-color: var(--warn); }
.tile.bad { border-color: var(--bad); }
.relances { margin-bottom: 16px; }
.alerte {
  display: flex; align-items: center; gap: 10px; justify-content: space-between;
  margin: 6px 0; padding: 8px 14px; border-radius: 10px; font-size: 14px;
  background: color-mix(in srgb, var(--warn) 14%, var(--panel)); border: 1px solid var(--warn);
}
.toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.tabs { display: flex; border: 1px solid var(--border); border-radius: 20px; overflow: hidden; }
.tab {
  font: inherit; font-size: 13px; cursor: pointer; border: none;
  background: var(--panel); color: var(--muted); padding: 6px 16px;
}
.tab.active { background: var(--accent); color: var(--accent-contrast); font-weight: 600; }
select, input {
  font: inherit; font-size: 13px; color: inherit; background: var(--panel2);
  border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px;
}
select:focus, input:focus { outline: none; border-color: var(--accent); }
.btn-primary {
  font: inherit; font-size: 13px; cursor: pointer; border: 1px solid var(--accent);
  border-radius: 20px; padding: 5px 16px; background: var(--accent); color: var(--accent-contrast);
  margin-inline-start: auto;
}
.add-form { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.grow { flex: 1; min-width: 160px; }
.empty { border: 1px dashed var(--border); border-radius: 12px; padding: 24px; text-align: center; }
.liste { list-style: none; margin: 0; padding: 0; }
.item {
  display: flex; justify-content: space-between; gap: 12px;
  border: 1px solid var(--border); border-radius: 12px; background: var(--panel);
  padding: 12px 16px; margin: 8px 0;
}
.item.due { border-color: var(--warn); }
.i-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; font-size: 15px; }
.i-ent { color: var(--muted); }
.i-canal { font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--accent2); background: var(--panel2); padding: 1px 8px; border-radius: 10px; }
.i-lien { text-decoration: none; }
.i-date { font-size: 12px; color: var(--muted); }
.i-relance { font-size: 12px; color: var(--warn); font-weight: 600; }
.i-notes { color: var(--muted); font-size: 13px; margin: 4px 0 0; }
.i-actions { display: flex; gap: 8px; align-items: flex-start; flex: 0 0 auto; }
.mini {
  font: inherit; font-size: 13px; cursor: pointer; border: 1px solid var(--border);
  border-radius: 8px; background: var(--panel2); color: inherit; padding: 2px 8px;
}
.mini.ko:hover { border-color: var(--bad); color: var(--bad); }
</style>
