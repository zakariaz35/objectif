<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../lib/api'
import { useI18n } from 'vue-i18n'
import { applyStrategy } from '../lib/quizStrategies'

const props = defineProps({
  formation: String,
  module: String,
  lesson: String,
  questions: { type: Array, default: () => [] },
  strategy: { type: String, default: 'linear' },
  draw: { type: Number, default: null },
})
const emit = defineEmits(['completed'])
const { t } = useI18n()

const choices = ref({}) // { questionId: optionIndex }
const result = ref(null) // { score, total, feedback[] }
const submitting = ref(false)
const error = ref(null)

// Questions actually presented, after applying the delivery strategy.
const activeQuestions = ref([...props.questions])
let missedIds = null // cached across retries for the `review` strategy

async function init() {
  choices.value = {}
  result.value = null
  error.value = null
  if (props.strategy === 'review' && missedIds === null) {
    try {
      const attempts = await api.getAttempts(props.formation, props.module, props.lesson)
      missedIds = attempts[attempts.length - 1]?.missed || []
    } catch (e) {
      missedIds = []
    }
  }
  activeQuestions.value = applyStrategy(props.questions, {
    strategy: props.strategy,
    draw: props.draw,
    missedIds: missedIds || [],
  })
}

onMounted(init)

const allAnswered = computed(
  () => activeQuestions.value.length > 0 && activeQuestions.value.every((q) => choices.value[q.id] != null)
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
    error.value = t('quiz.sendError')
  } finally {
    submitting.value = false
  }
}

function retry() {
  init()
}
</script>

<template>
  <div class="quiz">
    <div v-if="result" class="scoreboard" :class="{ win: scorePct >= 75 }">
      <div class="big">{{ result.score }} / {{ result.total }}</div>
      <div class="lbl">
        {{ scorePct }}% —
        <template v-if="scorePct === 100">{{ $t('common.score.perfect') }}</template>
        <template v-else-if="scorePct >= 75">{{ $t('common.score.great') }}</template>
        <template v-else-if="scorePct >= 50">{{ $t('quiz.scoreOk') }}</template>
        <template v-else>{{ $t('quiz.scoreLow') }}</template>
      </div>
      <div v-if="result.level" class="level" :title="$t('quiz.estimatedLevelTitle')">
        {{ $t('quiz.estimatedLevel') }} : <strong>{{ result.level }}</strong>
      </div>
    </div>

    <ol class="questions">
      <li v-for="(q, qi) in activeQuestions" :key="q.id" class="q">
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
        {{ submitting ? $t('common.grading') : $t('quiz.submit') }}
      </button>
      <button v-else class="btn btn-ghost" @click="retry">{{ $t('common.retry') }}</button>
      <span v-if="!result && !allAnswered" class="hint">
        {{ $t('quiz.answerHint', { count: activeQuestions.length }) }}
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
.scoreboard .level {
  margin-left: auto;
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--panel2);
  color: var(--accent);
  font-size: 14px;
  white-space: nowrap;
}
.scoreboard .level strong {
  font-size: 18px;
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
  background: var(--panel2);
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
  box-shadow: inset 0 0 0 1px var(--accent);
}
.opt.sel .mark {
  background: var(--accent);
  color: var(--accent-contrast);
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
