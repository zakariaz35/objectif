<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'

const props = defineProps({
  formation: String,
  module: String,
  lesson: String,
  items: { type: Array, default: () => [] }, // [{ parts:[html], gaps:Number }]
})
const emit = defineEmits(['completed'])
const { t } = useI18n()

const inputs = ref({}) // { globalGapIndex: text }
const result = ref(null) // { score, total, feedback[] }
const submitting = ref(false)
const error = ref(null)

// Assign a global, sequential gap index to each item (matches the backend order).
const itemsWithBase = computed(() => {
  let base = 0
  return props.items.map((it) => {
    const withBase = { ...it, base }
    base += it.gaps
    return withBase
  })
})
const totalGaps = computed(() => props.items.reduce((n, it) => n + it.gaps, 0))
const allFilled = computed(
  () => totalGaps.value > 0 && Array.from({ length: totalGaps.value }, (_, i) => inputs.value[i]).every((v) => (v || '').trim() !== '')
)
const feedbackByGap = computed(() => {
  const m = {}
  if (result.value) for (const f of result.value.feedback) m[f.gap] = f
  return m
})
const scorePct = computed(() =>
  result.value ? Math.round((result.value.score / result.value.total) * 100) : 0
)

function inputClass(gi) {
  const fb = feedbackByGap.value[gi]
  if (!fb) return ''
  return fb.correct ? 'good' : 'bad'
}
function expected(gi) {
  return (feedbackByGap.value[gi]?.answer || '').split('|')[0]
}

async function submit() {
  if (!allFilled.value || submitting.value) return
  submitting.value = true
  error.value = null
  try {
    result.value = await api.gradeCloze(props.formation, props.module, props.lesson, inputs.value)
    emit('completed')
  } catch (e) {
    error.value = t('cloze.sendError')
  } finally {
    submitting.value = false
  }
}
function retry() {
  inputs.value = {}
  result.value = null
  error.value = null
}
</script>

<template>
  <div class="cloze">
    <div v-if="result" class="scoreboard" :class="{ win: scorePct >= 75 }">
      <div class="big">{{ result.score }} / {{ result.total }}</div>
      <div class="lbl">
        {{ scorePct }}% —
        <template v-if="scorePct === 100">{{ $t('common.score.faultless') }}</template>
        <template v-else-if="scorePct >= 75">{{ $t('common.score.great') }}</template>
        <template v-else>{{ $t('cloze.scoreLow') }}</template>
      </div>
    </div>

    <ol class="lines">
      <li v-for="(item, i) in itemsWithBase" :key="i" class="line">
        <template v-for="(part, j) in item.parts" :key="j">
          <span class="txt" v-html="part"></span>
          <span v-if="j < item.gaps" class="gapwrap">
            <input
              class="gap"
              :class="inputClass(item.base + j)"
              :disabled="!!result"
              v-model="inputs[item.base + j]"
              type="text"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
            />
            <span v-if="feedbackByGap[item.base + j] && !feedbackByGap[item.base + j].correct" class="fix">
              {{ expected(item.base + j) }}
            </span>
          </span>
        </template>
      </li>
    </ol>

    <p v-if="error" class="err">{{ error }}</p>

    <div class="actions">
      <button v-if="!result" class="btn btn-primary" :disabled="!allFilled || submitting" @click="submit">
        {{ submitting ? $t('common.grading') : $t('common.validate') }}
      </button>
      <button v-else class="btn btn-ghost" @click="retry">{{ $t('common.retry') }}</button>
      <span v-if="!result && !allFilled" class="hint">{{ $t('cloze.fillHint', { count: totalGaps }) }}</span>
    </div>
  </div>
</template>

<style scoped>
.cloze {
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
.lines {
  list-style: none;
  padding: 0;
  margin: 0;
}
.line {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 18px;
  margin: 10px 0;
  background: var(--panel);
  font-size: 16px;
  line-height: 2.2;
}
.txt :deep(p) {
  display: inline;
  margin: 0;
}
.gapwrap {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}
.gap {
  width: 8em;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-bottom: 2px solid var(--accent);
  border-radius: 6px;
  background: var(--code);
  color: var(--txt);
  font: inherit;
  text-align: center;
}
.gap:focus {
  outline: none;
  border-color: var(--accent);
}
.gap.good {
  border-color: var(--good);
  background: rgba(107, 227, 154, 0.12);
}
.gap.bad {
  border-color: var(--bad);
  background: rgba(255, 138, 138, 0.12);
}
.fix {
  color: var(--good);
  font-size: 13px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
}
.hint {
  color: var(--muted);
  font-size: 13px;
}
.err {
  color: var(--bad);
}
</style>
