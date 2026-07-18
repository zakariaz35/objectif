<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'

const props = defineProps({ slug: { type: String, default: '' } })
const router = useRouter()
const { t } = useI18n()

const parcoursList = ref([])
const formations = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const notice = ref(null)

// Formulaire d'édition (null = pas d'édition en cours, on affiche la liste).
const form = ref(null)
const editingSlug = ref(null) // slug du parcours édité (null = création)

function blankStep(type = 'formation') {
  return { titre: '', type, ref: '', duree_h: 4, url: '', note: '' }
}
function blankForm() {
  return { title: '', objectif: '', heures_par_semaine: null, etapes: [blankStep()] }
}

async function load() {
  loading.value = true
  error.value = null
  try {
    ;[parcoursList.value, formations.value] = await Promise.all([
      api.listParcours(),
      api.listFormations(),
    ])
  } catch (e) {
    error.value = t('atelier.loadError')
  } finally {
    loading.value = false
  }
}

async function openEditor(slug) {
  if (!slug) {
    editingSlug.value = null
    form.value = blankForm()
    return
  }
  try {
    const p = await api.getParcours(slug)
    editingSlug.value = slug
    form.value = {
      title: p.title,
      objectif: p.objectif || '',
      heures_par_semaine: p.heures_par_semaine,
      etapes: p.etapes.map((e) => ({
        titre: e.titre,
        type: e.type,
        ref: e.ref || '',
        duree_h: e.duree_h,
        url: e.url || '',
        note: e.note || '',
      })),
    }
  } catch (e) {
    error.value = t('parcours.notFound')
  }
}

function closeEditor() {
  form.value = null
  editingSlug.value = null
  if (props.slug) router.replace('/atelier-parcours')
}

// Étapes : ajout, suppression, réordonnancement.
function addStep(type) {
  form.value.etapes.push(blankStep(type))
}
function removeStep(i) {
  form.value.etapes.splice(i, 1)
}
function move(i, delta) {
  const arr = form.value.etapes
  const j = i + delta
  if (j < 0 || j >= arr.length) return
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}
// Une étape « formation » reprend titre + durée par défaut du catalogue.
function onPickFormation(step) {
  const f = formations.value.find((x) => x.slug === step.ref)
  if (f && !step.titre) step.titre = f.title
}

const totalH = computed(() =>
  (form.value?.etapes || []).reduce((a, e) => a + (Number(e.duree_h) || 0), 0),
)
const weeks = computed(() => {
  const hps = Number(form.value?.heures_par_semaine)
  return hps > 0 ? Math.ceil(totalH.value / hps) : null
})

const valid = computed(
  () =>
    form.value &&
    form.value.title.trim() !== '' &&
    form.value.etapes.length > 0 &&
    form.value.etapes.every(
      (e) => e.titre.trim() !== '' && (e.type !== 'formation' || e.ref !== ''),
    ),
)

async function save() {
  if (!valid.value) return
  saving.value = true
  error.value = null
  try {
    const payload = {
      title: form.value.title,
      objectif: form.value.objectif || null,
      heures_par_semaine: form.value.heures_par_semaine || null,
      etapes: form.value.etapes.map((e) => ({
        titre: e.titre,
        type: e.type,
        ref: e.type === 'formation' ? e.ref : null,
        duree_h: Number(e.duree_h) || 0,
        url: e.url || null,
        note: e.note || null,
      })),
    }
    const res = editingSlug.value
      ? await api.updateParcours(editingSlug.value, payload)
      : await api.createParcours(payload)
    notice.value = t('atelier.saved')
    setTimeout(() => (notice.value = null), 3000)
    await load()
    closeEditor()
    router.push(`/parcours/${res.slug}`)
  } catch (e) {
    error.value = e.response?.data?.message || t('atelier.saveError')
  } finally {
    saving.value = false
  }
}

async function remove(slug) {
  if (!confirm(t('atelier.confirmDelete'))) return
  try {
    await api.deleteParcours(slug)
    if (localStorage.getItem('feuille_de_route') === slug) {
      localStorage.removeItem('feuille_de_route')
    }
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || t('atelier.saveError')
  }
}

onMounted(async () => {
  await load()
  if (props.slug) await openEditor(props.slug)
})
watch(
  () => props.slug,
  (s) => {
    if (s) openEditor(s)
  },
)
</script>

