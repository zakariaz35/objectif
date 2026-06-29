// Build entry for the vendored CodeMirror bundle.
// Re-exports exactly what CodeEditor.vue needs. Bundled into ONE file
// (public/vendor/codemirror.js) by `npm run build:cm` so the editor loads from
// our own origin (no runtime CDN) with a single shared @codemirror/state.
export { EditorView, keymap, lineNumbers, highlightActiveLineGutter, drawSelection } from '@codemirror/view'
export { EditorState, Prec } from '@codemirror/state'
export { history, defaultKeymap, historyKeymap, indentWithTab } from '@codemirror/commands'
export { syntaxHighlighting, HighlightStyle, indentOnInput, bracketMatching } from '@codemirror/language'
export { tags } from '@lezer/highlight'
export { python } from '@codemirror/lang-python'
export { javascript } from '@codemirror/lang-javascript'
export { vue } from '@codemirror/lang-vue'
