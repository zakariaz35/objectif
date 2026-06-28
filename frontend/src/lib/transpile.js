// Lazy-loaded source→JS transpile (Sucrase). Strips TypeScript types and/or
// compiles JSX so a snippet can run in the JS sandbox. Plain JS passes through.
// Extend by adding a language to TRANSFORMS (e.g. React TSX is already covered).
let _transform = null

const TRANSFORMS = {
  js: [],
  ts: ['typescript'],
  jsx: ['jsx'],
  tsx: ['typescript', 'jsx'],
}

async function loadTransform() {
  if (!_transform) {
    const sucrase = await import('sucrase')
    _transform = sucrase.transform
  }
  return _transform
}

export async function toJs(code, lang = 'ts') {
  const transforms = TRANSFORMS[lang] ?? ['typescript']
  if (transforms.length === 0) return code // plain JS: nothing to transpile
  const transform = await loadTransform()
  return transform(code, { transforms, production: false }).code
}