<template>
  <main class="atelier">
    <router-link to="/explorer" class="back">{{ $t('parcours.back') }}</router-link>
    <h1>🛠️ {{ $t('atelier.title') }}</h1>
    <p class="intro">{{ $t('atelier.intro') }}</p>

    <div v-if="loading" class="muted">{{ $t('common.loading') }}</div>
    <p v-if="error" class="err">{{ error }}</p>
    <p v-if="notice" class="ok">✓ {{ notice }}</p>

    <!-- Liste des itinéraires existants -->
    <template v-if="!loading && !form">
      <div class="list">
        <article v-for="p in parcoursList" :key="p.slug" class="item">
          <div class="item-main">
            <h3>🧭 {{ p.title }}</h3>
            <p class="muted small">{{ p.objectif }}</p>
            <span class="badge">{{
              $t('explorer.parcoursBadge', { count: p.etapes_count, hours: p.total_duree_h })
            }}</span>
          </div>
          <div class="item-actions">
            <router-link :to="`/parcours/${p.slug}`" class="link">{{ $t('atelier.view') }}</router-link>
            <button class="btn-ghost" @click="openEditor(p.slug)">{{ $t('atelier.edit') }}</button>
            <button class="btn-danger" @click="remove(p.slug)">{{ $t('atelier.delete') }}</button>
          </div>
        </article>
      </div>
      <button class="btn-primary new" @click="openEditor(null)">＋ {{ $t('atelier.new') }}</button>
    </template>

    <!-- Éditeur -->
    <form v-if="form" class="editor" @submit.prevent="save">
      <h2>{{ editingSlug ? $t('atelier.editTitle', { title: form.title }) : $t('atelier.newTitle') }}</h2>

      <label class="field">
        <span>{{ $t('atelier.fieldTitle') }}</span>
        <input v-model="form.title" required maxlength="150" :placeholder="$t('atelier.titlePlaceholder')" />
      </label>
      <label class="field">
        <span>{{ $t('atelier.fieldObjectif') }}</span>
        <textarea v-model="form.objectif" rows="2" maxlength="2000" :placeholder="$t('atelier.objectifPlaceholder')"></textarea>
      </label>
      <label class="field field-sm">
        <span>{{ $t('atelier.fieldHours') }}</span>
        <input v-model.number="form.heures_par_semaine" type="number" min="1" max="80" />
      </label>

      <h3 class="steps-title">{{ $t('atelier.steps') }}</h3>
      <ol class="steps">
        <li v-for="(e, i) in form.etapes" :key="i" class="step">
          <div class="step-head">
            <span class="num">{{ i + 1 }}</span>
            <select v-model="e.type">
              <option value="formation">{{ $t('atelier.typeFormation') }}</option>
              <option value="jalon">{{ $t('atelier.typeJalon') }}</option>
            </select>
            <div class="reorder">
              <button type="button" :disabled="i === 0" @click="move(i, -1)" :aria-label="$t('atelier.moveUp')">↑</button>
              <button type="button" :disabled="i === form.etapes.length - 1" @click="move(i, 1)" :aria-label="$t('atelier.moveDown')">↓</button>
              <button type="button" class="btn-danger" :disabled="form.etapes.length === 1" @click="removeStep(i)" :aria-label="$t('atelier.delete')">✕</button>
            </div>
          </div>

          <div class="step-fields">
            <select v-if="e.type === 'formation'" v-model="e.ref" required @change="onPickFormation(e)">
              <option value="" disabled>{{ $t('atelier.pickFormation') }}</option>
              <option v-for="f in formations" :key="f.slug" :value="f.slug">
                {{ f.kind === 'mission' ? '🧰 ' : '' }}{{ f.title }}
              </option>
            </select>
            <input v-model="e.titre" required maxlength="200" :placeholder="$t('atelier.stepTitle')" />
            <div class="inline">
              <label class="mini">
                <span>{{ $t('atelier.stepHours') }}</span>
                <input v-model.number="e.duree_h" type="number" min="0" max="2000" required />
              </label>
              <input v-if="e.type === 'jalon'" v-model="e.url" type="url" maxlength="500" :placeholder="$t('atelier.stepUrl')" class="grow" />
            </div>
            <input v-model="e.note" maxlength="1000" :placeholder="$t('atelier.stepNote')" />
          </div>
        </li>
      </ol>
      <div class="add-row">
        <button type="button" class="btn-ghost" @click="addStep('formation')">＋ {{ $t('atelier.addFormation') }}</button>
        <button type="button" class="btn-ghost" @click="addStep('jalon')">＋ {{ $t('atelier.addJalon') }}</button>
      </div>

      <div class="summary">
        <b>{{ $t('parcours.hours', { h: totalH }) }}</b>
        <span v-if="weeks" class="muted"> · {{ $t('atelier.forecast', { weeks }) }}</span>
      </div>

      <div class="actions">
        <button type="submit" class="btn-primary" :disabled="!valid || saving">
          {{ saving ? $t('atelier.saving') : $t('atelier.save') }}
        </button>
        <button type="button" class="btn-ghost" @click="closeEditor">{{ $t('atelier.cancel') }}</button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.atelier { max-width: 820px; margin: 0 auto; padding: 32px 24px 80px; }
