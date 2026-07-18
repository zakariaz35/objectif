<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'

const { t } = useI18n()

const queue = ref([]) // cards still to review this session
const revealed = ref(false)
const loading = ref(true)
const error = ref(null)
const reviewedCount = ref(0)

const GRADES = [
  { q: 1, key: 'again', cls: 'again' },
  { q: 3, key: 'hard', cls: 'hard' },
  { q: 4, key: 'good', cls: 'good' },
  { q: 5, key: 'easy', cls: 'easy' },
]

const current = computed(() => queue.value[0] || null)

onMounted(async () => {
  try {
    queue.value = await api.getDueCards()
  } catch (e) {
    error.value = t('review.loadError')
  } finally {
    loading.value = false
  }
})

async function grade(q) {
  const card = current.value
  if (!card) return
  try {
    await api.reviewCard(card.formation, card.module, card.lesson, card.card_index, q)
  } catch (e) {
    error.value = t('review.saveError')
    return
  }
  reviewedCount.value++
  queue.value.shift()
  // A lapsed card (Encore) is due again today → re-queue it at the end.
  if (q < 3) queue.value.push(card)
  revealed.value = false
}
</script>

<template>
  <section class="review">
    <RouterLink to="/explorer" class="back">{{ $t('common.backToCourses') }}</RouterLink>
    <h1>{{ $t('review.title') }}</h1>

    <div v-if="loading" class="muted">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="err">{{ error }}</div>

    <div v-else-if="!current" class="empty">
      <p class="big">🎉 {{ $t('review.empty') }}</p>
      <p class="muted">
        <template v-if="reviewedCount">{{ $t('review.reviewedCount', { count: reviewedCount }) }}</template>
        {{ $t('review.emptyHint') }}
      </p>
    </div>

    <div v-else class="stage">
      <div class="meta">
        <span class="remaining">{{ $t('review.remaining', { count: queue.length }) }}</span>
        <span class="src">{{ current.lesson_title }}</span>
      </div>

      <div class="card">
        <div class="q prose" v-html="current.q_html"></div>

        <div v-if="!revealed" class="actions">
          <button class="btn btn-primary" type="button" @click="revealed = true">{{ $t('common.reveal') }}</button>
        </div>
        <template v-else>
          <div class="a prose" v-html="current.a_html"></div>
          <div class="rate">
            <span class="lbl">{{ $t('review.knew') }}</span>
            <button v-for="g in GRADES" :key="g.q" type="button" class="rbtn" :class="g.cls" @click="grade(g.q)">
              {{ $t('common.grade.' + g.key) }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.review {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px 80px;
}
.back {
  color: var(--muted);
  font-size: 13px;
}
h1 {
  font-size: 26px;
  margin: 10px 0 20px;
}
.muted {
  color: var(--muted);
}
.err {
  color: var(--bad);
}
.empty {
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}
.empty .big {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
}
.meta {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 13px;
  margin-bottom: 10px;
}
.card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  background: var(--panel);
}
.q {
  font-size: 18px;
  font-weight: 600;
}
.actions {
  margin-top: 18px;
}
.a {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}
.rate {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}
.rate .lbl {
  color: var(--muted);
  font-size: 13px;
  margin-right: 4px;
}
.rbtn {
  border: 1px solid var(--border);
  background: var(--code);
  color: var(--txt);
  border-radius: 8px;
  padding: 8px 16px;
}
.rbtn.again:hover {
  border-color: var(--bad);
  color: var(--bad);
}
.rbtn.hard:hover {
  border-color: var(--warn);
  color: var(--warn);
}
.rbtn.good:hover,
.rbtn.easy:hover {
  border-color: var(--good);
  color: var(--good);
}
</style>
