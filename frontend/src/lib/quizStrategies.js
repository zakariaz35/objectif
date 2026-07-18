// Quiz delivery strategies (pattern Strategy): decide WHICH questions to present
// and in WHAT order. Grading stays server-side (QuizController@grade) — this only
// shapes the pool shown to the learner.
//
//   linear  (default) — every question, in order.
//   random            — shuffle, then keep `draw` questions (or all if no draw).
//   review            — only the questions missed on the last attempt (else all).

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function applyStrategy(questions, { strategy = 'linear', draw = null, missedIds = [] } = {}) {
  switch (strategy) {
    case 'random': {
      const pool = shuffle(questions)
      return draw && draw > 0 && draw < pool.length ? pool.slice(0, draw) : pool
    }
    case 'review': {
      const missed = new Set(missedIds)
      const only = questions.filter((q) => missed.has(q.id))
      // Nothing to review (no history, or everything was already correct) → show all.
      return only.length ? only : questions
    }
    case 'linear':
    default:
      return questions
  }
}
