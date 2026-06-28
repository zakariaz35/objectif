import { openScratch } from './scratch'
import { openVuePlayground } from './vuePlayground'
import { openPythonPlayground } from './pythonPlayground'

// Registry: code-block language → how to "test" it (which playground to open).
// THIS is the single extension point for new frameworks. To add React/Angular:
//   import { openReactPlayground } from './reactPlayground'
//   registerPlayground(['jsx', 'tsx'], openReactPlayground)
// Nothing else in the app needs to change — lessons pick it up automatically.
const registry = {}

export function registerPlayground(langs, open) {
  for (const lang of langs) registry[lang] = open
}

/** Returns an `open(code)` handler for a language, or null if not runnable. */
export function playgroundFor(lang) {
  return registry[lang || 'js'] || null
}

// Built-in runners.
registerPlayground(['js', 'javascript', 'ts', 'typescript'], openScratch)
registerPlayground(['vue'], openVuePlayground)
registerPlayground(['python', 'py'], openPythonPlayground)
