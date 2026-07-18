import { defineConfig } from 'vite'

// Dedicated build that bundles CodeMirror (cm-entry.js) into a single self-contained
// ESM file served from our own origin: public/vendor/codemirror.js.
// Run with: npm run build:cm
export default defineConfig({
  publicDir: false, // don't copy public/ into the lib outDir
  build: {
    lib: {
      entry: 'cm-entry.js',
      // UMD so it can be loaded via a plain <script> tag (sets window.CMBundle),
      // bypassing Vite's dev module pipeline entirely.
      formats: ['umd'],
      name: 'CMBundle',
      fileName: () => 'codemirror.js',
    },
    outDir: 'public/vendor',
    emptyOutDir: false, // keep other files in public/
    minify: true,
    target: 'es2020',
  },
})
