<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

// CodeMirror is loaded from esm.sh at runtime (like Pyodide) rather than bundled,
// because this project's Vite cannot resolve the granular @codemirror/* imports.
// We import ONLY from @codemirror/* + @lezer/highlight (no `codemirror` meta) so
// esm.sh resolves a single shared @codemirror/state instance across them.
const ESM = 'https://esm.sh/'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'js' },
})
const emit = defineEmits(['update:modelValue'])

const host = ref(null)
const loading = ref(true)
const failed = ref(false) // esm.sh unreachable → fall back to a plain textarea
let view = null

let cmPromise = null
function loadCM() {
  if (!cmPromise) {
    cmPromise = Promise.all([
      import(/* @vite-ignore */ ESM + '@codemirror/view'),
      import(/* @vite-ignore */ ESM + '@codemirror/state'),
      import(/* @vite-ignore */ ESM + '@codemirror/commands'),
      import(/* @vite-ignore */ ESM + '@codemirror/language'),
      import(/* @vite-ignore */ ESM + '@lezer/highlight'),
      import(/* @vite-ignore */ ESM + '@codemirror/lang-python'),
      import(/* @vite-ignore */ ESM + '@codemirror/lang-javascript'),
      import(/* @vite-ignore */ ESM + '@codemirror/lang-vue'),
    ]).then(([view, state, commands, language, hi, py, js, vlang]) => ({
      view, state, commands, language, hi, py, js, vlang,
    }))
  }
  return cmPromise
}

function langExt(m, lang) {
  if (lang === 'python' || lang === 'py') return m.py.python()
  if (lang === 'vue') return m.vlang.vue()
  if (lang === 'ts' || lang === 'typescript') return m.js.javascript({ typescript: true })
  if (lang === 'tsx') return m.js.javascript({ typescript: true, jsx: true })
  if (lang === 'jsx') return m.js.javascript({ jsx: true })
  return m.js.javascript()
}

onMounted(async () => {
  let m
  try {
    m = await loadCM()
  } catch (e) {
    loading.value = false
    failed.value = true // CodeMirror unavailable → plain textarea fallback
    return
  }
  if (!host.value) return

  const { EditorView, keymap, lineNumbers, highlightActiveLineGutter, drawSelection } = m.view
  const { EditorState, Prec } = m.state
  const { history, defaultKeymap, historyKeymap, indentWithTab } = m.commands
  const { syntaxHighlighting, HighlightStyle, indentOnInput, bracketMatching } = m.language
  const { tags: t } = m.hi

  const theme = EditorView.theme({
    '&': { backgroundColor: 'var(--code)', color: 'var(--code-txt)', border: '1px solid var(--border)', borderRadius: '10px' },
    '&.cm-focused': { outline: 'none', borderColor: 'var(--accent)' },
    '.cm-scroller': { fontFamily: "'SF Mono', Menlo, Consolas, monospace", fontSize: '13.5px', lineHeight: '1.55' },
    '.cm-content': { padding: '12px 0' },
    '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--muted)', border: 'none' },
    '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'transparent' },
    '.cm-cursor': { borderLeftColor: 'var(--accent)' },
  })
  const highlight = Prec.high(
    syntaxHighlighting(
      HighlightStyle.define([
        { tag: [t.keyword, t.modifier, t.controlKeyword, t.operatorKeyword], color: 'var(--accent2)' },
        { tag: [t.string, t.special(t.string)], color: '#2f9e44' },
        { tag: [t.comment, t.lineComment, t.blockComment], color: 'var(--muted)', fontStyle: 'italic' },
        { tag: [t.number, t.bool, t.null, t.atom], color: 'var(--accent)' },
        { tag: [t.function(t.variableName), t.definition(t.variableName)], color: 'var(--accent)' },
      ]),
    ),
  )

  view = new EditorView({
    parent: host.value,
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        langExt(m, props.language),
        theme,
        highlight,
        EditorView.lineWrapping,
        EditorView.updateListener.of((u) => {
          if (u.docChanged) emit('update:modelValue', u.state.doc.toString())
        }),
      ],
    }),
  })
  loading.value = false
})

watch(
  () => props.modelValue,
  (val) => {
    if (view && val !== view.state.doc.toString()) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: val } })
    }
  },
)

onBeforeUnmount(() => {
  if (view) view.destroy()
})
</script>

<template>
  <textarea
    v-if="failed"
    class="cm-fallback"
    :value="modelValue"
    spellcheck="false"
    autocapitalize="off"
    autocomplete="off"
    @input="emit('update:modelValue', $event.target.value)"
  ></textarea>
  <div v-else ref="host" class="cm-host">
    <div v-if="loading" class="cm-loading">Chargement de l'éditeur…</div>
  </div>
</template>

<style scoped>
.cm-host {
  width: 100%;
}
.cm-host :deep(.cm-editor) {
  min-height: 180px;
  border-radius: 10px;
}
.cm-loading {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  font-size: 13px;
  background: var(--code);
  border: 1px solid var(--border);
  border-radius: 10px;
}
.cm-fallback {
  width: 100%;
  min-height: 180px;
  resize: vertical;
  background: var(--code);
  color: var(--code-txt);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13.5px;
  line-height: 1.55;
  tab-size: 2;
}
.cm-fallback:focus {
  outline: none;
  border-color: var(--accent);
}
</style>
