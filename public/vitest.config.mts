import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const isE2E = process.env.E2E_TEST === 'true';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: isE2E ? [] : ['./__tests__/setupMSW.ts'],
    include: ['./__tests__/**/*.test.ts', './__tests__/**/*.test.tsx'],
  },
})