.back { color: var(--muted); font-size: 14px; text-decoration: none; }
.back:hover { color: var(--accent); }
h1 { margin: 12px 0 6px; }
.intro { color: var(--muted); margin: 0 0 22px; }
.muted { color: var(--muted); }
.small { font-size: 14px; margin: 4px 0 10px; }
.err { color: var(--bad); }
.ok { color: var(--good); }
.list { display: flex; flex-direction: column; gap: 12px; }
.item {
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
  border: 1px solid var(--border); border-radius: 12px; background: var(--panel); padding: 14px 18px;
}
.item h3 { margin: 0 0 2px; font-size: 16px; }
.item-actions { display: flex; align-items: center; gap: 10px; flex: 0 0 auto; }
.badge { font-size: 12px; background: var(--panel2); color: var(--accent2); padding: 3px 10px; border-radius: 20px; }
.link { font-size: 14px; color: var(--accent); text-decoration: none; }
.link:hover { text-decoration: underline; }
.new { margin-top: 18px; }
.btn-primary {
  font: inherit; font-size: 14px; cursor: pointer; border: 1px solid var(--accent);
  border-radius: 20px; padding: 6px 18px; background: var(--accent); color: var(--accent-contrast);
}
.btn-primary:disabled { opacity: 0.55; cursor: default; }
.btn-ghost {
  font: inherit; font-size: 13px; cursor: pointer; border: 1px solid var(--border);
  border-radius: 20px; padding: 5px 14px; background: var(--panel2); color: inherit;
}
.btn-ghost:hover { border-color: var(--accent); }
.btn-danger {
  font: inherit; font-size: 13px; cursor: pointer; border: 1px solid var(--border);
  border-radius: 20px; padding: 5px 12px; background: var(--panel2); color: var(--bad);
}
.btn-danger:disabled { opacity: 0.4; cursor: default; }
.editor { border: 1px solid var(--border); border-radius: 14px; background: var(--panel); padding: 20px 22px; }
.editor h2 { margin: 0 0 16px; font-size: 20px; }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.field span { font-size: 13px; color: var(--muted); }
.field-sm input { max-width: 120px; }
input, textarea, select {
  font: inherit; color: inherit; background: var(--panel2);
  border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px;
}
input:focus, textarea:focus, select:focus { outline: none; border-color: var(--accent); }
.steps-title { margin: 20px 0 10px; font-size: 16px; }
.steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.step { border: 1px solid var(--border); border-radius: 10px; background: var(--panel2); padding: 12px 14px; }
.step-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.num {
  width: 24px; height: 24px; border-radius: 50%; background: var(--panel); border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex: 0 0 auto;
}
.reorder { display: flex; gap: 6px; margin-inline-start: auto; }
.reorder button {
  font: inherit; cursor: pointer; border: 1px solid var(--border); border-radius: 8px;
  background: var(--panel); color: inherit; padding: 3px 9px;
}
.reorder button:disabled { opacity: 0.35; cursor: default; }
.step-fields { display: flex; flex-direction: column; gap: 8px; }
.inline { display: flex; gap: 10px; align-items: end; }
.mini { display: flex; flex-direction: column; gap: 4px; }
.mini span { font-size: 12px; color: var(--muted); }
.mini input { max-width: 90px; }
.grow { flex: 1; }
.add-row { display: flex; gap: 10px; margin: 14px 0 18px; }
.summary { margin-bottom: 18px; font-size: 15px; }
.actions { display: flex; gap: 12px; }
</style>
