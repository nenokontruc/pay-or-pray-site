/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// GitHub Pages serves this repo at https://<user>.github.io/pay-or-pray-site/,
// so production builds need that sub-path. The dev server runs at the root.
const PAGES_BASE = '/pay-or-pray-site/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? PAGES_BASE : '/',
  // Tailwind is used only for its CSS reset (Preflight); no utility classes.
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { host: '127.0.0.1', port: 8443, strictPort: true },
  preview: { host: '127.0.0.1', port: 8443 },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    // Run test files one at a time. In parallel, CPU contention pushed jsdom-heavy tests (the legacy
    // Simulation harness, Home, Framework) past the 5 s default on a busy machine; serial runs pass reliably.
    fileParallelism: false,
  },
}))
