// Lazy-loaded TS→JS transpile (Sucrase). Strips TypeScript types so a snippet
// can run in the JS sandbox. Plain JS passes through unchanged.
let _transform = null

async function loadTransform() {
  if (!_transform) {
    const sucrase = await import('sucrase')
    _transform = sucrase.transform
  }
  return _transform
}

export async function toJs(code) {
  const transform = await loadTransform()
  return transform(code, { transforms: ['typescript'] }).code
}
