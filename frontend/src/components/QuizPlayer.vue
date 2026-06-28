<script setup>
import { ref, computed } from 'vue'
import api from '../lib/api'

const props = defineProps({
  formation: String,
  module: String,
  lesson: String,
  questions: { type: Array, default: () => [] },
})
const emit = defineEmits(['completed'])

const choices = ref({}) // { questionId: optionIndex }
const result = ref(null) // { score, total, feedback[] }
const submitting = ref(false)
const error = ref(null)

const allAnswered = computed(
  () => props.questions.length > 0 && props.questions.every((q) => choices.value[q.id] != null)
)
const feedbackById = computed(() => {
  const map = {}
  if (result.value) for (const f of result.value.feedback) map[f.id] = f
  return map
})
const scorePct = computed(() =>
  result.value ? Math.round((result.value.score / result.value.total) * 100) : 0
)

function pick(qId, idx) {
  if (result.value) return // locked after grading
  choices.value = { ...choices.value, [qId]: idx }
}

function optionClass(qId, idx) {
  const fb = feedbackById.value[qId]
  if (!fb) return choices.value[qId] === idx ? 'sel' : ''
  if (idx === fb.correct_index) return 'good'
  if (idx === fb.chosen && !fb.correct) return 'bad'
  return ''
}

async function submit() {
  if (!allAnswered.value || submitting.value) return
  submitting.value = true
  error.value = null
  try {
    result.value = await api.gradeQuiz(props.formation, props.module, props.lesson, choices.value)
    emit('completed')
  } catch (e) {
    error.value = "Impossible d'envoyer le quiz."
  } finally {
    submitting.value = false
  }
}

function retry() {
  choices.value = {}
  result.value = null
  error.value = null
}
</script>

<template>
  <div class="quiz">
    <div v-if="result" class="scoreboard" :class="{ win: scorePct >= 75 }">
      <div class="big">{{ result.score }} / {{ result.total }}</div>
      <div class="lbl">
        {{ scorePct }}% —
        <template v-if="scorePct === 100">parfait ! 🎉</template>
        <template v-else-if="scorePct >= 75">bien joué 👍</template>
        <template v-else-if="scorePct >= 50">à revoir un peu</template>
        <template v-else>relis le cours et retente 💪</template>
      </div>
    </div>

    <ol class="questions">
      <li v-for="(q, qi) in questions" :key="q.id" class="q">
        <div class="prompt">
          <span class="num">{{ qi + 1 }}</span>
          <span v-html="q.prompt_html"></span>
        </div>
        <div class="options">
          <button
            v-for="(opt, idx) in q.options"
            :key="idx"
            type="button"
            class="opt"
            :class="optionClass(q.id, idx)"
            :disabled="!!result"
            @click="pick(q.id, idx)"
          >
            <span class="mark">{{ String.fromCharCode(65 + idx) }}</span>
            <span v-html="opt"></span>
          </button>
        </div>
        <div v-if="feedbackById[q.id]?.explanation_html" class="explain" v-html="feedbackById[q.id].explanation_html"></div>
      </li>
    </ol>

    <p v-if="error" class="err">{{ error }}</p>

    <div class="actions">
      <button v-if="!result" class="btn btn-primary" :disabled="!allAnswered || submitting" @click="submit">
        {{ submitting ? 'Correction…' : 'Valider le quiz' }}
      </button>
      <button v-else class="btn btn-ghost" @click="retry">↻ Recommencer</button>
      <span v-if="!result && !allAnswered" class="hint">
        Réponds aux {{ questions.length }} questions pour valider.
      </span>
    </div>
  </div>
</template>

<style scoped>
.quiz {
  margin-top: 8px;
}
.scoreboard {
  border: 1px solid var(--border);
  border-left: 4px solid var(--warn);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
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
.questions {
  list-style: none;
  padding: 0;
  margin: 0;
}
.q {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 18px;
  margin: 14px 0;
  background: var(--panel);
}
.prompt {
  display: flex;
  gap: 10px;
  font-weight: 600;
  margin-bottom: 12px;
}
.prompt .num {
  flex: 0 0 24px;
  height: 24px;
  width: 24px;
  text-align: center;
  line-height: 24px;
  border-radius: 50%;
  background: var(--panel2);
  color: var(--accent);
  font-size: 13px;
}
.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.opt {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--code);
  color: var(--txt);
  transition: border-color 0.12s, background 0.12s;
}
.opt:hover:not(:disabled) {
  border-color: var(--accent);
}
.opt:disabled {
  cursor: default;
}
.opt .mark {
  flex: 0 0 22px;
  height: 22px;
  width: 22px;
  text-align: center;
  line-height: 22px;
  border-radius: 6px;
  background: var(--panel2);
  font-size: 12px;
  font-weight: 700;
}
.opt.sel {
  border-color: var(--accent);
  background: var(--panel2);
}
.opt.good {
  border-color: var(--good);
  background: rgba(107, 227, 154, 0.12);
}
.opt.good .mark {
  background: var(--good);
  color: #0b0d13;
}
.opt.bad {
  border-color: var(--bad);
  background: rgba(255, 138, 138, 0.12);
}
.opt.bad .mark {
  background: var(--bad);
  color: #0b0d13;
}
.explain {
  margin-top: 12px;
  padding: 10px 14px;
  border-left: 3px solid var(--accent);
  background: var(--panel2);
  border-radius: 6px;
  color: var(--txt);
  font-size: 14px;
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
