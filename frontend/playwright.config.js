import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,        // 2 min par test (Pyodide long au 1er run)
  expect: { timeout: 30_000 },
  fullyParallel: false,    // tests séquentiels pour éviter les conflits Pyodide
  retries: 0,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 800 },
    // Autorise les fetch vers localhost:8000 (API) et CDN Pyodide
    bypassCSP: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Le serveur Vite tourne déjà — on ne le relance pas.
  // webServer: undefined
})
