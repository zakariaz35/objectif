<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'

const props = defineProps({
  formation: String,
  module: String,
  lesson: String,
  left: { type: Array, default: () => [] }, // [{ id, html }] — EN, in order
  right: { type: Array, default: () => [] }, // [{ id, html }] — FR, shuffled
})
const emit = defineEmits(['completed'])
const { t } = useI18n()

const mapping = ref({}) // { leftId: rightId }
const selectedLeft = ref(null)
const result = ref(null) // { score, total, feedback[] }
const submitting = ref(false)
const error = ref(null)

const allLinked = computed(
  () => props.left.length > 0 && props.left.every((l) => mapping.value[l.id] != null)
)
const feedbackByLeft = computed(() => {
  const m = {}
  if (result.value) for (const f of result.value.feedback) m[f.left_id] = f
  return m
})
const scorePct = computed(() =>
  result.value ? Math.round((result.value.score / result.value.total) * 100) : 0
)

// Display order number (1-based) of a left item — used as a link badge on both sides.
function badge(leftId) {
  return props.left.findIndex((l) => l.id === leftId) + 1
}
function rightUsedBy(rightId) {
  return props.left.find((l) => mapping.value[l.id] === rightId)?.id ?? null
}
function rightHtml(rightId) {
  return props.right.find((r) => r.id === rightId)?.html ?? ''
}
// The FR that SHOULD be linked to this left (correct_right === left id).
function correctHtml(leftId) {
  return props.right.find((r) => r.id === leftId)?.html ?? ''
}

function pickLeft(id) {
  if (result.value) return
  selectedLeft.value = selectedLeft.value === id ? null : id
}
function pickRight(rightId) {
  if (result.value || selectedLeft.value == null) return
  const next = { ...mapping.value }
  // A right can be linked once: detach whoever held it.
  for (const l of Object.keys(next)) if (next[l] === rightId) delete next[l]
  // Toggle off if re-picking the same link.
  if (next[selectedLeft.value] === rightId) delete next[selectedLeft.value]
  else next[selectedLeft.value] = rightId
  mapping.value = next
  selectedLeft.value = null
}

function leftClass(id) {
  const fb = feedbackByLeft.value[id]
  if (fb) return fb.correct ? 'good' : 'bad'
  if (selectedLeft.value === id) return 'sel'
  if (mapping.value[id] != null) return 'linked'
  return ''
}
function rightClass(rightId) {
  if (result.value) {
    const holder = rightUsedBy(rightId)
    if (holder == null) return ''
    return feedbackByLeft.value[holder]?.correct ? 'good' : 'bad'
  }
  return rightUsedBy(rightId) != null ? 'linked' : ''
}

async function submit() {
  if (!allLinked.value || submitting.value) return
  submitting.value = true
  error.value = null
  try {
    result.value = await api.gradeMatching(props.formation, props.module, props.lesson, mapping.value)
    emit('completed')
  } catch (e) {
    error.value = t('matching.sendError')
  } finally {
    submitting.value = false
  }
}
function retry() {
  mapping.value = {}
  selectedLeft.value = null
  result.value = null
  error.value = null
}
</script>

<template>
  <div class="matching">
    <div v-if="result" class="scoreboard" :class="{ win: scorePct >= 75 }">
      <div class="big">{{ result.score }} / {{ result.total }}</div>
      <div class="lbl">
        {{ scorePct }}% —
        <template v-if="scorePct === 100">{{ $t('common.score.faultless') }}</template>
        <template v-else-if="scorePct >= 75">{{ $t('common.score.great') }}</template>
        <template v-else>{{ $t('matching.scoreLow') }}</template>
      </div>
    </div>

    <p v-if="!result" class="help">
      {{ $t('matching.help') }}
    </p>

    <div class="cols">
      <ul class="col">
        <li v-for="l in left" :key="l.id">
          <button type="button" class="cell" :class="leftClass(l.id)" :disabled="!!result" @click="pickLeft(l.id)">
            <span v-if="mapping[l.id] != null || feedbackByLeft[l.id]" class="badge">{{ badge(l.id) }}</span>
            <span class="txt" v-html="l.html"></span>
          </button>
          <div v-if="mapping[l.id] != null && !result" class="paired" v-html="rightHtml(mapping[l.id])"></div>
          <div v-if="feedbackByLeft[l.id] && !feedbackByLeft[l.id].correct" class="fix">
            → <span v-html="correctHtml(l.id)"></span>
          </div>
        </li>
      </ul>

      <ul class="col">
        <li v-for="r in right" :key="r.id">
          <button type="button" class="cell" :class="rightClass(r.id)" :disabled="!!result" @click="pickRight(r.id)">
            <span v-if="rightUsedBy(r.id) != null" class="badge">{{ badge(rightUsedBy(r.id)) }}</span>
            <span class="txt" v-html="r.html"></span>
          </button>
        </li>
      </ul>
    </div>

    <p v-if="error" class="err">{{ error }}</p>

    <div class="actions">
      <button v-if="!result" class="btn btn-primary" :disabled="!allLinked || submitting" @click="submit">
        {{ submitting ? $t('common.grading') : $t('common.validate') }}
      </button>
      <button v-else class="btn btn-ghost" @click="retry">{{ $t('common.retry') }}</button>
      <span v-if="!result && !allLinked" class="hint">{{ $t('matching.linkHint', { count: left.length }) }}</span>
    </div>
  </div>
</template>

<style scoped>
.matching {
  margin-top: 8px;
}
.scoreboard {
  border: 1px solid var(--border);
  border-left: 4px solid var(--warn);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  background: var(--panel);
  display: flex;
  align-items: baseline;
  gap: 16px;
}
.scoreboard.win {
  border-left-color: var(--good);
}
.scoreboard .big {
  font-size: 32px;
  font-weight: 800;
}
.scoreboard .lbl {
  color: var(--muted);
}
.help {
  color: var(--muted);
  font-size: 14px;
  margin: 0 0 14px;
}
.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}
.col {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cell {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--code);
  color: var(--txt);
  transition: border-color 0.12s, background 0.12s;
}
.cell:hover:not(:disabled) {
  border-color: var(--accent);
  background: var(--panel2);
}
.cell:disabled {
  cursor: default;
}
.cell .badge {
  flex: 0 0 22px;
  height: 22px;
  width: 22px;
  text-align: center;
  line-height: 22px;
  border-radius: 6px;
  background: var(--accent);
  color: var(--accent-contrast);
  font-size: 12px;
  font-weight: 700;
}
.cell.sel {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
  background: var(--panel2);
}
.cell.linked {
  border-color: var(--accent2);
}
.cell.good {
  border-color: var(--good);
  background: rgba(107, 227, 154, 0.12);
}
.cell.good .badge {
  background: var(--good);
  color: #0b0d13;
}
.cell.bad {
  border-color: var(--bad);
  background: rgba(255, 138, 138, 0.12);
}
.cell.bad .badge {
  background: var(--bad);
  color: #0b0d13;
}
.paired {
  font-size: 12px;
  color: var(--muted);
  padding: 2px 8px 0 32px;
}
.fix {
  font-size: 13px;
  color: var(--good);
  padding: 3px 8px 0 32px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 22px;
}
.hint {
  color: var(--muted);
  font-size: 13px;
}
.err {
  color: var(--bad);
}
</style>
